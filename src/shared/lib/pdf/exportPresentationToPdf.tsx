import { createRoot } from "react-dom/client";
import { Provider } from "react-redux";

import type { Presentation } from "../../../entities/presentation/model/types.ts";
import { store } from "../../../entities/store";
import { ExportSlides } from "./ExportSlides.tsx";
import {
  createOffscreenHost,
  ensureFontsLoaded,
  getSlidesInOrder,
  nextFrame,
  safeFileName,
  SLIDE_H,
  SLIDE_W,
  swapImagesToBlobUrls,
  unmountAndRemove,
} from "./utils.ts";

export async function exportPresentationToPdf(
  presentation: Presentation,
): Promise<void> {
  const slides = getSlidesInOrder(presentation);
  if (slides.length === 0) return;

  const [{ jsPDF }, html2canvasMod] = await Promise.all([
    import("jspdf"),
    import("html2canvas"),
  ]);
  const html2canvas = html2canvasMod.default as unknown as (
    el: HTMLElement,
    opts?: Record<string, unknown>,
  ) => Promise<HTMLCanvasElement>;

  const host = createOffscreenHost();
  const root = createRoot(host);
  root.render(
    <Provider store={store}>
      <ExportSlides slides={slides} />
    </Provider>,
  );

  await nextFrame();
  await ensureFontsLoaded();
  await nextFrame();

  const slideEls = Array.from(
    host.querySelectorAll<HTMLElement>("[data-export-slide='true']"),
  );

  if (slideEls.length === 0) {
    unmountAndRemove(root, host);
    return;
  }

  const doc = new jsPDF({
    orientation: "l",
    unit: "px",
    format: [SLIDE_W, SLIDE_H],
    hotfixes: ["px_scaling"],
  });

  let hadImageFailures = false;

  try {
    for (let i = 0; i < slideEls.length; i++) {
      const wrapper = slideEls[i];
      const slideCanvas =
        wrapper.querySelector<HTMLElement>("[data-slide-canvas='true']") ??
        wrapper;

      const { cleanup, hadFailures } = await swapImagesToBlobUrls(slideCanvas);
      hadImageFailures ||= hadFailures;

      try {
        const canvas = await html2canvas(slideCanvas, {
          backgroundColor: null,
          scale: 2,
          useCORS: true,
        });

        const dataUrl = canvas.toDataURL("image/png");

        if (i > 0) {
          doc.addPage([SLIDE_W, SLIDE_H], "l");
        }
        doc.addImage(dataUrl, "PNG", 0, 0, SLIDE_W, SLIDE_H);
      } finally {
        cleanup();
      }
    }
  } finally {
    unmountAndRemove(root, host);
  }

  const name = safeFileName(presentation.title || presentation.id);
  doc.save(`${name}.pdf`);

  if (hadImageFailures) {
    console.warn(
      "PDF export: некоторые изображения не удалось загрузить в виде двоичных файлов",
    );
  }
}
