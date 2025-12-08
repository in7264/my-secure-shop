// src/pages/AdminPage/components/AdminAnalytics/AdminAnalytics.tsx
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
import { useAdminAnalyticsLogic } from "./AdminAnalytics.logic";
import "./AdminAnalytics.styles.scss";
import type {
  AnalyticsData,
  CategorySalesData,
  DailyViewData,
} from "../../../types";

interface AdminAnalyticsProps {
  analytics: AnalyticsData | null;
}

export default function AdminAnalytics({ analytics }: AdminAnalyticsProps) {
  const { dailyViewsData, salesByCategoryData, colors } =
    useAdminAnalyticsLogic(analytics);

  if (!analytics) {
    return (
      <div className="admin-analytics admin-analytics--empty">
        <p>Немає даних для аналітики</p>
      </div>
    );
  }

  // Функция для форматирования подписи пирога
  const renderCustomizedLabel = ({
    cx,
    cy,
    midAngle,
    innerRadius,
    outerRadius,
    percent,
    index,
  }: any) => {
    const RADIAN = Math.PI / 180;
    const radius = innerRadius + (outerRadius - innerRadius) * 0.5;
    const x = cx + radius * Math.cos(-midAngle * RADIAN);
    const y = cy + radius * Math.sin(-midAngle * RADIAN);

    return (
      <text
        x={x}
        y={y}
        fill="white"
        textAnchor={x > cx ? "start" : "end"}
        dominantBaseline="central"
      >
        {`${(percent * 100).toFixed(0)}%`}
      </text>
    );
  };

  return (
    <div className="admin-analytics">
      {/* График просмотров по дням */}
      <div className="admin-analytics__chart-container">
        <h3 className="admin-analytics__chart-title">Перегляди по дням</h3>
        <div className="admin-analytics__chart-wrapper">
          <ResponsiveContainer width="100%" height="100%">
            <LineChart data={dailyViewsData as DailyViewData[]}>
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
      <div className="admin-analytics__chart-container">
        <h3 className="admin-analytics__chart-title">Продажі по категоріям</h3>
        <div className="admin-analytics__chart-wrapper">
          <ResponsiveContainer width="100%" height="100%">
            <PieChart>
              <Pie
                data={salesByCategoryData as CategorySalesData[]}
                cx="50%"
                cy="50%"
                labelLine={false}
                label={renderCustomizedLabel}
                outerRadius={80}
                fill="#8884d8"
                dataKey="sales"
              >
                {(salesByCategoryData as CategorySalesData[]).map(
                  (_, index) => (
                    <Cell
                      key={`cell-${index}`}
                      fill={colors[index % colors.length]}
                    />
                  )
                )}
              </Pie>
              <Tooltip
                formatter={(value: number) => [`${value}`, "Продажі"]}
                labelFormatter={(label: string) => `Категорія: ${label}`}
              />
            </PieChart>
          </ResponsiveContainer>
        </div>
      </div>
    </div>
  );
}
