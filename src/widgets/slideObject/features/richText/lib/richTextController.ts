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
  } {
    const editor = this.editor;
    const baseSizePx = parsePx(this.context?.font.fontSize ?? null, 15);
    if (!editor)
      return {
        bold: false,
        italic: false,
        dir: "auto",
        fontSizePx: baseSizePx,
      };

    const domDir =
      (editor.view.dom.getAttribute("dir") as TextDir | null) ?? "auto";

    const markSize = editor.getAttributes("fontSize")?.size as
      | string
      | undefined
      | null;
    const fontSizePx = parsePx(markSize, baseSizePx);

    return {
      bold: editor.isActive("bold"),
      italic: editor.isActive("italic"),
      dir: domDir,
      fontSizePx,
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

  bumpFontSize(delta: number) {
    const editor = this.editor;
    if (!editor) return;

    const baseSizePx = parsePx(this.context?.font.fontSize ?? null, 15);
    const markSize = editor.getAttributes("fontSize")?.size as
      | string
      | undefined
      | null;
    const current = parsePx(markSize, baseSizePx);
    const next = Math.max(1, Math.min(500, Math.round(current + delta)));

    editor.chain().focus().setFontSize(`${next}px`).run();
    this.notify();
  }
}

export const richTextController = new RichTextController();
