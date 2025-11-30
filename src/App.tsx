import { useEffect, useState } from "react";
import {
  BrowserRouter as Router,
  Routes,
  Route,
  Link,
  useNavigate,
} from "react-router-dom";
import Home from "./pages/Home";
import Auth from "./pages/Auth";
import EquipmentList from "./pages/EquipmentList";
import AdminPanel from "./pages/AdminPanel";
import "./styles/App.scss";
import Categories from "./pages/Categories";
import EquipmentDetail from "./pages/EquipmentDetail";

export default function App() {
  const [user, setUser] = useState<any>(null);

  return (
    <Router>
      <MainApp user={user} setUser={setUser} />
    </Router>
  );
}

function MainApp({ user, setUser }: { user: any; setUser: any }) {
  const navigate = useNavigate();
  const API = import.meta.env.VITE_API as string;

  // Проверить авторизацию при загрузке
  useEffect(() => {
    checkAuth();

    // Проверять авторизацию каждые 5 минут
    const interval = setInterval(checkAuth, 300000);

    return () => clearInterval(interval);
  }, []);

  // Проверить авторизацию через бэкенд
  const checkAuth = async () => {
    try {
      const res = await fetch(`${API}/auth/check`, {
        method: "GET",
        credentials: "include", // Важно для кук
      });

      if (res.ok) {
        const data = await res.json();
        if (data.authorized) {
          setUser(data.user);
          checkRoleAndRedirect(data.user);
        } else {
          setUser(null);
        }
      } else {
        setUser(null);
      }
    } catch (error) {
      console.error("Auth check error:", error);
      setUser(null);
    }
  };

  // Проверить роль и перенаправить
  const checkRoleAndRedirect = async (user: any) => {
    if (!user) {
      navigate("/");
      return;
    }

    // Если пользователь уже на нужной странице, не перенаправлять
    const currentPath = window.location.pathname;

    if (user.role === "admin" && currentPath !== "/admin") {
      navigate("/admin");
    } else if (user.role !== "admin" && currentPath === "/admin") {
      navigate("/");
    }
  };

  // Выйти из системы
  const handleLogout = async () => {
    try {
      const res = await fetch(`${API}/auth/logout`, {
        method: "GET",
        credentials: "include",
      });

      if (res.ok) {
        setUser(null);
        navigate("/");
        window.location.reload(); // Полностью очистить состояние
      }
    } catch (error) {
      console.error("Logout error:", error);
      // Все равно сбросить состояние
      setUser(null);
      navigate("/");
    }
  };

  return (
    <>
      <nav>
        <div>
          <Link to="/">Головна</Link> | <Link to="/equipment">Каталог</Link> |{" "}
          <Link to="/auth">Авторизація</Link>
        </div>

        <div className="user-info">
          {user ? (
            <>
              <span>
                👤 {user.email} ({user.role})
              </span>
              <button onClick={handleLogout}>Вийти</button>
              {user.role === "supabase_admin" && (
                <Link to="/admin" style={{ marginLeft: "10px" }}>
                  Адмін-панель
                </Link>
              )}
            </>
          ) : (
            <Link to="/auth">Увійти</Link>
          )}
        </div>
      </nav>
      <Routes>
        <Route path="/" element={<Home />} />
        <Route path="/auth" element={<Auth />} />
        <Route path="/equipment" element={<Categories />} />
        <Route
          path="/equipment/category/:category"
          element={<EquipmentList />}
        />
        <Route path="/equipment/all" element={<EquipmentList />} />
        <Route path="/equipment/item/:id" element={<EquipmentDetail />} />
        <Route
          path="/admin"
          element={
            user?.role === "supabase_admin" ? (
              <AdminPanel />
            ) : (
              <div style={{ padding: "20px", textAlign: "center" }}>
                <h2>Доступ заборонено</h2>
                <p>У вас немає прав для доступу до адмін-панелі</p>
                <Link to="/">На головну</Link>
              </div>
            )
          }
        />
      </Routes>
    </>
  );
}
