package com.tbread.entity

import kotlinx.serialization.Serializable

@Serializable
data class OdeGroupData(
    val arrivedAt: Long,
    val size: Int,
    val ode: Int,
    val transcend: Int,
    val dungeon: Int,
    val dungeonBoss: Int,
    val transcendBoss: Int,
    val odeV1: Int = 0,
    val odeV2: Int = 0,
    val odeTwoValues: Boolean = false,
    val transcendV1: Int = 0,
    val transcendV2: Int = 0,
    val transcendTwoValues: Boolean = false,
    val dungeonV1: Int = 0,
    val dungeonV2: Int = 0,
    val dungeonTwoValues: Boolean = false,
    val dungeonBossV1: Int = 0,
    val dungeonBossV2: Int = 0,
    val dungeonBossTwoValues: Boolean = false,
    val transcendBossV1: Int = 0,
    val transcendBossV2: Int = 0,
    val transcendBossTwoValues: Boolean = false
)
