import { AllSlideObjects } from "../../allSlideObjects/ui/AllSlideObjects.tsx";
import type { Slide } from "../../../entities/slide/model/types.ts";

import styles from "./SlideView.module.css";
import { useEffect, useRef } from "react";
import * as React from "react";
import { dispatch } from "../../../entities/editor/lib/modifyEditor.ts";
import {
  addSlideObjToSelection,
  deselectSlideObjects,
  removeSlideObjects,
} from "../../../entities/editor/lib/editor.ts";
import type { Editor } from "../../../entities/editor/model/types.ts";

type SlideViewProps = {
  editor: Editor;
  slide: Slide;
};

export function SlideView(props: SlideViewProps) {
  const { editor, slide } = props;
  const { select } = editor;

  const slideRef = useRef<HTMLDivElement | null>(null);

  const handleBackgroundClick = (e: React.MouseEvent) => {
    if (e.defaultPrevented) {
      return;
    }
    dispatch(deselectSlideObjects, [select.selectedSlideObjIds]);
  };

  useEffect(() => {
    const handleKeyDown = (e: KeyboardEvent) => {
      switch (e.key) {
        case "Backspace": {
          dispatch(removeSlideObjects, [slide.id, select.selectedSlideObjIds]);
          break;
        }
        default: {
          break;
        }
      }
    };

    window.addEventListener("keydown", handleKeyDown);
    return () => {
      window.removeEventListener("keydown", handleKeyDown);
    };
  }, [slide.id, select.selectedSlideObjIds]);

  const preventSelection = (e: React.MouseEvent | React.DragEvent) => {
    e.preventDefault();
  };
  return (
    <div
      ref={slideRef}
      className={styles.slide}
      style={{
        background: slide.backgroundColor.color,
      }}
      onClick={handleBackgroundClick}
      onMouseDown={preventSelection}
      onDragStart={preventSelection}
    >
      <AllSlideObjects
        editor={editor}
        slide={slide}
        selectedObjectIds={select.selectedSlideObjIds}
        onSelectObject={(id: string, isMultipleSelection: boolean) => {
          if (!isMultipleSelection) {
            dispatch(deselectSlideObjects, [select.selectedSlideObjIds]);
          }
          dispatch(addSlideObjToSelection, [id]);
        }}
        onDeselectObject={(id: string) => {
          dispatch(deselectSlideObjects, [id]);
        }}
      />
    </div>
  );
}
