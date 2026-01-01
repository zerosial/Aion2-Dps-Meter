package com.tbread

import java.io.FileInputStream
import java.io.IOException
import java.io.UnsupportedEncodingException
import java.util.*

object PropertyHandler {
    private val props = Properties()

    init {
        loadProperties("settings.properties")
    }

    fun loadProperties(fname: String) {
        try {
            FileInputStream(fname).use { fis ->
                props.load(fis)
            }
        } catch (e: IOException) {
            println("설정 파일 읽기에 실패했습니다.")
        }
    }

    private fun encodeToEucKr(key: String?): String? {
        if (key == null) return null
        return try {
            String(key.toByteArray(Charsets.ISO_8859_1), charset("EUC-KR"))
        } catch (e: UnsupportedEncodingException) {
            key
        }
    }

    fun getProperty(key: String): String? {
        return encodeToEucKr(props.getProperty(key))
    }

    fun getProperty(key: String, defaultValue: String): String?{
        return encodeToEucKr(props.getProperty(key,defaultValue))
    }


}