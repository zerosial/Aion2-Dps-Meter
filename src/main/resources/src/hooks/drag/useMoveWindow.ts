import { useSettingsStore } from "@/stores/useSettingsStore";
import { useEffect, useRef, type RefObject } from "react";

export const useMoveWindow = (target: string | RefObject<HTMLElement | null>) => {
  const wasDraggingRef = useRef(false);
  const setWindowPosition = useSettingsStore((s) => s.setWindowPosition);

  useEffect(() => {
    const el =
      typeof target === "string" ? document.querySelector<HTMLElement>(target) : target.current;
    if (!el) return;

    let isDragging = false;
    let startX = 0;
    let startY = 0;
    let initialStageX = 0;
    let initialStageY = 0;

    // [PERF] rAF throttle — mousemove fires 60~120Hz on most setups, and each
    // moveWindow call goes through the JS↔JavaFX bridge into Compose stage
    // mutation (an OS-level call). Coalescing to one call per animation frame
    // (~16ms) eliminates the drag-time lag while staying visually fluid.
    let pendingX = 0;
    let pendingY = 0;
    let rafScheduled = false;
    const flushMove = () => {
      rafScheduled = false;
      const bridge = (window as any).javaBridge;
      if (bridge?.moveWindow) bridge.moveWindow(pendingX, pendingY);
    };

    const handleMouseDown = (e: globalThis.MouseEvent) => {
      const ignoreTarget = (e.target as HTMLElement).closest(
        "input, button, .settingsPanel, .detailsPanel, .console, .resizeHandle, .drag-handle",
      );
      if (ignoreTarget) return;

      isDragging = true;
      startX = e.screenX;
      startY = e.screenY;
      initialStageX = window.screenX;
      initialStageY = window.screenY;
    };

    const handleMouseMove = (e: globalThis.MouseEvent) => {
      if (!isDragging) return;
      if (!(window as any).javaBridge) return;

      const deltaX = e.screenX - startX;
      const deltaY = e.screenY - startY;

      if (Math.abs(deltaX) > 3 || Math.abs(deltaY) > 3) {
        wasDraggingRef.current = true;
      }

      pendingX = initialStageX + deltaX;
      pendingY = initialStageY + deltaY;
      if (!rafScheduled) {
        rafScheduled = true;
        requestAnimationFrame(flushMove);
      }
    };

    const handleMouseUp = () => {
      if (isDragging) {
        if (wasDraggingRef.current) {
          // Make sure the *final* position is sent even if mouseup landed
          // between rAF frames.
          if (rafScheduled) flushMove();
          setWindowPosition(window.screenX, window.screenY);
        }
      }
      isDragging = false;
      setTimeout(() => {
        wasDraggingRef.current = false;
      }, 0);
    };

    el.addEventListener("mousedown", handleMouseDown);
    document.addEventListener("mousemove", handleMouseMove);
    document.addEventListener("mouseup", handleMouseUp);

    return () => {
      el.removeEventListener("mousedown", handleMouseDown);
      document.removeEventListener("mousemove", handleMouseMove);
      document.removeEventListener("mouseup", handleMouseUp);
    };
  }, [target, setWindowPosition]);

  return { wasDraggingRef };
};
