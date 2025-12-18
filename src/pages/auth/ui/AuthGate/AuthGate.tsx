import { useState } from "react";
import * as React from "react";
import { LoginForm } from "../Forms/LoginForm.tsx";
import { RegisterForm } from "../Forms/RegisterForm.tsx";
import { useAuth } from "../../../../auth";
import styles from "./AuthGate.module.css";

export function AuthGate({ children }: { children: React.ReactNode }) {
  const { user, loading } = useAuth();
  const [mode, setMode] = useState<"login" | "register">("login");

  if (loading) {
    return <div>Загрузка...</div>;
  }

  if (!user) {
    return (
      <div className={styles.authContainer}>
        <div className={styles.authOptionsContainer}>
          <button
            className={styles.authOptionButton}
            onClick={() => setMode("login")}
            disabled={mode === "login"}
          >
            Войти
          </button>
          <button
            className={styles.authOptionButton}
            onClick={() => setMode("register")}
            disabled={mode === "register"}
          >
            Зарегистрироваться
          </button>
        </div>

        <div className={styles.authContentContainer}>
          {mode === "login" ? <LoginForm /> : <RegisterForm />}
        </div>
      </div>
    );
  }

  return <div style={{ height: "100vh" }}>{children}</div>;
}
