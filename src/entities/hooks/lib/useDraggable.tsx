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
  onEnd?: (moved?: boolean) => void;
  preventDefault?: boolean;
  stopPropagation?: boolean;
  movementThreshold?: number;
};
export function useDraggable(args: DraggableArgs) {
  const {
    onStart,
    onDrag,
    onEnd,
    preventDefault = true,
    stopPropagation = false,
    movementThreshold = 5,
  } = args;

  const startRef = useRef<{ x: number; y: number } | null>(null);
  const isDraggingStartedRef = useRef(false);
  const pointerIdRef = useRef<number | null>(null);

  const cleanup = useRef<() => void>(() => {});
  const movedRef = useRef(false);

  const onPointerDown = useCallback(
    (e: ReactPointerEvent) => {
      if (preventDefault) e.preventDefault();
      if (stopPropagation) e.stopPropagation();

      const pe = e.nativeEvent as PointerEvent;
      const startX = pe.clientX;
      const startY = pe.clientY;

      startRef.current = { x: startX, y: startY };
      pointerIdRef.current = pe.pointerId;
      isDraggingStartedRef.current = false;
      movedRef.current = false;

      (e.target as Element).setPointerCapture?.(pe.pointerId);

      const onMove = (ev: PointerEvent) => {
        if (
          pointerIdRef.current != null &&
          ev.pointerId !== pointerIdRef.current
        ) {
          return;
        }

        if (!startRef.current) return;
        const dx = ev.clientX - startRef.current.x;
        const dy = ev.clientY - startRef.current.y;

        const distSq = dx * dx + dy * dy;
        if (!isDraggingStartedRef.current) {
          if (distSq >= movementThreshold * movementThreshold) {
            isDraggingStartedRef.current = true;
            movedRef.current = true;
            onStart?.();
          } else {
            return;
          }
        } else {
          movedRef.current = true;
        }

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
        ) {
          return;
        }

        const moved = movedRef.current;

        onEnd?.(moved);

        isDraggingStartedRef.current = false;
        startRef.current = null;
        pointerIdRef.current = null;
        movedRef.current = false;

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
        isDraggingStartedRef.current = false;
        startRef.current = null;
        movedRef.current = false;
      };
    },
    [
      onStart,
      onDrag,
      onEnd,
      preventDefault,
      stopPropagation,
      movementThreshold,
    ],
  );

  return {
    onPointerDown,
    isDraggingRef: isDraggingStartedRef,
  };
}
