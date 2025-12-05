import {
  LineChart,
  Line,
  XAxis,
  YAxis,
  CartesianGrid,
  Tooltip,
  Legend,
  ResponsiveContainer,
  PieChart,
  Pie,
  Cell,
} from "recharts";
import type { AnalyticsData } from "../../types";

const COLORS = ["#0088FE", "#00C49F", "#FFBB28", "#FF8042", "#8884D8"];

interface AdminAnalyticsProps {
  analytics: AnalyticsData | null;
}

export default function AdminAnalytics({ analytics }: AdminAnalyticsProps) {
  if (!analytics) {
    return (
      <div style={{ padding: 20, textAlign: "center" }}>
        <p>Немає даних для аналітики</p>
      </div>
    );
  }

  // Преобразуем данные для графиков
  const dailyViewsData = analytics.dailyViews
    ? Object.entries(analytics.dailyViews)
        .map(([date, views]) => ({ date, views }))
        .sort((a, b) => a.date.localeCompare(b.date))
    : [];

  const salesByCategoryData = analytics.salesByCategory
    ? Object.entries(analytics.salesByCategory).map(([category, sales]) => ({
        category,
        sales,
      }))
    : [];

  return (
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
                label={({
                  category,
                  sales,
                }: {
                  category: string;
                  sales: number;
                }) => `${category}: ${sales}`}
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
  );
}