import { StrictMode } from "react";
import { createRoot } from "react-dom/client";
import { PresentationMaker } from "../pages/presentation/ui/PresentationMaker.tsx";
import {
  addEditorChangeHandler,
  getEditor,
} from "../entities/editor/lib/modifyEditor.ts";

const root = createRoot(document.getElementById("root")!);

function render() {
  root.render(
    <StrictMode>
      <PresentationMaker editor={getEditor()} />
    </StrictMode>,
  );
}

addEditorChangeHandler(render);
render();
