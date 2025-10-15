import styles from "./toolbar.module.css";
import { InterfaceButtonView } from "../../interfaceButton/ui/InterfaceButtonView.tsx";
import type { Select } from "../../../entities/select/model/types.ts";
import { dispatch } from "../../../entities/editor/lib/modifyEditor.ts";
import {
  addImage,
  addSlide,
  addText,
  removeSlide,
} from "../../../entities/editor/lib/editor.ts";
import { defaultTextObjectParameters } from "../../../entities/slideText/model/test/data.ts";
import type { Rect } from "../../../shared/types/rect/Rect.ts";
import { defaultSlideImage } from "../../../entities/slideImage/lib/defaultSlideImage.ts";

type ToolbarProps = {
  select: Select;
};

export function Toolbar(props: ToolbarProps) {
  const { select } = props;

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
    if (id) {
      const rect: Rect = {
        x: 15,
        y: 15,
        w: 220,
        h: 50,
      };
      dispatch(addText, [id, { ...defaultTextObjectParameters(), rect }]);
    }
  };

  const handleAddImage = (): void => {
    const id = select.selectedSlideId[0];
    if (id) {
      dispatch(addImage, [id, defaultSlideImage()]);
    }
  };

  return (
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
        <InterfaceButtonView type={"changeBackground"} alt={"Сменить фон"} />
      </div>
      <div className={styles.buttonsWrapper}>
        <InterfaceButtonView type={"hideUpperPanel"} alt={"Скрыть меню"} />
      </div>
    </div>
  );
}
