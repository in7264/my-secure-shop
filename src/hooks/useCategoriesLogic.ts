/* eslint-disable react-hooks/exhaustive-deps */
import { useEffect, useState } from "react";

export function useCategoriesLogic() {
  const [categories, setCategories] = useState<string[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  const API = import.meta.env.VITE_API as string;

  // Завантаження категорій
  useEffect(() => {
    loadCategories();
  }, []);

  const loadCategories = async (): Promise<void> => {
    try {
      setLoading(true);
      setError(null);

      const res = await fetch(`${API}/equipment/categories`);

      if (!res.ok) {
        throw new Error(`HTTP error! status: ${res.status}`);
      }

      const data = await res.json();
      setCategories(data.categories || []);
    } catch (err) {
      console.error("Error loading categories:", err);
      setError("Не вдалося завантажити категорії");
    } finally {
      setLoading(false);
    }
  };

  // Отримання URL для категорії
  const getCategoryUrl = (category: string): string => {
    return `/equipment/category/${encodeURIComponent(category)}`;
  };

  // Отримання назви для відображення
  const getCategoryDisplayName = (category: string): string => {
    // Можна додати трансформації назв, наприклад, великі літери
    return category.charAt(0).toUpperCase() + category.slice(1);
  };

  return {
    // Стан
    categories,
    loading,
    error,

    // Функції
    loadCategories,
    getCategoryUrl,
    getCategoryDisplayName,

    // Утиліти
    isEmpty: categories.length === 0,
    categoriesCount: categories.length,
  };
}
