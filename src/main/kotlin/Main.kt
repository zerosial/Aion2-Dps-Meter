package com.tbread

import com.tbread.config.PcapCapturerConfig
import com.tbread.config.VersionConfig
import com.tbread.data.DataManager
import com.tbread.packet.*
import com.tbread.webview.BrowserApp
import javafx.application.Platform
import javafx.stage.Stage
import kotlinx.coroutines.Dispatchers
import kotlinx.coroutines.channels.Channel
import kotlinx.coroutines.delay
import kotlinx.coroutines.launch
import kotlinx.coroutines.runBlocking

fun main() = runBlocking {
    Thread.setDefaultUncaughtExceptionHandler { t, e ->
        println("thread dead ${t.name}")
        e.printStackTrace()
    }

    DataManager.load()

    val channel = Channel<CapturedPacket>(4096)
    val pcapConfig = PcapCapturerConfig.loadFromProperties()
    val versionConfig = VersionConfig.loadFromProperties()


    val processor = StreamProcessor()
    val alignmenter = PacketAlignmenter()
    val assembler = StreamAssembler(processor)
    
    val captureMode = pcapConfig.captureMode
    val capturer = if (captureMode != "WINDIVERT") PcapCapturer(pcapConfig, channel) else null
    val divertCapturer = if (captureMode == "WINDIVERT") WinDivertCapturer(pcapConfig, channel) else null

    val calculator = DpsCalculator {
        assembler.flush()
        alignmenter.reset()
    }

    // Phase 3: DataManager 변경 시 DpsCalculator dirty flag 설정
    DataManager.setOnChangeCallback { calculator.markDirty() }

    launch(Dispatchers.Default) {
        var currentIp = ""
        for ((ip, seq, data, arrivedAt) in channel) {
            if (ip != currentIp) {
                currentIp = ip
                alignmenter.reset()
            }
            val chunks = alignmenter.feed(seq, data, arrivedAt)
            for ((chunk, ts) in chunks) {
                assembler.processChunk(chunk, ts)
            }
        }
    }

    launch(Dispatchers.IO) {
        if (divertCapturer != null) {
            println("[CAPTURED] Starting WinDivert Kernel-level Capture Mode...")
            divertCapturer.start()
        } else {
            println("[CAPTURED] Starting Npcap Packet Sniffing Capture Mode...")
            capturer?.start()
        }
    }

    launch {
        while (true) {
            delay(1000)
            DataManager.checkDummyTimeout()
        }
    }

    Platform.startup {
        val browserApp = BrowserApp(versionConfig,calculator)
        browserApp.start(Stage())
    }
}


