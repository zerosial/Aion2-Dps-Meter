## v1.7.9-dev (프리릴리즈, 개발용 테스트 빌드)

> 이 빌드는 **테스트용 사전 배포본**입니다. 안정성이 검증되지 않은 변경이 포함될 수 있습니다.

### 신규 — 패킷 녹화 + cielui 자동 업로드 (dev 한정)

- 헤더 좌측의 **🔴 로그 기록 시작** 버튼은 `__IS_LOCAL__` 빌드(=dev 브랜치 prerelease 또는 로컬 개발)에서만 노출됩니다.
- 시작 → 종료 사이의 모든 raw 패킷을 hex로 `logs/packet_log_<timestamp>.log` 에 누적합니다 (파서 분기 전 단계 포함).
- 녹화 **종료** 시 결과 파일이 백그라운드 스레드에서 `cielui.com` 의 어드민 endpoint(`POST /api/admin/packet-recordings/upload`)로 자동 업로드되고, 성공하면 로컬 파일이 삭제됩니다.
  - 인증: 미터기에 임베드된 `UPLOAD_API_KEY` (기존 `/api/logs/upload` 와 동일한 키).
  - 업로드 메타데이터: 닉네임 · 서버명 · 미터기 버전 · 패킷 수 · 녹화 시간 · 파일 크기 · 시작/종료 epoch.
- 새 webview 브릿지:
  - `javaBridge.stopPacketRecording()` 이제 JSON 결과를 반환 (`{recorded, packetCount, durationMs, fileSize, filePath}`).
  - `javaBridge.getPacketRecordingInfo()` 진행 중 실시간 상태 조회용.
- 어드민 페이지(`cielui.com/?view=admin`) 에 "🎬 녹화된 패킷 로그" 카드 추가 — 업로드된 모든 녹화를 표로 보고 raw 다운로드.

### 정리

- 오드(Ode) 던전 실험 코드 일괄 제거 (DungeonDataManager, OdeGroupData, OdeGroupParser, DungeonPopover). `StreamProcessor.onPacketReceived` 핫패스 분기 1개 감소.
- `WinDivert.dll`/`WinDivert64.sys` 런타임 바이너리를 `.gitignore` 에 등재.
- 잘못된 commit에 attached되어 있던 v1.7.8-dev, v1.7.9-dev 태그 정리.

### 유지된 v1.7.8 누적 분

- **WinDivert 커널 패킷 캡처** 모드 기본 설정 (관리자 권한 필요)
- 인게임 캐릭터 정보보기 패킷(0x4F, 0x36) 파서 + UI 연계
- 동시성/성능 최적화 리팩토링
- 무스펠의 성배 신규 보스(이스카리엘, 칼드릭스) 인식
- 비공개 캐릭터 처리 개선
