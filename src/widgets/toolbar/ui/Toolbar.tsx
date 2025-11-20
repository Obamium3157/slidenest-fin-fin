import styles from "./toolbar.module.css";
import { InterfaceButtonView } from "../../interfaceButton/ui/InterfaceButtonView.tsx";
import { useRef } from "react";
import { useToolbarInitialization } from "../../../entities/hooks/lib/useToolbarInitialization.tsx";
import { useAppSelector } from "../../../entities/store/hooks.ts";

export function Toolbar() {
  const select = useAppSelector((state) => state.selection);

  const fileInputRef = useRef<HTMLInputElement | null>(null);
  const colorInputRef = useRef<HTMLInputElement | null>(null);

  const {
    handleCreateSlide,
    handleRemoveSlide,
    handleAddText,
    handleAddImage,
    handleChangeBackgroundColor,
  } = useToolbarInitialization({ select, fileInputRef, colorInputRef });

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
