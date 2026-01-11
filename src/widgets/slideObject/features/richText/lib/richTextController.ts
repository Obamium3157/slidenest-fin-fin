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

  getState(): { bold: boolean; italic: boolean; dir: TextDir } {
    const editor = this.editor;
    if (!editor) return { bold: false, italic: false, dir: "auto" };

    const domDir =
      (editor.view.dom.getAttribute("dir") as TextDir | null) ?? "auto";

    return {
      bold: editor.isActive("bold"),
      italic: editor.isActive("italic"),
      dir: domDir,
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
}

export const richTextController = new RichTextController();
