import styles from "./toolbar.module.css";
import { InterfaceButtonView } from "../../interfaceButton/ui/InterfaceButtonView.tsx";

export function Toolbar() {
  return (
    <div className={styles.toolbar}>
      <div className={styles.buttonsWrapper}>
        <InterfaceButtonView type={"newSlide"} alt={"Новый слайд"} />
        <InterfaceButtonView type={"undo"} alt={"Отменить"} />
        <InterfaceButtonView type={"redo"} alt={"Повторить"} />
        <InterfaceButtonView type={"cursor"} alt={"Выбрать (Esc)"} />
        <InterfaceButtonView type={"textField"} alt={"Вставить текст"} />
        <InterfaceButtonView type={"imgObject"} alt={"Вставить изображение"} />
        <InterfaceButtonView type={"changeBackground"} alt={"Сменить фон"} />
      </div>
      <div className={styles.buttonsWrapper}>
        <InterfaceButtonView type={"hideUpperPanel"} alt={"Скрыть меню"} />
      </div>
    </div>
  );
}
