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

// 드래그를 막아야 하는 인터랙티브 요소인지 확인
const isInteractiveTarget = (target: Element, panelEl: Element): boolean => {
  const INTERACTIVE_TAGS = new Set(["button", "input", "select", "textarea", "a", "label"]);
  const INTERACTIVE_ROLES = new Set(["button", "slider", "checkbox", "radio", "textbox", "combobox", "menuitem", "tab", "switch"]);

  // 클릭된 요소 자신이 스크롤 가능한지만 체크 (상위 순회 X)
  const targetStyle = window.getComputedStyle(target);
  const targetOverflow = targetStyle.overflowY;
  if (
    (targetOverflow === "auto" || targetOverflow === "scroll") &&
    target.scrollHeight > target.clientHeight
  ) return true;

  let el: Element | null = target;
  while (el && el !== panelEl) {
    const tag = el.tagName.toLowerCase();
    if (INTERACTIVE_TAGS.has(tag)) return true;

    const role = el.getAttribute("role");
    if (role && INTERACTIVE_ROLES.has(role)) return true;

    if (el.hasAttribute("data-no-drag")) return true;

    el = el.parentElement;
  }
  return false;
};

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

  const startDrag = useCallback(
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
      const maxX = constrainToViewport
        ? Math.max(minX, window.innerWidth - constraintWidth)
        : Infinity;
      const maxY = constrainToViewport
        ? Math.max(minY, window.innerHeight - constraintHeight)
        : Infinity;

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

  // Grip 전용 핸들러 (기존 유지)
  const onMouseDownHandle = startDrag;

  // 패널 전체 클릭 핸들러 — 인터랙티브 요소 필터링
  const onMouseDownPanel = useCallback(
    (e: React.MouseEvent) => {
      const panel = panelRef.current;
      if (!panel) return;
      if (isInteractiveTarget(e.target as Element, panel)) return;
      startDrag(e);
    },
    [startDrag],
  );

  return { panelRef, onMouseDownHandle, onMouseDownPanel, isPositioned };
};
