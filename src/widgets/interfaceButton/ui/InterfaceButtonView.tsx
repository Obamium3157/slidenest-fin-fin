import type { InterfaceButtonType } from "../../../entities/interfaceButton/model/types.ts";

import plus from "../assets/tabler/plus.svg";
import undo from "../assets/tabler/arrow-back-up.svg";
import redo from "../assets/tabler/arrow-forward-up.svg";
import cursor from "../assets/tabler/pointer.svg";
import textField from "../assets/tabler/forms.svg";
import img from "../assets/tabler/photo-down.svg";
import changeBackground from "../assets/tabler/background.svg";
import hideUpperPanel from "../assets/tabler/chevron-up.svg";

import styles from "./interfaceButtonView.module.css";

type InterfaceButtonViewProps = {
  type: InterfaceButtonType;
  alt: string;
};

export function InterfaceButtonView(props: InterfaceButtonViewProps) {
  const { type, alt } = props;

  switch (type) {
    case "undo": {
      return (
        <img className={styles.toolbarInterfaceButton} src={undo} alt={alt} />
      );
    }
    case "redo": {
      return (
        <img className={styles.toolbarInterfaceButton} src={redo} alt={alt} />
      );
    }
    case "cursor": {
      return (
        <img className={styles.toolbarInterfaceButton} src={cursor} alt={alt} />
      );
    }
    case "textField": {
      return (
        <img
          className={styles.toolbarInterfaceButton}
          src={textField}
          alt={alt}
        />
      );
    }
    case "imgObject": {
      return (
        <img className={styles.toolbarInterfaceButton} src={img} alt={alt} />
      );
    }
    case "newSlide": {
      return (
        <img className={styles.toolbarInterfaceButton} src={plus} alt={alt} />
      );
    }
    case "changeBackground": {
      return (
        <img
          className={styles.toolbarInterfaceButton}
          src={changeBackground}
          alt={alt}
        />
      );
    }
    case "slideShow": {
      return <button className={styles.slideShowButton}>Слайд-шоу</button>;
    }
    case "hideUpperPanel": {
      return (
        <img
          className={styles.toolbarInterfaceButton}
          src={hideUpperPanel}
          alt={alt}
        />
      );
    }
    default: {
      return null;
    }
  }
}
