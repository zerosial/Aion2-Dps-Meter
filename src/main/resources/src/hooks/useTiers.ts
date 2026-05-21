import { useEffect, useState, useCallback, useRef } from "react";
import type { JoinRequestUser } from "@/stores/useJoinRequestStore";
import type { Tier } from "@/components/joinPanel/TierBadge";

const BASE_URL = "https://cielui.com";

interface BoxplotClassStat {
  q1: number;
  median: number;
  q3: number;
  min: number;
  max: number;
  sampleCount: number;
  className: string;
}

interface BoxplotStatsResponse {
  period: string;
  updatedAt: string;
  bosses: Record<string, BoxplotClassStat[]>;
}

interface PowerTierRange {
  rangeStart: number;
  classes: Record<string, { q1: number; q3: number; count: number }>;
}

interface PowerTierStatsResponse {
  global: any;
  ranges: PowerTierRange[];
}

export interface ProfileTierInfo {
  combatPowerTier: Tier;
  classTier: Tier;
  isPending?: boolean;
}

export function useTiers(requests: JoinRequestUser[]) {
  const [tierInfoMap, setTierInfoMap] = useState<Record<number, ProfileTierInfo>>({});
  
  const powerStatsRef = useRef<PowerTierStatsResponse | null>(null);
  const classStatsRef = useRef<BoxplotStatsResponse | null>(null);
  const profileCacheRef = useRef<Record<string, any>>({});

  // Fetch Tier Definitions on Mount
  useEffect(() => {
    fetch(`${BASE_URL}/api/tier-stats`)
      .then(r => r.json())
      .then(d => { powerStatsRef.current = d; })
      .catch(e => console.error("Failed to fetch power tier stats", e));

    fetch(`${BASE_URL}/api/stats/boxplot?period=14d`)
      .then(r => r.json())
      .then(d => { classStatsRef.current = d; })
      .catch(e => console.error("Failed to fetch class tier stats", e));
  }, []);

  const calculateTier11 = (dps: number, q1: number, q3: number): { tier: Tier; score: number } => {
    if (!q1 || !q3 || q1 === q3) return { tier: "언랭크", score: 0 };
    const pct = (dps - q1) / (q3 - q1);
    const score = pct * 100 + 40;
    
    let tier: Tier = "언랭크";
    if (score < 0.0) tier = "언랭크";
    else if (score >= 170.0) tier = "챌린저";
    else if (score >= 155.0) tier = "그랜드마스터";
    else if (score >= 140.0) tier = "마스터";
    else if (score >= 120.0) tier = "다이아몬드";
    else if (score >= 100.0) tier = "에메랄드";
    else if (score >= 80.0) tier = "플래티넘";
    else if (score >= 60.0) tier = "골드";
    else if (score >= 40.0) tier = "실버";
    else if (score >= 20.0) tier = "브론즈";
    else tier = "아이언";
    
    return { tier, score };
  };

  const getJobName = (jobCode: string | null) => {
    if (!jobCode) return "데바";
    return jobCode; // e.g. "살성"
  };

  const computeTiersForProfile = useCallback((req: JoinRequestUser, profile: any): ProfileTierInfo => {
    const jobName = getJobName(req.job);
    let bestPowerTier: Tier = "언랭크";
    let bestPowerScore = -1;
    let bestClassTier: Tier = "언랭크";
    let bestClassScore = -1;

    const dpsRecords = profile.bossRecords || [];
    if (dpsRecords.length === 0) {
      return { combatPowerTier: "언랭크", classTier: "언랭크" };
    }

    const combatPower = req.power;
    const powerRange = powerStatsRef.current?.ranges.find(
      (r: any) => combatPower >= r.rangeStart && combatPower < r.rangeStart + 20000
    );

    dpsRecords.forEach((record: any) => {
      const boss = record.bossName;
      const dps = record.dps;

      // 1. Power Tier (4-week)
      if (powerRange && powerRange.classes[jobName]) {
        const stats = powerRange.classes[jobName];
        const res = calculateTier11(dps, stats.q1, stats.q3);
        if (res.score > bestPowerScore) {
          bestPowerScore = res.score;
          bestPowerTier = res.tier;
        }
      }

      // 2. Class Tier (2-week)
      const cStats = classStatsRef.current?.bosses[boss]?.find((c: any) => c.className === jobName);
      if (cStats) {
        const res = calculateTier11(dps, cStats.q1, cStats.q3);
        if (res.score > bestClassScore) {
          bestClassScore = res.score;
          bestClassTier = res.tier;
        }
      }
    });

    return { combatPowerTier: bestPowerTier, classTier: bestClassTier };
  }, []);

  useEffect(() => {
    if (requests.length === 0) return;

    const newRequests = requests.filter(r => !tierInfoMap[r.requester]);
    if (newRequests.length === 0) return;

    const payload = newRequests.map(r => ({ server: r.server.toString(), name: r.nickname }));

    fetch(`${BASE_URL}/api/party/profiles`, {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify(payload)
    })
      .then(res => res.json())
      .then((profiles: any[]) => {
        setTierInfoMap(prev => {
          const next = { ...prev };
          newRequests.forEach(req => {
            const profile = profiles.find(p => p.name === req.nickname && (parseInt(p.server) === req.server || p.server === req.server.toString()));
            if (profile) {
              profileCacheRef.current[`${req.server}-${req.nickname}`] = profile;
              const tiers = computeTiersForProfile(req, profile);
              tiers.isPending = profile.isPending;
              next[req.requester] = tiers;
            }
          });
          return next;
        });

        // 2. Handle pending profiles via client-side distributed scraping
        const pendingProfiles = profiles.filter(p => p.isPending);
        if (pendingProfiles.length > 0) {
          pendingProfiles.forEach(p => {
            const aionIngUrl = `https://aion.ing/p/char/?server_id=&server=${encodeURIComponent(p.server)}&name=${encodeURIComponent(p.name)}`;
            
            // Run asynchronously so it doesn't block UI
            setTimeout(async () => {
              try {
                let html = "";
                if ((window as any).javaBridge) {
                  html = (window as any).javaBridge.fetchUrl(aionIngUrl);
                } else {
                  // Fallback for local web dev without CORS limits
                  const res = await fetch(aionIngUrl);
                  html = await res.text();
                }

                if (!html) return;

                // Send HTML raw string to backend
                const syncRes = await fetch(`${BASE_URL}/api/character/sync-html`, {
                  method: "POST",
                  headers: { "Content-Type": "application/json" },
                  body: JSON.stringify({ server: p.server, name: p.name, html })
                });

                if (syncRes.ok) {
                  const syncedProfile = await syncRes.json();
                  
                  setTierInfoMap(prev => {
                    const next = { ...prev };
                    const req = newRequests.find(r => r.nickname === p.name && (parseInt(r.server as any) === parseInt(p.server) || r.server.toString() === p.server));
                    if (req) {
                      profileCacheRef.current[`${req.server}-${req.nickname}`] = syncedProfile;
                      const tiers = computeTiersForProfile(req, syncedProfile);
                      tiers.isPending = false;
                      next[req.requester] = tiers;
                    }
                    return next;
                  });
                }
              } catch (e) {
                console.error("Distributed scrape failed for", p.name, e);
              }
            }, 0);
          });
        }
      })
      .catch(err => console.error("Failed to fetch profiles", err));

  }, [requests, computeTiersForProfile, tierInfoMap]);

  return tierInfoMap;
}
