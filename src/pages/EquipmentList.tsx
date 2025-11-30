import { useEffect, useState } from "react";
import { useParams, Link } from "react-router-dom";
import type { Equipment } from "../types/equipment";

export default function EquipmentList() {
  const [items, setItems] = useState<Equipment[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const { category } = useParams<{ category: string }>();

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
                style={{ textDecoration: "none", color: "inherit" }}
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
                      src={it.images}
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
