package com.tbread.addon

import java.io.File

object EnvLoader {
    private val envMap = mutableMapOf<String, String>()

    init {
        // Try to load .env from different locations
        val paths = listOf(
            File(".env"),
            File("../.env"),
            File("../../.env"),
            File("c:/Users/Brian/Documents/GitHub/aion2meter/.env"),
            File("c:/Users/Brian/Documents/GitHub/galmeter/.env")
        )

        var loaded = false
        for (file in paths) {
            if (file.exists() && file.isFile) {
                try {
                    file.readLines().forEach { line ->
                        val trimmed = line.trim()
                        if (trimmed.isEmpty() || trimmed.startsWith("#") || trimmed.startsWith("//")) {
                            return@forEach
                        }
                        val idx = trimmed.indexOf('=')
                        if (idx > 0) {
                            val key = trimmed.substring(0, idx).trim()
                            var value = trimmed.substring(idx + 1).trim()
                            if (value.startsWith("\"") && value.endsWith("\"")) {
                                value = value.substring(1, value.length - 1)
                            } else if (value.startsWith("'") && value.endsWith("'")) {
                                value = value.substring(1, value.length - 1)
                            }
                            envMap[key] = value
                        }
                    }
                    println("[EnvLoader] Loaded env from: ${file.absolutePath}")
                    loaded = true
                    break
                } catch (e: Exception) {
                    // fallback to next path
                }
            }
        }

        // Also try to load from classpath resource as a fallback
        if (!loaded) {
            try {
                javaClass.getResourceAsStream("/.env")?.use { stream ->
                    stream.bufferedReader().readLines().forEach { line ->
                        val trimmed = line.trim()
                        if (trimmed.isEmpty() || trimmed.startsWith("#") || trimmed.startsWith("//")) {
                            return@forEach
                        }
                        val idx = trimmed.indexOf('=')
                        if (idx > 0) {
                            val key = trimmed.substring(0, idx).trim()
                            var value = trimmed.substring(idx + 1).trim()
                            if (value.startsWith("\"") && value.endsWith("\"")) {
                                value = value.substring(1, value.length - 1)
                            } else if (value.startsWith("'") && value.endsWith("'")) {
                                value = value.substring(1, value.length - 1)
                            }
                            envMap[key] = value
                        }
                    }
                    println("[EnvLoader] Loaded env from classpath resource")
                }
            } catch (e: Exception) {
                // best effort
            }
        }
    }

    fun get(key: String): String? {
        return envMap[key] ?: System.getenv(key)
    }
}
