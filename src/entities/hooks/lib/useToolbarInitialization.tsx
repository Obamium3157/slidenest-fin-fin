import { useCallback } from "react";
import type * as React from "react";

import type { Select } from "../../select/model/types";
import { useAppActions } from "../../store/actions";
import { useImagePicker } from "./useImagePicker";
import { uploadImageToStorage } from "../../../shared/lib/appwrite/repo/presentationRepo.ts";

type Params = {
  select: Select;
  fileInputRef: React.RefObject<HTMLInputElement | null>;
  colorInputRef: React.RefObject<HTMLInputElement | null>;
};

export function useToolbarInitialization({
  select,
  fileInputRef,
  colorInputRef,
}: Params) {
  const {
    addSlide,
    removeSlide,
    addTextToSlide,
    addImageToSlide,
    updateSlideBackgroundColor,
  } = useAppActions();

  const { pickImage } = useImagePicker(fileInputRef);

  const currentSlideId = select.selectedSlideIds[0];

  const handleCreateSlide = useCallback(() => {
    addSlide();
  }, [addSlide]);

  const handleRemoveSlide = useCallback(() => {
    if (!currentSlideId) return;
    removeSlide({ targetSlideId: currentSlideId });
  }, [removeSlide, currentSlideId]);

  const handleAddText = useCallback(() => {
    if (!currentSlideId) return;
    addTextToSlide({ slideId: currentSlideId });
  }, [addTextToSlide, currentSlideId]);

  const handleAddImage = useCallback(async () => {
    if (!currentSlideId) return;

    const picked = await pickImage();
    if (!picked) return;

    const src = await uploadImageToStorage(picked.file);

    addImageToSlide({
      slideId: currentSlideId,
      src,
      w: picked.width,
      h: picked.height,
    });
  }, [addImageToSlide, currentSlideId, pickImage]);

  const handleChangeBackgroundColor = useCallback(() => {
    if (!currentSlideId) return;

    const input = colorInputRef.current;
    if (!input) return;

    const onChange = () => {
      updateSlideBackgroundColor({
        slideId: currentSlideId,
        newColor: input.value,
      });
      input.removeEventListener("change", onChange);
    };

    input.addEventListener("change", onChange, { once: true });
    input.click();
  }, [colorInputRef, currentSlideId, updateSlideBackgroundColor]);

  return {
    handleCreateSlide,
    handleRemoveSlide,
    handleAddText,
    handleAddImage,
    handleChangeBackgroundColor,
  };
}
