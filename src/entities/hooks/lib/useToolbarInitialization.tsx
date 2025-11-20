import { useImagePicker } from "./useImagePicker.tsx";
import { useColorPicker } from "./useColorPicker.tsx";
import type { Select } from "../../select/model/types.ts";
import type { RefObject } from "react";
import { useAppActions } from "../../store/actions.ts";

type UseToolbarInitializationArgs = {
  select: Select;
  fileInputRef: RefObject<HTMLInputElement | null>;
  colorInputRef: RefObject<HTMLInputElement | null>;
};

export function useToolbarInitialization(args: UseToolbarInitializationArgs) {
  const { select, fileInputRef, colorInputRef } = args;

  const {
    addSlide,
    removeSlide,
    addTextToSlide,
    addImageToSlide,
    updateSlideBackgroundColor,
  } = useAppActions();

  const { pickImage } = useImagePicker(fileInputRef);
  const { pickColor } = useColorPicker(colorInputRef);

  const handleCreateSlide = (): void => {
    addSlide();
  };

  const handleRemoveSlide = (): void => {
    const id = select.selectedSlideIds[0];
    if (id) {
      removeSlide({ targetSlideId: id });
    }
  };

  const handleAddText = (): void => {
    const id = select.selectedSlideIds[0];
    if (!id) return;
    addTextToSlide({
      slideId: id,
    });
  };

  const handleAddImage = async (): Promise<void> => {
    const id = select.selectedSlideIds[0];
    if (!id) return;

    try {
      const picked = await pickImage();
      if (!picked) return;

      addImageToSlide({
        slideId: id,
        src: picked.dataUrl,
        w: picked.width,
        h: picked.height,
      });
    } catch (e) {
      console.error("Ошибка при выборе изображения: ", e);
    }
  };

  const handleChangeBackgroundColor = async (): Promise<void> => {
    const id = select.selectedSlideIds[0];
    if (!id) return;

    try {
      const newColor = await pickColor();
      if (!newColor) return;
      updateSlideBackgroundColor({
        slideId: id,
        newColor,
      });
    } catch (e) {
      console.error("Ошибка при выборе цвета фона: ", e);
    }
  };

  return {
    handleCreateSlide,
    handleRemoveSlide,
    handleAddText,
    handleAddImage,
    handleChangeBackgroundColor,
  };
}
