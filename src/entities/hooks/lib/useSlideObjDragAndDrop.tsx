import { useDraggable } from "./useDraggable.tsx";
import { dispatch } from "../../editor/lib/modifyEditor.ts";
import {
  addSlideObjToSelection,
  changeMultipleSlideObjectsPosition,
  changeSlideObjectPosition,
  deselectSlideObjects,
} from "../../editor/lib/editor.ts";
import type { Rect } from "../../../shared/types/rect/Rect.ts";
import { getOrderedMapElementById } from "../../../shared/types/orderedMap/OrderedMap.ts";
import type { Editor } from "../../editor/model/types.ts";
import type { Slide, SlideObj } from "../../slide/model/types.ts";
import { useRef } from "react";
import * as React from "react";

type SlideDragAndDropArgs = {
  editor: Editor;
  slide: Slide;
  slideId: string;
  slideObj: SlideObj;
  onSelect?: (isMultipleSelection: boolean) => void;
};

export function useSlideObjDragAndDrop(args: SlideDragAndDropArgs) {
  const { editor, slide, slideId, slideObj, onSelect } = args;

  const startRectMapRef = useRef<Record<string, Rect> | null>(null);
  const didDragRef = useRef(false);

  const { onPointerDown: draggablePointerDown, isDraggingRef } = useDraggable({
    preventDefault: true,
    onStart: () => {
      const currentlySelected = editor.select.selectedSlideObjIds || [];
      const isAlreadySelected = currentlySelected.includes(slideObj.id);

      const idsToCapture = isAlreadySelected
        ? currentlySelected.slice()
        : [slideObj.id];

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

      startRectMapRef.current = map;
    },
    onDrag: ({ dx, dy }) => {
      const startMap = startRectMapRef.current;
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

      startRectMapRef.current = null;
    },
  });

  const handlePointerDown = (e: React.PointerEvent) => {
    const currentlySelected = editor.select.selectedSlideObjIds || [];
    const isAlreadySelected = currentlySelected.includes(slideObj.id);

    if (!isAlreadySelected) {
      if (!e.shiftKey) {
        if (currentlySelected.length > 0) {
          dispatch(deselectSlideObjects, [currentlySelected]);
        }
      }
      dispatch(addSlideObjToSelection, [slideObj.id]);
    }

    draggablePointerDown(e);
  };

  const handleClick = (e: React.MouseEvent) => {
    e.preventDefault();

    if (didDragRef.current) {
      didDragRef.current = false;
      return;
    }

    onSelect?.(e.shiftKey);
  };

  return {
    handleClick,
    onPointerDown: handlePointerDown,
    isDraggingRef,
  };
}
