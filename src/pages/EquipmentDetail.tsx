/* eslint-disable react-hooks/exhaustive-deps */
import { useEffect, useState, useCallback, useRef } from "react";
import { useParams, Link, useNavigate } from "react-router-dom";
import type { Equipment, EquipmentDetailProps } from "../types/index";

export default function EquipmentDetail({
  onAddToCart,
  onRemoveFromCart,
  onUpdateCartQuantity,
  cartItems,
  favorites,
  onTrackView,
}: EquipmentDetailProps) {
  const [equipment, setEquipment] = useState<Equipment | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [activeImage, setActiveImage] = useState(0);
  const [cartQuantity, setCartQuantity] = useState(1);
  const [addingToCart, setAddingToCart] = useState(false);
  const [addingToFavorites, setAddingToFavorites] = useState(false);

  // Используем useRef вместо useState для hasTrackedView
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

  // Загрузка оборудования - используем useCallback
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
      if (!hasTrackedViewRef.current) {
        trackView();
      }
    } catch (err) {
      console.error("Error loading equipment:", err);
      setError("Не вдалося завантажити інформацію про обладнання");
    } finally {
      setLoading(false);
    }
  }, [id, API]);

  // Отслеживание просмотра
  const trackView = useCallback(async () => {
    if (!id || hasTrackedViewRef.current) return;

    try {
      await fetch(`${API}/equipment/${id}/view`, {
        method: "POST",
        credentials: "include",
      });
      hasTrackedViewRef.current = true;
    } catch (error) {
      console.error("Error tracking view:", error);
    }
  }, [id, API]);

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

  // Обновление количества в корзине
  useEffect(() => {
    if (currentCartItem) {
      setCartQuantity(currentCartItem.quantity);
    } else {
      setCartQuantity(1);
    }
  }, [currentCartItem]);

  useEffect(() => {
    if (id && equipment && !hasTrackedViewRef.current) {
      onTrackView(parseInt(id));
      hasTrackedViewRef.current = true;
    }
  }, [id, equipment, onTrackView]);

  // Остальные функции без изменений...
  async function addToCartHandler() {
    if (!equipment) return;

    setAddingToCart(true);
    try {
      onAddToCart(equipment, cartQuantity);
      alert("Товар додано до кошика!");
    } catch (error) {
      console.error("Error adding to cart:", error);
      alert("Помилка при додаванні до кошика");
    } finally {
      setAddingToCart(false);
    }
  }

  async function removeFromCartHandler() {
    if (!equipment) return;

    onRemoveFromCart(equipment.id);
    alert("Товар видалено з кошика!");
    setCartQuantity(1);
  }

  async function updateCartQuantityHandler(newQuantity: number) {
    if (!equipment || newQuantity < 1) return;

    onUpdateCartQuantity(equipment.id, newQuantity);
    setCartQuantity(newQuantity);
  }

  async function toggleFavoriteHandler() {
    if (!equipment) return;

    setAddingToFavorites(true);
    try {
      if (isInFavorites) {
        // Удаляем из избранного
        const res = await fetch(`${API}/user/favorites/${id}`, {
          method: "DELETE",
          credentials: "include",
        });

        if (res.ok) {
          alert("Видалено з обраного");
          window.dispatchEvent(new Event("favoritesUpdated"));
        }
      } else {
        // Добавляем в избранное
        const res = await fetch(`${API}/user/favorites/${id}`, {
          method: "POST",
          credentials: "include",
        });

        if (res.ok) {
          alert("Додано до обраного!");
          window.dispatchEvent(new Event("favoritesUpdated"));
        } else if (res.status === 401) {
          alert(
            "Будь ласка, увійдіть в систему щоб додавати товари до обраного"
          );
          navigate("/auth");
        }
      }
    } catch (error) {
      console.error("Error toggling favorite:", error);
      alert("Помилка при роботі з обраним");
    } finally {
      setAddingToFavorites(false);
    }
  }

  if (loading) {
    return (
      <div style={{ padding: 20, textAlign: "center" }}>
        <p>Завантаження...</p>
      </div>
    );
  }

  if (error || !equipment) {
    return (
      <div style={{ padding: 20, textAlign: "center" }}>
        <p style={{ color: "red" }}>{error || "Обладнання не знайдено"}</p>
        <button onClick={() => navigate(-1)}>Назад</button>
      </div>
    );
  }

  const images = equipment.images || [];
  const mainImage =
    equipment.main_image ||
    (Array.isArray(images) && images.length > 0 ? images[0] : null);

  return (
    <div style={{ padding: 20, maxWidth: 1200, margin: "0 auto" }}>
      {/* Хлебные крошки */}
      <div style={{ marginBottom: 20 }}>
        <Link to="/equipment" style={{ marginRight: "10px" }}>
          ← Каталог
        </Link>
        {equipment.category && (
          <>
            <Link
              to={`/equipment/category/${encodeURIComponent(
                equipment.category
              )}`}
              style={{ marginRight: "10px" }}
            >
              {equipment.category}
            </Link>
            <span>→</span>
          </>
        )}
        <span style={{ marginLeft: "10px", color: "#666" }}>
          {equipment.name}
        </span>
      </div>

      <div
        style={{
          display: "grid",
          gridTemplateColumns: "1fr 1fr",
          gap: 40,
          alignItems: "start",
        }}
      >
        {/* Блок с фотографиями */}
        <div>
          {mainImage ? (
            <div>
              <img
                src={mainImage}
                alt={equipment.name}
                style={{
                  width: "100%",
                  height: "400px",
                  objectFit: "cover",
                  borderRadius: "8px",
                  marginBottom: "10px",
                }}
              />

              {/* Миниатюры если есть дополнительные фото */}
              {images.length > 1 && (
                <div
                  style={{ display: "flex", gap: "10px", overflowX: "auto" }}
                >
                  {images.map((image, index) => (
                    <img
                      key={index}
                      src={image}
                      alt={`${equipment.name} ${index + 1}`}
                      style={{
                        width: "80px",
                        height: "80px",
                        objectFit: "cover",
                        borderRadius: "4px",
                        cursor: "pointer",
                        border:
                          activeImage === index
                            ? "2px solid #007bff"
                            : "1px solid #ddd",
                        opacity: activeImage === index ? 1 : 0.7,
                      }}
                      onClick={() => setActiveImage(index)}
                    />
                  ))}
                </div>
              )}
            </div>
          ) : (
            <div
              style={{
                width: "100%",
                height: "400px",
                backgroundColor: "#f8f9fa",
                display: "flex",
                alignItems: "center",
                justifyContent: "center",
                borderRadius: "8px",
                color: "#666",
              }}
            >
              Фото відсутнє
            </div>
          )}
        </div>

        {/* Блок с информацией */}
        <div>
          <h1 style={{ margin: "0 0 10px 0", fontSize: "28px" }}>
            {equipment.name}
          </h1>

          <div style={{ marginBottom: "20px" }}>
            <span
              style={{
                backgroundColor: "#007bff",
                color: "white",
                padding: "4px 12px",
                borderRadius: "16px",
                fontSize: "14px",
                fontWeight: "bold",
              }}
            >
              {equipment.price} ₴
            </span>
          </div>

          <div style={{ marginBottom: "20px" }}>
            <p
              style={{
                color: equipment.stock > 0 ? "#28a745" : "#dc3545",
                fontWeight: "bold",
                fontSize: "16px",
              }}
            >
              {equipment.stock > 0
                ? `✓ В наявності: ${equipment.stock} шт.`
                : "✗ Немає в наявності"}
            </p>
          </div>

          <div style={{ marginBottom: "20px" }}>
            <h3 style={{ margin: "0 0 10px 0" }}>Опис</h3>
            <p
              style={{
                lineHeight: "1.6",
                color: "#333",
                fontSize: "16px",
              }}
            >
              {equipment.description}
            </p>
          </div>

          <div
            style={{
              display: "grid",
              gridTemplateColumns: "repeat(auto-fit, minmax(150px, 1fr))",
              gap: "15px",
              marginBottom: "20px",
            }}
          >
            <div
              style={{
                padding: "15px",
                backgroundColor: "#f8f9fa",
                borderRadius: "8px",
                textAlign: "center",
              }}
            >
              <div style={{ fontWeight: "bold", color: "#007bff" }}>
                {equipment.total_views || 0}
              </div>
              <div style={{ fontSize: "14px", color: "#666" }}>переглядів</div>
            </div>

            <div
              style={{
                padding: "15px",
                backgroundColor: "#f8f9fa",
                borderRadius: "8px",
                textAlign: "center",
              }}
            >
              <div style={{ fontWeight: "bold", color: "#28a745" }}>
                {equipment.category}
              </div>
              <div style={{ fontSize: "14px", color: "#666" }}>категорія</div>
            </div>
          </div>

          {/* Блок управления корзиной и избранным */}
          <div style={{ marginBottom: "20px" }}>
            {isInCart ? (
              <div
                style={{
                  display: "flex",
                  alignItems: "center",
                  gap: "10px",
                  marginBottom: "10px",
                }}
              >
                <span style={{ fontWeight: "bold", color: "#28a745" }}>
                  ✓ В кошику
                </span>
                <div
                  style={{ display: "flex", alignItems: "center", gap: "5px" }}
                >
                  <button
                    onClick={() => updateCartQuantityHandler(cartQuantity - 1)}
                    disabled={cartQuantity <= 1}
                    style={{
                      width: "30px",
                      height: "30px",
                      border: "1px solid #ddd",
                      backgroundColor: "white",
                      borderRadius: "4px",
                      cursor: cartQuantity > 1 ? "pointer" : "not-allowed",
                    }}
                  >
                    -
                  </button>
                  <span style={{ padding: "0 10px", fontWeight: "bold" }}>
                    {cartQuantity}
                  </span>
                  <button
                    onClick={() => updateCartQuantityHandler(cartQuantity + 1)}
                    disabled={cartQuantity >= equipment.stock}
                    style={{
                      width: "30px",
                      height: "30px",
                      border: "1px solid #ddd",
                      backgroundColor: "white",
                      borderRadius: "4px",
                      cursor:
                        cartQuantity < equipment.stock
                          ? "pointer"
                          : "not-allowed",
                    }}
                  >
                    +
                  </button>
                </div>
                <button
                  onClick={removeFromCartHandler}
                  style={{
                    padding: "8px 16px",
                    backgroundColor: "#dc3545",
                    color: "white",
                    border: "none",
                    borderRadius: "6px",
                    cursor: "pointer",
                    fontSize: "14px",
                  }}
                >
                  Видалити
                </button>
              </div>
            ) : (
              <div
                style={{
                  display: "flex",
                  alignItems: "center",
                  gap: "10px",
                  marginBottom: "10px",
                }}
              >
                <div
                  style={{ display: "flex", alignItems: "center", gap: "5px" }}
                >
                  <span style={{ marginRight: "10px" }}>Кількість:</span>
                  <button
                    onClick={() =>
                      setCartQuantity(Math.max(1, cartQuantity - 1))
                    }
                    style={{
                      width: "30px",
                      height: "30px",
                      border: "1px solid #ddd",
                      backgroundColor: "white",
                      borderRadius: "4px",
                      cursor: "pointer",
                    }}
                  >
                    -
                  </button>
                  <span style={{ padding: "0 10px", fontWeight: "bold" }}>
                    {cartQuantity}
                  </span>
                  <button
                    onClick={() =>
                      setCartQuantity(
                        Math.min(equipment.stock, cartQuantity + 1)
                      )
                    }
                    style={{
                      width: "30px",
                      height: "30px",
                      border: "1px solid #ddd",
                      backgroundColor: "white",
                      borderRadius: "4px",
                      cursor: "pointer",
                    }}
                  >
                    +
                  </button>
                </div>
                <button
                  onClick={addToCartHandler}
                  disabled={addingToCart || equipment.stock === 0}
                  style={{
                    padding: "12px 24px",
                    backgroundColor:
                      equipment.stock > 0 ? "#28a745" : "#6c757d",
                    color: "white",
                    border: "none",
                    borderRadius: "6px",
                    cursor:
                      equipment.stock > 0 && !addingToCart
                        ? "pointer"
                        : "not-allowed",
                    fontSize: "16px",
                    fontWeight: "bold",
                  }}
                >
                  {addingToCart
                    ? "Додаємо..."
                    : equipment.stock > 0
                    ? "Додати до кошика"
                    : "Немає в наявності"}
                </button>
              </div>
            )}
          </div>

          <div style={{ display: "flex", gap: "10px", flexWrap: "wrap" }}>
            <button
              onClick={toggleFavoriteHandler}
              disabled={addingToFavorites}
              style={{
                padding: "12px 24px",
                backgroundColor: isInFavorites ? "#dc3545" : "transparent",
                color: isInFavorites ? "white" : "#007bff",
                border: `1px solid ${isInFavorites ? "#dc3545" : "#007bff"}`,
                borderRadius: "6px",
                cursor: addingToFavorites ? "not-allowed" : "pointer",
                fontSize: "16px",
                opacity: addingToFavorites ? 0.6 : 1,
              }}
            >
              {addingToFavorites
                ? "..."
                : isInFavorites
                ? "★ В обраному"
                : "☆ Додати до обраного"}
            </button>

            <Link
              to="/cart"
              style={{
                padding: "12px 24px",
                backgroundColor: "#007bff",
                color: "white",
                border: "none",
                borderRadius: "6px",
                cursor: "pointer",
                fontSize: "16px",
                textDecoration: "none",
                display: "inline-block",
                textAlign: "center",
              }}
            >
              Перейти до кошика
            </Link>
          </div>
        </div>
      </div>

      {/* Дополнительная информация */}
      <div
        style={{
          marginTop: "40px",
          paddingTop: "20px",
          borderTop: "1px solid #ddd",
        }}
      >
        <h3>Додаткова інформація</h3>
        <div
          style={{
            display: "grid",
            gridTemplateColumns: "repeat(auto-fit, minmax(200px, 1fr))",
            gap: "15px",
          }}
        >
          <div>
            <strong>ID товару:</strong> {equipment.id}
          </div>
          <div>
            <strong>Додано:</strong>{" "}
            {new Date(equipment.created_at).toLocaleDateString("uk-UA")}
          </div>
          <div>
            <strong>Категорія:</strong> {equipment.category}
          </div>
        </div>
      </div>
    </div>
  );
}
