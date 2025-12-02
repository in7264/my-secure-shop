/* eslint-disable react-hooks/exhaustive-deps */
import { useCallback, useEffect, useMemo, useState } from "react";
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
import CartPage from "./pages/CartPage"; // Добавьте
import FavoritesPage from "./pages/FavoritesPage"; // Добавьте
import type { User } from "@supabase/supabase-js";
import type { CartItem, Equipment, Favorite } from "./types";

export default function App() {
  const [user, setUser] = useState<User | null>(null);

  return (
    <Router>
      <MainApp user={user} setUser={setUser} />
    </Router>
  );
}

function MainApp({
  user,
  setUser,
}: {
  user: User | null;
  setUser: (user: User | null) => void;
}) {
  const navigate = useNavigate();
  const [cartItems, setCartItems] = useState<CartItem[]>(() => {
    // Загружаем из localStorage при инициализации
    const savedCart = localStorage.getItem("cart");
    return savedCart ? JSON.parse(savedCart) : [];
  });
  const [favorites, setFavorites] = useState<Favorite[]>(() => {
    const savedFavorites = localStorage.getItem("favorites");
    return savedFavorites ? JSON.parse(savedFavorites) : [];
  });

  const API = import.meta.env.VITE_API as string;

  // Сохраняем корзину и избранное в localStorage при изменении
  useEffect(() => {
    localStorage.setItem("cart", JSON.stringify(cartItems));
  }, [cartItems]);

  useEffect(() => {
    localStorage.setItem("favorites", JSON.stringify(favorites));
  }, [favorites]);

  // Проверить авторизацию при загрузке
  useEffect(() => {
    checkAuth();
    const interval = setInterval(checkAuth, 300000);
    return () => clearInterval(interval);
  }, []);

  // Загрузить корзину и избранное с сервера при авторизации
  useEffect(() => {
    if (user) {
      loadCartFromServer();
      loadFavoritesFromServer();
    } else {
      // Оставляем локальные данные, но синхронизируем при следующем входе
    }
  }, [user]);

  const checkAuth = async () => {
    try {
      const res = await fetch(`${API}/auth/check`, {
        method: "GET",
        credentials: "include",
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

  const loadCartFromServer = async () => {
    try {
      const res = await fetch(`${API}/user/cart`, {
        method: "GET",
        credentials: "include",
      });

      if (res.ok) {
        const data = await res.json();
        setCartItems(data.cartItems || []);
      }
    } catch (error) {
      console.error("Load cart from server error:", error);
    }
  };

  const loadFavoritesFromServer = async () => {
    try {
      const res = await fetch(`${API}/user/favorites`, {
        method: "GET",
        credentials: "include",
      });

      if (res.ok) {
        const data = await res.json();
        setFavorites(data.favorites || []);
      }
    } catch (error) {
      console.error("Load favorites from server error:", error);
    }
  };

  // Функции для управления корзиной
  const addToCart = useCallback(
    async (equipment: Equipment, quantity: number = 1) => {
      if (!user) {
        // Сохраняем локально если пользователь не авторизован
        const existingItem = cartItems.find(
          (item) => item.equipment.id === equipment.id
        );

        if (existingItem) {
          setCartItems(
            cartItems.map((item) =>
              item.equipment.id === equipment.id
                ? { ...item, quantity: item.quantity + quantity }
                : item
            )
          );
        } else {
          setCartItems([
            ...cartItems,
            {
              id: Date.now(),
              quantity,
              equipment: {
                id: equipment.id,
                name: equipment.name,
                price: equipment.price,
                main_image: equipment.main_image,
                stock: equipment.stock, // Добавляем stock
              },
            },
          ]);
        }
        alert("Товар додано до кошика!");
        return;
      }

      // Если пользователь авторизован - сохраняем на сервер
      try {
        const res = await fetch(`${API}/user/cart/${equipment.id}`, {
          method: "POST",
          headers: {
            "Content-Type": "application/json",
          },
          body: JSON.stringify({ quantity }),
          credentials: "include",
        });

        if (res.ok) {
          loadCartFromServer(); // Перезагружаем с сервера
          alert("Товар додано до кошика!");
        }
      } catch (error) {
        console.error("Error adding to cart:", error);
      }
    },
    [user, API]
  );

  const removeFromCart = useCallback(
    async (equipmentId: number) => {
      if (!user) {
        setCartItems(
          cartItems.filter((item) => item.equipment.id !== equipmentId)
        );
        return;
      }

      try {
        await fetch(`${API}/user/cart/${equipmentId}`, {
          method: "DELETE",
          credentials: "include",
        });
        loadCartFromServer();
      } catch (error) {
        console.error("Error removing from cart:", error);
      }
    },
    [user, API]
  );

  const updateCartQuantity = useCallback(
    async (equipmentId: number, quantity: number) => {
      if (!user) {
        setCartItems(
          cartItems.map((item) =>
            item.equipment.id === equipmentId && quantity > 0
              ? { ...item, quantity }
              : item
          )
        );
        return;
      }

      try {
        await fetch(`${API}/user/cart/${equipmentId}`, {
          method: "PUT",
          headers: {
            "Content-Type": "application/json",
          },
          body: JSON.stringify({ quantity }),
          credentials: "include",
        });
        loadCartFromServer();
      } catch (error) {
        console.error("Error updating cart:", error);
      }
    },
    [user, API]
  );

  const stableCartItems = useMemo(() => cartItems, [cartItems]);
  const stableFavorites = useMemo(() => favorites, [favorites]);

  const checkRoleAndRedirect = async (user: User | null) => {
    const currentPath = window.location.pathname;

    // Защита админ-панели
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

    // Опционально: перенаправление при входе в систему
    if (user && currentPath === "/auth") {
      navigate("/");
    }
  };

  const handleLogout = async () => {
    try {
      const res = await fetch(`${API}/auth/logout`, {
        method: "GET",
        credentials: "include",
      });

      if (res.ok) {
        setUser(null);
        setCartItems([]);
        setFavorites([]);
        localStorage.removeItem("cart");
        localStorage.removeItem("favorites");
        navigate("/");
      }
    } catch (error) {
      console.error("Logout error:", error);
      setUser(null);
      navigate("/");
    }
  };

  const totalCartItems = cartItems.reduce(
    (sum, item) => sum + item.quantity,
    0
  );

  const trackView = useCallback(async (equipmentId: number) => {
  try {
    await fetch(`${API}/equipment/${equipmentId}/view`, {
      method: "POST",
      credentials: "include",
    });
  } catch (error) {
    console.error("Error tracking view:", error);
  }
}, [API]);

  return (
    <>
      <nav
        style={{
          display: "flex",
          justifyContent: "space-between",
          alignItems: "center",
          padding: "1rem 2rem",
          backgroundColor: "#f8f9fa",
          borderBottom: "1px solid #dee2e6",
        }}
      >
        <div>
          <Link to="/" style={{ marginRight: "1rem" }}>
            Головна
          </Link>
          <Link to="/equipment" style={{ marginRight: "1rem" }}>
            Каталог
          </Link>
          {user && (
            <>
              <Link to="/favorites" style={{ marginRight: "1rem" }}>
                Обране
              </Link>
              <Link to="/cart" style={{ marginRight: "1rem" }}>
                Кошик
              </Link>
            </>
          )}
        </div>

        <div style={{ display: "flex", alignItems: "center", gap: "1rem" }}>
          {/* Иконка избранного */}
          <div style={{ position: "relative" }}>
            <Link
              to="/favorites"
              style={{
                background: "none",
                border: "none",
                fontSize: "1.5rem",
                cursor: "pointer",
                position: "relative",
                textDecoration: "none",
              }}
            >
              ❤️
              {favorites.length > 0 && (
                <span
                  style={{
                    position: "absolute",
                    top: "-5px",
                    right: "-5px",
                    backgroundColor: "#dc3545",
                    color: "white",
                    borderRadius: "50%",
                    width: "18px",
                    height: "18px",
                    fontSize: "12px",
                    display: "flex",
                    alignItems: "center",
                    justifyContent: "center",
                  }}
                >
                  {favorites.length}
                </span>
              )}
            </Link>
          </div>

          {/* Иконка корзины */}
          <div style={{ position: "relative" }}>
            <Link
              to="/cart"
              style={{
                background: "none",
                border: "none",
                fontSize: "1.5rem",
                cursor: "pointer",
                position: "relative",
                textDecoration: "none",
              }}
            >
              🛒
              {totalCartItems > 0 && (
                <span
                  style={{
                    position: "absolute",
                    top: "-5px",
                    right: "-5px",
                    backgroundColor: "#007bff",
                    color: "white",
                    borderRadius: "50%",
                    width: "18px",
                    height: "18px",
                    fontSize: "12px",
                    display: "flex",
                    alignItems: "center",
                    justifyContent: "center",
                  }}
                >
                  {totalCartItems}
                </span>
              )}
            </Link>
          </div>

          {/* Информация пользователя */}
          <div className="user-info">
            {user ? (
              <>
                <span style={{ marginRight: "0.5rem" }}>
                  👤 {user.email} ({user.role})
                </span>
                <button
                  onClick={handleLogout}
                  style={{
                    padding: "0.25rem 0.5rem",
                    backgroundColor: "#dc3545",
                    color: "white",
                    border: "none",
                    borderRadius: "4px",
                    cursor: "pointer",
                  }}
                >
                  Вийти
                </button>
                {user.role === "supabase_admin" && (
                  <Link
                    to="/admin"
                    style={{
                      marginLeft: "0.5rem",
                      padding: "0.25rem 0.5rem",
                      backgroundColor: "#007bff",
                      color: "white",
                      textDecoration: "none",
                      borderRadius: "4px",
                    }}
                  >
                    Адмін-панель
                  </Link>
                )}
              </>
            ) : (
              <Link to="/auth">Увійти</Link>
            )}
          </div>
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
        <Route
          path="/equipment/item/:id"
          element={
            <EquipmentDetail
              onTrackView={trackView}
              onAddToCart={addToCart}
              onRemoveFromCart={removeFromCart}
              onUpdateCartQuantity={updateCartQuantity}
              cartItems={stableCartItems}
              favorites={stableFavorites}
            />
          }
        />
        <Route
          path="/cart"
          element={
            <CartPage
              cartItems={cartItems}
              onUpdateCart={updateCartQuantity}
              onRemoveFromCart={removeFromCart}
            />
          }
        />
        <Route path="/favorites" element={<FavoritesPage />} />
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
