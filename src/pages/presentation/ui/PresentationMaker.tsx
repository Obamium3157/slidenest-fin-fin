import { MenuBar } from "../../../widgets/menubar/ui/MenuBar.tsx";
import { getMenuBarItems } from "../../../widgets/menubar/data/data.ts";
import { FilmStrip } from "../../../widgets/filmstrip/ui/Filmstrip.tsx";
import { Workspace } from "../../../widgets/workspace/ui/Workspace.tsx";

import styles from "./presentationMaker.module.css";
import { Toolbar } from "../../../widgets/toolbar/ui/Toolbar.tsx";
import { InterfaceButtonView } from "../../../widgets/interfaceButton/ui/InterfaceButtonView.tsx";
import appIcon from "../assets/appicon.svg";
import { Title } from "../../../widgets/title/ui/Title.tsx";
import { AvatarView } from "../../../widgets/avatarView/ui/AvatarView.tsx";

export function PresentationMaker() {
  return (
    <div className={styles.mainField}>
      <div className={styles.headerPanel}>
        <div className={styles.titleAndInterfaceWrapper}>
          <div className={styles.iconAndInterfaceWrapper}>
            <img className={styles.logo} src={appIcon} alt="Логотип" />
            <div>
              <Title />
              <MenuBar items={getMenuBarItems()} />
            </div>
          </div>
          <div className={styles.sideContainer}>
            <InterfaceButtonView type={"slideShow"} alt={"Слайд-шоу"} />
            <AvatarView />
          </div>
        </div>
        <Toolbar />
      </div>
      <div className={styles.workField}>
        <FilmStrip />
        <Workspace />
      </div>
    </div>
  );
}
