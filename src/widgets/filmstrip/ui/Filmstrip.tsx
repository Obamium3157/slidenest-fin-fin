import {
  getOrderedMapElementById,
  getOrderedMapOrder,
} from "../../../shared/types/orderedMap/OrderedMap.ts";
import { SlideViewFilmstrip } from "../../slideViewFilmstrip/ui/SlideViewFilmstrip.tsx";

import styles from "./filmstrip.module.css";
import { useSlideDragAndDrop } from "../../../entities/hooks/lib/useSlideDragAndDrop.tsx";
import type { Editor } from "../../../entities/editor/model/types.ts";
import { useAppSelector } from "../../../entities/store/hooks.ts";
import { FILMSTRIP_SCALE_FACTOR } from "../../../shared/lib/constants/constants.ts";

export function FilmStrip() {
  const presentation = useAppSelector(
    (state) => state.presentation.history.present,
  );
  const select = useAppSelector((state) => state.presentation.selection);

  const editor: Editor = {
    presentation,
    select,
  };

  const slides = presentation.slides;

  const order = getOrderedMapOrder(slides);

  const {
    containerRef,
    separatorsRef,
    isDragging,
    hoverSeparatorIdx,
    onDragStart,
    onDrag,
    onDragEnd,
  } = useSlideDragAndDrop({ order });

  return (
    <div className={styles.filmstrip} ref={containerRef}>
      {order.map((id, idx) => {
        const s = getOrderedMapElementById(slides, id);
        if (!s) return null;

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
              slide={s}
              scaleFactor={FILMSTRIP_SCALE_FACTOR}
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
