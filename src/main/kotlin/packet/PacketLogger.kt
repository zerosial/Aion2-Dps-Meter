package com.tbread.packet

import org.slf4j.LoggerFactory
import java.io.File
import java.io.FileOutputStream
import java.text.SimpleDateFormat
import java.util.*
import java.util.concurrent.ConcurrentLinkedQueue

object PacketLogger {
    private val logger = LoggerFactory.getLogger(PacketLogger::class.java)
    
    @Volatile
    var isRecording = false
        private set
        
    private var outputStream: FileOutputStream? = null
    private val packetQueue = ConcurrentLinkedQueue<String>()
    
    // 비동기 쓰기를 위한 스레드
    private var writerThread: Thread? = null

    @Synchronized
    fun startRecording() {
        if (isRecording) return
        try {
            val logDir = File("logs")
            if (!logDir.exists()) {
                logDir.mkdirs()
            }
            
            val sdf = SimpleDateFormat("yyyyMMdd_HHmmss")
            val fileName = "packet_log_${sdf.format(Date())}.log"
            val file = File(logDir, fileName)
            
            outputStream = FileOutputStream(file, true)
            isRecording = true
            
            writerThread = Thread {
                while (isRecording || packetQueue.isNotEmpty()) {
                    val line = packetQueue.poll()
                    if (line != null) {
                        try {
                            outputStream?.write((line + "\n").toByteArray())
                        } catch (e: Exception) {
                            logger.error("패킷 로그 작성 실패", e)
                        }
                    } else {
                        Thread.sleep(100)
                    }
                }
                outputStream?.close()
                outputStream = null
            }
            writerThread?.isDaemon = true
            writerThread?.start()
            
            logger.info("패킷 로깅 시작: ${file.absolutePath}")
        } catch (e: Exception) {
            logger.error("패킷 로깅 시작 실패", e)
            isRecording = false
        }
    }

    @Synchronized
    fun stopRecording() {
        if (!isRecording) return
        isRecording = false
        logger.info("패킷 로깅 중지")
    }

    fun logPacket(packet: ByteArray, arrivedAt: Long) {
        if (!isRecording) return
        val hexString = packet.joinToString("") { "%02X".format(it) }
        packetQueue.add("[$arrivedAt] $hexString")
    }
}
