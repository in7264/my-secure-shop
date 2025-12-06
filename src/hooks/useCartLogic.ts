import { useState } from "react";
import { useAppState } from "../contexts/AppContext";
import { useAppActions } from "./useAppActions";
export function useCartLogic() {
  const { cartItems } = useAppState();
  const { updateCartQuantity, removeFromCart } = useAppActions();
  const [loading, setLoading] = useState(false);

  // Розрахунок загальної суми
  const calculateTotal = (): number => {
    return cartItems.reduce((total, item) => {
      return total + item.equipment.price * item.quantity;
    }, 0);
  };

  // Розрахунок загальної кількості товарів
  const calculateTotalItems = (): number => {
    return cartItems.reduce((total, item) => total + item.quantity, 0);
  };

  // Обробка оформлення замовлення
  const handleCheckout = async (): Promise<void> => {
    setLoading(true);
    try {
      // Тут буде логіка оформлення замовлення
      alert("Замовлення оформлено успішно!");

      // Очищаємо корзину після успішного замовлення
      cartItems.forEach((item) => removeFromCart(item.equipment.id));
    } catch (error) {
      console.error("Checkout error:", error);
      alert("Помилка при оформленні замовлення");
    } finally {
      setLoading(false);
    }
  };

  // Оновлення кількості товару
  const handleUpdateQuantity = (itemId: number, quantity: number): void => {
    updateCartQuantity(itemId, quantity);
  };

  // Видалення товару
  const handleRemoveItem = (itemId: number): void => {
    removeFromCart(itemId);
  };

  return {
    // Стан
    cartItems,
    loading,

    // Функції розрахунку
    calculateTotal,
    calculateTotalItems,

    // Обробники
    handleCheckout,
    handleUpdateQuantity,
    handleRemoveItem,

    // Утиліти
    isCartEmpty: cartItems.length === 0,
  };
}
