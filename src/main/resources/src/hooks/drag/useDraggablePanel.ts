import { useRef, useCallback } from "react";

interface UseDraggablePanelOptions {
  initialX: number;
  initialY: number;
  onPositionChange: (x: number, y: number) => void;
  minX?: number;
  minY?: number;
  constrainToViewport?: boolean;
  viewportConstraintWidth?: number;
  viewportConstraintHeight?: number;
}

const clamp = (value: number, min: number, max: number) => Math.min(Math.max(value, min), max);

export const useDraggablePanel = ({
  initialX,
  initialY,
  onPositionChange,
  minX = 0,
  minY = 0,
  constrainToViewport = true,
  viewportConstraintWidth,
  viewportConstraintHeight,
}: UseDraggablePanelOptions) => {
  const posRef = useRef({ x: Math.max(minX, initialX), y: Math.max(minY, initialY) });
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
      const constraintWidth = viewportConstraintWidth ?? rect.width;
      const constraintHeight = viewportConstraintHeight ?? rect.height;
      const maxX = constrainToViewport ? Math.max(minX, window.innerWidth - constraintWidth) : Infinity;
      const maxY = constrainToViewport ? Math.max(minY, window.innerHeight - constraintHeight) : Infinity;

      posRef.current = { x: clamp(startPanelX, minX, maxX), y: clamp(startPanelY, minY, maxY) };

      const handleMouseMove = (moveEvent: MouseEvent) => {
        if (rafId.current !== null) cancelAnimationFrame(rafId.current);
        rafId.current = requestAnimationFrame(() => {
          const deltaX = moveEvent.clientX - startMouseX;
          const deltaY = moveEvent.clientY - startMouseY;
          const nextX = clamp(startPanelX + deltaX, minX, maxX);
          const nextY = clamp(startPanelY + deltaY, minY, maxY);
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
    [
      constrainToViewport,
      minX,
      minY,
      onPositionChange,
      viewportConstraintHeight,
      viewportConstraintWidth,
    ],
  );

  return { panelRef, onMouseDownHandle, isPositioned };
};
