import type { Point } from "../../../shared/types/point/Point.ts";
import { useCallback, useEffect, useRef, useState } from "react";
import * as React from "react";

type DraggableArgs = {
  initialX: number;
  initialY: number;
  onDrag?: (pos: Point) => void;
};

export function useDraggable(args: DraggableArgs) {
  const { initialX, initialY, onDrag } = args;

  const [pos, setPos] = useState<Point>({ x: initialX, y: initialY });
  const [isDragging, setIsDragging] = useState(false);
  const offsetRef = useRef<Point>({ x: 0, y: 0 });

  const onDragRef = useRef(onDrag);
  onDragRef.current = onDrag;

  const onMouseDown = useCallback(
    (e: React.MouseEvent) => {
      e.preventDefault();
      setIsDragging(true);
      offsetRef.current = {
        x: pos.x - e.clientX,
        y: pos.y - e.clientY,
      };
    },
    [pos],
  );

  useEffect(() => {
    if (!isDragging) return;

    const onMouseMove = (e: MouseEvent) => {
      const newX = offsetRef.current.x + e.clientX;
      const newY = offsetRef.current.y + e.clientY;

      setPos({ x: newX, y: newY });
      if (onDragRef.current) onDragRef.current({ x: newX, y: newY });
    };

    const onMouseUp = () => {
      setIsDragging(false);
    };

    window.addEventListener("mousemove", onMouseMove);
    window.addEventListener("mouseup", onMouseUp);

    return () => {
      window.removeEventListener("mousemove", onMouseMove);
      window.removeEventListener("mouseup", onMouseUp);
    };
  }, [isDragging, pos]);

  return { onMouseDown };
}
