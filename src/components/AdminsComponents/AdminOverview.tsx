import { useEffect, useState } from "react";
import {
  BarChart,
  Bar,
  XAxis,
  YAxis,
  CartesianGrid,
  Tooltip,
  Legend,
  ResponsiveContainer,
} from "recharts";
import type { AnalyticsData } from "../types";

interface AdminOverviewProps {
  analytics: AnalyticsData | null;
  setAnalytics: (analytics: AnalyticsData) => void;
}

export default function AdminOverview({ analytics, setAnalytics }: AdminOverviewProps) {
  const [loading, setLoading] = useState(true);
  const API = import.meta.env.VITE_API as string;

  useEffect(() => {
    loadAnalytics();
  }, []);

  const loadAnalytics = async () => {
    try {
      setLoading(true);
      const res = await fetch(`${API}/analytics/dashboard`, {
        credentials: "include",
      });

      if (!res.ok) {
        throw new Error(`HTTP error! status: ${res.status}`);
      }

      const data = await res.json();
      setAnalytics(
        data || {
          totalProducts: 0,
          totalViews: 0,
          totalOrders: 0,
          lowStock: 0,
          categories: [],
          popularProducts: [],
          recentPriceChanges: [],
          salesByCategory: {},
          dailyViews: {},
        }
      );
    } catch (error) {
      console.error("Error loading analytics:", error);
      setAnalytics({
        totalProducts: 0,
        totalViews: 0,
        totalOrders: 0,
        lowStock: 0,
        categories: [],
        popularProducts: [],
        recentPriceChanges: [],
        salesByCategory: {},
        dailyViews: {},
      });
    } finally {
      setLoading(false);
    }
  };

  if (loading) {
    return (
      <div style={{ padding: 20, textAlign: "center" }}>
        <p>Завантаження...</p>
      </div>
    );
  }

  if (!analytics) {
    return (
      <div style={{ padding: 20, textAlign: "center" }}>
        <p>Помилка завантаження аналітики</p>
        <button onClick={loadAnalytics}>Спробувати знову</button>
      </div>
    );
  }

  return (
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
  );
}