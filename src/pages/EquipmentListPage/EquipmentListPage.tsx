/* eslint-disable react-hooks/exhaustive-deps */
import { useEffect, useState } from "react";
import { useParams, Link, useNavigate } from "react-router-dom"; // Добавьте useNavigate
import type { Equipment } from "../../types/index";

export default function EquipmentList() {
  const [items, setItems] = useState<Equipment[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const { category } = useParams<{ category: string }>();
  const navigate = useNavigate(); // Добавьте эту строку

  const API = import.meta.env.VITE_API as string;

  useEffect(() => {
    loadItems();
  }, [category]);

  async function loadItems() {
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
  }

  // Функция для добавления в корзину
  const addToCart = async (equipmentId: number) => {
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
        navigate("/auth"); // Теперь navigate доступен
      } else {
        const errorData = await res.json();
        alert("Помилка: " + (errorData.error || "Не вдалося додати до кошика"));
      }
    } catch (error) {
      console.error("Error adding to cart:", error);
      alert("Помилка при додаванні до кошика");
    }
  };

  // Функция для добавления/удаления из избранного
  const toggleFavorite = async (equipmentId: number) => {
    try {
      // Проверяем сначала, есть ли в избранном
      const checkRes = await fetch(
        `${API}/user/favorites/${equipmentId}/check`,
        {
          credentials: "include",
        }
      );

      if (checkRes.ok) {
        const { isFavorite } = await checkRes.json();

        if (isFavorite) {
          // Удаляем
          await fetch(`${API}/user/favorites/${equipmentId}`, {
            method: "DELETE",
            credentials: "include",
          });
          alert("Видалено з обраного");
        } else {
          // Добавляем
          const res = await fetch(`${API}/user/favorites/${equipmentId}`, {
            method: "POST",
            credentials: "include",
          });

          if (res.ok) {
            alert("Додано до обраного!");
          } else if (res.status === 401) {
            alert("Будь ласка, увійдіть в систему");
            navigate("/auth"); // Теперь navigate доступен
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

  return (
    <div style={{ padding: 20 }}>
      <div style={{ marginBottom: "20px" }}>
        <Link to="/equipment" style={{ marginRight: "10px" }}>
          ← Всі категорії
        </Link>
        <h2 style={{ display: "inline", marginLeft: "10px" }}>
          {category
            ? `Обладнання: ${decodeURIComponent(category)}`
            : "Всі обладнання"}
        </h2>
      </div>

      {loading ? (
        <p>Завантаження...</p>
      ) : error ? (
        <div>
          <p style={{ color: "red" }}>{error}</p>
          <button onClick={loadItems}>Спробувати знову</button>
        </div>
      ) : (
        <div>
          {items.length === 0 ? (
            <p>Обладнання не знайдено</p>
          ) : (
            items.map((it) => (
              <Link
                key={it.id}
                to={`/equipment/item/${it.id}`}
                style={{
                  textDecoration: "none",
                  color: "inherit",
                  display: "block",
                }}
              >
                <div
                  style={{
                    border: "1px solid #ddd",
                    borderRadius: "8px",
                    padding: "15px",
                    marginBottom: "15px",
                    backgroundColor: "#fff",
                    boxShadow: "0 2px 4px rgba(0,0,0,0.1)",
                    transition: "transform 0.2s, box-shadow 0.2s",
                    cursor: "pointer",
                  }}
                  onMouseEnter={(e) => {
                    e.currentTarget.style.transform = "translateY(-2px)";
                    e.currentTarget.style.boxShadow =
                      "0 4px 8px rgba(0,0,0,0.15)";
                  }}
                  onMouseLeave={(e) => {
                    e.currentTarget.style.transform = "translateY(0)";
                    e.currentTarget.style.boxShadow =
                      "0 2px 4px rgba(0,0,0,0.1)";
                  }}
                >
                  {/* Добавьте изображение если есть */}
                  {it.images && (
                    <img
                      src={Array.isArray(it.images) ? it.images[0] : it.images}
                      alt={it.name}
                      style={{
                        width: "100%",
                        height: "200px",
                        objectFit: "cover",
                        borderRadius: "4px",
                        marginBottom: "10px",
                      }}
                    />
                  )}

                  <h3 style={{ margin: "0 0 10px 0", color: "#333" }}>
                    {it.name} — {it.price} ₴
                  </h3>
                  <p style={{ margin: "0 0 10px 0", color: "#666" }}>
                    {it.description}
                  </p>
                  <small
                    style={{ color: it.stock > 0 ? "#28a745" : "#dc3545" }}
                  >
                    {it.stock > 0
                      ? `В наявності: ${it.stock}`
                      : "Немає в наявності"}
                  </small>

                  {/* Кнопки быстрого добавления */}
                  <div
                    style={{ display: "flex", gap: "5px", marginTop: "10px" }}
                  >
                    <button
                      onClick={(e) => {
                        e.preventDefault();
                        e.stopPropagation();
                        addToCart(it.id);
                      }}
                      style={{
                        padding: "5px 10px",
                        backgroundColor: "#28a745",
                        color: "white",
                        border: "none",
                        borderRadius: "4px",
                        cursor: "pointer",
                        fontSize: "12px",
                      }}
                    >
                      🛒
                    </button>
                    <button
                      onClick={(e) => {
                        e.preventDefault();
                        e.stopPropagation();
                        toggleFavorite(it.id);
                      }}
                      style={{
                        padding: "5px 10px",
                        backgroundColor: "#ffc107",
                        color: "white",
                        border: "none",
                        borderRadius: "4px",
                        cursor: "pointer",
                        fontSize: "12px",
                      }}
                    >
                      ★
                    </button>
                  </div>

                  {it.category && (
                    <div style={{ marginTop: "8px" }}>
                      <span
                        style={{
                          backgroundColor: "#007bff",
                          color: "white",
                          padding: "2px 8px",
                          borderRadius: "12px",
                          fontSize: "12px",
                        }}
                      >
                        {it.category}
                      </span>
                    </div>
                  )}
                </div>
              </Link>
            ))
          )}
        </div>
      )}
    </div>
  );
}
