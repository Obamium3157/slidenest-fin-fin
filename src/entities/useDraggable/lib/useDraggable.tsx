import type { Point } from "../../../shared/types/point/Point.ts";
import { useCallback, useEffect, useRef, useState } from "react";
import * as React from "react";

type DraggableArgs = {
  initialX: number;
  initialY: number;
  onDragEnd?: (pos: Point) => void;
};

export function useDraggable(args: DraggableArgs) {
  const { initialX, initialY, onDragEnd } = args;

  const [pos, setPos] = useState<Point>({ x: initialX, y: initialY });
  const [isDragging, setIsDragging] = useState(false);

  const offSetRef = useRef<Point>({ x: 0, y: 0 });
  const posRef = useRef<Point>(pos);
  posRef.current = pos;
  const onDragEndRef = useRef(onDragEnd);
  onDragEndRef.current = onDragEnd;

  const onMouseDown = useCallback((e: React.MouseEvent) => {
    e.preventDefault();
    setIsDragging(true);
    offSetRef.current = {
      x: posRef.current.x - e.clientX,
      y: posRef.current.y - e.clientY,
    };
  }, []);

  useEffect(() => {
    if (!isDragging) return;

    const onMouseMove = (event: MouseEvent) => {
      const newX = offSetRef.current.x + event.clientX;
      const newY = offSetRef.current.y + event.clientY;
      setPos({ x: newX, y: newY });
    };

    const onMouseUp = () => {
      setIsDragging(false);
      if (onDragEndRef.current) onDragEndRef.current(posRef.current);
    };

    window.addEventListener("mousemove", onMouseMove);
    window.addEventListener("mouseup", onMouseUp);

    return () => {
      window.removeEventListener("mousemove", onMouseMove);
      window.removeEventListener("mouseup", onMouseUp);
    };
  }, [isDragging]);

  return {
    pos,
    setPos,
    isDragging,
    onMouseDown,
  };
}
