import React, { useEffect, useState } from "react";
import { useParams, Link, useNavigate } from "react-router-dom";
import type { Equipment } from "../types/equipment";

export default function EquipmentDetail() {
  const [equipment, setEquipment] = useState<Equipment | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [activeImage, setActiveImage] = useState(0);

  const { id } = useParams<{ id: string }>();
  const navigate = useNavigate();
  const API = import.meta.env.VITE_API as string;

  useEffect(() => {
    if (id) {
      loadEquipment();
      trackView(); // Отслеживаем просмотр
    }
  }, [id]);

  async function loadEquipment() {
    try {
      setLoading(true);
      setError(null);

      const res = await fetch(`${API}/equipment/${id}`);

      if (!res.ok) {
        throw new Error(`HTTP error! status: ${res.status}`);
      }

      const data = await res.json();
      setEquipment(data.equipment);
    } catch (err) {
      console.error("Error loading equipment:", err);
      setError("Не вдалося завантажити інформацію про обладнання");
    } finally {
      setLoading(false);
    }
  }

  async function trackView() {
    try {
      await fetch(`${API}/equipment/${id}/view`, {
        method: "POST",
        credentials: "include",
      });
    } catch (error) {
      console.error("Error tracking view:", error);
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
    equipment.main_image || (images.length > 0 ? images[0] : null);

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

          <div style={{ display: "flex", gap: "10px", flexWrap: "wrap" }}>
            <button
              style={{
                padding: "12px 24px",
                backgroundColor: equipment.stock > 0 ? "#28a745" : "#6c757d",
                color: "white",
                border: "none",
                borderRadius: "6px",
                cursor: equipment.stock > 0 ? "pointer" : "not-allowed",
                fontSize: "16px",
                fontWeight: "bold",
              }}
              disabled={equipment.stock === 0}
            >
              {equipment.stock > 0 ? "Замовити" : "Немає в наявності"}
            </button>

            <button
              style={{
                padding: "12px 24px",
                backgroundColor: "transparent",
                color: "#007bff",
                border: "1px solid #007bff",
                borderRadius: "6px",
                cursor: "pointer",
                fontSize: "16px",
              }}
            >
              Додати до обраного
            </button>
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
