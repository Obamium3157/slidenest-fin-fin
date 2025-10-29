import { AllSlideObjects } from "../../allSlideObjects/ui/AllSlideObjects.tsx";
import type { Slide } from "../../../entities/slide/model/types.ts";

import styles from "./SlideView.module.css";
import { useEffect, useRef, useState } from "react";
import * as React from "react";
import { dispatch } from "../../../entities/editor/lib/modifyEditor.ts";
import { removeSlideObj } from "../../../entities/editor/lib/editor.ts";

type SlideViewProps = {
  slide: Slide;
};

export function SlideView(props: SlideViewProps) {
  const { slide } = props;

  const [selectedObjectId, setSelectedObjectId] = useState<string | null>(null);

  const slideRef = useRef<HTMLDivElement | null>(null);

  const handleBackgroundClick = () => {
    setSelectedObjectId(null);
  };

  // eslint-disable-next-line @typescript-eslint/no-unused-vars
  const [_, setLastKeyPressed] = React.useState<string>("");

  useEffect(() => {
    const handleKeyDown = (e: KeyboardEvent) => {
      setLastKeyPressed(e.key);

      switch (e.key) {
        case "Backspace": {
          dispatch(removeSlideObj, [slide.id, selectedObjectId]);
          break;
        }
        // case "Escape": {
        //   setSelectedObjectId(null);
        //   break;
        // }
        default: {
          break;
        }
      }
    };

    window.addEventListener("keydown", handleKeyDown);
    return () => {
      window.removeEventListener("keydown", handleKeyDown);
    };
  }, [slide.id, selectedObjectId]);

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
        selectedObjectId={selectedObjectId}
        onSelectObject={(id: string | null) => {
          setSelectedObjectId(id);
        }}
        stopPropagation={true}
      />
    </div>
  );
}
