import { useCallback } from "react";
import * as React from "react";

type PickedImage = {
  file: File;
  dataUrl: string;
  width: number;
  height: number;
};

export function useImagePicker(
  inputRef?: React.RefObject<HTMLInputElement | null>,
) {
  const readFileAsDataURL = (file: File): Promise<string> =>
    new Promise((resolve, reject) => {
      const reader = new FileReader();
      reader.onerror = () => reject(new Error("Ошибка чтения файла"));
      reader.onload = () => resolve(String(reader.result));
      reader.readAsDataURL(file);
    });

  const loadImageSize = (
    src: string,
  ): Promise<{ width: number; height: number }> =>
    new Promise((resolve, reject) => {
      const img = new Image();
      img.onload = () =>
        resolve({ width: img.naturalWidth, height: img.naturalHeight });
      img.onerror = () => reject(new Error("Ошибка при загрузке изображения"));
      img.src = src;
    });

  const pickImage = useCallback(async (): Promise<PickedImage | null> => {
    const input = inputRef?.current;
    if (!input) {
      return Promise.resolve(null);
    }

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

          const dataUrl = await readFileAsDataURL(file);
          const { width, height } = await loadImageSize(dataUrl);

          resolve({ file, dataUrl, width, height });
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
