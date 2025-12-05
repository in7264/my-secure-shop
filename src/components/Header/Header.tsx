import { Link } from "react-router-dom";
import "../../App.scss";
import { useAppState } from "../../contexts/AppContext";
import { useLocation } from "react-router-dom";
import { useAppActions } from "../../hooks/useAppActions";

export default function Header() {
  const { user, cartItems, favorites } = useAppState();
  const { logout } = useAppActions();
  const location = useLocation();

  // Функция проверки активной ссылки
  const isActive = (path: string) => location.pathname === path;

  // Подсчет количества товаров в корзине
  const cartItemsCount = cartItems.reduce(
    (sum, item) => sum + item.quantity,
    0
  );

  // Количество избранных товаров
  const favoritesCount = favorites.length;

  const handleLogout = async () => {
    const success = await logout();
    if (success) {
      window.location.href = "/"; // Перезагрузка страницы для сброса состояния
    }
  };

  return (
    <nav className="navbar">
      <div className="nav-links">
        <Link to="/" className={`nav-link ${isActive("/") ? "active" : ""}`}>
          Головна
        </Link>
        <Link
          to="/equipment"
          className={`nav-link ${isActive("/equipment") ? "active" : ""}`}
        >
          Каталог
        </Link>
        {user && (
          <>
            <Link
              to="/favorites"
              className={`nav-link ${isActive("/favorites") ? "active" : ""}`}
            >
              Обране
            </Link>
            <Link
              to="/cart"
              className={`nav-link ${isActive("/cart") ? "active" : ""}`}
            >
              Кошик
            </Link>
          </>
        )}
      </div>

      <div className="nav-actions">
        <div className="icon-button-wrapper">
          <Link to="/favorites" className="icon-button" title="Обране">
            ❤️
            {favoritesCount > 0 && (
              <span className="badge badge-danger">{favoritesCount}</span>
            )}
          </Link>
        </div>

        <div className="icon-button-wrapper">
          <Link to="/cart" className="icon-button" title="Кошик">
            🛒
            {cartItemsCount > 0 && (
              <span className="badge">{cartItemsCount}</span>
            )}
          </Link>
        </div>

        <div className="user-info">
          {user ? (
            <div className="d-flex align-items-center gap-2">
              <div className="user-details">
                <div className="user-email">👤 {user.email}</div>
                <div className="user-role">{user.role}</div>
              </div>
              {user.role === "supabase_admin" && (
                <Link to="/admin" className="btn btn-admin">
                  Адмін
                </Link>
              )}
              <button onClick={handleLogout} className="btn btn-logout">
                Вийти
              </button>
            </div>
          ) : (
            <Link to="/auth" className="btn btn-login">
              Увійти
            </Link>
          )}
        </div>
      </div>
    </nav>
  );
}
