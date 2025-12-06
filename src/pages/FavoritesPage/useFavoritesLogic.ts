/* eslint-disable react-hooks/exhaustive-deps */
import { useEffect, useState } from "react";
import { useNavigate } from "react-router-dom";
import { useAppState } from "../../contexts/AppContext";
import { useAppActions } from "../../hooks/useAppActions";
import type { Favorite } from "../../types";

export function useFavoritesLogic() {
  const { favorites } = useAppState();
  const { loadFavoritesFromServer } = useAppActions(); // Змінюємо на loadFavoritesFromServer
  const [loading, setLoading] = useState(true);
  const navigate = useNavigate();
  const API = import.meta.env.VITE_API as string;

  // Завантаження обраного
  useEffect(() => {
    const loadData = async () => {
      await loadFavorites();
    };
    loadData();
  }, []);

  const loadFavorites = async (): Promise<void> => {
    try {
      setLoading(true);
      // Використовуємо функцію з useAppActions
      await loadFavoritesFromServer();
    } catch (error) {
      console.error("Error loading favorites:", error);
    } finally {
      setLoading(false);
    }
  };

  // Видалення з обраного
  const removeFromFavorites = async (equipmentId: number): Promise<void> => {
    try {
      const res = await fetch(`${API}/user/favorites/${equipmentId}`, {
        method: "DELETE",
        credentials: "include",
      });

      if (res.ok) {
        // Перезавантажуємо список обраного з сервера
        await loadFavorites();
        alert("Видалено з обраного");
      }
    } catch (error) {
      console.error("Error removing from favorites:", error);
    }
  };

  // Додавання в корзину
  const addToCart = async (equipment: Favorite["equipment"]): Promise<void> => {
    try {
      const res = await fetch(`${API}/user/cart/${equipment.id}`, {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify({ quantity: 1 }),
        credentials: "include",
      });

      if (res.ok) {
        alert("Товар додано до кошика!");
      } else if (res.status === 401) {
        alert("Будь ласка, увійдіть в систему");
        navigate("/auth");
      }
    } catch (error) {
      console.error("Error adding to cart:", error);
    }
  };

  return {
    // Стан
    favorites,
    loading,

    // Обробники
    removeFromFavorites,
    addToCart,

    // Утиліти
    isFavoritesEmpty: favorites.length === 0,
  };
}
