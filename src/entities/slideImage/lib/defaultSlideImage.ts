import type { Rect } from "../../../shared/types/rect/Rect.ts";

export function defaultSlideImage(): { src: string; rect: Rect } {
  return {
    src: "https://encrypted-tbn0.gstatic.com/images?q=tbn:ANd9GcQPKD_lbfqfXoqaqsgOwAlMm2DrfP9Za0Dimw&s",
    rect: {
      x: 600,
      y: 300,
      w: 350,
      h: 350,
    },
  };
}
