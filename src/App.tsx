import { BrowserRouter as Router, Routes, Route, Link } from "react-router-dom";
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
import { useAppEffects } from "./hooks/useAppEffects";
import GoogleCallbackPage from "./pages/GoogleCallbackPage/GoogleCallbackPage";

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
  //Запуск всіх useEffect
  useAppEffects();

  return (
    <div className="app-container">
      <Header />

      <main className="main-content">
        <Routes>
          <Route path="/" element={<HomePage />} />
          <Route path="/login" element={<AuthPage />} />
          <Route path="/auth/callback" element={<GoogleCallbackPage />} />
          <Route path="/equipment" element={<CategoriesPage />} />
          <Route
            path="/equipment/category/:category"
            element={<EquipmentListPage />}
          />
          <Route path="/equipment/all" element={<EquipmentListPage />} />
          <Route path="/equipment/item/:id" element={<EquipmentDetailPage />} />
          <Route path="/cart" element={<CartPage />} />
          <Route path="/favorites" element={<FavoritesPage />} />
          <Route
            path="/admin"
            element={
              <AdminGuard>
                <AdminPage />
              </AdminGuard>
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

function AdminGuard({ children }: { children: React.ReactNode }) {
  const { user } = useAppState();

  if (user?.role === "service_role" || user?.role === "supabase_admin") {
    return <>{children}</>;
  }

  return (
    <div className="card text-center">
      <h2 className="card-title">Доступ заборонено</h2>
      <p>У вас немає прав для доступу до адмін-панелі</p>
      <Link to="/" className="btn btn-admin mt-2">
        На головну
      </Link>
    </div>
  );
}
