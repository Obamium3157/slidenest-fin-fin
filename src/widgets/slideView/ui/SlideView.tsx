import * as React from "react";
import { useEffect, useRef } from "react";

import { AllSlideObjects } from "../../allSlideObjects/ui/AllSlideObjects.tsx";
import type { Slide } from "../../../entities/slide/model/types.ts";

import styles from "./SlideView.module.css";
import { useAppSelector } from "../../../entities/store/hooks.ts";
import { useAppActions } from "../../../entities/store/actions.ts";
import { uploadImageToStorage } from "../../../shared/lib/appwrite/repo/presentationRepo.ts";

type SlideViewProps = {
  slide: Slide;
  readonly?: boolean;
  className?: string;
  style?: React.CSSProperties;
};

export function SlideView(props: SlideViewProps) {
  const { slide, readonly = false, className, style } = props;

  const select = useAppSelector((state) => state.presentation.selection);

  const {
    deselectSlideObjects,
    removeSlideObjectsWithStorageCleanup,
    addSlideObjToSelection,
    addImageToSlide,
  } = useAppActions();

  const slideRef = useRef<HTMLDivElement | null>(null);

  const handleBackgroundClick = (e: React.MouseEvent) => {
    if (readonly) return;
    if (e.defaultPrevented) return;

    deselectSlideObjects({ objIds: select.selectedSlideObjIds });
  };

  useEffect(() => {
    if (readonly) return;

    const handleKeyDown = (e: KeyboardEvent) => {
      const t = e.target as HTMLElement | null;
      const isEditable =
        !!t &&
        (t.tagName === "INPUT" ||
          t.tagName === "TEXTAREA" ||
          t.tagName === "SELECT" ||
          t.isContentEditable ||
          Boolean(t.closest?.("[contenteditable='true']")));

      if (e.key === "Backspace") {
        if (isEditable) return;
        if (select.selectedSlideObjIds.length === 0) return;
        removeSlideObjectsWithStorageCleanup({
          slideId: slide.id,
          objIds: select.selectedSlideObjIds,
        });
      }
    };

    window.addEventListener("keydown", handleKeyDown);
    return () => window.removeEventListener("keydown", handleKeyDown);
  }, [
    readonly,
    removeSlideObjectsWithStorageCleanup,
    slide.id,
    select.selectedSlideObjIds,
  ]);

  useEffect(() => {
    if (readonly) return;

    const loadImageSize = (
      file: Blob,
    ): Promise<{ width: number; height: number }> =>
      new Promise((resolve, reject) => {
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
          reject(new Error("Ошибка при загрузке изображения"));
        };

        img.src = url;
      });

    const handlePaste = (e: ClipboardEvent) => {
      const t = e.target as HTMLElement | null;
      const isEditable =
        !!t &&
        (t.tagName === "INPUT" ||
          t.tagName === "TEXTAREA" ||
          t.tagName === "SELECT" ||
          t.isContentEditable ||
          Boolean(t.closest?.("[contenteditable='true']")));

      if (isEditable) return;

      const items = e.clipboardData?.items;
      if (!items || items.length === 0) return;

      const imageFiles: File[] = [];
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
            : `pasted-${Date.now()}-${i}.${ext}`;
        imageFiles.push(
          new File([f], name, { type: f.type || "application/octet-stream" }),
        );
      }

      if (imageFiles.length === 0) return;

      e.preventDefault();

      void (async () => {
        for (const file of imageFiles) {
          try {
            const { width, height } = await loadImageSize(file);
            const src = await uploadImageToStorage(file);
            addImageToSlide({ slideId: slide.id, src, w: width, h: height });
          } catch {
            console.error("Ошибка при загрузке изображения");
          }
        }
      })();
    };

    window.addEventListener("paste", handlePaste);
    return () => window.removeEventListener("paste", handlePaste);
  }, [addImageToSlide, readonly, slide.id]);

  const preventSelection = (e: React.MouseEvent | React.DragEvent) => {
    if (readonly) return;

    const t = e.target as HTMLElement | null;
    const isEditable =
      !!t &&
      (t.isContentEditable || Boolean(t.closest?.("[contenteditable='true']")));

    if (isEditable) return;

    e.preventDefault();
  };

  return (
    <div
      ref={slideRef}
      className={[styles.slide, className].filter(Boolean).join(" ")}
      data-slide-canvas="true"
      style={{
        background: slide.backgroundColor.color,
        ...style,
      }}
      onClick={handleBackgroundClick}
      onMouseDown={preventSelection}
      onDragStart={preventSelection}
    >
      <AllSlideObjects
        slide={slide}
        readonly={readonly}
        selectedObjectIds={readonly ? [] : select.selectedSlideObjIds}
        onSelectObject={
          readonly
            ? undefined
            : (id: string, isMultipleSelection: boolean) => {
                if (!isMultipleSelection) {
                  deselectSlideObjects({ objIds: select.selectedSlideObjIds });
                }
                addSlideObjToSelection({ objId: id });
              }
        }
        onDeselectObject={
          readonly
            ? undefined
            : (id: string) => {
                deselectSlideObjects({ objIds: [id] });
              }
        }
      />
    </div>
  );
}
