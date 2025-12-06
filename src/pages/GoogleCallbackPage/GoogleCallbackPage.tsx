import { useEffect, useState } from "react";
import { useNavigate } from "react-router-dom";

const API = import.meta.env.VITE_API as string;

export default function GoogleCallbackPage() {
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const navigate = useNavigate();

  useEffect(() => {
    const handleGoogleCallback = async () => {
      try {
        console.log("=== GOOGLE CALLBACK STARTED ===");

        // Получаем токены из URL фрагмента
        const hash = window.location.hash.substring(1);
        const params = new URLSearchParams(hash);

        // Извлекаем access_token от Google (не provider_token!)
        const googleAccessToken = params.get("access_token");
        const expiresIn = params.get("expires_in");
        const tokenType = params.get("token_type");

        console.log(
          "Google access token received:",
          googleAccessToken ? "PRESENT" : "MISSING"
        );

        if (!googleAccessToken) {
          throw new Error("No access token received from Google");
        }

        // НЕ отправляем Google token напрямую в Supabase
        // Вместо этого используем Google token для получения информации о пользователе
        console.log("Fetching user info from Google...");

        // Получаем информацию о пользователе от Google
        const userInfoResponse = await fetch(
          "https://www.googleapis.com/oauth2/v3/userinfo",
          {
            headers: {
              Authorization: `Bearer ${googleAccessToken}`,
            },
          }
        );

        if (!userInfoResponse.ok) {
          throw new Error("Failed to fetch user info from Google");
        }

        const userInfo = await userInfoResponse.json();
        console.log("Google user info:", userInfo);

        // Теперь отправляем данные на ваш бэкенд
        const response = await fetch(`${API}/auth/google/callback`, {
          method: "POST",
          headers: {
            "Content-Type": "application/json",
            Accept: "application/json",
          },
          credentials: "include",
          body: JSON.stringify({
            googleAccessToken,
            userInfo, // Отправляем информацию о пользователе
          }),
        });

        if (!response.ok) {
          const errorData = await response.json();
          throw new Error(
            errorData.error || `HTTP error! status: ${response.status}`
          );
        }

        const data = await response.json();
        console.log("Authentication successful:", data);

        // Очищаем URL
        window.history.replaceState({}, document.title, "/auth/callback");

        // Редирект на главную
        setTimeout(() => {
          navigate("/");
        }, 500);
      } catch (err) {
        console.error("Google callback error:", err);
        setError(err instanceof Error ? err.message : "Authentication failed");

        setTimeout(() => {
          navigate("/auth", {
            state: {
              error: "Google authentication failed",
              details: err instanceof Error ? err.message : "Unknown error",
            },
          });
        }, 1000);
      } finally {
        setLoading(false);
      }
    };

    handleGoogleCallback();
  }, [navigate]);

  if (loading) {
    return (
      <div
        className="callback-page"
        style={{
          display: "flex",
          flexDirection: "column",
          alignItems: "center",
          justifyContent: "center",
          height: "100vh",
          textAlign: "center",
          padding: "20px",
        }}
      >
        <h2>🔐 Processing Google Authentication...</h2>
        <p>Please wait while we complete the login process...</p>
        <div
          className="spinner"
          style={{
            marginTop: "20px",
            width: "40px",
            height: "40px",
            border: "4px solid #f3f3f3",
            borderTop: "4px solid #3498db",
            borderRadius: "50%",
            animation: "spin 1s linear infinite",
          }}
        ></div>
        <style>{`
          @keyframes spin {
            0% { transform: rotate(0deg); }
            100% { transform: rotate(360deg); }
          }
        `}</style>
      </div>
    );
  }

  if (error) {
    return (
      <div
        className="callback-page"
        style={{
          display: "flex",
          flexDirection: "column",
          alignItems: "center",
          justifyContent: "center",
          height: "100vh",
          textAlign: "center",
          padding: "20px",
        }}
      >
        <h2 style={{ color: "#e74c3c" }}>❌ Authentication Error</h2>
        <p style={{ margin: "20px 0", maxWidth: "500px" }}>{error}</p>
        <button
          onClick={() => navigate("/login")}
          style={{
            padding: "10px 20px",
            backgroundColor: "#3498db",
            color: "white",
            border: "none",
            borderRadius: "5px",
            cursor: "pointer",
            fontSize: "16px",
          }}
        >
          Back to Login
        </button>
      </div>
    );
  }

  return null;
}
