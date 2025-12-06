import { useState } from "react";

export type AuthMode = "login" | "register" | "reset";

export function useAuthLogic() {
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [mode, setMode] = useState<AuthMode>("login");
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const API = import.meta.env.VITE_API as string;

  // Обробка входу через email
  const handleEmailLogin = async (): Promise<void> => {
    try {
      setLoading(true);
      setError(null);

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

      // Успішний вхід
      alert("Успішний вхід!");

      // Перезавантажуємо сторінку для оновлення стану
      window.location.href = "/";
    } catch (error) {
      const errorMessage =
        error instanceof Error ? error.message : "Невідома помилка";
      console.error("Login error:", errorMessage);
      setError(errorMessage);
      alert("Помилка входу: " + errorMessage);
    } finally {
      setLoading(false);
    }
  };

  // Обробка реєстрації через email
  const handleEmailRegister = async (): Promise<void> => {
    try {
      setLoading(true);
      setError(null);

      const res = await fetch(`${API}/auth/register`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ email, password }),
      });

      const data = await res.json();

      if (!res.ok) {
        throw new Error(data.error || "Помилка реєстрації");
      }

      alert("Перевірте пошту для підтвердження акаунта.");
      setMode("login"); // Перемикаємо на режим входу після реєстрації
    } catch (error) {
      const errorMessage =
        error instanceof Error ? error.message : "Невідома помилка";
      console.error("Register error:", errorMessage);
      setError(errorMessage);
      alert("Помилка реєстрації: " + errorMessage);
    } finally {
      setLoading(false);
    }
  };

  // Обробка відновлення паролю
  const handlePasswordReset = async (): Promise<void> => {
    try {
      setLoading(true);
      setError(null);

      const res = await fetch(`${API}/auth/reset`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ email }),
      });

      const data = await res.json();

      if (!res.ok) {
        throw new Error(data.error || "Помилка відновлення паролю");
      }

      alert("Лист для відновлення паролю відправлено!");
      setMode("login"); // Перемикаємо на режим входу
    } catch (error) {
      const errorMessage =
        error instanceof Error ? error.message : "Невідома помилка";
      console.error("Password reset error:", errorMessage);
      setError(errorMessage);
      alert("Помилка: " + errorMessage);
    } finally {
      setLoading(false);
    }
  };

  // Обробка входу через Google
  // Обробка входу через Google (новый фронтенд способ)
  const handleGoogleLogin = (): void => {
    try {
      console.log("Starting Google OAuth on frontend...");

      // Получаем Google Client ID из переменных окружения
      const googleClientId = import.meta.env.VITE_GOOGLE_CLIENT_ID;

      if (!googleClientId) {
        console.error("Google Client ID is not configured");
        setError("Google authentication is not properly configured");
        alert("Google authentication is not properly configured");
        return;
      }

      console.log(
        "Using Google Client ID:",
        googleClientId.substring(0, 10) + "..."
      );

      // Строим URL для Google OAuth
      const googleAuthUrl = new URL(
        "https://accounts.google.com/o/oauth2/v2/auth"
      );

      const params = {
        client_id: googleClientId, // ДОБАВЬТЕ ЭТО
        redirect_uri: `${window.location.origin}/auth/callback`,
        response_type: "token", // Используем token flow (Implicit flow)
        scope: "email profile openid",
        include_granted_scopes: "true",
        state: "google_oauth",
        prompt: "consent",
      };

      Object.entries(params).forEach(([key, value]) => {
        if (value) googleAuthUrl.searchParams.append(key, value);
      });

      console.log("Redirecting to Google OAuth:", googleAuthUrl.toString());
      window.location.href = googleAuthUrl.toString();
    } catch (error) {
      console.error("Google login error:", error);
      setError("Failed to start Google login");
      alert("Failed to start Google login");
    }
  };

  // Перемикання режимів
  const switchToLogin = (): void => {
    setMode("login");
    setError(null);
  };

  const switchToRegister = (): void => {
    setMode("register");
    setError(null);
  };

  const switchToReset = (): void => {
    setMode("reset");
    setError(null);
  };

  // Валідація email
  const isValidEmail = (email: string): boolean => {
    const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
    return emailRegex.test(email);
  };

  // Валідація паролю
  const isValidPassword = (password: string): boolean => {
    return password.length >= 6;
  };

  // Можна надсилати форму?
  const canSubmit = (): boolean => {
    if (!isValidEmail(email)) return false;

    if (mode === "login" || mode === "register") {
      return isValidPassword(password);
    }

    return true; // Для reset потрібен тільки email
  };

  // Отримання тексту для кнопки
  const getSubmitButtonText = (): string => {
    if (loading) {
      return mode === "login"
        ? "Вхід..."
        : mode === "register"
        ? "Реєстрація..."
        : "Відновлення...";
    }

    return mode === "login"
      ? "Увійти"
      : mode === "register"
      ? "Зареєструватися"
      : "Відновити пароль";
  };

  // Отримання заголовка
  const getTitle = (): string => {
    return mode === "login"
      ? "Вхід"
      : mode === "register"
      ? "Реєстрація"
      : "Відновлення паролю";
  };

  return {
    // Стан
    email,
    password,
    mode,
    loading,
    error,

    // Сетери
    setEmail,
    setPassword,

    // Обробники
    handleEmailLogin,
    handleEmailRegister,
    handlePasswordReset,
    handleGoogleLogin,
    switchToLogin,
    switchToRegister,
    switchToReset,

    // Утиліти
    isValidEmail,
    isValidPassword,
    canSubmit,
    getSubmitButtonText,
    getTitle,

    // Флаги
    isLoginMode: mode === "login",
    isRegisterMode: mode === "register",
    isResetMode: mode === "reset",
  };
}
