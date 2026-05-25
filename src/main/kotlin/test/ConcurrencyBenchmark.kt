package com.tbread.test

import java.util.Collections
import java.util.concurrent.ConcurrentHashMap
import java.util.concurrent.CopyOnWriteArrayList
import java.util.concurrent.CountDownLatch
import java.util.concurrent.Executors
import java.util.concurrent.atomic.AtomicLong
import kotlin.system.measureTimeMillis

/**
 * CopyOnWriteArrayList vs synchronized(ArrayList) 동시성 + 정합성 벤치마크.
 * 
 * 시나리오: 전투 중 데미지 패킷이 들어오는 상황을 시뮬레이션
 * - Writer: 고빈도 add() (패킷 수신 스레드)
 * - Reader: 주기적으로 전체 순회 + 합산 (DPS 계산 스레드)
 * - Reader2: snapshot 읽기 (UI 폴링)
 *
 * 검증 항목:
 * 1. 최종 데이터 크기 일치 (누락 없음)
 * 2. Reader가 읽는 도중 ConcurrentModificationException 없음
 * 3. 처리 시간 비교
 */
fun main() {
    println("=" .repeat(60))
    println("  Galmeter 동시성 벤치마크: CopyOnWriteArrayList vs sync(ArrayList)")
    println("=" .repeat(60))
    println()

    val iterations = 5
    val writeCount = 50_000    // 전투 1판에서 발생할 수 있는 패킷 수 (과대 추정)
    val readerIntervalMs = 1L  // Reader 폴링 간격 (실제보다 공격적)
    val writerThreads = 2      // 패킷 처리 + 압축해제 재귀

    // ── CopyOnWriteArrayList 벤치마크 ──
    println("▶ CopyOnWriteArrayList 테스트 (${iterations}회 반복)")
    val cowTimes = mutableListOf<Long>()
    val cowErrors = mutableListOf<String>()

    repeat(iterations) { iter ->
        val storage = ConcurrentHashMap<Int, CopyOnWriteArrayList<FakeDamagePacket>>()
        val result = runBenchmark(
            storage = storage,
            createList = { CopyOnWriteArrayList() },
            addToList = { list, item -> list.add(item) },
            readList = { list -> list.toList() },
            getSize = { list -> list.size },
            writeCount = writeCount,
            writerThreads = writerThreads,
            readerIntervalMs = readerIntervalMs
        )
        cowTimes.add(result.elapsedMs)
        if (!result.isCorrect) cowErrors.add("iter=$iter: ${result.errorMessage}")
        println("  [${iter + 1}] ${result.elapsedMs}ms | writes=${result.totalWrites} reads=${result.totalReads} | correct=${result.isCorrect}")
    }

    println()

    // ── synchronized(ArrayList) 벤치마크 ──
    println("▶ synchronized(ArrayList) 테스트 (${iterations}회 반복)")
    val syncTimes = mutableListOf<Long>()
    val syncErrors = mutableListOf<String>()

    repeat(iterations) { iter ->
        val storage = ConcurrentHashMap<Int, MutableList<FakeDamagePacket>>()
        val result = runBenchmark(
            storage = storage,
            createList = { Collections.synchronizedList(ArrayList()) },
            addToList = { list, item -> synchronized(list) { list.add(item) } },
            readList = { list -> synchronized(list) { ArrayList(list) } },
            getSize = { list -> synchronized(list) { list.size } },
            writeCount = writeCount,
            writerThreads = writerThreads,
            readerIntervalMs = readerIntervalMs
        )
        syncTimes.add(result.elapsedMs)
        if (!result.isCorrect) syncErrors.add("iter=$iter: ${result.errorMessage}")
        println("  [${iter + 1}] ${result.elapsedMs}ms | writes=${result.totalWrites} reads=${result.totalReads} | correct=${result.isCorrect}")
    }

    println()
    println("=" .repeat(60))
    println("  결과 요약")
    println("=" .repeat(60))
    println()
    println("  CopyOnWriteArrayList:")
    println("    평균: ${cowTimes.average().toLong()}ms | 최소: ${cowTimes.min()}ms | 최대: ${cowTimes.max()}ms")
    println("    오류: ${if (cowErrors.isEmpty()) "없음 ✓" else cowErrors.joinToString("; ")}")
    println()
    println("  synchronized(ArrayList):")
    println("    평균: ${syncTimes.average().toLong()}ms | 최소: ${syncTimes.min()}ms | 최대: ${syncTimes.max()}ms")
    println("    오류: ${if (syncErrors.isEmpty()) "없음 ✓" else syncErrors.joinToString("; ")}")
    println()

    val speedup = cowTimes.average() / syncTimes.average()
    println("  성능 비교: synchronized(ArrayList)가 ${String.format("%.1f", speedup)}배 빠름")
    println()

    if (cowErrors.isEmpty() && syncErrors.isEmpty()) {
        println("  ✅ 두 구현 모두 동시성 정합성 테스트 통과")
    } else {
        println("  ❌ 오류 발견 — 위 로그 확인 필요")
    }
}

// ── 가짜 데미지 패킷 (실제 ParsedDamagePacket 모방) ──
data class FakeDamagePacket(
    val actorId: Int,
    val targetId: Int,
    val damage: Int,
    val skillCode: Int,
    val timestamp: Long
)

data class BenchmarkResult(
    val elapsedMs: Long,
    val totalWrites: Long,
    val totalReads: Long,
    val isCorrect: Boolean,
    val errorMessage: String = ""
)

fun <L> runBenchmark(
    storage: ConcurrentHashMap<Int, L>,
    createList: () -> L,
    addToList: (L, FakeDamagePacket) -> Unit,
    readList: (L) -> List<FakeDamagePacket>,
    getSize: (L) -> Int,
    writeCount: Int,
    writerThreads: Int,
    readerIntervalMs: Long
): BenchmarkResult {
    val totalWrites = AtomicLong(0)
    val totalReads = AtomicLong(0)
    val errors = Collections.synchronizedList(mutableListOf<String>())
    val targetIds = listOf(1001, 1002, 1003) // 3개 타겟에 분산 저장
    val writesPerThread = writeCount / writerThreads

    val executor = Executors.newFixedThreadPool(writerThreads + 2) // writers + 2 readers
    val writersDone = CountDownLatch(writerThreads)
    val allDone = CountDownLatch(writerThreads + 2)

    var stopReaders = false

    val elapsed = measureTimeMillis {
        // Writer threads
        repeat(writerThreads) { threadIdx ->
            executor.submit {
                try {
                    for (i in 0 until writesPerThread) {
                        val targetId = targetIds[i % targetIds.size]
                        val list = storage.computeIfAbsent(targetId) { createList() }
                        val packet = FakeDamagePacket(
                            actorId = threadIdx * 100000 + i,
                            targetId = targetId,
                            damage = (100..50000).random(),
                            skillCode = (110000000..190000000).random(),
                            timestamp = System.currentTimeMillis()
                        )
                        addToList(list, packet)
                        totalWrites.incrementAndGet()
                    }
                } catch (e: Exception) {
                    errors.add("Writer[$threadIdx] error: ${e.javaClass.simpleName}: ${e.message}")
                } finally {
                    writersDone.countDown()
                    allDone.countDown()
                }
            }
        }

        // Reader 1: 전체 순회 + 합산 (DPS 계산 시뮬레이션)
        executor.submit {
            try {
                while (!stopReaders) {
                    for (targetId in targetIds) {
                        val list = storage[targetId] ?: continue
                        val snapshot = readList(list)
                        // DPS 계산 시뮬레이션: 전체 합산
                        var sum = 0L
                        for (p in snapshot) {
                            sum += p.damage
                        }
                        totalReads.incrementAndGet()
                    }
                    Thread.sleep(readerIntervalMs)
                }
            } catch (e: Exception) {
                errors.add("Reader1 error: ${e.javaClass.simpleName}: ${e.message}")
            } finally {
                allDone.countDown()
            }
        }

        // Reader 2: size 체크 + 마지막 원소 읽기 (UI 폴링 시뮬레이션)
        executor.submit {
            try {
                while (!stopReaders) {
                    for (targetId in targetIds) {
                        val list = storage[targetId] ?: continue
                        val size = getSize(list)
                        if (size > 0) {
                            val snapshot = readList(list)
                            if (snapshot.isNotEmpty()) {
                                // 마지막 원소 접근
                                val ignored = snapshot[snapshot.size - 1]
                            }
                        }
                        totalReads.incrementAndGet()
                    }
                    Thread.sleep(readerIntervalMs)
                }
            } catch (e: Exception) {
                errors.add("Reader2 error: ${e.javaClass.simpleName}: ${e.message}")
            } finally {
                allDone.countDown()
            }
        }

        // Writer 완료 대기 후 reader 중지
        writersDone.await()
        stopReaders = true
        allDone.await()
    }

    executor.shutdown()

    // 정합성 검증: 총 write 수 == 모든 리스트의 합산 크기
    val actualTotal = storage.values.sumOf { getSize(it) }
    val expectedTotal = writeCount.toLong()
    val isCorrect = errors.isEmpty() && actualTotal == expectedTotal.toInt()
    val errorMsg = when {
        errors.isNotEmpty() -> errors.joinToString("; ")
        actualTotal != expectedTotal.toInt() -> "크기 불일치: expected=$expectedTotal actual=$actualTotal"
        else -> ""
    }

    return BenchmarkResult(elapsed, totalWrites.get(), totalReads.get(), isCorrect, errorMsg)
}
