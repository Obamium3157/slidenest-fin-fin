import styles from "./toolbar.module.css";
import { InterfaceButtonView } from "../../interfaceButton/ui/InterfaceButtonView.tsx";
import { useRef, useEffect, useCallback, useState } from "react";
import { useToolbarInitialization } from "../../../entities/hooks/lib/useToolbarInitialization.tsx";
import { useAppSelector } from "../../../entities/store/hooks.ts";
import { useAppActions } from "../../../entities/store/actions.ts";
import { exportPresentationToPdf } from "../../../shared/lib/pdf/exportPresentationToPdf.tsx";
import { useRichTextToolbar } from "../lib/useRichTextToolbar.ts";

export function Toolbar() {
  const { undo, redo } = useAppActions();

  const rich = useRichTextToolbar();

  const select = useAppSelector((state) => state.presentation.selection);
  const presentation = useAppSelector(
    (state) => state.presentation.history.present,
  );

  const [exportingPdf, setExportingPdf] = useState(false);

  const fileInputRef = useRef<HTMLInputElement | null>(null);
  const colorInputRef = useRef<HTMLInputElement | null>(null);

  const {
    handleCreateSlide,
    handleRemoveSlide,
    handleAddText,
    handleAddImage,
    handleChangeBackgroundColor,
  } = useToolbarInitialization({ select, fileInputRef, colorInputRef });

  useEffect(() => {
    const handler = (e: KeyboardEvent) => {
      const key = e.key.toLowerCase();
      const mod = e.ctrlKey || e.metaKey;

      if (!mod) return;

      if (key === "z" || key === "я") {
        e.preventDefault();
        undo();
        return;
      }

      if (key === "y" || key === "н") {
        e.preventDefault();
        redo();
        return;
      }
    };

    window.addEventListener("keydown", handler);
    return () => {
      window.removeEventListener("keydown", handler);
    };
  }, [undo, redo]);

  const handleExportPdf = useCallback(async () => {
    if (exportingPdf) return;
    setExportingPdf(true);
    try {
      await exportPresentationToPdf(presentation);
    } catch (e) {
      console.error(e);
      alert("Не удалось экспортировать PDF. Проверьте консоль браузера.");
    } finally {
      setExportingPdf(false);
    }
  }, [exportingPdf, presentation]);

  return (
    <>
      <div className={styles.toolbar} data-toolbar-root="1">
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
          <InterfaceButtonView type={"undo"} alt={"Отменить"} onClick={undo} />
          <InterfaceButtonView type={"redo"} alt={"Повторить"} onClick={redo} />
          <InterfaceButtonView type={"cursor"} alt={"Выбрать (Esc)"} />
          <InterfaceButtonView
            type={"textField"}
            alt={"Вставить текст"}
            onClick={handleAddText}
          />

          {rich.hasEditor && (
            <>
              <div className={styles.separator} />
              <InterfaceButtonView
                type={"richBold"}
                alt={"Жирный"}
                isActive={rich.bold}
                onClick={rich.toggleBold}
              />
              <InterfaceButtonView
                type={"richItalic"}
                alt={"Курсив"}
                isActive={rich.italic}
                onClick={rich.toggleItalic}
              />
              <InterfaceButtonView
                type={"richDirLtr"}
                alt={"Направление текста: слева направо"}
                isActive={rich.dir === "ltr"}
                onClick={() => rich.setDir("ltr")}
              />
              <InterfaceButtonView
                type={"richDirRtl"}
                alt={"Направление текста: справа налево"}
                isActive={rich.dir === "rtl"}
                onClick={() => rich.setDir("rtl")}
              />
              <InterfaceButtonView
                type={"richDirAuto"}
                alt={"Автоматическое определение направления текста"}
                isActive={rich.dir === "auto"}
                onClick={() => rich.setDir("auto")}
              />
            </>
          )}

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
          <InterfaceButtonView
            type={"exportPdf"}
            alt={exportingPdf ? "Экспорт PDF..." : "Экспорт в PDF"}
            onClick={handleExportPdf}
          />
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
