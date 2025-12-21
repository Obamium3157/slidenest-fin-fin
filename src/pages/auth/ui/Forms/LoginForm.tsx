import { useState } from "react";
import * as React from "react";
import { useAuth } from "../../../../auth";
import styles from "./Form.module.css";

type LoginFormProps = {
  onRedirectClick: () => void;
};

export function LoginForm({ onRedirectClick }: LoginFormProps) {
  const { login } = useAuth();
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [error, setError] = useState<string | null>(null);
  const [loading, setLoading] = useState(false);

  const hasError = error !== null;

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setError(null);
    setLoading(true);
    try {
      await login(email, password);
    } catch (e: unknown) {
      const message =
        typeof e === "object" && e !== null && "message" in e
          ? String((e as { message?: unknown }).message ?? "Ошибка при входе")
          : "Ошибка при входе";

      setError(message);
    } finally {
      setLoading(false);
    }
  };

  return (
    <form className={styles.loginFormContainer} onSubmit={handleSubmit}>
      <h1 className={styles.title}>Войти</h1>
      <label className={styles.formLabel}>
        Email
        <input
          className={`${styles.formInputField} ${hasError ? styles.inputError : ""}`}
          type="email"
          value={email}
          onChange={(e) => setEmail(e.target.value)}
          required
          aria-invalid={hasError}
        />
      </label>

      <label className={styles.formLabel}>
        Пароль
        <input
          className={`${styles.formInputField} ${hasError ? styles.inputError : ""}`}
          type="password"
          value={password}
          onChange={(e) => setPassword(e.target.value)}
          required
          minLength={8}
          aria-invalid={hasError}
        />
      </label>

      {error && <div className={styles.formError}>{error}</div>}

      <button className={styles.submitButton} type="submit" disabled={loading}>
        {loading ? "Входим..." : "Войти"}
      </button>

      <span className={styles.redirectLinkContainer}>
        Впервые пользуетесь SlideNest?{" "}
        <a className={styles.redirectLink} onClick={onRedirectClick}>
          Создать аккаунт
        </a>
      </span>
    </form>
  );
}
