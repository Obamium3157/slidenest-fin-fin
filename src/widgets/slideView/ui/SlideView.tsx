import * as React from "react";
import { useEffect, useRef } from "react";

import { AllSlideObjects } from "../../allSlideObjects/ui/AllSlideObjects.tsx";
import type { Slide } from "../../../entities/slide/model/types.ts";

import styles from "./SlideView.module.css";
import { useAppSelector } from "../../../entities/store/hooks.ts";
import { useAppActions } from "../../../entities/store/actions.ts";

type SlideViewProps = {
  slide: Slide;
  readonly?: boolean;
  className?: string;
  style?: React.CSSProperties;
};

export function SlideView(props: SlideViewProps) {
  const { slide, readonly = false, className, style } = props;

  const select = useAppSelector((state) => state.presentation.selection);

  const { deselectSlideObjects, removeSlideObjects, addSlideObjToSelection } =
    useAppActions();

  const slideRef = useRef<HTMLDivElement | null>(null);

  const handleBackgroundClick = (e: React.MouseEvent) => {
    if (readonly) return;
    if (e.defaultPrevented) return;

    deselectSlideObjects({ objIds: select.selectedSlideObjIds });
  };

  useEffect(() => {
    if (readonly) return;

    const handleKeyDown = (e: KeyboardEvent) => {
      const t = e.target as HTMLElement | null;
      const isEditable =
        !!t &&
        (t.tagName === "INPUT" ||
          t.tagName === "TEXTAREA" ||
          t.tagName === "SELECT" ||
          t.isContentEditable ||
          Boolean(t.closest?.("[contenteditable='true']")));

      if (e.key === "Backspace") {
        if (isEditable) return;
        if (select.selectedSlideObjIds.length === 0) return;
        removeSlideObjects({
          slideId: slide.id,
          objIds: select.selectedSlideObjIds,
        });
      }
    };

    window.addEventListener("keydown", handleKeyDown);
    return () => window.removeEventListener("keydown", handleKeyDown);
  }, [readonly, removeSlideObjects, slide.id, select.selectedSlideObjIds]);

  const preventSelection = (e: React.MouseEvent | React.DragEvent) => {
    e.preventDefault();
  };

  return (
    <div
      ref={slideRef}
      className={[styles.slide, className].filter(Boolean).join(" ")}
      data-slide-canvas="true"
      style={{
        background: slide.backgroundColor.color,
        ...style,
      }}
      onClick={handleBackgroundClick}
      onMouseDown={preventSelection}
      onDragStart={preventSelection}
    >
      <AllSlideObjects
        slide={slide}
        readonly={readonly}
        selectedObjectIds={readonly ? [] : select.selectedSlideObjIds}
        onSelectObject={
          readonly
            ? undefined
            : (id: string, isMultipleSelection: boolean) => {
                if (!isMultipleSelection) {
                  deselectSlideObjects({ objIds: select.selectedSlideObjIds });
                }
                addSlideObjToSelection({ objId: id });
              }
        }
        onDeselectObject={
          readonly
            ? undefined
            : (id: string) => {
                deselectSlideObjects({ objIds: [id] });
              }
        }
      />
    </div>
  );
}
