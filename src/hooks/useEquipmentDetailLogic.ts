/* eslint-disable react-hooks/exhaustive-deps */
import { useEffect, useState, useCallback, useRef } from "react";
import { useParams, useNavigate } from "react-router-dom";
import { useAppState } from "../contexts/AppContext";
import { useAppActions } from "./useAppActions";
import type { Equipment } from "../types";

export function useEquipmentDetailLogic() {
  // Получаем состояние и действия из контекста
  const { cartItems, favorites, user } = useAppState();
  const { addToCart, removeFromCart, updateCartQuantity, toggleFavorite } = useAppActions();
  
  const [equipment, setEquipment] = useState<Equipment | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [activeImage, setActiveImage] = useState(0);
  const [cartQuantity, setCartQuantity] = useState(1);
  const [addingToCart, setAddingToCart] = useState(false);
  const [addingToFavorites, setAddingToFavorites] = useState(false);

  // Используем useRef для предотвращения повторных вызовов
  const hasTrackedViewRef = useRef(false);
  const initialLoadRef = useRef(false);

  const { id } = useParams<{ id: string }>();
  const navigate = useNavigate();
  const API = import.meta.env.VITE_API as string;

  // Определяем, есть ли товар в корзине и избранном
  const isInCart = equipment
    ? cartItems.some((item) => item.equipment.id === equipment.id)
    : false;

  const isInFavorites = equipment
    ? favorites.some((fav) => fav.equipment.id === equipment.id)
    : false;

  // Находим текущее количество в корзине
  const currentCartItem = equipment
    ? cartItems.find((item) => item.equipment.id === equipment.id)
    : null;

  /**Функція яка збирає статистику про користувача та який предмет він оглядає*/
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

  // Загрузка оборудования
  const loadEquipment = useCallback(async () => {
    if (!id || initialLoadRef.current) return;

    try {
      setLoading(true);
      setError(null);
      initialLoadRef.current = true;

      const res = await fetch(`${API}/equipment/${id}`);

      if (!res.ok) {
        throw new Error(`HTTP error! status: ${res.status}`);
      }

      const data = await res.json();
      setEquipment(data.equipment);

      // Отслеживание просмотра только после успешной загрузки
      if (!hasTrackedViewRef.current && data.equipment) {
        await trackView(data.equipment.id);
        hasTrackedViewRef.current = true;
      }
    } catch (err) {
      console.error("Error loading equipment:", err);
      setError("Не вдалося завантажити інформацію про обладнання");
    } finally {
      setLoading(false);
    }
  }, [id, API, trackView]);

  // Основной эффект загрузки
  useEffect(() => {
    if (id && !initialLoadRef.current) {
      loadEquipment();
    }

    // Очистка при размонтировании компонента
    return () => {
      initialLoadRef.current = false;
    };
  }, [id, loadEquipment]);

  // Обновление количества в корзине при изменении currentCartItem
  useEffect(() => {
    if (currentCartItem) {
      setCartQuantity(currentCartItem.quantity);
    } else {
      setCartQuantity(1);
    }
  }, [currentCartItem]);

  // Функция для добавления в корзину
  const addToCartHandler = useCallback(async () => {
    if (!equipment) return;

    setAddingToCart(true);
    try {
      await addToCart(equipment, cartQuantity);
      alert("Товар додано до кошика!");
    } catch (error) {
      console.error("Error adding to cart:", error);
      alert("Помилка при додаванні до кошика");
    } finally {
      setAddingToCart(false);
    }
  }, [equipment, cartQuantity, addToCart]);

  // Функция для удаления из корзины
  const removeFromCartHandler = useCallback(async () => {
    if (!equipment) return;

    try {
      await removeFromCart(equipment.id);
      alert("Товар видалено з кошика!");
      setCartQuantity(1);
    } catch (error) {
      console.error("Error removing from cart:", error);
      alert("Помилка при видаленні з кошика");
    }
  }, [equipment, removeFromCart]);

  // Функция для обновления количества в корзине
  const updateCartQuantityHandler = useCallback(async (newQuantity: number) => {
    if (!equipment || newQuantity < 1) return;

    try {
      await updateCartQuantity(equipment.id, newQuantity);
      setCartQuantity(newQuantity);
    } catch (error) {
      console.error("Error updating cart quantity:", error);
      alert("Помилка при оновленні кількості");
    }
  }, [equipment, updateCartQuantity]);

  // Функция для работы с избранным
  const toggleFavoriteHandler = useCallback(async () => {
    if (!equipment) return;

    setAddingToFavorites(true);
    try {
      if (!user) {
        // Если пользователь не авторизован, перенаправляем на страницу авторизации
        alert("Будь ласка, увійдіть в систему щоб додавати товари до обраного");
        navigate("/auth");
        return;
      }

      await toggleFavorite(equipment);
      
      // Сообщение пользователю
      if (isInFavorites) {
        alert("Видалено з обраного");
      } else {
        alert("Додано до обраного!");
      }
    } catch (error) {
      console.error("Error toggling favorite:", error);
      alert("Помилка при роботі з обраним");
    } finally {
      setAddingToFavorites(false);
    }
  }, [equipment, user, isInFavorites, toggleFavorite, navigate]);

  // Функции для управления количеством
  const decreaseQuantity = useCallback(() => {
    if (isInCart) {
      updateCartQuantityHandler(cartQuantity - 1);
    } else {
      setCartQuantity(prev => Math.max(1, prev - 1));
    }
  }, [isInCart, cartQuantity, updateCartQuantityHandler]);

  const increaseQuantity = useCallback(() => {
    if (!equipment) return;
    
    if (isInCart) {
      updateCartQuantityHandler(cartQuantity + 1);
    } else {
      setCartQuantity(prev => Math.min(equipment.stock, prev + 1));
    }
  }, [isInCart, cartQuantity, equipment, updateCartQuantityHandler]);

  return {
    // Состояние
    equipment,
    loading,
    error,
    activeImage,
    cartQuantity,
    addingToCart,
    addingToFavorites,
    
    // Логика
    isInCart,
    isInFavorites,
    currentCartItem,
    
    // Обработчики
    setActiveImage,
    addToCartHandler,
    removeFromCartHandler,
    toggleFavoriteHandler,
    decreaseQuantity,
    increaseQuantity,
    
    // Навигация
    navigate
  };
}