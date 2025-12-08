/* eslint-disable react-hooks/exhaustive-deps */
import { useEffect, useState } from "react";
import { useParams, useNavigate } from "react-router-dom";
import type { Equipment } from "../../types/index";

export function useEquipmentListLogic() {
  const [items, setItems] = useState<Equipment[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const { category } = useParams<{ category: string }>();
  const navigate = useNavigate();
  const API = import.meta.env.VITE_API as string;

  // Завантаження товарів
  useEffect(() => {
    loadItems();
  }, [category]);

  const loadItems = async (): Promise<void> => {
    try {
      setLoading(true);
      setError(null);

      let url = `${API}/equipment`;
      if (category) {
        url = `${API}/equipment/category/${encodeURIComponent(category)}`;
      }

      const res = await fetch(url);

      if (!res.ok) {
        throw new Error(`HTTP error! status: ${res.status}`);
      }

      const data = await res.json();
      setItems(data.items || []);
    } catch (err) {
      console.error("Error loading equipment:", err);
      setError("Не вдалося завантажити обладнання");
    } finally {
      setLoading(false);
    }
  };

  // Функція для додавання в корзину
  const addToCart = async (equipmentId: number): Promise<void> => {
    try {
      const res = await fetch(`${API}/user/cart/${equipmentId}`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ quantity: 1 }),
        credentials: "include",
      });

      if (res.ok) {
        alert("Товар додано до кошика!");
        window.dispatchEvent(new Event("cartUpdated"));
      } else if (res.status === 401) {
        alert("Будь ласка, увійдіть в систему");
        navigate("/auth");
      } else {
        const errorData = await res.json();
        alert("Помилка: " + (errorData.error || "Не вдалося додати до кошика"));
      }
    } catch (error) {
      console.error("Error adding to cart:", error);
      alert("Помилка при додаванні до кошика");
    }
  };

  // Функція для додавання/видалення з обраного
  const toggleFavorite = async (equipmentId: number): Promise<void> => {
    try {
      // Перевіряємо спочатку, чи є в обраному
      const checkRes = await fetch(
        `${API}/user/favorites/${equipmentId}/check`,
        {
          credentials: "include",
        }
      );

      if (checkRes.ok) {
        const { isFavorite } = await checkRes.json();

        if (isFavorite) {
          // Видаляємо
          await fetch(`${API}/user/favorites/${equipmentId}`, {
            method: "DELETE",
            credentials: "include",
          });
          alert("Видалено з обраного");
        } else {
          // Додаємо
          const res = await fetch(`${API}/user/favorites/${equipmentId}`, {
            method: "POST",
            credentials: "include",
          });

          if (res.ok) {
            alert("Додано до обраного!");
          } else if (res.status === 401) {
            alert("Будь ласка, увійдіть в систему");
            navigate("/auth");
          } else {
            const errorData = await res.json();
            alert(
              "Помилка: " + (errorData.error || "Не вдалося додати до обраного")
            );
          }
        }
        window.dispatchEvent(new Event("favoritesUpdated"));
      }
    } catch (error) {
      console.error("Error toggling favorite:", error);
      alert("Помилка при роботі з обраним");
    }
  };

  // Отримати перше зображення
  const getFirstImage = (item: Equipment): string | undefined => {
    if (item.images && Array.isArray(item.images) && item.images.length > 0) {
      return item.images[0];
    }
    return item.main_image;
  };

  return {
    // Стан
    items,
    loading,
    error,
    category,

    // Функції
    loadItems,
    addToCart,
    toggleFavorite,
    getFirstImage,

    // Утиліти
    isCategoryPage: !!category,
    isEmpty: items.length === 0,
  };
}
