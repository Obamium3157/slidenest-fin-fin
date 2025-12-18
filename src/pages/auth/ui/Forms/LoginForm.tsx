import { useState } from "react";
import * as React from "react";
import { useAuth } from "../../../../auth";
import styles from "./Form.module.css";

export function LoginForm() {
  const { login } = useAuth();
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [error, setError] = useState<string | null>(null);
  const [loading, setLoading] = useState(false);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setError(null);
    setLoading(true);
    try {
      await login(email, password);
    } catch (error) {
      if (error instanceof Error) {
        setError(error?.message ?? "Ошибка при входе");
      }
    } finally {
      setLoading(false);
    }
  };

  return (
    <form className={styles.loginFormContainer} onSubmit={handleSubmit}>
      <h1 className={styles.title}>Войти в SlideNest</h1>
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

      {error && <div style={{ color: "red" }}>{error}</div>}

      <button className={styles.submitButton} type="submit" disabled={loading}>
        {loading ? "Входим..." : "Войти"}
      </button>
    </form>
  );
}
