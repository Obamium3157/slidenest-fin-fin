import { useDraggable } from "./useDraggable.tsx";

type SlideViewFilmstripDragAndDropArgs = {
  onDragStart?: () => void;
  onDrag?: (state: { clientX: number; clientY: number }) => void;
  onDragEnd?: (moved?: boolean) => void;
};

export function useSlideViewFilmstripDragAndDrop(
  args: SlideViewFilmstripDragAndDropArgs,
) {
  const { onDragStart, onDrag, onDragEnd } = args;

  const { onPointerDown } = useDraggable({
    onStart: () => {
      onDragStart?.();
    },
    onDrag: (state) => {
      onDrag?.({ clientX: state.clientX, clientY: state.clientY });
    },
    onEnd: (moved?: boolean) => {
      onDragEnd?.(moved);
    },
    preventDefault: true,
    stopPropagation: true,
    movementThreshold: 5,
  });

  return { onPointerDown };
}
