import styles from "./toolbar.module.css";
import { InterfaceButtonView } from "../../interfaceButton/ui/InterfaceButtonView.tsx";
import type { Select } from "../../../entities/select/model/types.ts";
import { dispatch } from "../../../entities/editor/lib/modifyEditor.ts";
import {
  addImage,
  addSlide,
  addText,
  changeSlideBackgroundColor,
  removeSlide,
} from "../../../entities/editor/lib/editor.ts";
import { defaultTextObjectParameters } from "../../../entities/slideText/model/test/data.ts";
import type { Rect } from "../../../shared/types/rect/Rect.ts";
import { defaultSlideImage } from "../../../entities/slideImage/lib/defaultSlideImage.ts";
import { useImagePicker } from "../../../entities/useImagePicker/lib/useImagePicker.tsx";
import {
  SLIDE_HEIGHT,
  SLIDE_WIDTH,
} from "../../../shared/lib/constants/constants.ts";
import { useColorPicker } from "../../../entities/useColorPicker/lib/useColorPicker.tsx";
import { useRef } from "react";

type ToolbarProps = {
  select: Select;
};

export function Toolbar(props: ToolbarProps) {
  const { select } = props;

  const fileInputRef = useRef<HTMLInputElement | null>(null);
  const colorInputRef = useRef<HTMLInputElement | null>(null);

  const { pickImage } = useImagePicker(fileInputRef);
  const { pickColor } = useColorPicker(colorInputRef);

  const handleCreateSlide = (): void => {
    dispatch(addSlide, ["#ffffff"]);
  };

  const handleRemoveSlide = (): void => {
    const id = select.selectedSlideId[0];
    if (id) {
      dispatch(removeSlide, [id]);
    }
  };

  const handleAddText = (): void => {
    const id = select.selectedSlideId[0];
    if (!id) return;

    const rect: Rect = {
      x: 15,
      y: 15,
      w: 220,
      h: 50,
    };
    dispatch(addText, [id, { ...defaultTextObjectParameters(), rect }]);
  };

  const handleAddImage = async (): Promise<void> => {
    const id = select.selectedSlideId[0];
    if (!id) return;

    try {
      const picked = await pickImage();
      if (!picked) return;

      const maxW = SLIDE_WIDTH;
      const maxH = SLIDE_HEIGHT;
      let w = picked.width;
      let h = picked.height;
      const scale = Math.min(1, maxW / w, maxH / h);
      w = Math.round(w * scale);
      h = Math.round(h * scale);

      const rect: Rect = {
        x: 20,
        y: 20,
        w,
        h,
      };

      const imageObject = {
        ...defaultSlideImage(),
        src: picked.dataUrl,
        rect,
      };

      dispatch(addImage, [id, imageObject]);
    } catch (e) {
      console.error("Ошибка при выборе изображения: ", e);
    }
  };

  const handleChangeBackgroundColor = async (): Promise<void> => {
    const id = select.selectedSlideId[0];
    if (!id) return;

    try {
      const newColor = await pickColor();
      if (!newColor) return;
      dispatch(changeSlideBackgroundColor, [
        id,
        { type: "color", color: newColor },
      ]);
    } catch (e) {
      console.error("Ошибка при выборе цвета фона: ", e);
    }
  };

  return (
    <>
      <div className={styles.toolbar}>
        <div className={styles.buttonsWrapper}>
          <InterfaceButtonView
            type={"newSlide"}
            alt={"Новый слайд"}
            onClick={handleCreateSlide}
          />
          <InterfaceButtonView
            type={"removeSlide"}
            alt={"Удалить слайд"}
            onClick={handleRemoveSlide}
          />
          <InterfaceButtonView type={"undo"} alt={"Отменить"} />
          <InterfaceButtonView type={"redo"} alt={"Повторить"} />
          <InterfaceButtonView type={"cursor"} alt={"Выбрать (Esc)"} />
          <InterfaceButtonView
            type={"textField"}
            alt={"Вставить текст"}
            onClick={handleAddText}
          />
          <InterfaceButtonView
            type={"imgObject"}
            alt={"Вставить изображение"}
            onClick={handleAddImage}
          />
          <InterfaceButtonView
            type={"changeBackground"}
            alt={"Сменить фон"}
            onClick={handleChangeBackgroundColor}
          />
        </div>
        <div className={styles.buttonsWrapper}>
          <InterfaceButtonView type={"hideUpperPanel"} alt={"Скрыть меню"} />
        </div>
      </div>

      <input
        ref={fileInputRef}
        type="file"
        accept="image/*"
        style={{ display: "none" }}
      />

      <input ref={colorInputRef} type="color" style={{ display: "none" }} />
    </>
  );
}
