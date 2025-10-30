import { useCallback, useRef } from "react";
import type { PointerEvent as ReactPointerEvent } from "react";
export type DraggableArgs = {
  onStart?: () => void;
  onDrag?: (state: {
    clientX: number;
    clientY: number;
    dx: number;
    dy: number;
    originalEvent: PointerEvent;
  }) => void;
  onEnd?: () => void;
  preventDefault?: boolean;
  stopPropagation?: boolean;
};
export function useDraggable(args: DraggableArgs) {
  const {
    onStart,
    onDrag,
    onEnd,
    preventDefault = true,
    stopPropagation = false,
  } = args;

  const startRef = useRef<{ x: number; y: number } | null>(null);
  const isDraggingRef = useRef(false);
  const pointerIdRef = useRef<number | null>(null);

  const cleanup = useRef<() => void>(() => {});

  const onPointerDown = useCallback(
    (e: ReactPointerEvent) => {
      if (preventDefault) e.preventDefault();
      if (stopPropagation) e.stopPropagation();

      const pe = e.nativeEvent as PointerEvent;
      const startX = pe.clientX;
      const startY = pe.clientY;

      startRef.current = { x: startX, y: startY };
      pointerIdRef.current = pe.pointerId;
      isDraggingRef.current = true;

      (e.target as Element).setPointerCapture?.(pe.pointerId);

      onStart?.();

      const onMove = (ev: PointerEvent) => {
        if (
          pointerIdRef.current != null &&
          ev.pointerId !== pointerIdRef.current
        )
          return;

        if (!startRef.current) return;

        const dx = ev.clientX - startRef.current.x;
        const dy = ev.clientY - startRef.current.y;

        onDrag?.({
          clientX: ev.clientX,
          clientY: ev.clientY,
          dx,
          dy,
          originalEvent: ev,
        });
      };

      const onUp = (ev: PointerEvent) => {
        if (
          pointerIdRef.current != null &&
          ev.pointerId !== pointerIdRef.current
        )
          return;

        if (!startRef.current) {
          cleanup.current?.();
          return;
        }

        onEnd?.();

        isDraggingRef.current = false;
        startRef.current = null;

        (e.target as Element).releasePointerCapture?.(ev.pointerId);

        cleanup.current?.();
      };

      window.addEventListener("pointermove", onMove);
      window.addEventListener("pointerup", onUp);
      window.addEventListener("pointercancel", onUp);

      cleanup.current = () => {
        window.removeEventListener("pointermove", onMove);
        window.removeEventListener("pointerup", onUp);
        window.removeEventListener("pointercancel", onUp);
        pointerIdRef.current = null;
        isDraggingRef.current = false;
        startRef.current = null;
      };
    },
    [onStart, onDrag, onEnd, preventDefault, stopPropagation],
  );

  return {
    onPointerDown,
    isDraggingRef,
  };
}
