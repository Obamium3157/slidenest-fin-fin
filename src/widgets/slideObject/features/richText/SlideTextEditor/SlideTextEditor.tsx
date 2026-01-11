import { useEffect, useMemo, useRef, useState } from "react";
import { EditorContent, useEditor } from "@tiptap/react";
import StarterKit from "@tiptap/starter-kit";
import type { TextDir } from "../../../../../entities/slideText/model/types.ts";
import { useDebouncedTextCommit } from "../lib/useDebouncedTextCommit.ts";
import { useAppDispatch } from "../../../../../entities/store/hooks.ts";
import { updateTextDir } from "../../../../../entities/store/presentationSlice.ts";
import type { Font } from "../../../../../shared/types/font/Font.ts";
import { getStyleFromFont } from "../../../../../entities/slideText/lib/slideText.ts";
import richStyles from "./SlideRichText.module.css";
import styles from "./SlideTextEditor.module.css";
import { richTextController } from "../lib/richTextController.ts";

type Props = {
  slideId: string;
  objId: string;
  contentHtml: string;
  dir: TextDir | undefined;
  font: Font;
  onExit: () => void;
};

export function SlideTextEditor({
  slideId,
  objId,
  contentHtml,
  dir,
  font,
  onExit,
}: Props) {
  const dispatch = useAppDispatch();
  const rootRef = useRef<HTMLDivElement | null>(null);
  const [html, setHtml] = useState(contentHtml);

  const editor = useEditor({
    extensions: [StarterKit],
    content: contentHtml,
    onUpdate: ({ editor }) => {
      setHtml(editor.getHTML());
      richTextController.notify();
    },
    editorProps: {
      attributes: {
        class: `${styles.proseMirror} ${richStyles.content}`,
      },
    },
  });

  useEffect(() => {
    if (!editor) return;
    const id = requestAnimationFrame(() => {
      editor.commands.focus("end");
    });
    return () => cancelAnimationFrame(id);
  }, [editor]);

  useEffect(() => {
    if (!editor) return;
    const d = dir ?? "auto";
    editor.view.dom.setAttribute("dir", d);
    richTextController.notify();
  }, [editor, dir]);

  useEffect(() => {
    if (!editor) return;
    richTextController.setEditor(editor);

    const unsubDir = richTextController.subscribeDir((nextDir) => {
      dispatch(updateTextDir({ slideId, objId, dir: nextDir }));
    });

    return () => {
      unsubDir();
      richTextController.setEditor(null);
    };
  }, [dispatch, editor, objId, slideId]);

  useDebouncedTextCommit(slideId, objId, html);

  useEffect(() => {
    const onKey = (e: KeyboardEvent) => {
      if (!editor) return;

      const isFocused = editor.isFocused;

      if (!isFocused) {
        if (e.key === "Escape") onExit();
        return;
      }

      const mod = e.ctrlKey || e.metaKey;

      if (mod && e.code === "KeyA") {
        e.preventDefault();
        e.stopPropagation();
        editor.commands.focus();
        editor.commands.selectAll();
        return;
      }

      if (mod && e.code === "KeyB") {
        e.preventDefault();
        e.stopPropagation();
        editor.chain().focus().toggleBold().run();
        richTextController.notify();
        return;
      }

      if (mod && e.code === "KeyI") {
        e.preventDefault();
        e.stopPropagation();
        editor.chain().focus().toggleItalic().run();
        richTextController.notify();
        return;
      }

      if (e.key === "Escape") onExit();
    };

    window.addEventListener("keydown", onKey, true);
    return () => window.removeEventListener("keydown", onKey, true);
  }, [editor, onExit]);

  useEffect(() => {
    const onPointerDown = (e: PointerEvent) => {
      const root = rootRef.current;
      if (!root) return;

      const target = e.target as HTMLElement | null;
      if (target?.closest?.('[data-toolbar-root="1"]')) return;

      if (root.contains(e.target as Node)) return;
      onExit();
    };

    window.addEventListener("pointerdown", onPointerDown, true);
    return () => window.removeEventListener("pointerdown", onPointerDown, true);
  }, [onExit]);

  const fontStyle = useMemo(() => getStyleFromFont(font), [font]);

  if (!editor) return null;

  return (
    <div
      ref={rootRef}
      className={styles.root}
      style={fontStyle}
      onPointerDown={(e) => e.stopPropagation()}
      onClick={(e) => e.stopPropagation()}
      onDoubleClick={(e) => e.stopPropagation()}
    >
      <div className={styles.editor}>
        <EditorContent editor={editor} />
      </div>
    </div>
  );
}
