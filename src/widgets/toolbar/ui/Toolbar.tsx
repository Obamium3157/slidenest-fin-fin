import styles from "./toolbar.module.css";
import { InterfaceButtonView } from "../../interfaceButton/ui/InterfaceButtonView.tsx";
import { useRef, useEffect, useCallback, useMemo, useState } from "react";
import { useToolbarInitialization } from "../../../entities/hooks/lib/useToolbarInitialization.tsx";
import { useAppSelector } from "../../../entities/store/hooks.ts";
import { useAppActions } from "../../../entities/store/actions.ts";
import { exportPresentationToPdf } from "../../../shared/lib/pdf/exportPresentationToPdf.tsx";
import { useRichTextToolbar } from "../lib/useRichTextToolbar.ts";
import { FONT_PRESETS } from "../../../shared/lib/fonts/fontPresets.ts";

function parsePx(value: string | undefined, fallback: number): number {
  if (!value) return fallback;
  const m = value.trim().match(/^(-?\d+(?:\.\d+)?)px$/i);
  if (!m) return fallback;
  const n = Number(m[1]);
  return Number.isFinite(n) ? n : fallback;
}

function clampInt(v: number, min: number, max: number): number {
  return Math.max(min, Math.min(max, Math.round(v)));
}

function parseUserFontSize(input: string): number | null {
  const raw = input.trim();
  if (!raw) return null;
  const n = Number.parseInt(raw, 10);
  if (!Number.isFinite(n)) return null;
  return n;
}

export function Toolbar() {
  const { undo, redo, changeFontFamily, changeFontSize } = useAppActions();

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

  const [fontMenuOpen, setFontMenuOpen] = useState(false);
  const fontMenuRef = useRef<HTMLDivElement | null>(null);

  useEffect(() => {
    if (!fontMenuOpen) return;

    const onPointerDown = (e: PointerEvent) => {
      const root = fontMenuRef.current;
      if (!root) return;
      if (root.contains(e.target as Node)) return;
      setFontMenuOpen(false);
    };

    window.addEventListener("pointerdown", onPointerDown, true);
    return () => window.removeEventListener("pointerdown", onPointerDown, true);
  }, [fontMenuOpen]);

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

  const ctx = rich.context;
  const canEditFont = Boolean(rich.hasEditor && ctx);

  const baseFontFamily = ctx?.font.fontFamily ?? "SST";
  const fontFamilyLabel = rich.hasEditor
    ? (rich.fontFamilyLabel ?? baseFontFamily)
    : baseFontFamily;

  const effectiveFontSizePx = useMemo(() => {
    if (rich.hasEditor) return rich.fontSizePx ?? 15;
    return parsePx(ctx?.font.fontSize, 15);
  }, [ctx?.font.fontSize, rich.fontSizePx, rich.hasEditor]);

  const [fontSizeDraft, setFontSizeDraft] = useState<string>(
    String(effectiveFontSizePx),
  );
  const fontSizeEditingRef = useRef(false);

  useEffect(() => {
    if (fontSizeEditingRef.current) return;
    setFontSizeDraft(String(effectiveFontSizePx));
  }, [effectiveFontSizePx]);

  const applyFontFamily = (family: string) => {
    if (!ctx) return;
    if (rich.hasEditor) {
      rich.setFontFamily(family);
    } else {
      changeFontFamily({
        slideId: ctx.slideId,
        objId: ctx.objId,
        newFamily: family,
      });
    }
    setFontMenuOpen(false);
  };

  const bumpFontSize = (delta: number) => {
    if (!ctx) return;
    if (rich.hasEditor) {
      rich.bumpFontSize(delta);
      return;
    }

    const next = clampInt(effectiveFontSizePx + delta, 1, 200);
    changeFontSize({
      slideId: ctx.slideId,
      objId: ctx.objId,
      newSize: `${next}px`,
    });
  };

  const commitFontSize = (raw: string) => {
    if (!ctx) return;
    const parsed = parseUserFontSize(raw);
    if (parsed === null) {
      setFontSizeDraft(String(effectiveFontSizePx));
      return;
    }
    const next = clampInt(parsed, 1, 200);
    setFontSizeDraft(String(next));

    if (rich.hasEditor) {
      rich.setFontSizePx(next);
      return;
    }

    changeFontSize({
      slideId: ctx.slideId,
      objId: ctx.objId,
      newSize: `${next}px`,
    });
  };

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
          <InterfaceButtonView
            type={"exportPdf"}
            alt={exportingPdf ? "Экспорт PDF..." : "Экспорт в PDF"}
            onClick={handleExportPdf}
          />

          {canEditFont && (
            <>
              <div className={styles.separator} />

              <div className={styles.fontFamilyWrapper} ref={fontMenuRef}>
                <button
                  type="button"
                  className={styles.fontFamilyButton}
                  onClick={() => setFontMenuOpen((v) => !v)}
                  title="Выбор шрифта"
                >
                  <span
                    className={styles.fontFamilyLabel}
                    style={{
                      fontFamily:
                        fontFamilyLabel === "..."
                          ? baseFontFamily
                          : fontFamilyLabel,
                    }}
                  >
                    {fontFamilyLabel}
                  </span>
                  <span className={styles.fontFamilyArrow} aria-hidden="true">
                    ▼
                  </span>
                </button>

                {fontMenuOpen && (
                  <div className={styles.fontDropdown} role="menu">
                    {FONT_PRESETS.map((f) => (
                      <button
                        key={f.id}
                        type="button"
                        className={styles.fontDropdownItem}
                        onClick={() => applyFontFamily(f.fontFamily)}
                        style={{ fontFamily: f.fontFamily }}
                        role="menuitem"
                      >
                        {f.label}
                      </button>
                    ))}
                  </div>
                )}
              </div>

              <div className={styles.separator} />

              <div className={styles.fontSizeWrapper} title="Размер шрифта">
                <button
                  type="button"
                  className={styles.fontSizeBtn}
                  onClick={() => bumpFontSize(-1)}
                >
                  -
                </button>

                <input
                  className={styles.fontSizeInput}
                  inputMode="numeric"
                  value={fontSizeDraft}
                  onFocus={() => {
                    fontSizeEditingRef.current = true;
                  }}
                  onChange={(e) => {
                    const next = e.target.value.replace(/[^0-9]/g, "");
                    setFontSizeDraft(next);
                  }}
                  onKeyDown={(e) => {
                    if (e.key === "Enter") {
                      e.preventDefault();
                      commitFontSize(fontSizeDraft);
                      (e.target as HTMLInputElement).blur();
                      return;
                    }

                    if (e.key === "Escape") {
                      e.preventDefault();
                      setFontSizeDraft(String(effectiveFontSizePx));
                      (e.target as HTMLInputElement).blur();
                    }
                  }}
                  onBlur={() => {
                    fontSizeEditingRef.current = false;
                    commitFontSize(fontSizeDraft);
                  }}
                />

                <button
                  type="button"
                  className={styles.fontSizeBtn}
                  onClick={() => bumpFontSize(1)}
                >
                  +
                </button>
              </div>

              <div className={styles.separator} />

              <InterfaceButtonView
                type={"richBold"}
                alt={"Жирный (Ctrl+B)"}
                isActive={rich.bold}
                onClick={rich.toggleBold}
              />
              <InterfaceButtonView
                type={"richItalic"}
                alt={"Курсив (Ctrl+I)"}
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
