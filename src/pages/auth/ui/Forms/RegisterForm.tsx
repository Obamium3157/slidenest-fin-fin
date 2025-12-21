import { useState } from "react";
import * as React from "react";
import { useAuth } from "../../../../auth";
import styles from "./Form.module.css";

type RegisterFormProps = {
  onRedirectClick: () => void;
};

export function RegisterForm({ onRedirectClick }: RegisterFormProps) {
  const { register } = useAuth();
  const [email, setEmail] = useState("");
  const [name, setName] = useState("");
  const [password, setPassword] = useState("");
  const [confirm, setConfirm] = useState("");
  const [error, setError] = useState<string | null>(null);
  const [loading, setLoading] = useState(false);

  const hasError = error !== null;

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setError(null);

    if (password.length < 8) {
      setError("Пароль должен быть не менее 8 символов.");
      return;
    }
    if (password !== confirm) {
      setError("Пароли не совпадают.");
      return;
    }

    setLoading(true);

    try {
      await register(email, password, name);
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
      <h1 className={styles.title}>Зарегистрироваться</h1>
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
        Имя
        <input
          className={`${styles.formInputField} ${hasError ? styles.inputError : ""}`}
          value={name}
          onChange={(e) => setName(e.target.value)}
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

      <label className={styles.formLabel}>
        Подтвердите пароль
        <input
          className={`${styles.formInputField} ${hasError ? styles.inputError : ""}`}
          type="password"
          value={confirm}
          onChange={(e) => setConfirm(e.target.value)}
          required
          minLength={8}
          aria-invalid={hasError}
        />
      </label>

      {error && <div className={styles.formError}>{error}</div>}

      <button className={styles.submitButton} type="submit" disabled={loading}>
        {loading ? "Регистрация..." : "Зарегистрироваться"}
      </button>

      <span className={styles.redirectLinkContainer}>
        Уже есть аккаунт?{" "}
        <a className={styles.redirectLink} onClick={onRedirectClick}>
          Войти
        </a>
      </span>
    </form>
  );
}
