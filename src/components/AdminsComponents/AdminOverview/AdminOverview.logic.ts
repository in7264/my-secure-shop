// src/pages/AdminPage/components/AdminOverview/AdminOverview.logic.ts
import { useEffect, useState, useCallback } from "react";
import type { AnalyticsData } from "../../../types";

const API = import.meta.env.VITE_API as string;

export function useAdminOverviewLogic(
  setAnalytics: (analytics: AnalyticsData) => void
) {
  const [loading, setLoading] = useState(true);

  const loadAnalytics = useCallback(async () => {
    try {
      setLoading(true);
      const res = await fetch(`${API}/analytics/dashboard`, {
        credentials: "include",
      });

      if (!res.ok) {
        throw new Error(`HTTP error! status: ${res.status}`);
      }

      const data: AnalyticsData = await res.json();
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
      const defaultAnalytics: AnalyticsData = {
        totalProducts: 0,
        totalViews: 0,
        totalOrders: 0,
        lowStock: 0,
        categories: [],
        popularProducts: [],
        recentPriceChanges: [],
        salesByCategory: {},
        dailyViews: {},
      };
      setAnalytics(defaultAnalytics);
    } finally {
      setLoading(false);
    }
  }, [setAnalytics]);

  useEffect(() => {
    loadAnalytics();
  }, [loadAnalytics]);

  return {
    loading,
    loadAnalytics,
  };
}
