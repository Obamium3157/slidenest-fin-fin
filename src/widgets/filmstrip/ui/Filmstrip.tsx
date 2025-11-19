import {
  getOrderedMapElementById,
  getOrderedMapOrder,
} from "../../../shared/types/orderedMap/OrderedMap.ts";
import { SlideViewFilmstrip } from "../../slideViewFilmstrip/ui/SlideViewFilmstrip.tsx";

import styles from "./filmstrip.module.css";
import type { Editor } from "../../../entities/editor/model/types.ts";
import { useSlideDragAndDrop } from "../../../entities/hooks/lib/useSlideDragAndDrop.tsx";

export type FilmstripProps = {
  editor: Editor;
};

export function FilmStrip(props: FilmstripProps) {
  const { editor } = props;
  const slides = editor.presentation.slides;

  const order = getOrderedMapOrder(slides);

  const {
    containerRef,
    separatorsRef,
    isDragging,
    hoverSeparatorIdx,
    ensureSepCapacity,
    onDragStart,
    onDrag,
    onDragEnd,
  } = useSlideDragAndDrop({ editor, order });

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
