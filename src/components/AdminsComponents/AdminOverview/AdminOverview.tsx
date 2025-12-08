// src/pages/AdminPage/components/AdminOverview/AdminOverview.tsx
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
          {/* Chart будет рендериться в logic файле */}
        </div>
      </div>
    </div>
  );
}
