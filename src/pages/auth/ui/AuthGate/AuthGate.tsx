import { useState } from "react";
import * as React from "react";
import { LoginForm } from "../Forms/LoginForm.tsx";
import { RegisterForm } from "../Forms/RegisterForm.tsx";
import { useAuth } from "../../../../auth";
import styles from "./AuthGate.module.css";

export function AuthGate({ children }: { children: React.ReactNode }) {
  const { user, loading } = useAuth();
  const [mode, setMode] = useState<"login" | "register">("login");

  if (user) {
    return <div style={{ height: "100vh" }}>{children}</div>;
  }

  return (
    <div className={styles.authContainer}>
      <div className={styles.authContentContainer} aria-busy={loading}>
        {mode === "login" ? (
          <LoginForm onRedirectClick={() => setMode("register")} />
        ) : (
          <RegisterForm onRedirectClick={() => setMode("login")} />
        )}
      </div>

      {loading && (
        <div className={styles.loadingOverlay}>
          <div className={styles.loadingText}>Загрузка...</div>
        </div>
      )}
    </div>
  );
}
