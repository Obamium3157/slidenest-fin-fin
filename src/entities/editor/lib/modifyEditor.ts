import type { Editor } from "../model/types.ts";
import { maxPresentation } from "../../presentation/model/test/data.ts";

type ModifyFn = (editor: Editor, ...args: any[]) => Editor;
type EditorChangeHandler = () => void;

// let modifyEditor: Editor;
let modifyEditor: Editor = maxPresentation();
let editorChangeHandler: EditorChangeHandler;

export function getEditor() {
  return modifyEditor;
}

export function setEditor(newEditor: Editor) {
  modifyEditor = newEditor;
}

export function addEditorChangeHandler(handler: EditorChangeHandler) {
  editorChangeHandler = handler;
}

export function dispatch(fn: ModifyFn, payload?: unknown): void {
  const args = Array.isArray(payload)
    ? payload
    : payload === undefined
      ? []
      : [payload];

  const newEditor = (fn as any)(modifyEditor, ...args);
  setEditor(newEditor);
  if (editorChangeHandler) {
    editorChangeHandler();
  }
}
