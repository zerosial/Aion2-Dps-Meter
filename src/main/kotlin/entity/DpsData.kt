package com.tbread.entity

import kotlinx.serialization.Required
import kotlinx.serialization.Serializable

@Serializable
data class DpsData(val map:MutableMap<String,PersonalData> = mutableMapOf(),@Required var targetName:String = "")

