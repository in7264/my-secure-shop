import { useState } from "react";
import "./AuthPage.scss";
import { useAuthLogic } from "./useAuthLogic";

export default function AuthPage() {
  const [showPassword, setShowPassword] = useState(false);

  const {
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
    isLoginMode,
    isRegisterMode,
    isResetMode,
  } = useAuthLogic();

  // Обробка відправки форми
  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();

    if (!canSubmit()) return;

    if (isLoginMode) {
      handleEmailLogin();
    } else if (isRegisterMode) {
      handleEmailRegister();
    } else if (isResetMode) {
      handlePasswordReset();
    }
  };

  // Обробник для Google кнопки
  const handleGoogleClick = (e: React.MouseEvent) => {
    e.preventDefault();
    handleGoogleLogin();
  };

  // Перемикання видимості паролю
  const togglePasswordVisibility = () => {
    setShowPassword(!showPassword);
  };

  // Перевірка валідності поля email
  const getEmailInputClass = () => {
    if (email === "") return "";
    return isValidEmail(email) ? "valid" : "error";
  };

  // Перевірка валідності поля паролю
  const getPasswordInputClass = () => {
    if (password === "") return "";
    return isValidPassword(password) ? "valid" : "error";
  };

  return (
    <div className="auth-page">
      <div className="auth-page__header">
        <h2>{getTitle()}</h2>
        <p>Будь ласка, введіть свої дані для продовження</p>
      </div>

      {error && <div className="auth-page__error">{error}</div>}

      <form className="auth-page__form" onSubmit={handleSubmit}>
        <div className="form-group">
          <label htmlFor="email">Електронна пошта</label>
          <input
            id="email"
            type="email"
            placeholder="your@email.com"
            value={email}
            onChange={(e) => setEmail(e.target.value)}
            className={`auth-page__input ${getEmailInputClass()}`}
            required
            disabled={loading}
          />
        </div>

        {(isLoginMode || isRegisterMode) && (
          <div className="form-group">
            <label htmlFor="password">Пароль</label>
            <div className="auth-page__password-toggle">
              <input
                id="password"
                type={showPassword ? "text" : "password"}
                placeholder="Введіть пароль"
                value={password}
                onChange={(e) => setPassword(e.target.value)}
                className={`auth-page__input ${getPasswordInputClass()}`}
                required
                disabled={loading}
              />
              <button
                type="button"
                className="toggle-button"
                onClick={togglePasswordVisibility}
                disabled={loading}
              >
                {showPassword ? "🙈" : "👁️"}
              </button>
            </div>

            {isRegisterMode && (
              <div className="auth-page__password-requirements">
                <h4>Вимоги до паролю:</h4>
                <ul>
                  <li className={password.length >= 6 ? "valid" : "invalid"}>
                    Мінімум 6 символів
                  </li>
                  <li className={/\d/.test(password) ? "valid" : "invalid"}>
                    Містить цифри
                  </li>
                  <li className={/[A-Z]/.test(password) ? "valid" : "invalid"}>
                    Містить великі літери
                  </li>
                </ul>
              </div>
            )}
          </div>
        )}

        <button
          type="submit"
          className={`auth-page__submit-button ${
            isRegisterMode ? "auth-page__submit-button--secondary" : ""
          }`}
          disabled={!canSubmit() || loading}
        >
          {getSubmitButtonText()}
        </button>
      </form>

      <div className="auth-page__divider">
        <span>або</span>
      </div>

      <div className="auth-page__oauth-buttons">
        <button
          onClick={handleGoogleClick}
          className="auth-page__google-button"
          disabled={loading}
        >
          <span className="google-icon">G</span>
          Увійти через Google
        </button>
      </div>

      <div className="auth-page__links">
        {isLoginMode ? (
          <>
            <p>
              Немає акаунта?{" "}
              <a
                href="#"
                onClick={(e) => {
                  e.preventDefault();
                  if (!loading) switchToRegister();
                }}
                className="auth-link"
              >
                Зареєструватися
              </a>
            </p>
            <p>
              Забули пароль?{" "}
              <a
                href="#"
                onClick={(e) => {
                  e.preventDefault();
                  if (!loading) switchToReset();
                }}
                className="auth-link"
              >
                Відновити
              </a>
            </p>
          </>
        ) : isRegisterMode ? (
          <p>
            Уже маєте акаунт?{" "}
            <a
              href="#"
              onClick={(e) => {
                e.preventDefault();
                if (!loading) switchToLogin();
              }}
              className="auth-link"
            >
              Увійти
            </a>
          </p>
        ) : (
          <p>
            <a
              href="#"
              onClick={(e) => {
                e.preventDefault();
                if (!loading) switchToLogin();
              }}
              className="auth-link"
            >
              Назад до входу
            </a>
          </p>
        )}
      </div>

      {/* Додаткові повідомлення */}
      {mode === "reset" && email && isValidEmail(email) && (
        <div className="auth-page__success-message">
          На цю пошту буде відправлено лист з інструкціями
        </div>
      )}
    </div>
  );
}
