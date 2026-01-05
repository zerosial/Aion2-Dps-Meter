package com.tbread

import java.util.concurrent.ConcurrentHashMap

class DataStorage {
    private val byTargetStorage = ConcurrentHashMap<Int, MutableSet<ParsedDamagePacket>>()
    private val byActorStorage = ConcurrentHashMap<Int,MutableSet<ParsedDamagePacket>>()
    private val nicknameStorage = ConcurrentHashMap<Int, String>()

    @Synchronized
    fun appendDamage(pdp: ParsedDamagePacket) {
        byActorStorage.getOrPut(pdp.getActorId()) { mutableSetOf() }.add(pdp)
        byTargetStorage.getOrPut(pdp.getTargetId()) { mutableSetOf() }.add(pdp)
    }

    fun appendNickname(uid: Int, nickname: String) {
        if (nicknameStorage[uid] != null && nicknameStorage[uid] == nickname) return
        nicknameStorage[uid] = nickname
        println("$uid 할당 닉네임 변경됨 이전: ${nicknameStorage[uid]} 현재: $nickname")
    }

    @Synchronized
    private fun flushDamageStorage() {
        byActorStorage.clear()
        byTargetStorage.clear()
    }

    private fun flushNicknameStorage() {
        nicknameStorage.clear()
    }
}