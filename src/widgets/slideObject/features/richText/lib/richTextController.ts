import type { Editor } from "@tiptap/core";
import type { TextDir } from "../../../../../entities/slideText/model/types.ts";
import type { Font } from "../../../../../shared/types/font/Font.ts";

type Listener = () => void;
type DirListener = (dir: TextDir) => void;

export type RichTextContext = {
  slideId: string;
  objId: string;
  font: Font;
};

function parsePx(value: string | undefined | null, fallback: number): number {
  if (!value) return fallback;
  const m = value.trim().match(/^(-?\d+(?:\.\d+)?)px$/i);
  if (!m) return fallback;
  const n = Number(m[1]);
  return Number.isFinite(n) ? n : fallback;
}

function clampInt(v: number, min: number, max: number): number {
  return Math.max(min, Math.min(max, Math.round(v)));
}

function getMarkAttr(
  marks: readonly { type: { name: string }; attrs: Record<string, unknown> }[],
  markName: string,
  attrName: string,
): string | null {
  const m = marks.find((x) => x.type.name === markName);
  const v = (m?.attrs?.[attrName] as string | undefined | null) ?? null;
  return typeof v === "string" && v.trim() ? v : null;
}

type SelectionMetrics = {
  fontFamilies: Set<string>;
  maxFontSizePx: number;
};

function collectSelectionMetrics(
  editor: Editor,
  baseFamily: string,
  baseSizePx: number,
): SelectionMetrics {
  const { from, to, empty } = editor.state.selection;

  const families = new Set<string>();
  let maxSizePx = -Infinity;

  if (empty) {
    const stored = editor.state.storedMarks;
    const marks = stored ?? editor.state.selection.$from.marks();

    const fam = getMarkAttr(marks, "fontFamily", "family") ?? baseFamily;
    const sizeRaw = getMarkAttr(marks, "fontSize", "size");
    const sizePx = parsePx(sizeRaw, baseSizePx);

    families.add(fam);
    maxSizePx = sizePx;

    return { fontFamilies: families, maxFontSizePx: maxSizePx };
  }

  editor.state.doc.nodesBetween(from, to, (node) => {
    if (!node.isText) return;

    const fam = getMarkAttr(node.marks, "fontFamily", "family") ?? baseFamily;
    const sizeRaw = getMarkAttr(node.marks, "fontSize", "size");
    const sizePx = parsePx(sizeRaw, baseSizePx);

    families.add(fam);
    if (sizePx > maxSizePx) maxSizePx = sizePx;
  });

  if (families.size === 0) families.add(baseFamily);
  if (!Number.isFinite(maxSizePx)) maxSizePx = baseSizePx;

  return { fontFamilies: families, maxFontSizePx: maxSizePx };
}

class RichTextController {
  private editor: Editor | null = null;
  private context: RichTextContext | null = null;

  private listeners = new Set<Listener>();
  private dirListeners = new Set<DirListener>();

  setEditor(next: Editor | null) {
    if (this.editor === next) return;
    this.editor = next;
    if (!next) this.context = null;
    this.notify();
  }

  getEditor(): Editor | null {
    return this.editor;
  }

  setContext(next: RichTextContext | null) {
    this.context = next;
    this.notify();
  }

  getContext(): RichTextContext | null {
    return this.context;
  }

  subscribe(listener: Listener): () => void {
    this.listeners.add(listener);
    return () => {
      this.listeners.delete(listener);
    };
  }

  subscribeDir(listener: DirListener): () => void {
    this.dirListeners.add(listener);
    return () => {
      this.dirListeners.delete(listener);
    };
  }

  notify() {
    for (const l of this.listeners) l();
  }

  getState(): {
    bold: boolean;
    italic: boolean;
    dir: TextDir;
    fontSizePx: number;
    fontFamilyLabel: string;
    isMixedFontFamily: boolean;
  } {
    const editor = this.editor;
    const baseFamily = this.context?.font.fontFamily ?? "SST";
    const baseSizePx = parsePx(this.context?.font.fontSize ?? null, 15);
    if (!editor)
      return {
        bold: false,
        italic: false,
        dir: "auto",
        fontSizePx: clampInt(baseSizePx, 1, 200),
        fontFamilyLabel: baseFamily,
        isMixedFontFamily: false,
      };

    const domDir =
      (editor.view.dom.getAttribute("dir") as TextDir | null) ?? "auto";

    const metrics = collectSelectionMetrics(editor, baseFamily, baseSizePx);
    const isMixedFontFamily = metrics.fontFamilies.size > 1;
    const fontFamilyLabel = isMixedFontFamily
      ? "..."
      : (Array.from(metrics.fontFamilies)[0] ?? baseFamily);

    return {
      bold: editor.isActive("bold"),
      italic: editor.isActive("italic"),
      dir: domDir,
      fontSizePx: clampInt(metrics.maxFontSizePx, 1, 200),
      fontFamilyLabel,
      isMixedFontFamily,
    };
  }

  toggleBold() {
    const editor = this.editor;
    if (!editor) return;
    editor.chain().focus().toggleBold().run();
    this.notify();
  }

  toggleItalic() {
    const editor = this.editor;
    if (!editor) return;
    editor.chain().focus().toggleItalic().run();
    this.notify();
  }

  setDir(nextDir: TextDir) {
    const editor = this.editor;
    if (!editor) return;
    editor.view.dom.setAttribute("dir", nextDir);
    editor.commands.focus();

    for (const l of this.dirListeners) l(nextDir);
    this.notify();
  }

  setFontFamily(family: string) {
    const editor = this.editor;
    if (!editor) return;
    editor.chain().focus().setFontFamily(family).run();
    this.notify();
  }

  setFontSizePx(px: number) {
    const editor = this.editor;
    if (!editor) return;
    const next = clampInt(px, 1, 200);
    editor.chain().focus().setFontSize(`${next}px`).run();
    this.notify();
  }

  bumpFontSize(delta: number) {
    const editor = this.editor;
    if (!editor) return;

    const baseFamily = this.context?.font.fontFamily ?? "SST";
    const baseSizePx = parsePx(this.context?.font.fontSize ?? null, 15);
    const metrics = collectSelectionMetrics(editor, baseFamily, baseSizePx);
    const current = metrics.maxFontSizePx;
    const next = clampInt(current + delta, 1, 200);

    editor.chain().focus().setFontSize(`${next}px`).run();
    this.notify();
  }
}

export const richTextController = new RichTextController();
