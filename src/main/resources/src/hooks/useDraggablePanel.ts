import { useRef, useCallback } from "react";

interface UseDraggablePanelOptions {
  initialX: number;
  initialY: number;
  onPositionChange: (x: number, y: number) => void;
}

export const useDraggablePanel = ({
  initialX,
  initialY,
  onPositionChange,
}: UseDraggablePanelOptions) => {
  const posRef = useRef({ x: initialX, y: initialY });
  const panelRef = useRef<HTMLDivElement>(null);

  const isPositioned = initialX !== 0 || initialY !== 0;
  const rafId = useRef<number | null>(null);

  const onMouseDownHandle = useCallback(
    (e: React.MouseEvent) => {
      e.preventDefault();
      e.stopPropagation();

      const panel = panelRef.current;
      if (!panel) return;

      const rect = panel.getBoundingClientRect();
      const startMouseX = e.clientX;
      const startMouseY = e.clientY;
      const startPanelX = rect.left;
      const startPanelY = rect.top;

      posRef.current = { x: startPanelX, y: startPanelY };

      const handleMouseMove = (moveEvent: MouseEvent) => {
        if (rafId.current !== null) cancelAnimationFrame(rafId.current);
        rafId.current = requestAnimationFrame(() => {
          const deltaX = moveEvent.clientX - startMouseX;
          const deltaY = moveEvent.clientY - startMouseY;
          const nextX = startPanelX + deltaX;
          const nextY = startPanelY + deltaY;
          posRef.current = { x: nextX, y: nextY };
          if (panel) {
            panel.style.left = `${nextX}px`;
            panel.style.top = `${nextY}px`;
            panel.style.right = "auto";
            panel.style.bottom = "auto";
          }
        });
      };

      const handleMouseUp = () => {
        if (rafId.current !== null) {
          cancelAnimationFrame(rafId.current);
          rafId.current = null;
        }
        onPositionChange(posRef.current.x, posRef.current.y);
        document.removeEventListener("mousemove", handleMouseMove);
        document.removeEventListener("mouseup", handleMouseUp);
      };

      document.addEventListener("mousemove", handleMouseMove);
      document.addEventListener("mouseup", handleMouseUp);
    },
    [onPositionChange],
  );

  return { panelRef, onMouseDownHandle, isPositioned };
};
