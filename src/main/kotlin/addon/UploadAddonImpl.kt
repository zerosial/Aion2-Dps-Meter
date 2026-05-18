package com.tbread.addon

import com.tbread.entity.DpsLog
import com.tbread.entity.ParsedDamagePacket
import com.tbread.util.ServerMap
import kotlinx.serialization.json.*
import java.net.URI
import java.net.http.HttpClient
import java.net.http.HttpRequest
import java.net.http.HttpResponse
import java.time.Duration
import java.time.Instant
import java.time.ZoneId
import java.time.format.DateTimeFormatter

class UploadAddonImpl : BattleLogUploader {

    private val httpClient: HttpClient by lazy {
        HttpClient.newBuilder()
            .connectTimeout(Duration.ofSeconds(10))
            .build()
    }

    private val uploadUrl: String by lazy {
        val envUrl = System.getenv("UPLOAD_URL") ?: "https://aion2.cielui.com"
        if (envUrl.endsWith("/")) envUrl else "$envUrl/"
    }

    private val apiKey: String by lazy {
        System.getenv("UPLOAD_API_KEY") ?: "ciel_a2m_secure_tr_9f3b8a1c6e2d4d"
    }

    private val dateFormatter = DateTimeFormatter.ofPattern("yyyy-MM-dd HH:mm:ss")
        .withZone(ZoneId.systemDefault())

    override fun upload(log: DpsLog): Boolean {
        val target = log.report.target ?: return false
        val mob = target.mob
        if (!mob.boss) {
            println("[UploadAddonImpl] Skip uploading: target is not a boss (${mob.name})")
            return false
        }

        val selfUser = log.report.contributors.find { it.isExecutor } ?: return false
        val selfName = selfUser.nickname ?: "Unknown"
        val selfServerId = selfUser.server
        val selfServer = ServerMap.getName(selfServerId)
        if (selfServer.isEmpty()) {
            println("[UploadAddonImpl] Skip uploading: unknown self server ID $selfServerId")
            return false
        }

        val battleStart = log.report.battleStart
        val battleEnd = log.report.battleEnd
        val durationSec = if (battleStart > 0 && battleEnd >= battleStart) {
            ((battleEnd - battleStart) / 1000.0).toInt().coerceAtLeast(1)
        } else {
            1
        }

        val timestampStr = dateFormatter.format(Instant.ofEpochMilli(battleStart.coerceAtLeast(1L)))

        // Gather all parsed packets for calculating crit percent
        val packets = log.report.packets ?: emptyList()

        val membersArray = buildJsonArray {
            for (member in log.report.contributors) {
                val memberName = stripServerSuffix(member.nickname ?: "Unknown")
                val memberServer = if (member.server <= 0) selfServer else ServerMap.getName(member.server).ifEmpty { selfServer }
                val className = member.job?.className ?: ""
                
                // Get dps info from report information map
                val dpsInfo = log.report.information[member.id]
                val dpsVal = dpsInfo?.dps ?: 0.0
                val sharePct = (dpsInfo?.contribution ?: 0.0) * 100.0
                val roundedSharePct = Math.round(sharePct * 10.0) / 10.0

                // Calculate critical rate
                val memberPackets = packets.filter { it.getActorId() == member.id && !it.isDoT() }
                val totalHits = memberPackets.size
                val critHits = memberPackets.count { it.isCrit() }
                val critPct = if (totalHits > 0) {
                    val rawCrit = (critHits.toDouble() / totalHits) * 100.0
                    Math.round(rawCrit * 10.0) / 10.0
                } else {
                    0.0
                }

                add(buildJsonObject {
                    put("name", memberName)
                    put("server", memberServer)
                    put("className", className)
                    put("dps", dpsVal)
                    put("sharePct", roundedSharePct)
                    put("critPct", critPct)
                    put("combatPower", member.power)
                    put("combatScore", 0) // Default / placeholder as in C# when not present
                })
            }
        }

        val payload = buildJsonObject {
            put("uploaderName", selfName)
            put("uploaderServer", selfServer)
            put("bossName", mob.name)
            put("field", "필드")
            put("durationSec", durationSec)
            put("timestamp", timestampStr)
            put("members", membersArray)
        }

        return try {
            val jsonString = payload.toString()
            val request = HttpRequest.newBuilder()
                .uri(URI.create("${uploadUrl}api/logs/upload"))
                .header("Content-Type", "application/json")
                .header("User-Agent", "Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36")
                .header("Accept", "application/json")
                .apply {
                    if (apiKey.isNotEmpty()) {
                        header("X-Upload-Api-Key", apiKey)
                    }
                }
                .POST(HttpRequest.BodyPublishers.ofString(jsonString))
                .build()

            val response = httpClient.send(request, HttpResponse.BodyHandlers.ofString())
            if (response.statusCode() in 200..299) {
                println("[UploadAddonImpl] Uploaded stats successfully for boss ${mob.name}")
                // Fire and forget character fetch
                try {
                    val escServer = java.net.URLEncoder.encode(selfServer, "UTF-8")
                    val escName = java.net.URLEncoder.encode(selfName, "UTF-8")
                    val fetchRequest = HttpRequest.newBuilder()
                        .uri(URI.create("${uploadUrl}api/character?server=$escServer&name=$escName&force=true"))
                        .header("User-Agent", "Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36")
                        .GET()
                        .build()
                    httpClient.sendAsync(fetchRequest, HttpResponse.BodyHandlers.discarding())
                } catch (e: Exception) {
                    // ignore fetch errors
                }
                true
            } else {
                System.err.println("[UploadAddonImpl] Upload failed: HTTP ${response.statusCode()} | ${response.body()}")
                false
            }
        } catch (e: Exception) {
            System.err.println("[UploadAddonImpl] Upload exception: ${e.message}")
            false
        }
    }

    private fun stripServerSuffix(name: String): String {
        val idx = name.indexOf('[')
        return if (idx > 0) name.substring(0, idx) else name
    }
}
