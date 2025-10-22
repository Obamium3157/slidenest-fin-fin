import { useCallback } from "react";

type PickedImage = {
  file: File;
  dataUrl: string;
  width: number;
  height: number;
};

export function useImagePicker() {
  const readFileAsDataURL = (file: File): Promise<string> =>
    new Promise((resolve, reject) => {
      const reader = new FileReader();
      reader.onerror = () => {
        reader.abort();
        reject(new Error("Ошибка чтения файла"));
      };
      reader.onload = () => {
        resolve(String(reader.result));
      };
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

  const pickImage = useCallback(
    async (accept = "image/*"): Promise<PickedImage | null> => {
      return new Promise((resolve, reject) => {
        const input = document.createElement("input");
        input.type = "file";
        input.accept = accept;
        input.style.display = "none";

        input.onchange = async () => {
          try {
            const files = input.files;
            if (!files || files.length === 0) {
              resolve(null);
              input.remove();
              return;
            }
            const file = files[0];
            if (!file.type.startsWith("image/")) {
              resolve(null);
              input.remove();
              return;
            }

            const dataUrl = await readFileAsDataURL(file);
            const { width, height } = await loadImageSize(dataUrl);

            resolve({
              file,
              dataUrl,
              width,
              height,
            });
          } catch (error) {
            reject(error);
          } finally {
            try {
              input.remove();
            } catch {
              /* empty */
            }
          }
        };

        document.body.appendChild(input);
        input.value = "";
        input.click();
      });
    },
    [],
  );

  return { pickImage };
}
