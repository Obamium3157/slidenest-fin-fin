import { useEffect, useState } from "react";
import type { TextDir } from "../../../entities/slideText/model/types.ts";
import {
  richTextController,
  type RichTextContext,
} from "../../slideObject/features/richText/lib/richTextController.ts";

export function useRichTextToolbar() {
  const [hasEditor, setHasEditor] = useState(() =>
    Boolean(richTextController.getEditor()),
  );
  const [state, setState] = useState(() => richTextController.getState());
  const [ctx, setCtx] = useState<RichTextContext | null>(() =>
    richTextController.getContext(),
  );

  useEffect(() => {
    return richTextController.subscribe(() => {
      setHasEditor(Boolean(richTextController.getEditor()));
      setState(richTextController.getState());
      setCtx(richTextController.getContext());
    });
  }, []);

  const toggleBold = () => richTextController.toggleBold();
  const toggleItalic = () => richTextController.toggleItalic();
  const setDir = (dir: TextDir) => richTextController.setDir(dir);

  return {
    hasEditor,
    context: ctx,
    bold: state.bold,
    italic: state.italic,
    dir: state.dir,
    toggleBold,
    toggleItalic,
    setDir,
  };
}
