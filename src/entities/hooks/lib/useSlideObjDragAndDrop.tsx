import { useDraggable } from "./useDraggable.tsx";
import type { Rect } from "../../../shared/types/rect/Rect.ts";
import { getOrderedMapElementById } from "../../../shared/types/orderedMap/OrderedMap.ts";
import type { Slide, SlideObj } from "../../slide/model/types.ts";
import { useRef, useState } from "react";
import * as React from "react";
import { useAppSelector } from "../../store/hooks.ts";
import { useAppActions } from "../../store/actions.ts";

type SlideDragAndDropArgs = {
  slide: Slide;
  slideId: string;
  slideObj: SlideObj;
  onSelect?: (isMultipleSelection: boolean) => void;
};

export function useSlideObjDragAndDrop(args: SlideDragAndDropArgs) {
  const { slide, slideId, slideObj, onSelect } = args;

  const startRectMapRef = useRef<Record<string, Rect> | null>(null);
  const didDragRef = useRef(false);

  const select = useAppSelector((state) => state.selection);

  const {
    changeMultipleSlideObjectsPosition,
    deselectSlideObjects,
    addSlideObjToSelection,
  } = useAppActions();

  const [localPositions, setLocalPositionsState] = useState<Record<
    string,
    { x: number; y: number }
  > | null>(null);

  const localPositionsRef = useRef<Record<
    string,
    { x: number; y: number }
  > | null>(null);

  const setLocalPositions = (
    val: Record<string, { x: number; y: number }> | null,
  ) => {
    localPositionsRef.current = val;
    setLocalPositionsState(val);
  };

  const { onPointerDown: draggablePointerDown, isDraggingRef } = useDraggable({
    preventDefault: true,
    onStart: () => {
      const currentlySelected = select.selectedSlideObjIds || [];
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

      const initialLocal: Record<string, { x: number; y: number }> = {};
      for (const id of Object.keys(map)) {
        initialLocal[id] = { x: map[id].x, y: map[id].y };
      }
      setLocalPositions(initialLocal);
    },
    onDrag: ({ dx, dy }) => {
      const startMap = startRectMapRef.current;
      if (!startMap) return;

      didDragRef.current = true;
      isDraggingRef.current = true;

      const ids = Object.keys(startMap);

      const updates: Record<string, { x: number; y: number }> = {};
      for (const id of ids) {
        const start = startMap[id];
        updates[id] = {
          x: Math.round(start.x + dx),
          y: Math.round(start.y + dy),
        };
      }

      setLocalPositions(updates);
    },
    onEnd: () => {
      const latest = localPositionsRef.current;

      if (didDragRef.current && latest && Object.keys(latest).length > 0) {
        changeMultipleSlideObjectsPosition({
          slideId,
          updates: latest,
        });
      }

      setTimeout(() => {
        didDragRef.current = false;
        isDraggingRef.current = false;
      }, 0);

      startRectMapRef.current = null;
      setLocalPositions(null);
    },
  });

  const handlePointerDown = (e: React.PointerEvent) => {
    const currentlySelected = select.selectedSlideObjIds || [];
    const isAlreadySelected = currentlySelected.includes(slideObj.id);

    if (!isAlreadySelected) {
      if (!e.shiftKey) {
        if (currentlySelected.length > 0) {
          deselectSlideObjects({
            objIds: currentlySelected,
          });
        }
      }
      addSlideObjToSelection({
        objId: slideObj.id,
      });
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
    localPositions,
  };
}
