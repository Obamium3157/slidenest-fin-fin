import { AllSlideObjects } from "../../allSlideObjects/ui/AllSlideObjects.tsx";
import type { Slide } from "../../../entities/slide/model/types.ts";

import styles from "./SlideView.module.css";
import { useEffect, useRef } from "react";
import * as React from "react";
import { useAppSelector } from "../../../entities/store/hooks.ts";
import { useAppActions } from "../../../entities/store/actions.ts";

type SlideViewProps = {
  slide: Slide;
};

export function SlideView(props: SlideViewProps) {
  const { slide } = props;

  const select = useAppSelector((state) => state.selection);

  const { deselectSlideObjects, removeSlideObjects, addSlideObjToSelection } =
    useAppActions();

  const slideRef = useRef<HTMLDivElement | null>(null);

  const handleBackgroundClick = (e: React.MouseEvent) => {
    if (e.defaultPrevented) {
      return;
    }
    deselectSlideObjects({
      objIds: select.selectedSlideObjIds,
    });
  };

  useEffect(() => {
    const handleKeyDown = (e: KeyboardEvent) => {
      switch (e.key) {
        case "Backspace": {
          removeSlideObjects({
            slideId: slide.id,
            objIds: select.selectedSlideObjIds,
          });
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
  }, [slide.id, select.selectedSlideObjIds, removeSlideObjects]);

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
        slide={slide}
        selectedObjectIds={select.selectedSlideObjIds}
        onSelectObject={(id: string, isMultipleSelection: boolean) => {
          if (!isMultipleSelection) {
            deselectSlideObjects({
              objIds: select.selectedSlideObjIds,
            });
          }
          addSlideObjToSelection({
            objId: id,
          });
        }}
        onDeselectObject={(id: string) => {
          deselectSlideObjects({
            objIds: [id],
          });
        }}
      />
    </div>
  );
}
