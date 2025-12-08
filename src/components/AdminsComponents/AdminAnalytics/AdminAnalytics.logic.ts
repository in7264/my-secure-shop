// src/pages/AdminPage/components/AdminAnalytics/AdminAnalytics.logic.ts
import type { AnalyticsData } from "../../../types";

const COLORS = ["#0088FE", "#00C49F", "#FFBB28", "#FF8042", "#8884D8"];

export function useAdminAnalyticsLogic(analytics: AnalyticsData | null) {
  // Преобразуем данные для графиков
  const dailyViewsData = analytics?.dailyViews
    ? Object.entries(analytics.dailyViews)
        .map(([date, views]) => ({ date, views }))
        .sort((a, b) => a.date.localeCompare(b.date))
    : [];

  const salesByCategoryData = analytics?.salesByCategory
    ? Object.entries(analytics.salesByCategory).map(([category, sales]) => ({
        category,
        sales,
      }))
    : [];

  return {
    dailyViewsData,
    salesByCategoryData,
    colors: COLORS,
  };
}
