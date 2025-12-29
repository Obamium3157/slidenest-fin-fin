import type { InterfaceButtonType } from "../../../entities/interfaceButton/model/types.ts";

import plus from "../assets/tabler/plus.svg";
import trash from "../assets/tabler/trash.svg";
import undo from "../assets/tabler/arrow-back-up.svg";
import redo from "../assets/tabler/arrow-forward-up.svg";
import cursor from "../assets/tabler/pointer.svg";
import textField from "../assets/tabler/forms.svg";
import img from "../assets/tabler/photo-down.svg";
import changeBackground from "../assets/tabler/background.svg";
import hideUpperPanel from "../assets/tabler/chevron-up.svg";
import exportPdf from "../assets/tabler/file-type-pdf.svg";

import styles from "./interfaceButtonView.module.css";
import defaultFont from "../../../shared/ui/defaultFont/defaultFont.module.css";

type InterfaceButtonViewProps = {
  type: InterfaceButtonType;
  alt: string;
  onClick?: () => void;
};

export function InterfaceButtonView(props: InterfaceButtonViewProps) {
  const { type, alt, onClick } = props;

  if (type === "slideShow") {
    return (
      <button className={styles.slideShowButton} onClick={onClick} title={alt}>
        Слайд-шоу
      </button>
    );
  }

  const icons: Record<string, string> = {
    undo,
    redo,
    cursor,
    textField,
    imgObject: img,
    newSlide: plus,
    removeSlide: trash,
    changeBackground,
    exportPdf,
    hideUpperPanel,
  };

  const src = icons[type];
  if (!src) return null;

  return (
    <button
      className={`${styles.toolbarButton} ${defaultFont.defaultFont}`}
      onClick={onClick}
      title={alt}
    >
      <img className={styles.toolbarIcon} src={src} alt={alt} />
    </button>
  );
}
