import { useDraggable } from "./useDraggable.tsx";
import type { Rect } from "../../../shared/types/rect/Rect.ts";
import { getOrderedMapElementById } from "../../../shared/types/orderedMap/OrderedMap.ts";
import type { Slide, SlideObj } from "../../slide/model/types.ts";
import { useRef, useState } from "react";
import * as React from "react";
import { useAppSelector } from "../../store/hooks.ts";
import { useAppActions } from "../../store/actions.ts";
import {
  SLIDE_HEIGHT,
  SLIDE_WIDTH,
} from "../../../shared/lib/constants/constants.ts";

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

  const select = useAppSelector((state) => state.presentation.selection);

  const {
    changeMultipleSlideObjectsPosition,
    deselectSlideObjects,
    addSlideObjToSelection,
  } = useAppActions();

  const [localRects, setLocalRects] = useState<Record<string, Rect> | null>(
    null,
  );

  const localRectsRef = useRef<Record<string, Rect> | null>(null);

  const updateLocalRectsRef = (val: Record<string, Rect> | null) => {
    localRectsRef.current = val;
    setLocalRects(val);
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

      const initialLocal: Record<string, Rect> = {};
      for (const id of Object.keys(map)) {
        initialLocal[id] = {
          x: map[id].x,
          y: map[id].y,
          w: map[id].w,
          h: map[id].h,
        };
      }
      updateLocalRectsRef(initialLocal);
    },
    onDrag: ({ dx, dy }) => {
      const startMap = startRectMapRef.current;
      if (!startMap) return;

      didDragRef.current = true;
      isDraggingRef.current = true;

      const ids = Object.keys(startMap);

      const updates: Record<string, Rect> = {};
      for (const id of ids) {
        const start = startMap[id];
        let nextX = Math.round(start.x + dx);
        let nextY = Math.round(start.y + dy);

        const maxX = Math.max(0, SLIDE_WIDTH - start.w);
        const maxY = Math.max(0, SLIDE_HEIGHT - start.h);
        if (nextX < 0) nextX = 0;
        if (nextY < 0) nextY = 0;
        if (nextX > maxX) nextX = maxX;
        if (nextY > maxY) nextY = maxY;

        updates[id] = {
          x: nextX,
          y: nextY,
          w: start.w,
          h: start.h,
        };
      }

      updateLocalRectsRef(updates);
    },
    onEnd: () => {
      const latest = localRectsRef.current;

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
      updateLocalRectsRef(null);
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
    localRects: localRects,
  };
}
