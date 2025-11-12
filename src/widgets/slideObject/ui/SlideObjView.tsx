import type { Slide, SlideObj } from "../../../entities/slide/model/types.ts";
import * as React from "react";
import styles from "./slideObjView.module.css";
import { getStyleFromFont } from "../../../entities/slideText/lib/slideText.ts";
import { useDraggable } from "../../../entities/hooks/lib/useDraggable.tsx";
import { dispatch } from "../../../entities/editor/lib/modifyEditor.ts";
import {
  addSlideObjToSelection,
  changeFontSize,
  changeMultipleSlideObjectsPosition,
  changeSlideObjectPosition,
  changeSlideObjSize,
  deselectSlideObjects,
  MIN_FONT_SIZE,
} from "../../../entities/editor/lib/editor.ts";
import { useRef } from "react";
import { AllResizePoints } from "../../allResizePoints/ui/AllResizePoints.tsx";
import type { Rect } from "../../../shared/types/rect/Rect.ts";
import { parseFontSize } from "../../../shared/types/font/lib/lib.ts";
import type { Editor } from "../../../entities/editor/model/types.ts";
import { getOrderedMapElementById } from "../../../shared/types/orderedMap/OrderedMap.ts";

export type SlideObjViewProps = {
  editor: Editor;
  slide: Slide;
  slideObj: SlideObj;
  isSelected?: boolean;
  onSelect?: (isMultipleSelection: boolean) => void;
  onDeselect?: () => void;
  stopPropagation?: boolean;
};

export function SlideObjView(props: SlideObjViewProps) {
  const {
    editor,
    slide,
    slideObj,
    isSelected = false,
    onSelect,
    stopPropagation = false,
  } = props;

  const slideId = slide.id;

  const [isHovered, setHovered] = React.useState(false);
  const startRectRef = useRef<Record<string, Rect> | null>(null);
  const didDragRef = useRef(false);

  const className = `${styles.slideObj} ${
    isSelected
      ? styles.slideObj__selected
      : isHovered
        ? styles.slideObj__hovered
        : ""
  }`;

  const { x, y, w, h } = slideObj.rect;

  const handleClick = (e: React.MouseEvent) => {
    if (stopPropagation) e.stopPropagation();

    if (didDragRef.current) {
      didDragRef.current = false;
      return;
    }

    onSelect?.(e.shiftKey);
  };

  const { onPointerDown, isDraggingRef } = useDraggable({
    preventDefault: true,
    stopPropagation: stopPropagation,
    onStart: () => {
      const currentlySelected = editor.select.selectedSlideObjIds || [];

      const isAlreadySelected = currentlySelected.includes(slideObj.id);

      const idsToCapture = isAlreadySelected
        ? currentlySelected.slice()
        : [slideObj.id];

      if (!isAlreadySelected) {
        if (currentlySelected.length > 0) {
          dispatch(deselectSlideObjects, [currentlySelected]);
        }
        dispatch(addSlideObjToSelection, [slideObj.id]);
      }

      const map: Record<string, Rect> = {};
      for (const id of idsToCapture) {
        const obj = getOrderedMapElementById(slide.slideObjects, id);
        if (obj) {
          map[id] = { ...obj.rect };
        }
      }

      if (!map[slideObj.id]) {
        map[slideObj.id] = { ...slideObj.rect };
      }

      startRectRef.current = map;
    },
    onDrag: ({ dx, dy }) => {
      const startMap = startRectRef.current;
      if (!startMap) return;

      didDragRef.current = true;
      isDraggingRef.current = true;

      const ids = Object.keys(startMap);

      if (ids.length === 1) {
        const start = startMap[ids[0]];
        const newX = Math.round(start.x + dx);
        const newY = Math.round(start.y + dy);
        dispatch(changeSlideObjectPosition, [slideId, ids[0], newX, newY]);
      } else {
        const updates: Record<string, { x: number; y: number }> = {};
        for (const id of ids) {
          const start = startMap[id];
          updates[id] = {
            x: Math.round(start.x + dx),
            y: Math.round(start.y + dy),
          };
        }
        dispatch(changeMultipleSlideObjectsPosition, [slideId, updates]);
      }
    },
    onEnd: () => {
      setTimeout(() => {
        didDragRef.current = false;
        isDraggingRef.current = false;
      }, 0);

      startRectRef.current = null;
    },
  });

  const handlePointerDownWrapper = (e: React.PointerEvent) => {
    if (stopPropagation) e.stopPropagation();

    onPointerDown(e);
  };

  const baseStyle: React.CSSProperties = {
    left: `${x}px`,
    top: `${y}px`,
    width: `${w}px`,
    height: `${h}px`,
    position: "absolute",
    transformOrigin: "top left",
    boxSizing: "border-box",
  };

  const handleResize = (newRect: Rect) => {
    dispatch(changeSlideObjSize, [slideId, slideObj.id, newRect.w, newRect.h]);
    dispatch(changeSlideObjectPosition, [
      slideId,
      slideObj.id,
      newRect.x,
      newRect.y,
    ]);

    if (slideObj.type === "text") {
      const textObj = slideObj;
      const oldW = slideObj.rect.w;
      const oldH = slideObj.rect.h;
      const width = newRect.w;
      const height = newRect.h;

      if ((oldW === 0 && oldH === 0) || (width === 0 && height === 0)) {
        return;
      }

      let scale = 1;
      if (height < oldH) {
        scale = Math.hypot(width, height) / Math.hypot(oldW || 0, oldH || 0);
      }

      const rawFontSize = textObj.font?.fontSize;
      const { value: oldFontSizeNum, unit } = parseFontSize(rawFontSize);

      const newFontSizeNum = Math.max(
        Math.round(oldFontSizeNum * scale),
        MIN_FONT_SIZE,
      );

      const newFontSizeStr = `${newFontSizeNum}${unit}`;

      dispatch(changeFontSize, [slideId, slideObj.id, newFontSizeStr]);
    }
  };

  return (
    <div
      className={className}
      style={baseStyle}
      onPointerDown={handlePointerDownWrapper}
      onMouseEnter={() => setHovered(true)}
      onMouseLeave={() => setHovered(false)}
      onClick={handleClick}
    >
      {isSelected && (
        <AllResizePoints parentRect={slideObj.rect} onResize={handleResize} />
      )}
      {slideObj.type === "text" ? (
        <div
          // TODO: добавить contentEditable
          // contentEditable={true}
          className={styles.slideObjText}
          style={getStyleFromFont(slideObj.font)}
          onChange={() => console.log("AKHDHJASKDSLDHJSALD")}
        >
          {slideObj.text}
        </div>
      ) : slideObj.type === "image" ? (
        <img
          src={slideObj.src}
          alt="изображение на слайде"
          className={styles.slideObjImage}
        />
      ) : null}
    </div>
  );
}
