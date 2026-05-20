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
        val envUrl = EnvLoader.get("UPLOAD_URL") ?: "https://cielui.com"
        if (envUrl.endsWith("/")) envUrl else "$envUrl/"
    }

    private val apiKey: String by lazy {
        EnvLoader.get("UPLOAD_API_KEY") ?: ""
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

        // Robust User Resolution
        val selfUser = log.report.contributors.find { it.isExecutor }
            ?: log.report.contributors.firstOrNull { it.nickname != null && !it.nickname!!.all { c -> c.isDigit() } }
            ?: log.report.contributors.firstOrNull()

        val nameWithSuffix = selfUser?.nickname ?: "Unknown"
        val selfName = stripServerSuffix(nameWithSuffix)

        // Robust Server Resolution
        var selfServerId = selfUser?.server ?: -1
        var selfServer = ServerMap.getName(selfServerId)
        if (selfServer.isEmpty()) {
            if (nameWithSuffix.contains('[') && nameWithSuffix.contains(']')) {
                val start = nameWithSuffix.indexOf('[') + 1
                val end = nameWithSuffix.indexOf(']')
                if (end > start) {
                    selfServer = nameWithSuffix.substring(start, end).trim()
                }
            }
            if (selfServer.isEmpty()) {
                // Try fallback from other contributors
                val fallbackId = log.report.contributors
                    .map { it.server }
                    .firstOrNull { it in 1001..1021 || it in 2001..2021 }
                if (fallbackId != null) {
                    selfServer = ServerMap.getName(fallbackId)
                } else {
                    // Look at contributors' nicknames for server suffixes
                    for (member in log.report.contributors) {
                        val mNick = member.nickname ?: ""
                        if (mNick.contains('[') && mNick.contains(']')) {
                            val start = mNick.indexOf('[') + 1
                            val end = mNick.indexOf(']')
                            if (end > start) {
                                selfServer = mNick.substring(start, end).trim()
                                if (selfServer.isNotEmpty()) break
                            }
                        }
                    }
                }
            }
            // Ultimate fallback to "시엘"
            if (selfServer.isEmpty()) {
                selfServer = "시엘"
            }
        }

        val battleStart = log.report.battleStart
        val battleEnd = log.report.battleEnd
        val durationSec = if (battleStart > 0 && battleEnd >= battleStart) {
            ((battleEnd - battleStart) / 1000.0).toInt().coerceAtLeast(1)
        } else {
            1
        }

        val totalDamage = log.report.information.values.sumOf { it.amount }
        val isLocalDev = uploadUrl.contains("localhost") || uploadUrl.contains("127.0.0.1")
        val minDuration = if (isLocalDev) 1 else 10
        val minDamage = if (isLocalDev) 1.0 else 1_000_000.0

        if (durationSec < minDuration || totalDamage < minDamage) {
            println("[UploadAddonImpl] Skip uploading: duration (${durationSec}s) < ${minDuration}s or total damage (${totalDamage}) < $minDamage")
            return false
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
