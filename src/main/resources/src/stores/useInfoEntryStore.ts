import { create } from "zustand";
import type { JoinRequestUser } from "./useJoinRequestStore";

/**
 * "정보 조회" store (Phase 2 / v1.7.10-dev).
 *
 * The JoinRequest store auto-expires entries after 20s because the underlying
 * use case is a transient party-invite toast. The info-lookup view in the
 * new DPS↔Info mode switch should NOT auto-expire — the user is
 * deliberately stacking characters they want to compare. So we mirror every
 * incoming JoinRequest into this separate store with:
 *
 *   - no timer (entries stay until the user removes them or a fight starts)
 *   - dedupe by (nickname, server) — repeated lookups on the same character
 *     just refresh the row's metadata (combat power, arrival time)
 *
 * `useMeterMode` calls clearAll() when a new fight begins so the list starts
 * empty each time the user returns to info mode.
 */
export interface InfoEntry extends JoinRequestUser {}

interface InfoEntryStore {
  entries: InfoEntry[];
  addEntry: (e: InfoEntry) => void;
  removeEntry: (requester: number) => void;
  clearAll: () => void;
}

export const useInfoEntryStore = create<InfoEntryStore>((set) => ({
  entries: [],
  addEntry: (e) =>
    set((state) => {
      // Dedupe by (nickname, server). Most recent metadata wins.
      const filtered = state.entries.filter(
        (x) => !(x.nickname === e.nickname && x.server === e.server),
      );
      return { entries: [...filtered, e] };
    }),
  removeEntry: (requester) =>
    set((state) => ({
      entries: state.entries.filter((x) => x.requester !== requester),
    })),
  clearAll: () => set({ entries: [] }),
}));
