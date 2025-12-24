import { useCallback } from "react";
import * as React from "react";

type PickedImage = {
  file: File;
  width: number;
  height: number;
};

export function useImagePicker(
  inputRef?: React.RefObject<HTMLInputElement | null>,
) {
  const loadImageSize = (
    file: File,
  ): Promise<{ width: number; height: number }> =>
    new Promise((resolve, reject) => {
      const url = URL.createObjectURL(file);
      const img = new Image();

      img.onload = () => {
        const w = img.naturalWidth;
        const h = img.naturalHeight;
        URL.revokeObjectURL(url);
        resolve({ width: w, height: h });
      };

      img.onerror = () => {
        URL.revokeObjectURL(url);
        reject(new Error("Ошибка при загрузке изображения"));
      };

      img.src = url;
    });

  const pickImage = useCallback(async (): Promise<PickedImage | null> => {
    const input = inputRef?.current;
    if (!input) return null;

    return new Promise((resolve, reject) => {
      const onChange = async () => {
        try {
          const files = input.files;
          input.value = "";
          input.removeEventListener("change", onChange);

          if (!files || files.length === 0) {
            resolve(null);
            return;
          }

          const file = files[0];
          if (!file.type.startsWith("image/")) {
            resolve(null);
            return;
          }

          const { width, height } = await loadImageSize(file);
          resolve({ file, width, height });
        } catch (error) {
          reject(error);
        }
      };

      input.addEventListener("change", onChange, { once: true });
      input.click();
    });
  }, [inputRef]);

  return { pickImage };
}
