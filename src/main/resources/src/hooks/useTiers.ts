import { useEffect, useState, useCallback, useRef } from "react";
import { JoinRequestUser } from "@/stores/useJoinRequestStore";
import { Tier } from "@/components/joinPanel/TierBadge";

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

  const calculateTier = (dps: number, q1: number, median: number, q3: number): Tier => {
    if (dps >= q3) return "S";
    if (dps >= median) return "A";
    if (dps >= q1) return "B";
    return "C";
  };

  const getJobName = (jobCode: string | null) => {
    if (!jobCode) return "데바";
    return jobCode; // e.g. "살성"
  };

  const computeTiersForProfile = useCallback((req: JoinRequestUser, profile: any) => {
    const jobName = getJobName(req.job);
    let bestPowerTier: Tier = "Unranked";
    let bestClassTier: Tier = "Unranked";

    const dpsRecords = profile.bossRecords || [];
    if (dpsRecords.length === 0) {
      return { combatPowerTier: "Unranked", classTier: "Unranked" };
    }

    const combatPower = req.power;
    const powerRange = powerStatsRef.current?.ranges.find(
      r => combatPower >= r.rangeStart && combatPower < r.rangeStart + 20000
    );

    dpsRecords.forEach((record: any) => {
      const boss = record.bossName;
      const dps = record.dps;

      // 1. Power Tier (4-week)
      if (powerRange && powerRange.classes[jobName]) {
        const stats = powerRange.classes[jobName];
        // We only have q1 and q3 for power tier from aion2power
        let pTier: Tier = "C";
        if (dps >= stats.q3) pTier = "S";
        else if (dps >= (stats.q1 + stats.q3) / 2) pTier = "A"; // approx median
        else if (dps >= stats.q1) pTier = "B";

        if (bestPowerTier === "Unranked" || pTier === "S" || (pTier === "A" && bestPowerTier !== "S") || (pTier === "B" && bestPowerTier === "C")) {
          bestPowerTier = pTier;
        }
      }

      // 2. Class Tier (2-week)
      const cStats = classStatsRef.current?.bosses[boss]?.find(c => c.className === jobName);
      if (cStats) {
        const cTier = calculateTier(dps, cStats.q1, cStats.median, cStats.q3);
        if (bestClassTier === "Unranked" || cTier === "S" || (cTier === "A" && bestClassTier !== "S") || (cTier === "B" && bestClassTier === "C")) {
          bestClassTier = cTier;
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
            const profile = profiles.find(p => p.name === req.nickname && parseInt(p.server) === req.server || p.server === req.server.toString());
            if (profile) {
              profileCacheRef.current[`${req.server}-${req.nickname}`] = profile;
              next[req.requester] = computeTiersForProfile(req, profile);
            }
          });
          return next;
        });
      })
      .catch(err => console.error("Failed to fetch profiles", err));

  }, [requests, computeTiersForProfile, tierInfoMap]);

  return tierInfoMap;
}
