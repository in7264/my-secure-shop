import { useEffect } from "react";
import {
  BrowserRouter as Router,
  Routes,
  Route,
  Link,
  useNavigate,
  useLocation,
} from "react-router-dom";
import "./App.scss";
import CartPage from "./pages/CartPage/CartPage";
import FavoritesPage from "./pages/FavoritesPage/FavoritesPage";
import { AppProvider, useAppState } from "./contexts/AppContext";
import HomePage from "./pages/HomePage/HomePage";
import AuthPage from "./pages/AuthPage/AuthPage";
import CategoriesPage from "./pages/CategoriesPage/CategoriesPage";
import EquipmentListPage from "./pages/EquipmentListPage/EquipmentListPage";
import EquipmentDetailPage from "./pages/EquipmentDetailPage/EquipmentDetailPage";
import AdminPage from "./pages/AdminPage/AdminPage";
import Footer from "./components/Footer/Footer";
import Header from "./components/Header/Header";
import { useAppActions } from "./hooks/useAppActions";

export default function App() {
  return (
    <AppProvider>
      <Router>
        <MainApp />
      </Router>
    </AppProvider>
  );
}

function MainApp() {
  const navigate = useNavigate();
  const location = useLocation();
  const API = import.meta.env.VITE_API as string;
  const { user, cartItems, favorites } = useAppState();
  const { checkAuth, loadCartFromServer, loadFavoritesFromServer } =
    useAppActions();

  // Завантаження товарів в корзину з локал стореджу при кожній зміні корзини
  useEffect(() => {
    localStorage.setItem("cart", JSON.stringify(cartItems));
  }, [cartItems]);

  // Завантаження товарів в обране з локал стореджу при кожній зміні обраних
  useEffect(() => {
    localStorage.setItem("favorites", JSON.stringify(favorites));
  }, [favorites]);

  // Стартова ініціалізація користувача та постійна його перевірка
  useEffect(() => {
    const initAuth = async () => {
      await checkAuth();
    };

    initAuth();
    const interval = setInterval(checkAuth, 300000);
    return () => clearInterval(interval);
  }, []);

  // Завантаженя данних корзини та обраних з серверу
  useEffect(() => {
    if (user) {
      loadCartFromServer();
      loadFavoritesFromServer();
    }
  }, [user]);

  // Перевірка на адміна, якщо ні то редірект на сторінку авторизації або головну
  useEffect(() => {
    const currentPath = location.pathname;

    if (currentPath === "/admin") {
      if (!user) {
        navigate("/auth");
        return;
      }
      if (user.role !== "supabase_admin") {
        navigate("/");
        return;
      }
    }

    if (user && currentPath === "/auth") {
      navigate("/");
    }
  }, [user, location.pathname, navigate]);

  // Функция для трекинга просмотров
  const trackView = async (equipmentId: number) => {
    try {
      await fetch(`${API}/equipment/${equipmentId}/view`, {
        method: "POST",
        credentials: "include",
      });
    } catch (error) {
      console.error("Error tracking view:", error);
    }
  };

  return (
    <div className="app-container">
      <Header />

      <main className="main-content">
        <Routes>
          <Route path="/" element={<HomePage />} />
          <Route path="/auth" element={<AuthPage />} />
          <Route path="/equipment" element={<CategoriesPage />} />
          <Route
            path="/equipment/category/:category"
            element={<EquipmentListPage />}
          />
          <Route path="/equipment/all" element={<EquipmentListPage />} />
          <Route
            path="/equipment/item/:id"
            element={<EquipmentDetailPage onTrackView={trackView} />}
          />
          <Route path="/cart" element={<CartPage />} />
          <Route path="/favorites" element={<FavoritesPage />} />
          <Route
            path="/admin"
            element={
              user?.role === "supabase_admin" ? (
                <AdminPage />
              ) : (
                <div className="card text-center">
                  <h2 className="card-title">Доступ заборонено</h2>
                  <p>У вас немає прав для доступу до адмін-панелі</p>
                  <Link to="/" className="btn btn-admin mt-2">
                    На головну
                  </Link>
                </div>
              )
            }
          />
          <Route
            path="*"
            element={
              <div className="not-found">
                <h1>404</h1>
                <p>Сторінку не знайдено</p>
                <Link to="/" className="btn-home">
                  На головну
                </Link>
              </div>
            }
          />
        </Routes>
      </main>

      <Footer />
    </div>
  );
}
