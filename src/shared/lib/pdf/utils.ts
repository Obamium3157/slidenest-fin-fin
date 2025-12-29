import type { Presentation } from "../../../entities/presentation/model/types.ts";
import { type Root } from "react-dom/client";
import type { Slide } from "../../../entities/slide/model/types.ts";

export const SLIDE_W = 1250;
export const SLIDE_H = 700;

export function safeFileName(name: string): string {
  const trimmed = (name || "presentation").trim() || "presentation";
  return trimmed.replace(/[\\/:*?"<>|]+/g, "-").slice(0, 120);
}

export function getSlidesInOrder(p: Presentation): Slide[] {
  const out: Slide[] = [];
  for (const id of p.slides.order) {
    const s = p.slides.collection[id];
    if (s) out.push(s);
  }
  return out;
}

export function nextFrame(): Promise<void> {
  return new Promise((resolve) => requestAnimationFrame(() => resolve()));
}

export async function ensureFontsLoaded(): Promise<void> {
  const fonts = (document as unknown as { fonts?: FontFaceSet }).fonts;
  if (!fonts) return;
  try {
    await fonts.ready;
  } catch {
    /* ... */
  }
}

export type ImgSwap = {
  img: HTMLImageElement;
  originalSrc: string;
  objectUrl: string;
};

export function waitForImg(img: HTMLImageElement): Promise<void> {
  if (img.complete && img.naturalWidth > 0) return Promise.resolve();

  return new Promise((resolve) => {
    const done = () => resolve();
    img.addEventListener("load", done, { once: true });
    img.addEventListener("error", done, { once: true });
  });
}

export async function fetchToObjectUrl(src: string): Promise<string> {
  const res = await fetch(src, {
    mode: "cors",
    credentials: "include",
    cache: "force-cache",
  });

  if (!res.ok) {
    throw new Error(`Failed to fetch image: ${res.status} ${res.statusText}`);
  }

  const blob = await res.blob();
  return URL.createObjectURL(blob);
}

export const TRANSPARENT_PIXEL =
  "data:image/gif;base64,R0lGODlhAQABAAAAACwAAAAAAQABAAA=";

export async function swapImagesToBlobUrls(container: HTMLElement): Promise<{
  cleanup: () => void;
  hadFailures: boolean;
}> {
  const imgs = Array.from(container.querySelectorAll("img"));
  const swaps: ImgSwap[] = [];
  let hadFailures = false;

  for (const img of imgs) {
    const src = img.currentSrc || img.src;
    if (!src) continue;
    if (src.startsWith("data:") || src.startsWith("blob:")) continue;

    try {
      const objectUrl = await fetchToObjectUrl(src);
      swaps.push({ img, originalSrc: img.src, objectUrl });
      img.src = objectUrl;
    } catch {
      hadFailures = true;
      img.src = TRANSPARENT_PIXEL;
    }
  }

  await Promise.all(imgs.map(waitForImg));

  const cleanup = () => {
    for (const s of swaps) {
      try {
        s.img.src = s.originalSrc;
      } catch {
        /* ... */
      }
      try {
        URL.revokeObjectURL(s.objectUrl);
      } catch {
        /* ... */
      }
    }
  };

  return { cleanup, hadFailures };
}

export function createOffscreenHost(): HTMLDivElement {
  const host = document.createElement("div");
  host.setAttribute("data-pdf-export-host", "true");
  host.style.position = "fixed";
  host.style.left = "-100000px";
  host.style.top = "0";
  host.style.width = `${SLIDE_W}px`;
  host.style.height = `${SLIDE_H}px`;
  host.style.pointerEvents = "none";
  host.style.zIndex = "-1";
  document.body.appendChild(host);
  return host;
}

export function unmountAndRemove(root: Root, host: HTMLElement): void {
  try {
    root.unmount();
  } catch {
    /* ... */
  }
  try {
    host.remove();
  } catch {
    /* ... */
  }
}
