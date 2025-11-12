import { getOrderedMapElementById } from "../../../shared/types/orderedMap/OrderedMap.ts";

import styles from "./workspace.module.css";
import { SlideView } from "../../slideView/ui/SlideView.tsx";
import type { Editor } from "../../../entities/editor/model/types.ts";

export type WorkspaceProps = {
  editor: Editor;
};

export function Workspace(props: WorkspaceProps) {
  const { presentation, select } = props.editor;
  const currentSlide = getOrderedMapElementById(
    presentation.slides,
    select.selectedSlideIds[0],
  );

  if (!currentSlide) {
    return null;
  }

  return (
    <div className={styles.workspace}>
      <SlideView editor={props.editor} slide={currentSlide} />
    </div>
  );
}
