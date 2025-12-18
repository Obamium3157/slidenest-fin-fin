import { useAuth } from "../../../auth";
import styles from "./AvatarView.module.css";
import userIcon from "../assets/tabler/user.svg";

export function AvatarView() {
  const { logout } = useAuth();

  return (
    <div className={styles.avatar} onClick={() => logout()}>
      <img className={styles.userIcon} src={userIcon} alt="avatar" />
    </div>
  );
}
