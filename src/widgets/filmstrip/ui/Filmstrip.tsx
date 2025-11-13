import { useCallback, useRef, useState } from "react";
import {
  getOrderedMapElementById,
  getOrderedMapOrder,
} from "../../../shared/types/orderedMap/OrderedMap.ts";
import { SlideViewFilmstrip } from "../../slideViewFilmstrip/ui/SlideViewFilmstrip.tsx";

import styles from "./filmstrip.module.css";
import { dispatch } from "../../../entities/editor/lib/modifyEditor.ts";
import { moveMultipleSlides } from "../../../entities/editor/lib/editor.ts";
import type { Editor } from "../../../entities/editor/model/types.ts";

export type FilmstripProps = {
  editor: Editor;
};

export function FilmStrip(props: FilmstripProps) {
  const { editor } = props;
  const slides = editor.presentation.slides;

  const order = getOrderedMapOrder(slides);

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

  return (
    <div className={styles.filmstrip} ref={containerRef}>
      {order.map((id, idx) => {
        const s = getOrderedMapElementById(slides, id);
        if (!s) return null;

        ensureSepCapacity(order.length + 1);

        const isThisHover = hoverSeparatorIdx === idx;

        return (
          <div key={id}>
            <hr
              ref={(el) => {
                separatorsRef.current[idx] = el;
              }}
              className={`${styles.slideSeparator} ${
                isThisHover ? styles.slideSeparatorActive : ""
              }`}
              onPointerDown={(e) => e.preventDefault()}
            />
            <SlideViewFilmstrip
              key={id}
              editor={editor}
              slide={s}
              scaleFactor={7}
              idx={idx}
              preview={true}
              isSelected={editor.select.selectedSlideIds.includes(id)}
              onDragStart={() => onDragStart(s.id)}
              onDrag={(p) => onDrag(p)}
              onDragEnd={(moved?: boolean) => onDragEnd(moved)}
              isDragging={isDragging}
            />
          </div>
        );
      })}

      <hr
        ref={(el) => {
          separatorsRef.current[order.length] = el;
        }}
        className={`${styles.slideSeparator} ${
          hoverSeparatorIdx === order.length ? styles.slideSeparatorActive : ""
        }`}
        onPointerDown={(e) => e.preventDefault()}
      />
    </div>
  );
}
