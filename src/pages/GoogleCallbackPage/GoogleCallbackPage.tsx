import { useEffect, useState } from "react";
import { useNavigate, useLocation } from "react-router-dom";

const API = import.meta.env.VITE_API as string;

export default function GoogleCallbackPage() {
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const navigate = useNavigate();
  const location = useLocation();

  useEffect(() => {
    const handleGoogleCallback = async () => {
      try {
        console.log("=== GOOGLE CALLBACK STARTED ===");
        console.log("Full URL:", window.location.href);
        console.log("Hash:", location.hash);

        // Получаем токены из URL фрагмента (#access_token=...)
        const hash = location.hash.substring(1); // Убираем #
        const params = new URLSearchParams(hash);

        const access_token = params.get("access_token");
        const refresh_token = params.get("refresh_token");
        const expires_at = params.get("expires_at");
        const provider_token = params.get("provider_token");

        console.log("Tokens extracted:", {
          access_token: access_token ? "PRESENT" : "MISSING",
          refresh_token: refresh_token ? "PRESENT" : "MISSING",
          expires_at,
          provider_token: provider_token ? "PRESENT" : "MISSING",
        });

        if (!access_token || !refresh_token) {
          throw new Error("No authentication tokens received from Google");
        }

        // Отправляем токены на бекенд
        console.log("Sending tokens to backend...");
        const response = await fetch(`${API}/auth/google/callback`, {
          method: "POST",
          headers: {
            "Content-Type": "application/json",
            Accept: "application/json",
          },
          credentials: "include", // Важно для получения куки
          body: JSON.stringify({
            access_token,
            refresh_token,
            expires_at,
            provider_token,
          }),
        });

        console.log("Backend response status:", response.status);

        if (!response.ok) {
          const errorData = await response.json();
          console.error("Backend error response:", errorData);
          throw new Error(
            errorData.error || `HTTP error! status: ${response.status}`
          );
        }

        const data = await response.json();
        console.log("Google authentication successful:", data);

        // Очищаем URL от токенов (по соображениям безопасности)
        window.history.replaceState({}, document.title, "/auth/callback");

        // Редирект на главную с небольшой задержкой
        setTimeout(() => {
          navigate("/");
        }, 500);
      } catch (err) {
        console.error("Google callback error:", err);
        setError(err instanceof Error ? err.message : "Authentication failed");

        // Редирект на страницу логина с ошибкой
        setTimeout(() => {
          navigate("/login", {
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
  }, [location, navigate]);

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
