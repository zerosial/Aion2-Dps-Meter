package com.tbread.packet

import com.sun.jna.Library
import com.sun.jna.Native
import com.sun.jna.Pointer
import com.sun.jna.ptr.IntByReference
import com.tbread.config.PcapCapturerConfig
import kotlinx.coroutines.CoroutineScope
import kotlinx.coroutines.Dispatchers
import kotlinx.coroutines.channels.Channel
import kotlinx.coroutines.launch
import org.slf4j.LoggerFactory
import java.nio.ByteBuffer
import java.nio.ByteOrder

class WinDivertCapturer(private val config: PcapCapturerConfig, private val channel: Channel<CapturedPacket>) {

    companion object {
        private val logger = LoggerFactory.getLogger(javaClass.enclosingClass)

        // JNA WinDivert Library Interface
        interface WinDivertLibrary : Library {
            fun WinDivertOpen(filter: String, layer: Int, priority: Short, flags: Long): Pointer?
            fun WinDivertRecv(handle: Pointer, packet: ByteArray, packetLen: Int, recvLen: IntByReference, addr: Pointer?): Boolean
            fun WinDivertShutdown(handle: Pointer, how: Int): Boolean
            fun WinDivertSetParam(handle: Pointer, param: Int, value: Long): Boolean
            fun WinDivertClose(handle: Pointer): Boolean
        }

        private var lib: WinDivertLibrary? = null

        init {
            try {
                // 프로젝트 루트 폴더에 복사해 둔 WinDivert.dll 로드
                lib = Native.load("WinDivert", WinDivertLibrary::class.java) as WinDivertLibrary
                logger.info("WinDivert.dll Native 라이브러리 로드 성공")
            } catch (e: Throwable) {
                logger.error("WinDivert.dll Native 라이브러리 로드 실패", e)
            }
        }
    }

    private var handle: Pointer? = null
    private var isRunning = false
    private val scope = CoroutineScope(Dispatchers.IO)

    fun start() {
        val wlib = lib ?: throw IllegalStateException("WinDivert Library가 로드되지 않았습니다. WinDivert.dll 파일 상태를 확인하십시오.")
        
        // AION2 서버 포트 필터링 (tcp 필터 적용)
        val filter = "tcp"
        val flags = 5L // 1uL (WinDivertFlagSniff) or 4uL (WinDivertFlagRecvOnly) = 5
        
        handle = wlib.WinDivertOpen(filter, 0, 0, flags)
        if (handle == null) {
            val err = Native.getLastError()
            logger.error("WinDivertOpen 실패. Win32Error=$err")
            throw IllegalStateException("WinDivert 드라이버 Open 실패. Win32Error=$err (관리자 권한으로 기동되었는지 확인 요망)")
        }

        logger.info("WinDivert 커널 캡처 핸들 생성 완료. 필터: $filter")
        
        // Queue 길이 및 버퍼 크기 구성 (기본 성능 처리 큐 구성)
        wlib.WinDivertSetParam(handle!!, 0, 16384L) // QueueLength
        wlib.WinDivertSetParam(handle!!, 2, 33554432L) // QueueSize
        wlib.WinDivertSetParam(handle!!, 1, 8000L) // QueueTime

        isRunning = true
        scope.launch {
            receiveLoop(wlib)
        }
    }

    private fun receiveLoop(wlib: WinDivertLibrary) {
        val packetBuffer = ByteArray(65535)
        val recvLen = IntByReference()
        
        val targetPort = config.serverPort.toInt() // 13328

        logger.info("WinDivert 패킷 수신 백그라운드 코루틴 기동 완료")

        while (isRunning && handle != null) {
            if (!wlib.WinDivertRecv(handle!!, packetBuffer, packetBuffer.size, recvLen, null)) {
                if (isRunning) {
                    val err = Native.getLastError()
                    logger.warn("WinDivertRecv 실패. Win32Error=$err")
                }
                continue
            }

            val len = recvLen.value
            if (len <= 0) continue

            try {
                // IP & TCP 헤더 파싱 및 정제
                processPacket(packetBuffer, len, targetPort)
            } catch (e: Exception) {
                // 패킷 파싱 중 오류는 스킵
            }
        }
    }

    private fun processPacket(data: ByteArray, rawLen: Int, targetPort: Int) {
        if (rawLen < 20) return
        val version = (data[0].toInt() shr 4) and 0x0F
        if (version == 4) { // IPv4 만 처리
            // IPv4 총 패킷 크기 해독 및 보정 (IP 페이로드 쓰레기 테일 유실 방지 보정 로직)
            val ipTotalLen = ((data[2].toInt() and 0xFF) shl 8) or (data[3].toInt() and 0xFF)
            val len = if (ipTotalLen in 20..rawLen) ipTotalLen else rawLen

            val ipHeaderLen = (data[0].toInt() and 0x0F) * 4
            if (len < ipHeaderLen + 20) return

            val protocol = data[9].toInt() and 0xFF
            if (protocol != 6) return // TCP 가 아니면 리턴

            // 송수신 IP 고속 해독 (GC / Array 할당 방지 최적화)
            val srcIp = "${data[12].toInt() and 0xFF}.${data[13].toInt() and 0xFF}.${data[14].toInt() and 0xFF}.${data[15].toInt() and 0xFF}"
            val dstIp = "${data[16].toInt() and 0xFF}.${data[17].toInt() and 0xFF}.${data[18].toInt() and 0xFF}.${data[19].toInt() and 0xFF}"

            // TCP 헤더 오프셋
            val tcpStart = ipHeaderLen
            val srcPort = ((data[tcpStart].toInt() and 0xFF) shl 8) or (data[tcpStart + 1].toInt() and 0xFF)
            val dstPort = ((data[tcpStart + 2].toInt() and 0xFF) shl 8) or (data[tcpStart + 3].toInt() and 0xFF)

            // TCP seq number 추출 (4바이트 Big Endian)
            val seq = ByteBuffer.wrap(data, tcpStart + 4, 4).order(ByteOrder.BIG_ENDIAN).int.toLong() and 0xFFFFFFFFL

            // TCP 헤더 크기
            val tcpHeaderLen = ((data[tcpStart + 12].toInt() shr 4) and 0x0F) * 4
            if (len < ipHeaderLen + tcpHeaderLen) return

            val payloadStart = ipHeaderLen + tcpHeaderLen
            val payloadLen = len - payloadStart

            if (payloadLen <= 0) return

            // Aion 서버 포트(13328) 통신 패킷만 발라냄
            if (srcPort == targetPort || dstPort == targetPort) {
                // 원시 슬라이스 어레이 생성
                val payload = data.sliceArray(payloadStart until len)
                
                // CapturedPacket 형태로 채널에 안전하게 던져 밀어넣음!
                channel.trySend(CapturedPacket(srcIp, seq, payload, System.currentTimeMillis()))
            }
        }
    }

    fun stop() {
        isRunning = false
        val h = handle
        val wlib = lib
        if (h != null && wlib != null) {
            wlib.WinDivertShutdown(h, 1)
            wlib.WinDivertClose(h)
            handle = null
            logger.info("WinDivert 커널 캡처가 성공적으로 중단되었습니다.")
        }
    }
}
