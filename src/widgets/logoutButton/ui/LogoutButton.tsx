import { useAuth } from "../../../auth";
import styles from "./LogoutButton.module.css";
import logoutIcon from "../assets/tabler/logout.svg";

export function LogoutButton() {
  const { logout } = useAuth();

  return (
    <div className={styles.avatar} onClick={() => logout()}>
      <img className={styles.userIcon} src={logoutIcon} alt="logout" />
    </div>
  );
}
