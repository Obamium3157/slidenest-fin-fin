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
import { useImagePicker } from "../../../entities/hooks/lib/useImagePicker.tsx";
import { useColorPicker } from "../../../entities/hooks/lib/useColorPicker.tsx";
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
