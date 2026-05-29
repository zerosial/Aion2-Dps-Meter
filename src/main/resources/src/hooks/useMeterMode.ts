import { useEffect, useRef, useState } from "react";

/**
 * Meter display mode state machine (Phase 2 / v1.7.10-dev).
 *
 *   ┌─────────┐   isInCombat=true              ┌─────────┐
 *   │  info   │ ─────────────────────────────▶ │   dps   │
 *   │         │                                │         │
 *   │ (idle / │ ◀───── 30s cooldown after ───── │ (live)  │
 *   │  lookup)│        battleEnd                └─────────┘
 *   └─────────┘
 *
 * - On mount the meter sits in `info` mode (no fight has happened yet).
 * - The first time isInCombat flips true we switch to `dps` and remember
 *   that a fight has occurred — the `info` list of accumulated lookups
 *   from the previous session is cleared so the next time we drop back to
 *   `info` the panel starts empty.
 * - When isInCombat goes false a 30s timer starts. If a new fight begins
 *   inside that window the timer is cleared and dps stays. Otherwise we
 *   slide back to `info`.
 *
 * The hook is intentionally tiny: it owns the mode + transition reasons,
 * and exposes one side-effect callback (`onCombatStarted`) that the host
 * uses to clear the info list at the exact moment of transition.
 */
export type MeterDisplayMode = "dps" | "info";
const COOLDOWN_MS = 30_000;

export function useMeterMode(
  isInCombat: boolean,
  onCombatStarted?: () => void,
): MeterDisplayMode {
  const [mode, setMode] = useState<MeterDisplayMode>("info");
  const cooldownRef = useRef<ReturnType<typeof setTimeout> | null>(null);
  const lastCombatRef = useRef<boolean>(false);
  const onStartedRef = useRef(onCombatStarted);
  onStartedRef.current = onCombatStarted;

  useEffect(() => {
    const wasInCombat = lastCombatRef.current;
    lastCombatRef.current = isInCombat;

    if (isInCombat && !wasInCombat) {
      // Combat just started → switch to DPS immediately, cancel any pending
      // cooldown back-to-info, and notify the host to clear the info list.
      if (cooldownRef.current) {
        clearTimeout(cooldownRef.current);
        cooldownRef.current = null;
      }
      onStartedRef.current?.();
      setMode("dps");
      return;
    }

    if (!isInCombat && wasInCombat) {
      // Combat just ended → arm the 30s grace window before falling back.
      if (cooldownRef.current) clearTimeout(cooldownRef.current);
      cooldownRef.current = setTimeout(() => {
        cooldownRef.current = null;
        setMode("info");
      }, COOLDOWN_MS);
    }
  }, [isInCombat]);

  // Cleanup on unmount so the timer doesn't fire after the meter closes.
  useEffect(() => {
    return () => {
      if (cooldownRef.current) clearTimeout(cooldownRef.current);
    };
  }, []);

  return mode;
}
