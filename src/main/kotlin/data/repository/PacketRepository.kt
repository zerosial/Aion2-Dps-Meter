package com.tbread.data.repository

import com.tbread.entity.ParsedDamagePacket
import java.util.Collections
import java.util.concurrent.ConcurrentHashMap

class PacketRepository {
    private val storage = ConcurrentHashMap<Int, MutableList<ParsedDamagePacket>>()
    @Volatile
    private var currentTarget = 0
    @Volatile
    private var currentBattleStart = 0L
    @Volatile
    private var currentBattleEnd = 0L

    fun save(pdp: ParsedDamagePacket) {
        val list = storage.computeIfAbsent(pdp.getTargetId()) {
            Collections.synchronizedList(ArrayList())
        }
        synchronized(list) { list.add(pdp) }
    }

    fun get(id: Int): MutableList<ParsedDamagePacket>? {
        return storage[id]
    }

    /**
     * Thread-safe snapshot 반환 — DPS 계산 시 사용
     */
    fun getSnapshot(id: Int): List<ParsedDamagePacket> {
        val list = storage[id] ?: return emptyList()
        return synchronized(list) { ArrayList(list) }
    }

    fun getAll(): ConcurrentHashMap<Int, MutableList<ParsedDamagePacket>> {
        return storage
    }

    /**
     * 모든 값을 flat하게 snapshot으로 반환
     */
    fun getAllFlattened(): List<ParsedDamagePacket> {
        val result = ArrayList<ParsedDamagePacket>()
        for (list in storage.values) {
            synchronized(list) { result.addAll(list) }
        }
        return result
    }

    fun exist(id: Int): Boolean {
        return storage.containsKey(id)
    }

    fun size(id: Int): Int {
        val list = storage[id] ?: return 0
        return synchronized(list) { list.size }
    }

    fun flush() {
        currentTarget = 0
        currentBattleStart = 0
        currentBattleEnd = 0
        storage.clear()
    }

    fun currentTarget(): Int {
        return currentTarget
    }

    fun currentTarget(targetId: Int): Int {
        val pastTarget = currentTarget
        currentTarget = targetId
        return pastTarget
    }

    fun flushBattleTime() {
        currentBattleStart = 0
        currentBattleEnd = 0
    }

    fun currentBattleStart(): Long {
        return currentBattleStart
    }

    fun currentBattleEnd(): Long {
        return currentBattleEnd
    }

    fun saveCurrentBattleStart() {
        currentBattleStart = System.currentTimeMillis()
    }

    fun saveCurrentBattleEnd(time: Long = System.currentTimeMillis()) {
        currentBattleEnd = time
    }
}