import type { SlideObj } from "../../../entities/slide/model/types.ts";
import * as React from "react";
import styles from "./slideObjView.module.css";
import { getStyleFromFont } from "../../../entities/slideText/lib/slideText.ts";
import { useDraggable } from "../../../entities/hooks/lib/useDraggable.tsx";
import { dispatch } from "../../../entities/editor/lib/modifyEditor.ts";
import {
  changeFontSize,
  changeSlideObjectPosition,
  changeSlideObjSize,
  MIN_FONT_SIZE,
} from "../../../entities/editor/lib/editor.ts";
import { useRef } from "react";
import { AllResizePoints } from "../../allResizePoints/ui/AllResizePoints.tsx";
import type { Rect } from "../../../shared/types/rect/Rect.ts";

export type SlideObjViewProps = {
  slideId: string;
  slideObj: SlideObj;
  isSelected?: boolean;
  onSelect?: () => void;
  onDeselect?: () => void;
  stopPropagation?: boolean;
};

function parseFontSize(fontSize: string | undefined): {
  value: number;
  unit: string;
} {
  if (!fontSize) {
    return { value: 14, unit: "px" };
  }

  const str = fontSize.trim();
  if (str.length === 0) {
    return { value: 14, unit: "px" };
  }

  let i = 0;
  let hasDot = false;
  let numberPart = "";

  if (str[i] === "-" || str[i] === "+") {
    numberPart += str[i];
    i++;
  }

  for (; i < str.length; i++) {
    const ch = str[i];
    if (ch >= "0" && ch <= "9") {
      numberPart += ch;
    } else if (ch === "." && !hasDot) {
      hasDot = true;
      numberPart += ch;
    } else {
      break;
    }
  }

  const rest = str.slice(i).trim();
  const num = Number(numberPart);
  if (Number.isNaN(num)) {
    return { value: 14, unit: "px" };
  }

  const unit = rest.length > 0 ? rest : "px";
  return { value: num, unit };
}

export function SlideObjView(props: SlideObjViewProps) {
  const {
    slideId,
    slideObj,
    isSelected = false,
    onSelect,
    onDeselect,
    stopPropagation = false,
  } = props;

  const [isHovered, setHovered] = React.useState(false);
  const startRectRef = useRef<Rect | null>(null);
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

    onSelect?.();
  };

  const { onPointerDown, isDraggingRef } = useDraggable({
    preventDefault: true,
    stopPropagation: stopPropagation,
    onStart: () => {
      startRectRef.current = slideObj.rect;
    },
    onDrag: ({ dx, dy }) => {
      const start = startRectRef.current;
      if (!start) return;

      didDragRef.current = true;
      isDraggingRef.current = true;

      const newX = Math.round(start.x + dx);
      const newY = Math.round(start.y + dy);

      dispatch(changeSlideObjectPosition, [slideId, slideObj.id, newX, newY]);
    },
    onEnd: () => {
      if (didDragRef.current) {
        onDeselect?.();
      }

      setTimeout(() => {
        didDragRef.current = false;
        isDraggingRef.current = false;
      }, 0);

      startRectRef.current = null;
    },
  });

  const handlePointerDownWrapper = (e: React.PointerEvent) => {
    if (stopPropagation) e.stopPropagation();

    onSelect?.();

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

      const scale =
        Math.hypot(width, height) / Math.hypot(oldW || 0, oldH || 0);

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
