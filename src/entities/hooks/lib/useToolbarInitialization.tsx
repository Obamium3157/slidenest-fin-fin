import { dispatch } from "../../editor/lib/modifyEditor.ts";
import {
  addImage,
  addSlide,
  addText,
  changeSlideBackgroundColor,
  removeSlide,
} from "../../editor/lib/editor.ts";
import { useImagePicker } from "./useImagePicker.tsx";
import { useColorPicker } from "./useColorPicker.tsx";
import type { Select } from "../../select/model/types.ts";
import type { RefObject } from "react";

type UseToolbarInitializationArgs = {
  select: Select;
  fileInputRef: RefObject<HTMLInputElement | null>;
  colorInputRef: RefObject<HTMLInputElement | null>;
};

export function useToolbarInitialization(args: UseToolbarInitializationArgs) {
  const { select, fileInputRef, colorInputRef } = args;

  const { pickImage } = useImagePicker(fileInputRef);
  const { pickColor } = useColorPicker(colorInputRef);

  const handleCreateSlide = (): void => {
    dispatch(addSlide);
  };

  const handleRemoveSlide = (): void => {
    const id = select.selectedSlideIds[0];
    if (id) {
      dispatch(removeSlide, [id]);
    }
  };

  const handleAddText = (): void => {
    const id = select.selectedSlideIds[0];
    if (!id) return;
    dispatch(addText, [id]);
  };

  const handleAddImage = async (): Promise<void> => {
    const id = select.selectedSlideIds[0];
    if (!id) return;

    try {
      const picked = await pickImage();
      if (!picked) return;

      dispatch(addImage, [id, picked.dataUrl, picked.width, picked.height]);
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
      dispatch(changeSlideBackgroundColor, [id, newColor]);
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
