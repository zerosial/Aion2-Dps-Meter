import { memo } from "react";
import { Search, X } from "lucide-react";
import { useInfoEntryStore } from "@/stores/useInfoEntryStore";
import { getClassColor } from "@/utils/classColor";

/**
 * Info lookup view shown in the main meter window when there's no live
 * combat (Phase 2 / v1.7.10-dev). Lists every character the user has
 * inspected via in-game info packet (0x4F 0x36) — name, class, server,
 * combat power — sorted by most-recently-added on top. No auto-expiry.
 *
 * Entries clear automatically when a new fight starts (useMeterMode hook
 * calls useInfoEntryStore.clearAll() at the dps↔info transition edge).
 */
export const InfoPanel = memo(() => {
  const entries = useInfoEntryStore((s) => s.entries);
  const removeEntry = useInfoEntryStore((s) => s.removeEntry);
  const clearAll = useInfoEntryStore((s) => s.clearAll);

  const orderedEntries = [...entries].sort((a, b) => b.arrivedAt - a.arrivedAt);

  return (
    <div className="flex flex-col gap-1 px-2 py-2 select-none">
      <div className="flex items-center gap-2 px-1 pb-1.5 border-b border-white/10">
        <Search className="size-3.5 text-white/60" />
        <span className="text-xs font-bold text-white/80">정보 조회</span>
        <span className="text-[10px] text-white/40">
          {orderedEntries.length}건 (전투 시작 시 자동 초기화)
        </span>
        {orderedEntries.length > 0 && (
          <button
            className="ml-auto text-[10px] text-white/40 hover:text-white/80 cursor-pointer transition-colors"
            onClick={clearAll}>
            전체 비우기
          </button>
        )}
      </div>

      {orderedEntries.length === 0 ? (
        <div className="flex flex-col items-center justify-center py-4 gap-1 text-white/40">
          <span className="text-xs">정보 조회 결과가 없습니다</span>
          <span className="text-[10px]">
            인게임에서 캐릭터 정보 조회 시 여기에 누적됩니다
          </span>
        </div>
      ) : (
        <div className="flex flex-col gap-1 max-h-[260px] overflow-y-auto">
          {orderedEntries.map((e) => (
            <div
              key={`${e.nickname}_${e.server}`}
              className={`${getClassColor(e.job ?? undefined)} flex items-center gap-2 p-1.5 px-2.5 rounded-md transition-[background-color] duration-150`}>
              <span className="text-xs font-bold truncate flex-1">
                {e.nickname}
              </span>
              <span className="text-[10px] text-white/70 whitespace-nowrap">
                {e.job ?? "—"}
              </span>
              <span className="text-[10px] text-white/60 whitespace-nowrap">
                {(e.power / 1000).toFixed(1)}K
              </span>
              <button
                className="text-white/30 hover:text-red-300 transition-colors cursor-pointer"
                onClick={() => removeEntry(e.requester)}
                aria-label="제거">
                <X className="size-3" />
              </button>
            </div>
          ))}
        </div>
      )}
    </div>
  );
});
