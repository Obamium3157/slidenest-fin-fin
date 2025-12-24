import { useEffect, useRef } from "react";
import { Link, useParams } from "react-router-dom";

import { MenuBar } from "../../../widgets/menubar/ui/MenuBar.tsx";
import { getMenuBarItems } from "../../../widgets/menubar/data/data.ts";
import { FilmStrip } from "../../../widgets/filmstrip/ui/Filmstrip.tsx";
import { Workspace } from "../../../widgets/workspace/ui/Workspace.tsx";
import { Toolbar } from "../../../widgets/toolbar/ui/Toolbar.tsx";
import { InterfaceButtonView } from "../../../widgets/interfaceButton/ui/InterfaceButtonView.tsx";
import { Title } from "../../../widgets/title/ui/Title.tsx";
import { AvatarView } from "../../../widgets/avatarView/ui/AvatarView.tsx";

import styles from "./presentationMaker.module.css";
import appIcon from "../assets/appicon.svg";

import {
  useAppDispatch,
  useAppSelector,
} from "../../../entities/store/hooks.ts";
import { bootstrapPresentation } from "../../../entities/store/appSlice.ts";

type RouteParams = {
  presentationId?: string;
};

export function PresentationMaker() {
  const dispatch = useAppDispatch();

  const status = useAppSelector((s) => s.app.status);
  const error = useAppSelector((s) => s.app.error);

  const { presentationId } = useParams<RouteParams>();

  const lastRequestedIdRef = useRef<string | null>(null);

  useEffect(() => {
    const nextId = presentationId ?? null;

    if (lastRequestedIdRef.current === nextId) return;
    lastRequestedIdRef.current = nextId;

    void dispatch(bootstrapPresentation({ presentationId: nextId }));
  }, [dispatch, presentationId]);

  if (status === "loading" || status === "idle") {
    return <div>Загрузка презентации...</div>;
  }

  if (status === "error") {
    return <div>Ошибка загрузки: {error}</div>;
  }

  return (
    <div className={styles.mainField}>
      <div className={styles.headerPanel}>
        <div className={styles.titleAndInterfaceWrapper}>
          <div className={styles.iconAndInterfaceWrapper}>
            <Link
              to={"/presentations"}
              aria-label={"Перейти на главную"}
              className={styles.logoLink}
            >
              <img className={styles.logo} src={appIcon} alt="Логотип" />
            </Link>
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
