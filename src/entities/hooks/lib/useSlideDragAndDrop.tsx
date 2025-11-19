import { useCallback, useRef, useState } from "react";
import type { Editor } from "../../editor/model/types.ts";
import { dispatch } from "../../editor/lib/modifyEditor.ts";
import { moveMultipleSlides } from "../../editor/lib/editor.ts";

type SlideDragAndDropArgs = {
  editor: Editor;
  order: string[];
};

export function useSlideDragAndDrop(args: SlideDragAndDropArgs) {
  const { editor, order } = args;

  const separatorsRef = useRef<Array<HTMLHRElement | null>>([]);
  const containerRef = useRef<HTMLDivElement | null>(null);

  const [hoverSeparatorIdx, setHoverSeparatorIdx] = useState<number | null>(
    null,
  );
  const hoverSeparatorIdxRef = useRef<number | null>(null);
  const [isDragging, setIsDragging] = useState<boolean>(false);

  const draggingSlideIdsRef = useRef<string[] | null>(null);

  const ensureSepCapacity = (n: number) => {
    if (separatorsRef.current.length < n) {
      separatorsRef.current.length = n;
    }
  };

  const findSeparatorIndexAtPoint = useCallback(
    (clientX: number, clientY: number) => {
      const seps = separatorsRef.current;
      for (let i = 0; i < seps.length; i++) {
        const el = seps[i];
        if (!el) continue;
        const rect = el.getBoundingClientRect();
        if (
          clientY >= rect.top &&
          clientY <= rect.bottom &&
          clientX >= rect.left &&
          clientX <= rect.right
        ) {
          return i;
        }
      }

      const container = containerRef.current;
      if (!container) return 0;
      const cRect = container.getBoundingClientRect();
      if (clientY < cRect.top) return 0;
      if (clientY > cRect.bottom) return order.length;

      let bestI: number | null = null;
      let bestDist = Infinity;
      for (let i = 0; i < seps.length; i++) {
        const el = seps[i];
        if (!el) continue;
        const rect = el.getBoundingClientRect();
        const mid = (rect.top + rect.bottom) / 2;
        const dist = Math.abs(clientY - mid);
        if (dist < bestDist) {
          bestDist = dist;
          bestI = i;
        }
      }

      if (bestI == null) return 0;
      return Math.max(0, Math.min(order.length, bestI));
    },
    [order.length],
  );

  const onDragStart = useCallback(
    (slideId: string) => {
      const currentSelection = editor.select.selectedSlideIds || [];

      draggingSlideIdsRef.current = currentSelection.includes(slideId)
        ? currentSelection.slice()
        : [slideId];
      setIsDragging(true);
      setHoverSeparatorIdx(null);
      hoverSeparatorIdxRef.current = null;
    },
    [editor.select.selectedSlideIds],
  );

  const onDrag = useCallback(
    (payload: { clientX: number; clientY: number }) => {
      if (!draggingSlideIdsRef.current && !isDragging) return;

      hoverSeparatorIdxRef.current = findSeparatorIndexAtPoint(
        payload.clientX,
        payload.clientY,
      );

      setHoverSeparatorIdx(hoverSeparatorIdxRef.current);
    },
    [findSeparatorIndexAtPoint, isDragging],
  );

  const onDragEnd = useCallback(
    (moved?: boolean) => {
      setIsDragging(false);

      const draggingIds = draggingSlideIdsRef.current;
      const targetIdxRaw = hoverSeparatorIdxRef.current;

      draggingSlideIdsRef.current = null;
      setHoverSeparatorIdx(null);
      hoverSeparatorIdxRef.current = null;

      if (!moved) return;
      if (!draggingIds || targetIdxRaw == null) return;

      const countBeforeTarget = draggingIds.reduce((acc, id) => {
        const pos = order.indexOf(id);
        return pos !== -1 && pos < targetIdxRaw ? acc + 1 : acc;
      }, 0);

      const remainingLength = order.length - draggingIds.length;
      const adjustedTarget = Math.max(
        0,
        Math.min(remainingLength, targetIdxRaw - countBeforeTarget),
      );

      dispatch(moveMultipleSlides, [draggingIds, adjustedTarget]);
    },
    [order],
  );

  return {
    containerRef,
    separatorsRef,
    isDragging,
    hoverSeparatorIdx,
    ensureSepCapacity,
    onDragStart,
    onDrag,
    onDragEnd,
  };
}
