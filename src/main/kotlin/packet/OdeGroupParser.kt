package com.tbread.packet

import com.tbread.data.DungeonDataManager
import com.tbread.entity.OdeGroupData
import kotlinx.coroutines.GlobalScope
import kotlinx.coroutines.delay
import kotlinx.coroutines.launch
import org.slf4j.LoggerFactory

object OdeGroupParser {
    private val logger = LoggerFactory.getLogger(OdeGroupParser::class.java)

    data class GroupSpec(val id: Int, val name: String, val max1: Int, val max2: Int, val used: Boolean)
    data class ParsedGroupValue(val id: Int, val values: List<Int>, val sum: Int, val suffixSize: Int)

    private val odeGroupSpecs = mapOf(
        1 to GroupSpec(1, "오드", 840, 2000, true),
        2 to GroupSpec(2, "초월 횟수", 14, 10, true),
        3 to GroupSpec(3, "버림", 0, 0, false),
        4 to GroupSpec(4, "버림", 0, 0, false),
        5 to GroupSpec(5, "버림", 0, 0, false),
        6 to GroupSpec(6, "던전 횟수", 28, 10, true),
        7 to GroupSpec(7, "던전보스 처치", 35, 30, true),
        8 to GroupSpec(8, "초월보스 처치", 28, 30, true)
    )

    private val odeGroupHeaders = (1..8).associateWith { id ->
        byteArrayOf(id.toByte(), 0x87.toByte(), 0x93.toByte(), 0x03)
    }

    private val possibleSuffixBytes = setOf<Byte>(0x04, 0x08, 0x0C)

    fun parseOdeGroupPacket(packet: ByteArray, arrivedAt: Long, processor: StreamProcessor) {
        val groupOffsets = mutableMapOf<Int, Int>()
        for (id in 1..8) {
            val header = odeGroupHeaders[id]!!
            val idx = findArrayIndex(packet, header)
            if (idx == -1) return
            groupOffsets[id] = idx
        }

        val offsets = (1..8).map { groupOffsets[it]!! }
        if (offsets != offsets.sorted()) return

        val byId = mutableMapOf<Int, ParsedGroupValue>()
        for (id in 1..8) {
            val spec = odeGroupSpecs[id] ?: continue
            if (!spec.used) continue

            val dataStart = groupOffsets[id]!! + 4
            val dataEnd = if (id == 8) {
                val m = findByteIndex(packet, 0x65.toByte(), dataStart)
                if (m != -1) m else packet.size
            } else {
                groupOffsets[id + 1]!!
            }

            if (dataStart > dataEnd || dataEnd > packet.size) continue
            val body = packet.copyOfRange(dataStart, dataEnd)

            if (id == 6 && body.size == 1 && body[0] == 0x08.toByte()) {
                byId[id] = ParsedGroupValue(id, emptyList(), 0, 0)
                continue
            }

            val parsed = parseOdeGroupBody(id, spec, body, processor) ?: continue
            byId[id] = parsed
        }

        if (byId.isEmpty()) return

        val data = OdeGroupData(
            arrivedAt = arrivedAt,
            size = packet.size,
            ode = byId[1]?.sum ?: 0,
            transcend = byId[2]?.sum ?: 0,
            dungeon = byId[6]?.sum ?: 0,
            dungeonBoss = byId[7]?.sum ?: 0,
            transcendBoss = byId[8]?.sum ?: 0,
            odeV1 = byId[1]?.values?.getOrNull(0) ?: 0,
            odeV2 = byId[1]?.values?.getOrNull(1) ?: 0,
            odeTwoValues = (byId[1]?.values?.size ?: 0) >= 2,
            transcendV1 = byId[2]?.values?.getOrNull(0) ?: 0,
            transcendV2 = byId[2]?.values?.getOrNull(1) ?: 0,
            transcendTwoValues = (byId[2]?.values?.size ?: 0) >= 2,
            dungeonV1 = byId[6]?.values?.getOrNull(0) ?: 0,
            dungeonV2 = byId[6]?.values?.getOrNull(1) ?: 0,
            dungeonTwoValues = (byId[6]?.values?.size ?: 0) >= 2,
            dungeonBossV1 = byId[7]?.values?.getOrNull(0) ?: 0,
            dungeonBossV2 = byId[7]?.values?.getOrNull(1) ?: 0,
            dungeonBossTwoValues = (byId[7]?.values?.size ?: 0) >= 2,
            transcendBossV1 = byId[8]?.values?.getOrNull(0) ?: 0,
            transcendBossV2 = byId[8]?.values?.getOrNull(1) ?: 0,
            transcendBossTwoValues = (byId[8]?.values?.size ?: 0) >= 2
        )

        logger.info("[던전] 오드=\${data.ode} 초월=\${data.transcend} 던전=\${data.dungeon} 던전보스=\${data.dungeonBoss} 초월보스=\${data.transcendBoss}")

        GlobalScope.launch {
            delay(1000)
            val name = extractCharacterNameFromWindow()
            if (name.isNotBlank()) {
                logger.info("[던전] 캐릭터명 감지: \$name")
            }
            DungeonDataManager.updateFromPacket(data, name)
        }
    }

    private fun parseOdeGroupBody(id: Int, spec: GroupSpec, body: ByteArray, processor: StreamProcessor): ParsedGroupValue? {
        val candidates = mutableListOf<ParsedGroupValue>()
        for (suffixLen in 0..body.size) {
            val coreLen = body.size - suffixLen
            if (coreLen < 0) continue

            val core = body.copyOfRange(0, coreLen)
            val suffix = body.copyOfRange(coreLen, body.size)

            if (!isValidSuffix(suffix)) continue
            if (core.isEmpty()) continue

            val values = readAllVarIntsSafely(core, processor)
            if (values.isEmpty() || values.size > 2) continue

            var valid = false
            if (values.size == 1) {
                valid = values[0] in 0..Math.max(spec.max1, spec.max2)
            } else {
                valid = (values[0] in 0..spec.max1) && (values[1] in 0..spec.max2)
            }

            if (valid) {
                candidates.add(ParsedGroupValue(id, values, values.sum(), suffix.size))
            }
        }

        return candidates.sortedWith(compareByDescending<ParsedGroupValue> { it.values.size }.thenBy { it.suffixSize }).firstOrNull { it.suffixSize > 0 } ?: candidates.firstOrNull()
    }

    private fun readAllVarIntsSafely(data: ByteArray, processor: StreamProcessor): List<Int> {
        val result = mutableListOf<Int>()
        var offset = 0
        while (offset < data.size) {
            val v = processor.readVarInt(data, offset)
            if (v.length <= 0) return emptyList()
            result.add(v.value)
            offset += v.length
        }
        return result
    }

    private fun isValidSuffix(suffix: ByteArray): Boolean {
        if (suffix.isEmpty()) return true
        if (suffix.size > 1) return false
        return possibleSuffixBytes.contains(suffix[0])
    }

    private fun extractCharacterNameFromWindow(): String {
        var foundTitle = ""
        com.sun.jna.platform.win32.User32.INSTANCE.EnumWindows(object : com.sun.jna.platform.win32.WinUser.WNDENUMPROC {
            override fun callback(hwnd: com.sun.jna.platform.win32.WinDef.HWND, data: com.sun.jna.Pointer?): Boolean {
                val windowText = CharArray(512)
                com.sun.jna.platform.win32.User32.INSTANCE.GetWindowText(hwnd, windowText, 512)
                val wTitle = String(windowText).trim { it <= ' ' }
                if (wTitle.contains("AION2", ignoreCase = true)) {
                    foundTitle = wTitle
                    return false
                }
                return true
            }
        }, null)

        if (foundTitle.isBlank()) return ""

        val regex = Regex("^AION2\\\\s*[|ㅣlI]\\\\s*(.+)$", RegexOption.IGNORE_CASE)
        val match = regex.find(foundTitle)
        return match?.groupValues?.getOrNull(1)?.trim()?.toString() ?: ""
    }

    private fun findArrayIndex(data: ByteArray, p: ByteArray): Int {
        if (p.isEmpty()) return 0
        val lps = IntArray(p.size)
        var len = 0
        var i = 1
        while (i < p.size) {
            if (p[i] == p[len]) {
                len++
                lps[i] = len
                i++
            } else {
                if (len != 0) {
                    len = lps[len - 1]
                } else {
                    lps[i] = 0
                    i++
                }
            }
        }
        i = 0
        var j = 0
        while (i < data.size) {
            if (p[j] == data[i]) {
                j++
                i++
            }
            if (j == p.size) {
                return i - j
            } else if (i < data.size && p[j] != data[i]) {
                if (j != 0) {
                    j = lps[j - 1]
                } else {
                    i++
                }
            }
        }
        return -1
    }

    private fun findByteIndex(target: ByteArray, byte: Byte, startOffset: Int = 0): Int {
        for (i in startOffset until target.size) {
            if (target[i] == byte) return i
        }
        return -1
    }
}
