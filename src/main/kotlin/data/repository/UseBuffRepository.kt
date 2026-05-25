package com.tbread.data.repository

import com.tbread.entity.UseBuff
import java.util.Collections
import java.util.concurrent.ConcurrentHashMap

class UseBuffRepository {
    private val storage = ConcurrentHashMap<Int, MutableList<UseBuff>>()

    fun save(id: Int, useBuff: UseBuff) {
        val list = storage.computeIfAbsent(id) { Collections.synchronizedList(ArrayList()) }
        synchronized(list) { list.add(useBuff) }
    }

    fun findOverlapping(id: Int, timestamp1: Long, timestamp2: Long): List<UseBuff> {
        val list = storage[id] ?: return emptyList()
        return synchronized(list) {
            list.filter { buff ->
                buff.buffStart <= timestamp2 && buff.buffEnd >= timestamp1
            }
        }
    }
}