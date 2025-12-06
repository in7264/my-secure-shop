import { useEffect } from "react";
import { useLocation, useNavigate } from "react-router-dom";
import { useAppState } from "../contexts/AppContext";
import { useAppActions } from "./useAppActions";
import type { CartItem, Favorite } from "../types";

/**Головний хук, який об'єднує всі ефекти для основного App компонента*/
export function useAppEffects() {
  const navigate = useNavigate();
  const location = useLocation();
  const { user, cartItems, favorites } = useAppState();
  const { checkAuth, loadCartFromServer, loadFavoritesFromServer } =
    useAppActions();

  useCartSyncEffect(cartItems);
  useFavoritesSyncEffect(favorites);
  useAuthEffect(checkAuth);
  useUserDataEffect(user, loadCartFromServer, loadFavoritesFromServer);
  useRouteGuardEffect(user, location, navigate);
}

/**Синхронізація корзини з localStorage*/
export function useCartSyncEffect(cartItems: CartItem[]) {
  useEffect(() => {
    localStorage.setItem("cart", JSON.stringify(cartItems));
  }, [cartItems]);
}

/**Синхронізація обраного з localStorage*/
export function useFavoritesSyncEffect(favorites: Favorite[]) {
  useEffect(() => {
    localStorage.setItem("favorites", JSON.stringify(favorites));
  }, [favorites]);
}

/**Ініціалізація та періодична перевірка авторизації */
export function useAuthEffect(checkAuth: () => Promise<any>) {
  useEffect(() => {
    const initAuth = async () => {
      await checkAuth();
    };

    initAuth();
    const interval = setInterval(checkAuth, 300000); // 5 хвилин
    return () => clearInterval(interval);
  }, [checkAuth]);
}

/**Завантаження даних користувача при зміні авторизації*/
export function useUserDataEffect(
  user: any,
  loadCartFromServer: () => Promise<void>,
  loadFavoritesFromServer: () => Promise<void>
) {
  useEffect(() => {
    if (user) {
      loadCartFromServer();
      loadFavoritesFromServer();
    }
  }, [user, loadCartFromServer, loadFavoritesFromServer]);
}

/** Захист маршрутів та перенаправлення */
export function useRouteGuardEffect(
  user: any,
  location: ReturnType<typeof useLocation>,
  navigate: ReturnType<typeof useNavigate>
) {
  useEffect(() => {
    const currentPath = location.pathname;

    // Захист адмін-панелі
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

    // Якщо вже авторизований, не показуємо сторінку входу
    if (user && currentPath === "/auth") {
      navigate("/");
    }
  }, [user, location.pathname, navigate]);
}
