import type { InterfaceButtonType } from "../../../entities/interfaceButton/model/types.ts";

import plus from "../assets/tabler/plus.svg";
import trash from "../assets/tabler/trash.svg";
import undo from "../assets/tabler/arrow-back-up.svg";
import redo from "../assets/tabler/arrow-forward-up.svg";
import cursor from "../assets/tabler/pointer.svg";
import textField from "../assets/tabler/forms.svg";
import bold from "../assets/tabler/bold.svg";
import italic from "../assets/tabler/italic.svg";
import ltr from "../assets/tabler/text-direction-ltr.svg";
import rtl from "../assets/tabler/text-direction-rtl.svg";
import textDirAuto from "../assets/tabler/pilcrow.svg";
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
  isActive?: boolean;
};

export function InterfaceButtonView(props: InterfaceButtonViewProps) {
  const { type, alt, onClick, isActive = false } = props;

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
    richBold: bold,
    richItalic: italic,
    richDirLtr: ltr,
    richDirRtl: rtl,
    richDirAuto: textDirAuto,
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
      className={`${styles.toolbarButton} ${isActive ? styles.toolbarButtonActive : ""} ${defaultFont.defaultFont}`}
      onClick={onClick}
      title={alt}
    >
      <img className={styles.toolbarIcon} src={src} alt={alt} />
    </button>
  );
}
