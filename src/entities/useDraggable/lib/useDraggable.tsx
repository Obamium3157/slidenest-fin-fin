// import type { Point } from "../../../shared/types/point/Point.ts";
// import { useCallback, useEffect, useRef, useState } from "react";
// import * as React from "react";
//
// type DraggableArgs = {
//   initialX: number;
//   initialY: number;
//   onDrag?: (pos: Point) => void;
// };
//
// export function useDraggable(args: DraggableArgs) {
//   const { initialX, initialY, onDrag } = args;
//
//   const [pos, setPos] = useState<Point>({ x: initialX, y: initialY });
//   const [isDragging, setIsDragging] = useState(false);
//   const offsetRef = useRef<Point>({ x: 0, y: 0 });
//
//   const onDragRef = useRef(onDrag);
//   onDragRef.current = onDrag;
//
//   const onMouseDown = useCallback(
//     (e: React.MouseEvent) => {
//       e.preventDefault();
//       setIsDragging(true);
//       offsetRef.current = {
//         x: pos.x - e.clientX,
//         y: pos.y - e.clientY,
//       };
//     },
//     [pos],
//   );
//
//   useEffect(() => {
//     if (!isDragging) return;
//
//     const onMouseMove = (e: MouseEvent) => {
//       const newX = offsetRef.current.x + e.clientX;
//       const newY = offsetRef.current.y + e.clientY;
//
//       setPos({ x: newX, y: newY });
//       if (onDragRef.current) onDragRef.current({ x: newX, y: newY });
//     };
//
//     const onMouseUp = () => {
//       setIsDragging(false);
//     };
//
//     window.addEventListener("mousemove", onMouseMove);
//     window.addEventListener("mouseup", onMouseUp);
//
//     return () => {
//       window.removeEventListener("mousemove", onMouseMove);
//       window.removeEventListener("mouseup", onMouseUp);
//     };
//   }, [isDragging, pos]);
//
//   return { onMouseDown };
// }

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

      try {
        (e.target as Element).setPointerCapture?.(pe.pointerId);
        // eslint-disable-next-line @typescript-eslint/no-unused-vars
      } catch (err) {
        /* empty */
      }

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
        try {
          (e.target as Element).releasePointerCapture?.(ev.pointerId);
          // eslint-disable-next-line @typescript-eslint/no-unused-vars
        } catch (err) {
          /*empty */
        }

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
    cancel: () => {
      cleanup.current?.();
    },
  } as const;
}
