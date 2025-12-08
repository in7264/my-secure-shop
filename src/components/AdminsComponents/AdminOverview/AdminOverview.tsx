// src/pages/AdminPage/components/AdminOverview/AdminOverview.tsx
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
import { useAdminOverviewLogic } from "./AdminOverview.logic";
import "./AdminOverview.styles.scss";
import type { AnalyticsData } from "../../../types";

interface AdminOverviewProps {
  analytics: AnalyticsData | null;
  setAnalytics: (analytics: AnalyticsData) => void;
}

export default function AdminOverview({
  analytics,
  setAnalytics,
}: AdminOverviewProps) {
  const { loading, loadAnalytics } = useAdminOverviewLogic(setAnalytics);

  if (loading) {
    return (
      <div className="admin-overview admin-overview--loading">
        <p>Завантаження...</p>
      </div>
    );
  }

  if (!analytics) {
    return (
      <div className="admin-overview admin-overview--error">
        <p>Помилка завантаження аналітики</p>
        <button onClick={loadAnalytics} className="retry-button">
          Спробувати знову
        </button>
      </div>
    );
  }

  // Подготавливаем данные для графика
  const popularProductsData = analytics.popularProducts
    .slice(0, 5)
    .map((product) => ({
      name:
        product.name.length > 20
          ? product.name.substring(0, 20) + "..."
          : product.name,
      views: product.views,
      orders: product.orders,
    }));

  return (
    <div className="admin-overview">
      {/* Статистические карточки */}
      <div className="admin-overview__stats-grid">
        <div className="admin-overview__stat-card">
          <h3 className="admin-overview__stat-value admin-overview__stat-value--products">
            {analytics.totalProducts}
          </h3>
          <p className="admin-overview__stat-label">Всього товарів</p>
        </div>
        <div className="admin-overview__stat-card">
          <h3 className="admin-overview__stat-value admin-overview__stat-value--views">
            {analytics.totalViews}
          </h3>
          <p className="admin-overview__stat-label">Переглядів</p>
        </div>
        <div className="admin-overview__stat-card">
          <h3 className="admin-overview__stat-value admin-overview__stat-value--orders">
            {analytics.totalOrders}
          </h3>
          <p className="admin-overview__stat-label">Замовлень</p>
        </div>
        <div className="admin-overview__stat-card">
          <h3 className="admin-overview__stat-value admin-overview__stat-value--lowstock">
            {analytics.lowStock}
          </h3>
          <p className="admin-overview__stat-label">Мало на складі</p>
        </div>
      </div>

      {/* Популярные товары */}
      <div className="admin-overview__chart-container">
        <h3 className="admin-overview__chart-title">Найпопулярніші товари</h3>
        <div className="admin-overview__chart-wrapper">
          {popularProductsData.length > 0 ? (
            <ResponsiveContainer width="100%" height="100%">
              <BarChart
                data={popularProductsData}
                margin={{ top: 20, right: 30, left: 20, bottom: 60 }}
              >
                <CartesianGrid strokeDasharray="3 3" />
                <XAxis
                  dataKey="name"
                  angle={-45}
                  textAnchor="end"
                  height={80}
                  interval={0}
                />
                <YAxis />
                <Tooltip />
                <Legend />
                <Bar
                  dataKey="views"
                  fill="#0088FE"
                  name="Перегляди"
                  radius={[4, 4, 0, 0]}
                />
                <Bar
                  dataKey="orders"
                  fill="#00C49F"
                  name="Замовлення"
                  radius={[4, 4, 0, 0]}
                />
              </BarChart>
            </ResponsiveContainer>
          ) : (
            <div className="admin-overview__no-data">
              <p>Немає даних про популярні товари</p>
            </div>
          )}
        </div>
      </div>
    </div>
  );
}
