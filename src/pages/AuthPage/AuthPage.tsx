import { useState } from "react";

export default function AuthPage() {
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [mode, setMode] = useState<"login" | "register" | "reset">("login");

  const API = import.meta.env.VITE_API as string;

  // === Email login ===
  const handleEmailLogin = async () => {
    try {
      console.log("API:", API);

      const res = await fetch(`${API}/auth/login`, {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
          Accept: "application/json",
        },
        body: JSON.stringify({ email, password }),
        credentials: "include",
      });

      if (!res.ok) {
        const errorData = await res.json();
        throw new Error(errorData.error || `HTTP error! status: ${res.status}`);
      }

      const data = await res.json();
      console.log("Login success:", data);

      alert("Успішний вхід!");
      window.location.href = "/";
    } catch (error) {
      console.error("Login error:", error);
      const errorMessage =
        error instanceof Error ? error.message : "Unknown error";
      alert("Помилка входу: " + errorMessage);
    }
  };

  // === Email registration ===
  const handleEmailRegister = async () => {
    const res = await fetch(`${API}/auth/register`, {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ email, password }),
    });

    const data = await res.json();

    if (!res.ok) return alert("Помилка реєстрації: " + data.error);

    alert("Перевірте пошту для підтвердження акаунта.");
  };

  // === Reset password ===
  const handlePasswordReset = async () => {
    const res = await fetch(`${API}/auth/reset`, {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ email }),
    });

    const data = await res.json();

    if (!res.ok) return alert("Помилка: " + data.error);

    alert("Лист для відновлення паролю відправлено!");
  };

  // === Google Login ===
  const handleGoogleLogin = async () => {
    window.location.href = `${API}/auth/google`;
  };

  return (
    <div style={{ maxWidth: 400, margin: "80px auto", textAlign: "center" }}>
      <h2>
        {mode === "login"
          ? "Вхід"
          : mode === "register"
          ? "Реєстрація"
          : "Відновлення паролю"}
      </h2>

      <input
        type="email"
        placeholder="Email"
        value={email}
        onChange={(e) => setEmail(e.target.value)}
        style={{ display: "block", margin: "10px auto", width: "100%" }}
      />

      {mode !== "reset" && (
        <input
          type="password"
          placeholder="Пароль"
          value={password}
          onChange={(e) => setPassword(e.target.value)}
          style={{ display: "block", margin: "10px auto", width: "100%" }}
        />
      )}

      {mode === "login" && (
        <>
          <button onClick={handleEmailLogin}>Увійти</button>
          <p>
            Немає акаунта?{" "}
            <a href="#" onClick={() => setMode("register")}>
              Зареєструватися
            </a>
          </p>
          <p>
            Забули пароль?{" "}
            <a href="#" onClick={() => setMode("reset")}>
              Відновити
            </a>
          </p>
        </>
      )}

      {mode === "register" && (
        <>
          <button onClick={handleEmailRegister}>Зареєструватися</button>
          <p>
            Уже маєте акаунт?{" "}
            <a href="#" onClick={() => setMode("login")}>
              Увійти
            </a>
          </p>
        </>
      )}

      {mode === "reset" && (
        <>
          <button onClick={handlePasswordReset}>Відновити пароль</button>
          <p>
            <a href="#" onClick={() => setMode("login")}>
              Назад до входу
            </a>
          </p>
        </>
      )}

      <hr style={{ margin: "20px 0" }} />
      <button onClick={handleGoogleLogin}>Увійти через Google</button>
    </div>
  );
}
