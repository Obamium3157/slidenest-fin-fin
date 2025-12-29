import type { Slide } from "../../../entities/slide/model/types.ts";
import { SlideView } from "../../../widgets/slideView/ui/SlideView.tsx";

export function ExportSlides(props: { slides: Slide[] }) {
  const { slides } = props;
  return (
    <div>
      {slides.map((slide) => (
        <div
          key={slide.id}
          data-export-slide={"true"}
          data-export-slide-id={slide.id}
        >
          <SlideView slide={slide} readonly style={{ border: "none" }} />
        </div>
      ))}
    </div>
  );
}
