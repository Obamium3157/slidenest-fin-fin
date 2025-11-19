import { type ResizePointType } from "../../resizePointType/model/types.ts";
import { useRef } from "react";
import type { Rect } from "../../../shared/types/rect/Rect.ts";
import { useDraggable } from "./useDraggable.tsx";
import { resizeRect } from "../../../shared/types/rect/lib/functions.ts";

type ResizePointArgs = {
  parentRect: Rect;
  type: ResizePointType;
  onResize: (rect: Rect) => void;
};

export function useResizePointDrag(args: ResizePointArgs) {
  const { parentRect, type, onResize } = args;
  const startRef = useRef<{ rect: Rect } | null>(null);

  const { onPointerDown } = useDraggable({
    onStart: () => {
      startRef.current = { rect: { ...parentRect } };
    },
    onDrag: ({ dx, dy }) => {
      if (!startRef.current) return;

      const startRect = startRef.current.rect;
      const newRect = resizeRect(startRect, type, dx, dy);

      onResize(newRect);
    },
    onEnd: () => {
      startRef.current = null;
    },
    preventDefault: true,
    stopPropagation: true,
  });

  return { onPointerDown };
}
