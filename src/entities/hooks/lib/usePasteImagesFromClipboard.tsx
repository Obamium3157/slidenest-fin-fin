import { useEffect } from "react";

import { useAppActions } from "../../store/actions.ts";
import { uploadImageToStorage } from "../../../shared/lib/appwrite/repo/presentationRepo.ts";

type Params = {
  slideId: string;
  enabled?: boolean;
  readonly?: boolean;
};

function isEditableTarget(target: EventTarget | null): boolean {
  const t = target as HTMLElement | null;
  if (!t) return false;

  if (
    t.tagName === "INPUT" ||
    t.tagName === "TEXTAREA" ||
    t.tagName === "SELECT"
  )
    return true;

  if (t.isContentEditable) return true;

  return Boolean(t.closest?.("[contenteditable='true']"));
}

function extractImageFiles(e: ClipboardEvent): File[] {
  const items = e.clipboardData?.items;
  if (!items || items.length === 0) return [];

  const stamp = Date.now();
  const res: File[] = [];
  const arr = Array.from(items);

  for (let i = 0; i < arr.length; i++) {
    const item = arr[i];
    if (!item.type.startsWith("image/")) continue;

    const f = item.getAsFile();
    if (!f) continue;

    const ext = (f.type.split("/")[1] || "png").toLowerCase();
    const name =
      f.name && f.name.trim().length > 0
        ? f.name
        : `pasted-${stamp}-${i}.${ext}`;

    res.push(
      new File([f], name, { type: f.type || "application/octet-stream" }),
    );
  }

  return res;
}

function loadImageSize(file: Blob): Promise<{ width: number; height: number }> {
  return new Promise((resolve, reject) => {
    const url = URL.createObjectURL(file);
    const img = new Image();

    img.onload = () => {
      const width = img.naturalWidth;
      const height = img.naturalHeight;
      URL.revokeObjectURL(url);
      resolve({ width, height });
    };

    img.onerror = () => {
      URL.revokeObjectURL(url);
      reject(new Error("Image load failed"));
    };

    img.src = url;
  });
}

export function usePasteImagesFromClipboard({
  slideId,
  enabled = true,
  readonly = false,
}: Params): void {
  const { addImageToSlide } = useAppActions();

  useEffect(() => {
    if (!enabled) return;
    if (readonly) return;
    if (!slideId) return;

    const handlePaste = (e: ClipboardEvent) => {
      if (isEditableTarget(e.target)) return;

      const files = extractImageFiles(e);
      if (files.length === 0) return;

      e.preventDefault();

      void (async () => {
        for (const file of files) {
          try {
            const { width, height } = await loadImageSize(file);
            const src = await uploadImageToStorage(file);
            addImageToSlide({ slideId, src, w: width, h: height });
          } catch {
            console.error("Ошибка при вставке изображения");
          }
        }
      })();
    };

    window.addEventListener("paste", handlePaste);
    return () => window.removeEventListener("paste", handlePaste);
  }, [addImageToSlide, enabled, readonly, slideId]);
}
