import { useNavigate } from "react-router-dom";
import { useAuth } from "../../../auth";
import { ROUTES } from "../../../app/router/routes.ts";
import { useAppDispatch } from "../../../entities/store/hooks.ts";
import { stopAutosaveTimer } from "../../../entities/store/autosaveTimer.ts";
import {
  clearActivePresentationCache,
  resetApp,
} from "../../../entities/store/appSlice.ts";
import { resetEditor } from "../../../entities/store/undoableReducer.ts";
import styles from "./LogoutButton.module.css";
import logoutIcon from "../assets/tabler/logout.svg";

export function LogoutButton() {
  const { logout } = useAuth();
  const navigate = useNavigate();
  const dispatch = useAppDispatch();

  const onLogout = () => {
    navigate(ROUTES.LOGIN, { replace: true, state: { reason: "logout" } });

    dispatch(stopAutosaveTimer());
    dispatch(resetEditor());
    dispatch(resetApp());

    clearActivePresentationCache();

    void logout();
  };

  return (
    <div className={styles.logoutButton} onClick={onLogout}>
      <img className={styles.logoutIcon} src={logoutIcon} alt="logout" />
    </div>
  );
}
