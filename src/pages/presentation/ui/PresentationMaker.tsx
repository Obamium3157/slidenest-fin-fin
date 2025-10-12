import type { Presentation } from "../../../entities/presentation/model/types.ts";
import { MenuBar } from "../../../widgets/menubar/ui/MenuBar.tsx";
import { getMenuBarItems } from "../../../widgets/menubar/data/data.ts";
import { FilmStrip } from "../../../widgets/filmstrip/ui/Filmstrip.tsx";
import { Workspace } from "../../../widgets/workspace/ui/Workspace.tsx";
import type { Select } from "../../../entities/select/model/types.ts";

import styles from "./presentationMaker.module.css";
import { Toolbar } from "../../../widgets/toolbar/ui/Toolbar.tsx";
import { InterfaceButtonView } from "../../../widgets/interfaceButton/ui/InterfaceButtonView.tsx";
import appIcon from "../assets/appicon.svg";

export type PresentationMakerProps = {
  presentation: Presentation;
  select: Select;
};

export function PresentationMaker(props: PresentationMakerProps) {
  const { presentation, select } = props;

  return (
    <div className={styles.mainField}>
      <div className={styles.headerPanel}>
        <div className={styles.titleAndInterfaceWrapper}>
          <div className={styles.iconAndInterfaceWrapper}>
            <img className={styles.logo} src={appIcon} alt="Логотип" />
            <div>
              <h1 className={styles.presentationTitle}>{presentation.title}</h1>
              <MenuBar items={getMenuBarItems()} />
            </div>
          </div>
          <InterfaceButtonView type={"slideShow"} alt={"Слайд-шоу"} />
        </div>
        <Toolbar />
      </div>
      <div className={styles.workField}>
        <FilmStrip slides={presentation.slides} />
        <Workspace presentation={presentation} select={select} />
      </div>
    </div>
  );
}
