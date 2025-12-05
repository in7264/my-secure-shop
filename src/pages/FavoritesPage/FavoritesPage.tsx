/* eslint-disable react-hooks/exhaustive-deps */
import { useEffect, useState } from "react";
import { Link, useNavigate } from "react-router-dom";
import type { Favorite } from "../../types";
import { useAppState } from "../../contexts/AppContext";
import { useAppActions } from "../../hooks/useAppActions";

export default function FavoritesPage() {
  const { favorites } = useAppState();
  const { toggleFavorite } = useAppActions();
  const [loading, setLoading] = useState(true);
  const navigate = useNavigate();
  const API = import.meta.env.VITE_API as string;

  useEffect(() => {
    loadFavorites();
  }, []);

  const loadFavorites = async () => {
    try {
      setLoading(true);
      const res = await fetch(`${API}/user/favorites`, {
        method: "GET",
        credentials: "include",
      });

      if (res.ok) {
        const data = await res.json();
        toggleFavorite(data.favorites || []);
      }
    } catch (error) {
      console.error("Error loading favorites:", error);
    } finally {
      setLoading(false);
    }
  };

  const removeFromFavorites = async (equipmentId: number) => {
    try {
      const res = await fetch(`${API}/user/favorites/${equipmentId}`, {
        method: "DELETE",
        credentials: "include",
      });

      if (res.ok) {
        toggleFavorite(
          favorites.filter((fav) => fav.equipment.id !== equipmentId)
        );
        alert("Видалено з обраного");
        window.dispatchEvent(new Event("favoritesUpdated"));
      }
    } catch (error) {
      console.error("Error removing from favorites:", error);
    }
  };

  const addToCart = async (equipment: Favorite["equipment"]) => {
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
        window.dispatchEvent(new Event("cartUpdated"));
      } else if (res.status === 401) {
        alert("Будь ласка, увійдіть в систему");
        navigate("/auth");
      }
    } catch (error) {
      console.error("Error adding to cart:", error);
    }
  };

  if (loading) {
    return (
      <div style={{ padding: "2rem", textAlign: "center" }}>
        <p>Завантаження...</p>
      </div>
    );
  }

  if (favorites.length === 0) {
    return (
      <div style={{ padding: "2rem", textAlign: "center" }}>
        <h1>Список обраного порожній</h1>
        <p>Додайте товари до обраного, щоб повернутися до них пізніше</p>
        <Link
          to="/equipment"
          style={{
            padding: "0.5rem 1rem",
            backgroundColor: "#007bff",
            color: "white",
            textDecoration: "none",
            borderRadius: "4px",
          }}
        >
          Перейти до каталогу
        </Link>
      </div>
    );
  }

  return (
    <div style={{ padding: "2rem", maxWidth: "1200px", margin: "0 auto" }}>
      <h1>Обране ({favorites.length} товарів)</h1>

      <div
        style={{
          display: "grid",
          gridTemplateColumns: "repeat(auto-fill, minmax(300px, 1fr))",
          gap: "1.5rem",
          marginTop: "2rem",
        }}
      >
        {favorites.map((fav) => (
          <div
            key={fav.id}
            style={{
              border: "1px solid #ddd",
              borderRadius: "8px",
              padding: "1rem",
              display: "flex",
              flexDirection: "column",
              gap: "1rem",
            }}
          >
            <Link
              to={`/equipment/item/${fav.equipment.id}`}
              style={{ textDecoration: "none", color: "inherit" }}
            >
              {fav.equipment.main_image && (
                <img
                  src={fav.equipment.main_image}
                  alt={fav.equipment.name}
                  style={{
                    width: "100%",
                    height: "200px",
                    objectFit: "cover",
                    borderRadius: "4px",
                  }}
                />
              )}

              <h3 style={{ margin: "0.5rem 0" }}>{fav.equipment.name}</h3>

              <p
                style={{
                  color: "#666",
                  margin: "0 0 0.5rem 0",
                  fontSize: "0.9rem",
                  display: "-webkit-box",
                  WebkitLineClamp: 2,
                  WebkitBoxOrient: "vertical",
                  overflow: "hidden",
                }}
              >
                {fav.equipment.description}
              </p>

              <div
                style={{
                  display: "flex",
                  justifyContent: "space-between",
                  alignItems: "center",
                }}
              >
                <span
                  style={{
                    color: "#007bff",
                    fontWeight: "bold",
                    fontSize: "1.25rem",
                  }}
                >
                  {fav.equipment.price} ₴
                </span>

                <span
                  style={{
                    color: fav.equipment.stock > 0 ? "#28a745" : "#dc3545",
                    fontSize: "0.9rem",
                  }}
                >
                  {fav.equipment.stock > 0
                    ? "В наявності"
                    : "Немає в наявності"}
                </span>
              </div>
            </Link>

            <div
              style={{
                display: "flex",
                gap: "0.5rem",
                marginTop: "auto",
              }}
            >
              <button
                onClick={() => addToCart(fav.equipment)}
                disabled={fav.equipment.stock === 0}
                style={{
                  flex: 1,
                  padding: "0.5rem",
                  backgroundColor:
                    fav.equipment.stock > 0 ? "#28a745" : "#6c757d",
                  color: "white",
                  border: "none",
                  borderRadius: "4px",
                  cursor: fav.equipment.stock > 0 ? "pointer" : "not-allowed",
                }}
              >
                До кошика
              </button>

              <button
                onClick={() => removeFromFavorites(fav.equipment.id)}
                style={{
                  padding: "0.5rem",
                  backgroundColor: "#dc3545",
                  color: "white",
                  border: "none",
                  borderRadius: "4px",
                  cursor: "pointer",
                }}
              >
                Видалити
              </button>
            </div>
          </div>
        ))}
      </div>
    </div>
  );
}
