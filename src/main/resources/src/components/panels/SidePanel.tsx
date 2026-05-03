import { useEffect, useState } from "react";
import type { CheckStatus, Player, UpdateInfo, PanelType, DownloadState } from "@/types";
import { DetailsPanel } from "./DetailsPanel";
import { SettingsPanel } from "./SettingsPanel.tsx";
import { UpdatePanel } from "./UpdatePanel";
import { useSettingsStore } from "@/stores/useSettingsStore";
import { HistoryPanel } from "./HistoryPanel";
import { useDraggablePanel } from "@/hooks/useDraggablePanel";
import { GripVertical } from "lucide-react";
import { cn } from "@/lib/utils.ts";

interface SidePanelProps {
  type: PanelType;
  player: Player | null;
  onClose: () => void;
  combatTime: string;
  updateInfo?: UpdateInfo | null;
  onUpdate?: () => void;
  formatBattleTime: (ms: number) => string;
  onSelectHistory: (idx: number, report: any) => void;
  historyIdx?: number;
  onOpenReleasePage: () => void;
  downloadState: DownloadState;
  checkStatus: CheckStatus;
  onRetryDownload: () => void;
  currentVersion?: string;
  onCheckUpdate?: () => void;
  players: Player[];
}

export const SidePanel = ({
  type,
  player,
  players,
  onClose,
  combatTime,
  updateInfo,
  onSelectHistory,
  onUpdate,
  downloadState,
  onRetryDownload,
  onOpenReleasePage,
  historyIdx,
  formatBattleTime,
  currentVersion,
  checkStatus,
  onCheckUpdate,
}: SidePanelProps) => {
  const [visible, setVisible] = useState(false);
  const [rendered, setRendered] = useState(false);
  const [currentType, setCurrentType] = useState<PanelType>(null);
  const [currentPlayer, setCurrentPlayer] = useState<Player | null>(null);

  // const meterWidth = useSettingsStore((s) => s.meterWidth);
  const sidePanelX = useSettingsStore((s) => s.sidePanelX);
  const sidePanelY = useSettingsStore((s) => s.sidePanelY);
  const setSidePanelPosition = useSettingsStore((s) => s.setSidePanelPosition);

  const { panelRef, onMouseDownHandle, isPositioned } = useDraggablePanel({
    initialX: sidePanelX,
    initialY: sidePanelY,
    onPositionChange: setSidePanelPosition,
  });

  // JoinRequestPanel과 동일한 타이밍/방식으로 통일
  useEffect(() => {
    if (type) {
      setCurrentType(type);
      setCurrentPlayer(player);
      if (!rendered) {
        setRendered(true);
        setTimeout(() => setVisible(true), 10);
      }
    } else {
      setVisible(false);
      setTimeout(() => {
        setRendered(false);
        setCurrentType(null);
      }, 200);
    }
  }, [type, player]);
  if (!rendered) return null;

  const positionStyle: React.CSSProperties = isPositioned
    ? { left: sidePanelX, top: sidePanelY }
    : { left: sidePanelX, top: sidePanelY }; // 저장값 항상 사용
  const rootClass = cn(
    "text-[rgba(215,215,215)] rounded-lg font-bold", // relative 제거
    "transition-opacity duration-200 ease-in-out",
    "bg-(--panel-bg)",
    visible ? "opacity-100" : "opacity-0 pointer-events-none",
  );
  return (
    <div
      ref={panelRef}
      style={positionStyle}
      className={cn(rootClass, "fixed left-0 flex flex-col")}
      onMouseDown={(e) => e.stopPropagation()}>
      {/* 드래그 핸들 */}
      <div
        className="drag-handle flex items-center justify-center w-full py-1 cursor-grab active:cursor-grabbing opacity-30 hover:opacity-70 transition-opacity"
        onMouseDown={onMouseDownHandle}
        title="드래그하여 이동">
        <GripVertical className="size-4 rotate-90" />
      </div>
      <div className="flex-1 min-h-0 overflow-auto">
        {currentType === "details" && (
          <DetailsPanel
            key={currentPlayer?.id}
            player={currentPlayer}
            players={players}
            onClose={onClose}
            combatTime={combatTime}
            historyIdx={historyIdx}
          />
        )}
        {currentType === "settings" && (
          <SettingsPanel
            onClose={onClose}
            currentVersion={currentVersion}
            updateInfo={updateInfo}
            onCheckUpdate={onCheckUpdate}
          />
        )}
        {currentType === "update" && (
          <UpdatePanel
            updateInfo={updateInfo ?? null}
            checkStatus={checkStatus}
            onClose={onClose}
            downloadState={downloadState}
            onRetryDownload={onRetryDownload}
            onUpdate={onUpdate ?? (() => {})}
            onOpenReleasePage={onOpenReleasePage}
          />
        )}
        {currentType === "history" && (
          <HistoryPanel
            key={currentPlayer?.id}
            onClose={onClose}
            onSelectHistory={onSelectHistory}
            formatBattleTime={formatBattleTime}
          />
        )}
      </div>
    </div>
  );
};
