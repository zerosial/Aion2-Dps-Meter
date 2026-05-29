package com.tbread.addon

import com.tbread.packet.PacketLogger
import kotlinx.serialization.json.JsonObject
import kotlinx.serialization.json.JsonPrimitive
import kotlinx.serialization.json.buildJsonObject
import org.slf4j.LoggerFactory
import java.io.File
import java.net.URI
import java.net.http.HttpClient
import java.net.http.HttpRequest
import java.net.http.HttpResponse
import java.time.Duration

/**
 * Upload a finished packet recording (raw hex log file) to the cielui admin
 * endpoint. Used by the dev/prerelease build's recording feature so test
 * sessions automatically land on the server for inspection without manual
 * file shuffling.
 *
 * Endpoint:
 *   POST {UPLOAD_URL}/api/admin/packet-recordings/upload
 *   Header X-Upload-Api-Key: {UPLOAD_API_KEY}  (reuses the existing meter key)
 *   Body application/json:
 *     uploaderName, uploaderServer, meterVersion, packetCount, durationMs,
 *     startedAt, stoppedAt, logContent (raw text)
 */
object PacketRecordingUploader {
    private val logger = LoggerFactory.getLogger(PacketRecordingUploader::class.java)

    private val httpClient: HttpClient by lazy {
        HttpClient.newBuilder().connectTimeout(Duration.ofSeconds(15)).build()
    }
    private val uploadUrl: String by lazy {
        val u = EnvLoader.get("UPLOAD_URL") ?: "http://localhost:5173/"
        if (u.endsWith("/")) u else "$u/"
    }
    private val apiKey: String by lazy { EnvLoader.get("UPLOAD_API_KEY") ?: "" }

    /**
     * Send the recording file to cielui. Runs synchronously on the caller's
     * thread; BrowserApp invokes it from a coroutine / off-EDT context so the
     * UI doesn't block on multi-MB uploads.
     */
    fun upload(
        result: PacketLogger.RecordingResult,
        uploaderName: String,
        uploaderServer: String,
        meterVersion: String,
    ): UploadOutcome {
        val file = File(result.filePath)
        if (!file.exists()) {
            return UploadOutcome(success = false, code = -1, message = "file missing: ${result.filePath}")
        }
        val logContent = try {
            file.readText(Charsets.UTF_8)
        } catch (e: Exception) {
            logger.error("녹화 파일 읽기 실패", e)
            return UploadOutcome(success = false, code = -1, message = "read failed: ${e.message}")
        }

        val body: JsonObject = buildJsonObject {
            put("uploaderName",   JsonPrimitive(uploaderName))
            put("uploaderServer", JsonPrimitive(uploaderServer))
            put("meterVersion",   JsonPrimitive(meterVersion))
            put("packetCount",    JsonPrimitive(result.packetCount))
            put("durationMs",     JsonPrimitive(result.durationMs))
            put("fileSize",       JsonPrimitive(result.fileSize))
            put("startedAt",      JsonPrimitive(result.startedAt))
            put("stoppedAt",      JsonPrimitive(result.stoppedAt))
            put("logContent",     JsonPrimitive(logContent))
        }
        val bodyStr = body.toString()

        return try {
            val req = HttpRequest.newBuilder()
                .uri(URI.create(uploadUrl + "api/admin/packet-recordings/upload"))
                .timeout(Duration.ofMinutes(2))
                .header("Content-Type", "application/json; charset=utf-8")
                .header("X-Upload-Api-Key", apiKey)
                .POST(HttpRequest.BodyPublishers.ofString(bodyStr, Charsets.UTF_8))
                .build()
            val res = httpClient.send(req, HttpResponse.BodyHandlers.ofString())
            val ok = res.statusCode() in 200..299
            if (ok) {
                logger.info(
                    "녹화 업로드 성공 packets=${result.packetCount} size=${result.fileSize} → ${res.statusCode()}"
                )
            } else {
                logger.warn("녹화 업로드 실패 status=${res.statusCode()} body=${res.body()?.take(200)}")
            }
            UploadOutcome(success = ok, code = res.statusCode(), message = res.body() ?: "")
        } catch (e: Exception) {
            logger.error("녹화 업로드 네트워크 오류", e)
            UploadOutcome(success = false, code = -1, message = e.message ?: "network error")
        }
    }

    data class UploadOutcome(val success: Boolean, val code: Int, val message: String)
}
