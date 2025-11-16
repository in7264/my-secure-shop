import { useState } from "react";

export default function Auth() {
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [mode, setMode] = useState<"login" | "register" | "reset">("login");

  const API = import.meta.env.API as string;

  // === Email login ===
  const handleEmailLogin = async () => {
    const res = await fetch(`${API}/auth/login`, {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ email, password }),
      credentials: "include"
    });

    const data = await res.json();

    if (!res.ok) return alert("Помилка входу: " + data.error);

    alert("Успішний вхід!");
    window.location.href = "/admin"; // redirect
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
            <a href="#" onClick={() => setMode("register")}>Зареєструватися</a>
          </p>
          <p>
            Забули пароль?{" "}
            <a href="#" onClick={() => setMode("reset")}>Відновити</a>
          </p>
        </>
      )}

      {mode === "register" && (
        <>
          <button onClick={handleEmailRegister}>Зареєструватися</button>
          <p>
            Уже маєте акаунт?{" "}
            <a href="#" onClick={() => setMode("login")}>Увійти</a>
          </p>
        </>
      )}

      {mode === "reset" && (
        <>
          <button onClick={handlePasswordReset}>Відновити пароль</button>
          <p>
            <a href="#" onClick={() => setMode("login")}>Назад до входу</a>
          </p>
        </>
      )}

      <hr style={{ margin: "20px 0" }} />
      <button onClick={handleGoogleLogin}>Увійти через Google</button>
    </div>
  );
}
