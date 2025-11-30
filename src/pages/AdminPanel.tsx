import React, { useEffect, useState } from "react";
import {
  BarChart,
  Bar,
  XAxis,
  YAxis,
  CartesianGrid,
  Tooltip,
  Legend,
  ResponsiveContainer,
  LineChart,
  Line,
  PieChart,
  Pie,
  Cell,
} from "recharts";

interface AnalyticsData {
  totalProducts: number;
  totalViews: number;
  totalOrders: number;
  lowStock: number;
  categories: string[];
  popularProducts: Array<{
    id: number;
    name: string;
    views: number;
    orders: number;
    stock: number;
    price: number;
  }>;
  recentPriceChanges: Array<{
    equipment_id: number;
    old_price: number;
    new_price: number;
    changed_at: string;
  }>;
  salesByCategory: Record<string, number>;
  dailyViews: Record<string, number>;
}

const COLORS = ["#0088FE", "#00C49F", "#FFBB28", "#FF8042", "#8884D8"];

export default function AdminPanel() {
  const [analytics, setAnalytics] = useState<AnalyticsData | null>(null);
  const [loading, setLoading] = useState(true);
  const [activeTab, setActiveTab] = useState("overview");

  const API = import.meta.env.VITE_API as string;

  useEffect(() => {
    loadAnalytics();
  }, []);

  const loadAnalytics = async () => {
    try {
      const res = await fetch(`${API}/analytics/dashboard`);
      const data = await res.json();
      setAnalytics(data);
    } catch (error) {
      console.error("Error loading analytics:", error);
    } finally {
      setLoading(false);
    }
  };

  if (loading) {
    return (
      <div style={{ padding: 20, textAlign: "center" }}>
        <h1>Адмін-панель</h1>
        <p>Завантаження аналітики...</p>
      </div>
    );
  }

  if (!analytics) {
    return (
      <div style={{ padding: 20, textAlign: "center" }}>
        <h1>Адмін-панель</h1>
        <p>Помилка завантаження аналітики</p>
        <button onClick={loadAnalytics}>Спробувати знову</button>
      </div>
    );
  }

  // Преобразуем данные для графиков
  const dailyViewsData = Object.entries(analytics.dailyViews)
    .map(([date, views]) => ({ date, views }))
    .sort((a, b) => a.date.localeCompare(b.date));

  const salesByCategoryData = Object.entries(analytics.salesByCategory).map(
    ([category, sales]) => ({ category, sales })
  );

  return (
    <div style={{ padding: 20, maxWidth: 1200, margin: "0 auto" }}>
      <h1>Адмін-панель 📊</h1>

      {/* Навигация */}
      <div style={{ marginBottom: 20, borderBottom: "1px solid #ddd" }}>
        <button
          onClick={() => setActiveTab("overview")}
          style={{
            padding: "10px 20px",
            marginRight: 10,
            backgroundColor:
              activeTab === "overview" ? "#007bff" : "transparent",
            color: activeTab === "overview" ? "white" : "#007bff",
            border: "1px solid #007bff",
            borderRadius: "5px",
            cursor: "pointer",
          }}
        >
          Огляд
        </button>
        <button
          onClick={() => setActiveTab("products")}
          style={{
            padding: "10px 20px",
            marginRight: 10,
            backgroundColor:
              activeTab === "products" ? "#007bff" : "transparent",
            color: activeTab === "products" ? "white" : "#007bff",
            border: "1px solid #007bff",
            borderRadius: "5px",
            cursor: "pointer",
          }}
        >
          Товари
        </button>
        <button
          onClick={() => setActiveTab("analytics")}
          style={{
            padding: "10px 20px",
            backgroundColor:
              activeTab === "analytics" ? "#007bff" : "transparent",
            color: activeTab === "analytics" ? "white" : "#007bff",
            border: "1px solid #007bff",
            borderRadius: "5px",
            cursor: "pointer",
          }}
        >
          Аналітика
        </button>
      </div>

      {activeTab === "overview" && (
        <div>
          {/* Статистические карточки */}
          <div
            style={{
              display: "grid",
              gridTemplateColumns: "repeat(auto-fit, minmax(200px, 1fr))",
              gap: 20,
              marginBottom: 30,
            }}
          >
            <div
              style={{
                padding: 20,
                backgroundColor: "#f8f9fa",
                borderRadius: 8,
                textAlign: "center",
              }}
            >
              <h3 style={{ margin: 0, color: "#007bff" }}>
                {analytics.totalProducts}
              </h3>
              <p style={{ margin: 0 }}>Всього товарів</p>
            </div>
            <div
              style={{
                padding: 20,
                backgroundColor: "#f8f9fa",
                borderRadius: 8,
                textAlign: "center",
              }}
            >
              <h3 style={{ margin: 0, color: "#28a745" }}>
                {analytics.totalViews}
              </h3>
              <p style={{ margin: 0 }}>Переглядів</p>
            </div>
            <div
              style={{
                padding: 20,
                backgroundColor: "#f8f9fa",
                borderRadius: 8,
                textAlign: "center",
              }}
            >
              <h3 style={{ margin: 0, color: "#ffc107" }}>
                {analytics.totalOrders}
              </h3>
              <p style={{ margin: 0 }}>Замовлень</p>
            </div>
            <div
              style={{
                padding: 20,
                backgroundColor: "#f8f9fa",
                borderRadius: 8,
                textAlign: "center",
              }}
            >
              <h3 style={{ margin: 0, color: "#dc3545" }}>
                {analytics.lowStock}
              </h3>
              <p style={{ margin: 0 }}>Мало на складі</p>
            </div>
          </div>

          {/* Популярные товары */}
          <div
            style={{
              backgroundColor: "white",
              padding: 20,
              borderRadius: 8,
              boxShadow: "0 2px 4px rgba(0,0,0,0.1)",
            }}
          >
            <h3>Найпопулярніші товари</h3>
            <div style={{ height: 300 }}>
              <ResponsiveContainer width="100%" height="100%">
                <BarChart data={analytics.popularProducts.slice(0, 5)}>
                  <CartesianGrid strokeDasharray="3 3" />
                  <XAxis
                    dataKey="name"
                    angle={-45}
                    textAnchor="end"
                    height={80}
                  />
                  <YAxis />
                  <Tooltip />
                  <Legend />
                  <Bar dataKey="views" fill="#0088FE" name="Перегляди" />
                  <Bar dataKey="orders" fill="#00C49F" name="Замовлення" />
                </BarChart>
              </ResponsiveContainer>
            </div>
          </div>
        </div>
      )}

      {activeTab === "products" && (
        <div>
          <h3>Всі товари</h3>
          <div style={{ display: "grid", gap: 15 }}>
            {analytics.popularProducts.map((product) => (
              <div
                key={product.id}
                style={{
                  padding: 15,
                  border: "1px solid #ddd",
                  borderRadius: 8,
                  display: "grid",
                  gridTemplateColumns: "1fr auto auto",
                  gap: 10,
                  alignItems: "center",
                }}
              >
                <div>
                  <strong>{product.name}</strong>
                  <div style={{ fontSize: 14, color: "#666" }}>
                    Ціна: {product.price} ₴ | На складі: {product.stock}
                  </div>
                </div>
                <div style={{ textAlign: "center" }}>
                  <div style={{ fontWeight: "bold", color: "#0088FE" }}>
                    {product.views}
                  </div>
                  <div style={{ fontSize: 12, color: "#666" }}>переглядів</div>
                </div>
                <div style={{ textAlign: "center" }}>
                  <div style={{ fontWeight: "bold", color: "#00C49F" }}>
                    {product.orders}
                  </div>
                  <div style={{ fontSize: 12, color: "#666" }}>замовлень</div>
                </div>
              </div>
            ))}
          </div>
        </div>
      )}

      {activeTab === "analytics" && (
        <div style={{ display: "grid", gap: 20 }}>
          {/* График просмотров по дням */}
          <div
            style={{
              backgroundColor: "white",
              padding: 20,
              borderRadius: 8,
              boxShadow: "0 2px 4px rgba(0,0,0,0.1)",
            }}
          >
            <h3>Перегляди по дням</h3>
            <div style={{ height: 300 }}>
              <ResponsiveContainer width="100%" height="100%">
                <LineChart data={dailyViewsData}>
                  <CartesianGrid strokeDasharray="3 3" />
                  <XAxis dataKey="date" />
                  <YAxis />
                  <Tooltip />
                  <Legend />
                  <Line
                    type="monotone"
                    dataKey="views"
                    stroke="#0088FE"
                    name="Перегляди"
                  />
                </LineChart>
              </ResponsiveContainer>
            </div>
          </div>

          {/* Продажи по категориям */}
          <div
            style={{
              backgroundColor: "white",
              padding: 20,
              borderRadius: 8,
              boxShadow: "0 2px 4px rgba(0,0,0,0.1)",
            }}
          >
            <h3>Продажі по категоріям</h3>
            <div style={{ height: 300 }}>
              <ResponsiveContainer width="100%" height="100%">
                <PieChart>
                  <Pie
                    data={salesByCategoryData}
                    cx="50%"
                    cy="50%"
                    labelLine={false}
                    label={({ category, sales }) => `${category}: ${sales}`}
                    outerRadius={80}
                    fill="#8884d8"
                    dataKey="sales"
                  >
                    {salesByCategoryData.map((entry, index) => (
                      <Cell
                        key={`cell-${index}`}
                        fill={COLORS[index % COLORS.length]}
                      />
                    ))}
                  </Pie>
                  <Tooltip />
                </PieChart>
              </ResponsiveContainer>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
