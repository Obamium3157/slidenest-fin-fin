import { useState } from "react";
import * as React from "react";
import { useAuth } from "../../../../auth";
import styles from "./Form.module.css";

export function RegisterForm() {
  const { register } = useAuth();
  const [email, setEmail] = useState("");
  const [name, setName] = useState("");
  const [password, setPassword] = useState("");
  const [confirm, setConfirm] = useState("");
  const [error, setError] = useState<string | null>(null);
  const [loading, setLoading] = useState(false);

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
    } catch (error) {
      if (error instanceof Error) {
        setError(error?.message ?? "Ошибка при регистрации");
      }
    } finally {
      setLoading(false);
    }
  };

  return (
    <form className={styles.loginFormContainer} onSubmit={handleSubmit}>
      <h1 className={styles.title}>Зарегистрироваться в SlideNest</h1>
      <label className={styles.formLabel}>
        Email
        <input
          className={styles.formInputField}
          type="email"
          value={email}
          onChange={(e) => setEmail(e.target.value)}
          required
        />
      </label>

      <label className={styles.formLabel}>
        Имя
        <input
          className={styles.formInputField}
          value={name}
          onChange={(e) => setName(e.target.value)}
        />
      </label>

      <label className={styles.formLabel}>
        Пароль
        <input
          className={styles.formInputField}
          type="password"
          value={password}
          onChange={(e) => setPassword(e.target.value)}
          required
          minLength={8}
        />
      </label>

      <label className={styles.formLabel}>
        Подтвердите пароль
        <input
          className={styles.formInputField}
          type="password"
          value={confirm}
          onChange={(e) => setConfirm(e.target.value)}
          required
          minLength={8}
        />
      </label>

      {error && <div style={{ color: "red" }}>{error}</div>}

      <button className={styles.submitButton} type="submit" disabled={loading}>
        {loading ? "Регистрация..." : "Зарегистрироваться"}
      </button>
    </form>
  );
}
