import { useEffect } from "react";
import { useLocation, useNavigate } from "react-router-dom";
import { useAuth } from "../../../../auth";
import { LoginForm } from "../Forms/LoginForm.tsx";
import styles from "../AuthGate/AuthGate.module.css";

type LocationState = {
  from?: { pathname?: string };
};

export function LoginPage() {
  const { user, loading } = useAuth();
  const navigate = useNavigate();
  const location = useLocation();

  useEffect(() => {
    if (loading) return;
    if (!user) return;

    const state = location.state as LocationState | null;
    const from = state?.from?.pathname;
    navigate(from ?? "/presentations", { replace: true });
  }, [user, loading, location.state, navigate]);

  return (
    <div className={styles.authContainer}>
      <div className={styles.authContentContainer} aria-busy={loading}>
        <LoginForm onRedirectClick={() => navigate("/register")} />
      </div>

      {loading && (
        <div className={styles.loadingOverlay}>
          <div className={styles.loadingText}>Загрузка...</div>
        </div>
      )}
    </div>
  );
}
