import { useCallback } from "react";
import { useAppDispatch, useAppState } from "../contexts/AppContext";
import type { Equipment } from "../types";

export function useAppActions() {
  const dispatch = useAppDispatch();
  const { user } = useAppState();

  /**
   * Проверяет аутентификацию пользователя через API
   */
  const checkAuth = useCallback(async () => {
    const API = import.meta.env.VITE_API as string;

    try {
      const res = await fetch(`${API}/auth/check`, {
        method: "GET",
        credentials: "include",
      });

      if (res.ok) {
        const data = await res.json();
        if (data.authorized) {
          dispatch({ type: "SET_USER", payload: data.user });
          return data.user;
        } else {
          dispatch({ type: "SET_USER", payload: null });
          return null;
        }
      } else {
        dispatch({ type: "SET_USER", payload: null });
        return null;
      }
    } catch (error) {
      console.error("Auth check error:", error);
      dispatch({ type: "SET_USER", payload: null });
      return null;
    }
  }, [dispatch]);

  const loadCartFromServer = useCallback(async () => {
    if (!user) return;

    const API = import.meta.env.VITE_API as string;

    try {
      const res = await fetch(`${API}/user/cart`, {
        method: "GET",
        credentials: "include",
      });

      if (res.ok) {
        const data = await res.json();
        dispatch({ type: "SET_CART_ITEMS", payload: data.cartItems || [] });
      }
    } catch (error) {
      console.error("Load cart from server error:", error);
    }
  }, [user, dispatch]);

  const loadFavoritesFromServer = useCallback(async () => {
    if (!user) return;

    const API = import.meta.env.VITE_API as string;

    try {
      const res = await fetch(`${API}/user/favorites`, {
        method: "GET",
        credentials: "include",
      });

      if (res.ok) {
        const data = await res.json();
        dispatch({ type: "SET_FAVORITES", payload: data.favorites || [] });
      }
    } catch (error) {
      console.error("Load favorites from server error:", error);
    }
  }, [user, dispatch]);

  const addToCart = useCallback(
    async (equipment: Equipment, quantity: number = 1) => {
      const API = import.meta.env.VITE_API as string;
      const { user, cartItems } = useAppState();

      if (!user) {
        // Локальное обновление
        const existingItem = cartItems.find(
          (item) => item.equipment.id === equipment.id
        );

        const cartItem = {
          id: Date.now(),
          quantity,
          equipment: {
            id: equipment.id,
            name: equipment.name,
            price: equipment.price,
            main_image: equipment.main_image,
            stock: equipment.stock,
          },
        };

        dispatch({ type: "ADD_TO_CART", payload: cartItem });
        alert("Товар додано до кошика!");
        return;
      }

      // Серверное обновление
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
          loadCartFromServer();
          alert("Товар додано до кошика!");
        }
      } catch (error) {
        console.error("Error adding to cart:", error);
      }
    },
    [dispatch, loadCartFromServer]
  );

  const removeFromCart = useCallback(
    async (equipmentId: number) => {
      const API = import.meta.env.VITE_API as string;
      const { user } = useAppState();

      if (!user) {
        dispatch({ type: "REMOVE_FROM_CART", payload: equipmentId });
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
    [dispatch, loadCartFromServer]
  );

  const updateCartQuantity = useCallback(
    async (equipmentId: number, quantity: number) => {
      const API = import.meta.env.VITE_API as string;
      const { user } = useAppState();

      if (!user) {
        dispatch({
          type: "UPDATE_CART_QUANTITY",
          payload: { equipmentId, quantity },
        });
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
    [dispatch, loadCartFromServer]
  );

  const toggleFavorite = useCallback(
    async (equipment: Equipment) => {
      const API = import.meta.env.VITE_API as string;
      const { user, favorites } = useAppState();

      const favoriteItem = {
        id: Date.now(),
        equipment: {
          id: equipment.id,
          name: equipment.name,
          price: equipment.price,
          main_image: equipment.main_image,
          category: equipment.category,
        },
      };

      if (!user) {
        dispatch({ type: "TOGGLE_FAVORITE", payload: favoriteItem });
        const isFavorite = favorites.some(
          (fav) => fav.equipment.id === equipment.id
        );
        alert(isFavorite ? "Видалено з обраного!" : "Додано в обране!");
        return;
      }

      try {
        const res = await fetch(`${API}/user/favorites/${equipment.id}`, {
          method: "POST",
          credentials: "include",
        });

        if (res.ok) {
          loadFavoritesFromServer();
          alert("Стан обраного оновлено!");
        }
      } catch (error) {
        console.error("Error toggling favorite:", error);
      }
    },
    [dispatch, loadFavoritesFromServer]
  );

  const logout = useCallback(async () => {
    const API = import.meta.env.VITE_API as string;

    try {
      const res = await fetch(`${API}/auth/logout`, {
        method: "GET",
        credentials: "include",
      });

      if (res.ok) {
        dispatch({ type: "LOGOUT" });
        localStorage.removeItem("cart");
        localStorage.removeItem("favorites");
        return true;
      }
    } catch (error) {
      console.error("Logout error:", error);
      dispatch({ type: "LOGOUT" });
      return false;
    }
  }, [dispatch]);

  return {
    checkAuth,
    loadCartFromServer,
    loadFavoritesFromServer,
    addToCart,
    removeFromCart,
    updateCartQuantity,
    toggleFavorite,
    logout,
  };
}
