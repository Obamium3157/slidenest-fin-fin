import { MenuBar } from "../../../widgets/menubar/ui/MenuBar.tsx";
import { getMenuBarItems } from "../../../widgets/menubar/data/data.ts";
import { FilmStrip } from "../../../widgets/filmstrip/ui/Filmstrip.tsx";
import { Workspace } from "../../../widgets/workspace/ui/Workspace.tsx";

import styles from "./presentationMaker.module.css";
import { Toolbar } from "../../../widgets/toolbar/ui/Toolbar.tsx";
import { InterfaceButtonView } from "../../../widgets/interfaceButton/ui/InterfaceButtonView.tsx";
import appIcon from "../assets/appicon.svg";
import type { Editor } from "../../../entities/editor/model/types.ts";
import { Title } from "../../../widgets/title/ui/Title.tsx";

export type PresentationMakerProps = {
  editor: Editor;
};

export function PresentationMaker(props: PresentationMakerProps) {
  const { editor } = props;

  return (
    <div className={styles.mainField}>
      <div className={styles.headerPanel}>
        <div className={styles.titleAndInterfaceWrapper}>
          <div className={styles.iconAndInterfaceWrapper}>
            <img className={styles.logo} src={appIcon} alt="Логотип" />
            <div>
              <Title editor={editor} />
              <MenuBar items={getMenuBarItems()} />
            </div>
          </div>
          <InterfaceButtonView type={"slideShow"} alt={"Слайд-шоу"} />
        </div>
        <Toolbar select={editor.select} />
      </div>
      <div className={styles.workField}>
        <FilmStrip editor={editor} />
        <Workspace editor={editor} />
      </div>
    </div>
  );
}
