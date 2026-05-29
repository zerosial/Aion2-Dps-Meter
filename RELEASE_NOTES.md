## v1.7.9-dev (프리릴리즈, 개발용 테스트 빌드)

> 이 빌드는 **테스트용 사전 배포본**입니다. 안정성이 검증되지 않은 변경이 포함될 수 있습니다.

### 변경 사항

- **오드(Ode) 관련 실험 기능 일괄 제거**
  - `DungeonDataManager`, `OdeGroupData`, `OdeGroupParser`, `DungeonPopover` 등 오드 패킷 파싱/UI 코드 전면 삭제
  - `BrowserApp.getDungeonData()` 브릿지 메소드 제거
  - `StreamProcessor`의 OdeGroup 사전 필터링 호출 제거 → 핫패스 분기 1개 감소

- 저장소 정리: `WinDivert.dll`, `WinDivert64.sys` 런타임 바이너리를 `.gitignore`에 추가 (배포 시 동봉, repo는 깔끔 유지)

### 유지된 v1.7.8 누적 분

- **WinDivert 커널 패킷 캡처** 모드 기본 설정 (관리자 권한 필요)
- 인게임 캐릭터 정보보기 패킷(0x4F, 0x36) 파서 + UI 연계
- 동시성/성능 최적화 리팩토링
- 무스펠의 성배 신규 보스(이스카리엘, 칼드릭스) 인식
- 비공개 캐릭터 처리 개선
