import { memo, useMemo } from "react";
import type { Player } from "@/types";
import { MeterRow } from "./MeterRow";

interface Props {
  players: Player[];
  selectedId?: number;
  onSelect: (id: number) => void;
  rowHeight: number;
}

const getDisplayRows = (players: Player[]): Player[] => {
  const sorted = [...players].sort((a, b) => b.dps - a.dps);
  const top8 = sorted.slice(0, 8);
  const user = sorted.find((p) => p.isUser);
  if (!user) return top8;
  if (top8.some((p) => p.isUser)) return top8;
  return [...top8, user];
};

export const MeterList = memo(({ players, selectedId, onSelect, rowHeight }: Props) => {
  const rows = useMemo(() => getDisplayRows(players), [players]);
  const topDps = useMemo(() => Math.max(...rows.map((p) => p.dps), 1), [rows]);

  if (rows.length === 0) {
    return (
      <div className="w-full">
        <div
          style={{ height: rowHeight }}
          className="px-2 rounded-sm bg-black/30 h-full flex items-center gap-3">
          <div
            className="flex items-center justify-center shrink-0"
            style={{ width: Math.round(rowHeight * 0.7), height: Math.round(rowHeight * 0.7) }}>
            <div
              className="rounded-full bg-white/10"
              style={{ width: Math.round(rowHeight * 0.5), height: Math.round(rowHeight * 0.5) }}
            />
          </div>
          <span
            className="font-bold"
            style={{ fontSize: `${Math.max(12, Math.round(rowHeight * 0.4))}px` }}>
            전투 대기 중
          </span>
        </div>
      </div>
    );
  }

  return (
    <div className="grid gap-1 w-full ">
      {rows.map((current) => {
        return (
          <div
            key={current.id}
            className="min-w-0">
            <MeterRow
              id={current.id}
              name={current.name}
              job={current.job}
              server={current.server}
              rowHeight={rowHeight}
              dps={current.dps}
              amount={current.amount}
              contribution={current.damageContribution}
              entireContribution={current.entireContribution}
              isUser={current.isUser}
              isSelected={selectedId === current.id}
              onSelect={onSelect}
              topDps={topDps}
              // power={current.power}
            />
          </div>
        );
      })}
    </div>
  );
});
