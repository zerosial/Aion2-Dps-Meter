package com.tbread.data

import com.tbread.entity.OdeGroupData

object DungeonDataManager {
    @Volatile var username: String = ""
    @Volatile var ode: Int = 0
    @Volatile var dungeon: Int = 0
    @Volatile var dungeonBoss: Int = 0
    @Volatile var transcend: Int = 0
    @Volatile var transcendBoss: Int = 0
    @Volatile var lastUpdated: Long = 0L

    fun updateFromPacket(data: OdeGroupData, charName: String) {
        if (charName.isNotBlank() && charName != username) {
            username = charName
        }
        ode = data.ode
        dungeon = data.dungeon
        dungeonBoss = data.dungeonBoss
        transcend = data.transcend
        transcendBoss = data.transcendBoss
        lastUpdated = System.currentTimeMillis()
    }
}
