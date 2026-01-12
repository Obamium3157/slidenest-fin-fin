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
import { FontSize } from "../lib/fontSizeExtension.ts";
import { FontFamily } from "../lib/fontFamilyExtension.ts";

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
    extensions: [StarterKit, FontSize, FontFamily],
    content: contentHtml,
    onUpdate: ({ editor }) => {
      setHtml(editor.getHTML());
      richTextController.notify();
    },
    onSelectionUpdate: () => {
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
    richTextController.setContext({ slideId, objId, font });

    const unsubDir = richTextController.subscribeDir((nextDir) => {
      dispatch(updateTextDir({ slideId, objId, dir: nextDir }));
    });

    return () => {
      unsubDir();
      richTextController.setContext(null);
      richTextController.setEditor(null);
    };
  }, [dispatch, editor, font, objId, slideId]);

  useEffect(() => {
    if (!editor) return;
    richTextController.setContext({ slideId, objId, font });
  }, [editor, font, objId, slideId]);

  useDebouncedTextCommit(slideId, objId, html);

  useEffect(() => {
    const onKey = (e: KeyboardEvent) => {
      const t = e.target as HTMLElement | null;
      const isInThisEditor =
        Boolean(
          t?.isContentEditable || t?.closest?.("[contenteditable='true']"),
        ) && Boolean(rootRef.current?.contains(t));

      if (isInThisEditor) return;
      if (e.key === "Escape") onExit();
    };

    window.addEventListener("keydown", onKey);
    return () => window.removeEventListener("keydown", onKey);
  }, [onExit]);

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
