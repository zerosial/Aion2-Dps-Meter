import { Button } from "@/components/ui/button";
import type { PanelType } from "@/types";
import { memo, useRef } from "react";
import {
  Settings,
  //  RefreshCcw,
  Power,
  ClipboardClock,
  Bug,
  UserRoundPlus,
  Grip,
  CircleDot,
  Square,
} from "lucide-react";
import { useState, useEffect } from "react";
// import { Tooltip, TooltipContent, TooltipTrigger } from "@/components/ui/tooltip";
import { useJoinRequestStore } from "@/stores/useJoinRequestStore";

interface Props {
  // isCollapse: boolean;
  // reset: () => void;
  setSettings: (value: PanelType) => void;
  // toggleCollapse: () => void;
  className: string;
}
import { useSettingsStore } from "@/stores/useSettingsStore";
import { useMoveWindow } from "@/hooks/drag/useMoveWindow";

export const Header = memo(
  ({
    className,
    //  reset,
    setSettings,
  }: Props) => {
    const isDebugMode = useSettingsStore((s) => s.isDebugMode);
    const requestCount = useJoinRequestStore((s) => s.requests.length);
    const isOpen = useJoinRequestStore((s) => s.isOpen);
    const setOpen = useJoinRequestStore((s) => s.setOpen);
    const exitApp = () => {
      (window as any).javaBridge.exitApp();
    };
    const dragRef = useRef<HTMLDivElement>(null);
    useMoveWindow(dragRef); // selector 대신 ref로 변경

    const toggleDebugConsole = () => {
      window.dispatchEvent(new CustomEvent("toggle-debug-console"));
    };

    const [isRecording, setIsRecording] = useState(false);

    useEffect(() => {
      if ((window as any).javaBridge?.isPacketRecording) {
        setIsRecording((window as any).javaBridge.isPacketRecording());
      }
    }, []);

    const toggleRecording = () => {
      if (isRecording) {
        (window as any).javaBridge?.stopPacketRecording();
        setIsRecording(false);
      } else {
        (window as any).javaBridge?.startPacketRecording();
        setIsRecording(true);
      }
    };

    return (
      <div className=" flex justify-between items-center">
        <div className={`flex gap-2 ${className}`}>
          <div
            ref={dragRef}
            className="window-drag-handle cursor-grab active:cursor-grabbing opacity-70 hover:opacity-100 transition-opacity p-1">
            <Grip className="size-4" />
          </div>
          <div className="w-20 h-full ">
            {/* Logo removed as requested */}
          </div>
        </div>

        {/* dev 환경 전용 패킷 기록 버튼 (중앙 배치) */}
        {/* @ts-ignore */}
        {typeof __IS_LOCAL__ !== "undefined" && __IS_LOCAL__ && (
          <div className="flex items-center">
            <Button
              variant={isRecording ? "destructive" : "secondary"}
              size="sm"
              onClick={toggleRecording}
              className={`h-7 px-3 text-xs gap-1.5 ${isRecording ? 'animate-pulse' : ''}`}
            >
              {isRecording ? (
                <>
                  <Square className="size-3" fill="currentColor" />
                  기록 중지
                </>
              ) : (
                <>
                  <CircleDot className="size-3 text-red-500" />
                  로그 기록 시작
                </>
              )}
            </Button>
          </div>
        )}

        <div className={`${className} flex gap-2`}>
          {/* <Tooltip>
            <TooltipTrigger asChild> */}
          <Button
            variant="ghost"
            onClick={exitApp}
            size="icon"
            className="rounded-full">
            <Power className="size-4.5" />
          </Button>
          {/* </TooltipTrigger> */}
          {/* <TooltipContent>종료</TooltipContent> */}
          {/* </Tooltip> */}

          {/* <Tooltip>
            <TooltipTrigger asChild> */}
          {/* <Button
            variant="ghost"
            onClick={reset}
            className="rounded-full">
            <RefreshCcw className="size-4.5" />
          </Button> */}
          {/* </TooltipTrigger>
            <TooltipContent>새로고침</TooltipContent>
          </Tooltip> */}
          <Button
            variant="ghost"
            onClick={() => setOpen(!isOpen)}
            size="icon"
            className="rounded-full relative">
            <UserRoundPlus className="size-4.5" />
            {requestCount > 0 && (
              <span
                className={`${className} absolute -top-1 -right-1 w-4 h-4 rounded-full bg-red-500 text-[10px] flex items-center justify-center font-bold`}>
                {requestCount}
              </span>
            )}
          </Button>

          {/* <Tooltip>
            <TooltipTrigger asChild> */}
          <Button
            size="icon"
            variant="ghost"
            onClick={() => setSettings("settings")}
            className="rounded-full">
            <Settings className="size-4.5" />
          </Button>
          {/* </TooltipTrigger>
            <TooltipContent>설정</TooltipContent>
          </Tooltip> */}

          {/* <Tooltip>
            <TooltipTrigger asChild> */}
          <Button
            variant="ghost"
            size="icon"
            onClick={() => setSettings("history")}
            className="rounded-full">
            <ClipboardClock className="size-4.5" />
          </Button>
          {/* </TooltipTrigger>
            <TooltipContent>전투 기록</TooltipContent>
          </Tooltip> */}

          {isDebugMode && (
            // <Tooltip>
            //   <TooltipTrigger asChild>
            <Button
              variant="ghost"
              size="icon"
              onClick={toggleDebugConsole}
              className="rounded-full">
              <Bug className="size-4.5" />
            </Button>
            //   </TooltipTrigger>
            //   <TooltipContent>디버그 콘솔</TooltipContent>
            // </Tooltip>
          )}
        </div>
      </div>
    );
  },
);
