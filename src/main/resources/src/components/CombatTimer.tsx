import { useEffect, useRef } from "react";
import { useSettingsStore } from "@/stores/useSettingsStore";

interface Props {
  isInCombat: boolean;
  /** Epoch ms of battle start (live calc base) */
  battleStart: number | null;
  /** Epoch ms of battle end (frozen after combat ends) */
  battleEnd: number | null;
  /** Fallback string used when battleStart is unavailable */
  fallbackTime: string;
}

function formatMs(ms: number): string {
  if (!Number.isFinite(ms) || ms < 0) return "00:00";
  const totalSec = Math.floor(ms / 1000);
  const min = Math.floor(totalSec / 60);
  const sec = totalSec % 60;
  return `${String(min).padStart(2, "0")}:${String(sec).padStart(2, "0")}`;
}

/**
 * Battle timer with a self-contained 100ms tick — the parent React tree no
 * longer needs to re-render every poll cycle just to advance the displayed
 * seconds. While in combat the component writes directly to the DOM via a
 * ref, so the rest of the meter UI stays stable.
 *
 * Idle / post-combat: shows the frozen `fallbackTime` string passed from
 * useMeter (battleEnd - battleStart).
 */
export const CombatTimer = ({ isInCombat, battleStart, battleEnd, fallbackTime }: Props) => {
  const combatTimeColor = useSettingsStore((s) => s.theme.combatTimeColor);
  const timeRef = useRef<HTMLSpanElement>(null);

  useEffect(() => {
    if (!timeRef.current) return;

    // Idle: pin the frozen text and bail; no timer needed.
    if (!isInCombat || !battleStart) {
      timeRef.current.textContent = fallbackTime;
      return;
    }

    // Live tick — 100ms is well under human-perceptible jank threshold but
    // still ~5× lighter than a rAF loop. We bypass React state on purpose.
    const update = () => {
      const ms = Date.now() - battleStart;
      if (timeRef.current) timeRef.current.textContent = formatMs(ms);
    };
    update();
    const id = setInterval(update, 100);
    return () => clearInterval(id);
  }, [isInCombat, battleStart, battleEnd, fallbackTime]);

  return (
    <div className="flex items-center gap-2 px-1 pt-2">
      <div
        className="w-2 h-2 rounded-full transition-colors duration-300"
        style={{
          background: isInCombat ? "#55c42a" : combatTimeColor,
          boxShadow: isInCombat ? "0 0 6px #55c42a" : "none",
        }}
      />
      <span
        className="text-xs font-bold"
        style={{ color: isInCombat ? "#55c42a" : combatTimeColor }}>
        {isInCombat ? "전투 중" : "대기 중"}
      </span>
      <span
        ref={timeRef}
        className="ml-auto text-xs font-bold"
        style={{ color: combatTimeColor }}>
        {fallbackTime}
      </span>
    </div>
  );
};
