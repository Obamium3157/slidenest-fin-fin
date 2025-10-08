import type { Presentation } from "../../../entities/presentation/model/types.ts";
import { MenuBar } from "../../../widgets/menubar/ui/MenuBar.tsx";
import { getMenuBarItems } from "../../../widgets/menubar/data/data.ts";
import { FilmStrip } from "../../../widgets/filmstrip/ui/Filmstrip.tsx";
import { Workspace } from "../../../widgets/workspace/ui/Workspace.tsx";
import type { Select } from "../../../entities/select/model/types.ts";

import styles from "./presentationMaker.module.css";

export type PresentationMakerProps = {
  presentation: Presentation;
  select: Select;
};

export function PresentationMaker(props: PresentationMakerProps) {
  const { presentation, select } = props;

  return (
    <div className={styles.mainField}>
      <div className={styles.headerPanel}>
        <h1>{presentation.title}</h1>
        <MenuBar items={getMenuBarItems()} />
      </div>
      <div className={styles.workField}>
        <FilmStrip slides={presentation.slides} />
        <Workspace presentation={presentation} select={select} />
      </div>
    </div>
  );
}
