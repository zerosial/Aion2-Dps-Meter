package com.tbread.packet

import org.slf4j.LoggerFactory
import java.io.File
import java.io.FileOutputStream
import java.text.SimpleDateFormat
import java.util.*
import java.util.concurrent.ConcurrentLinkedQueue
import java.util.concurrent.atomic.AtomicLong

/**
 * Raw packet hex logger used by the dev/prerelease build's "녹화" feature.
 * Each line of the output log is `[arrivedAtMs] <hex bytes>\n`. The file is
 * written asynchronously by a daemon thread so the capture hot-path never
 * blocks on disk I/O.
 *
 * stopRecording returns a [RecordingResult] so the caller (BrowserApp →
 * PacketRecordingUploader) can immediately POST the captured file to the
 * cielui admin endpoint without a second round-trip.
 */
object PacketLogger {
    private val logger = LoggerFactory.getLogger(PacketLogger::class.java)

    @Volatile
    var isRecording = false
        private set

    private var outputStream: FileOutputStream? = null
    private val packetQueue = ConcurrentLinkedQueue<String>()
    private var writerThread: Thread? = null

    // metadata for the in-progress recording
    private var currentFile: File? = null
    private var startedAt: Long = 0
    private val packetCount = AtomicLong(0)

    data class RecordingResult(
        val filePath: String,
        val fileSize: Long,
        val packetCount: Long,
        val startedAt: Long,
        val stoppedAt: Long,
        val durationMs: Long,
    )

    fun currentPacketCount(): Long = if (isRecording) packetCount.get() else 0
    fun currentStartedAt(): Long = startedAt
    fun currentFilePath(): String? = currentFile?.absolutePath

    @Synchronized
    fun startRecording() {
        if (isRecording) return
        try {
            val logDir = File("logs")
            if (!logDir.exists()) logDir.mkdirs()

            val sdf = SimpleDateFormat("yyyyMMdd_HHmmss")
            val fileName = "packet_log_${sdf.format(Date())}.log"
            val file = File(logDir, fileName)

            outputStream = FileOutputStream(file, true)
            currentFile = file
            packetCount.set(0)
            startedAt = System.currentTimeMillis()
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
                try {
                    outputStream?.flush()
                    outputStream?.close()
                } catch (_: Exception) {}
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

    /**
     * Stop recording. Returns the finalised result so callers can upload it.
     * Waits up to ~3 s for the writer thread to drain the queue and close the
     * file — otherwise the file size we report could be 0 because the OS
     * buffer hasn't flushed yet.
     */
    @Synchronized
    fun stopRecording(): RecordingResult? {
        if (!isRecording) return null
        isRecording = false
        val stoppedAt = System.currentTimeMillis()

        // Let writer thread finish draining; bounded wait so UI never hangs.
        try {
            writerThread?.join(3000)
        } catch (_: InterruptedException) {}

        val file = currentFile ?: return null
        val result = RecordingResult(
            filePath = file.absolutePath,
            fileSize = if (file.exists()) file.length() else 0,
            packetCount = packetCount.get(),
            startedAt = startedAt,
            stoppedAt = stoppedAt,
            durationMs = stoppedAt - startedAt,
        )
        currentFile = null
        startedAt = 0
        packetCount.set(0)
        writerThread = null

        logger.info(
            "패킷 로깅 중지: packets=${result.packetCount}, " +
                "duration=${result.durationMs}ms, size=${result.fileSize}B, file=${result.filePath}"
        )
        return result
    }

    fun logPacket(packet: ByteArray, arrivedAt: Long) {
        if (!isRecording) return
        val hexString = packet.joinToString("") { "%02X".format(it) }
        packetQueue.add("[$arrivedAt] $hexString")
        packetCount.incrementAndGet()
    }
}
