import { useEffect, useState, useRef } from "react";
import { SERVER_NAMES } from "../utils/parser";
import type { JoinRequestUser } from "@/stores/useJoinRequestStore";
import type { Tier } from "@/components/joinPanel/TierBadge";

// ── 환경별 BASE_URL ──
// 빌드 시점에 .env 파일에 정의된 변수가 주입됩니다.
// VITE_CIELUI_BASE_URL: 상용 빌드 시 사용할 API 서버 주소
// VITE_AION_ING_BASE: 상용 빌드 시 사용할 크롤링 타겟 주소

const getCieluiBaseUrl = () => {
  if ((window as any).javaBridge) {
    return import.meta.env.VITE_CIELUI_BASE_URL || "";
  }
  return "";
};

const getAionIngBaseUrl = () => {
  if ((window as any).javaBridge) {
    return import.meta.env.VITE_AION_ING_BASE || "";
  }
  return "/proxy-aion";
};

// 스테일 기준: 기존 cielui.com 서버와 동일하게 24시간 (서버에서 판단하므로 프론트에서는 제외)

// 병렬 크롤링 청크 크기 (동시 최대 5개)
const CRAWL_CHUNK_SIZE = 5;

export interface ProfileTierInfo {
  combatPowerTier: Tier;
  classTier: Tier;
  isPending?: boolean;
}

export function useTiers(requests: JoinRequestUser[]) {
  const [tierInfoMap, setTierInfoMap] = useState<
    Record<number, ProfileTierInfo>
  >({});
  const profileCacheRef = useRef<Record<string, any>>({});
  // 진행 중인 크롤링 중복 방지
  const crawlingRef = useRef<Set<string>>(new Set());

  useEffect(() => {
    if (requests.length === 0) return;

    const newRequests = requests.filter((r) => !tierInfoMap[r.requester]);
    if (newRequests.length === 0) return;

    const payload = newRequests.map((r) => ({
      server: r.server.toString(),
      name: r.nickname,
    }));

    // ── 1단계: cielui.com에서 배치 프로필 조회 ──
    const doFetchProfiles = async () => {
      try {
        let profiles: any[];
        const baseUrl = getCieluiBaseUrl();
        if ((window as any).javaBridge && (window as any).javaBridge.postUrl) {
          const resStr = (window as any).javaBridge.postUrl(`${baseUrl}/api/meter/profiles`, JSON.stringify(payload));
          profiles = resStr ? JSON.parse(resStr) : [];
        } else {
          const res = await fetch(`${baseUrl}/api/meter/profiles`, {
            method: "POST",
            headers: { "Content-Type": "application/json" },
            body: JSON.stringify(payload),
          });
          if (!res.ok) throw new Error(`Status ${res.status}`);
          profiles = await res.json();
        }

        // ── 2단계: 받은 티어를 즉시 표시 ──
        setTierInfoMap((prev) => {
          const next = { ...prev };
          newRequests.forEach((req) => {
            const profile = profiles.find(
              (p) =>
                p.name === req.nickname &&
                (parseInt(p.server) === req.server ||
                  p.server === req.server.toString()),
            );
            if (profile) {
              profileCacheRef.current[`${req.server}-${req.nickname}`] =
                profile;

              const tiers = profile.tiers || {};
              const powerTier = tiers.recentSpec?.tier || "언랭크";
              const classTier = tiers.recentGlobal?.tier || "언랭크";

              next[req.requester] = {
                combatPowerTier: powerTier,
                classTier: classTier,
                // isStale인 경우 갱신 진행 중임을 표시
                isPending: profile.isStale,
              };
            }
          });
          return next;
        });

        // ── 3단계: isStale인 캐릭터를 병렬 크롤링 후 최신화 ──
        const staleProfiles = profiles.filter((p) => p.isStale);
        if (staleProfiles.length > 0) {
          // 청크 단위로 나눠서 순차 처리 (각 청크 내부는 병렬)
          (async () => {
            for (let i = 0; i < staleProfiles.length; i += CRAWL_CHUNK_SIZE) {
              const chunk = staleProfiles.slice(i, i + CRAWL_CHUNK_SIZE);
              await Promise.all(
                chunk.map((p) => crawlAndSync(p, newRequests))
              );
            }
          })();
        }
      } catch (err) {
        console.error("[useTiers] Failed to fetch profiles:", err);
      }
    };
    
    doFetchProfiles();
  }, [requests, tierInfoMap]);

  /**
   * aion.ing에서 캐릭터 HTML을 크롤링하여 cielui.com으로 업로드,
   * 재계산된 최신 티어로 화면을 갱신합니다.
   */
  async function crawlAndSync(
    p: { server: string; name: string },
    sourceRequests: JoinRequestUser[],
  ) {
    const cacheKey = `${p.server}-${p.name}`;
    if (crawlingRef.current.has(cacheKey)) return;
    crawlingRef.current.add(cacheKey);

    try {
      const serverName = SERVER_NAMES[p.server.toString()] || "";
      const baseUrl = getAionIngBaseUrl();
      const aionIngUrl = `${baseUrl}/p/char/?server_id=${encodeURIComponent(p.server)}&server=${encodeURIComponent(serverName)}&name=${encodeURIComponent(p.name)}`;

      // ── aion.ing 크롤링 ──
      let html = "";
      if ((window as any).javaBridge) {
        html = (window as any).javaBridge.fetchUrl(aionIngUrl);
      } else {
        const r = await fetch(aionIngUrl);
        if (!r.ok) throw new Error(`aion.ing fetch failed: ${r.status}`);
        html = await r.text();
      }

      if (!html) {
        console.warn("[useTiers] No HTML returned for", p.name);
        return;
      }

      // ── cielui.com으로 크롤링 데이터 업로드 ──
      const uploadPayload = { server: p.server, name: p.name, html };
      let updated: any;
      const cieluiBase = getCieluiBaseUrl();
      if ((window as any).javaBridge && (window as any).javaBridge.postUrl) {
        const resStr = (window as any).javaBridge.postUrl(`${cieluiBase}/api/meter/sync-data`, JSON.stringify(uploadPayload));
        if (!resStr) throw new Error("Empty response from sync-data");
        updated = JSON.parse(resStr);
      } else {
        const syncRes = await fetch(`${cieluiBase}/api/meter/sync-data`, {
          method: "POST",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify(uploadPayload),
        });
        if (!syncRes.ok) {
          console.warn("[useTiers] sync-data API failed:", syncRes.status);
          return;
        }
        updated = await syncRes.json();
      }

      // ── 최신 티어로 UI 갱신 ──
      setTierInfoMap((prev) => {
        const next = { ...prev };
        const req = sourceRequests.find(
          (r) =>
            r.nickname === p.name &&
            r.server.toString() === p.server,
        );
        if (req) {
          profileCacheRef.current[cacheKey] = updated;
          const tiers = updated.tiers || {};
          const powerTier = tiers.recentSpec?.tier || "언랭크";
          const classTier = tiers.recentGlobal?.tier || "언랭크";
          next[req.requester] = {
            combatPowerTier: powerTier,
            classTier: classTier,
            isPending: false,
          };
        }
        return next;
      });
    } catch (e) {
      console.error("[useTiers] crawlAndSync exception:", e);
      // 실패 시 isPending 해제
      setTierInfoMap((prev) => {
        const next = { ...prev };
        const req = sourceRequests.find(
          (r) => r.nickname === p.name && r.server.toString() === p.server,
        );
        if (req && next[req.requester]) {
          next[req.requester].isPending = false;
        }
        return next;
      });
    } finally {
      crawlingRef.current.delete(cacheKey);
    }
  }

  return tierInfoMap;
}
