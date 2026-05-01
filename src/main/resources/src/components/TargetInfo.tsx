import { memo } from "react";
import bossIcon from "@/assets/bossIcon.png";
import { useSettingsStore } from "@/stores/useSettingsStore";
interface Props {
  targetName: string;
  rowHeight: number;
  remainHp: number;
  maxHp: number;
}

export const TargetInfo = memo(({ targetName, rowHeight, remainHp, maxHp }: Props) => {
  const theme = useSettingsStore((s) => s.theme);
  const displayName = targetName || "타겟 인식 실패";
  const isFailed = !targetName;

  const iconSize = Math.round(rowHeight * 0.7);
  const fontSize = `${Math.max(10, Math.round(rowHeight * 0.4))}px`;

  return (
    <div
      className="relative w-full px-2 mb-2 rounded-sm overflow-hidden bg-black/30"
      style={{ height: rowHeight }}>
      <div
        className="absolute inset-0 origin-left"
        style={{
          background: `linear-gradient(to right, ${theme.bossBar[0]}, ${theme.bossBar[1]})`,
          opacity: isFailed ? 0.2 : 0.8,
        }}
      />
      <div className="relative h-full flex items-center gap-3">
        <div
          className="flex items-center justify-center shrink-0"
          style={{ width: iconSize, height: iconSize }}>
          <img
            src={bossIcon}
            draggable={false}
            className={`w-full h-full object-contain ${isFailed ? "opacity-40" : ""}`}
          />
        </div>
        <span
          className="font-bold text-shadow-meter truncate"
          style={{ color: isFailed ? "rgba(255,255,255,0.4)" : "#ffffff", fontSize }}>
          {displayName}
        </span>

        {!isFailed && (
          <div className="ml-auto font-bold text-shadow-meter shrink-0 flex items-center gap-0">
            <span style={{ color: theme.bossRightValue, fontSize }}>
              {remainHp.toLocaleString()}
            </span>
            <span
              style={{ color: theme.bossRightValue, fontSize }}
              className="mx-0.5">
              /
            </span>
            <span
              style={{ color: theme.bossRightValue, fontSize }}
              className=" text-shadow-meter font-bold">
              {maxHp.toLocaleString()}
            </span>
            <span
              style={{ color: theme.bossRightValue, fontSize }}
              className="ml-2">
              {maxHp > 0 ? `${((remainHp / maxHp) * 100).toFixed(1)}%` : "-"}
            </span>
          </div>
        )}
      </div>
    </div>
  );
});
