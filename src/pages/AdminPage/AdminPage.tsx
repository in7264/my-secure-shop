import { useState } from "react";
import type { AnalyticsData, Equipment } from "../../types";
import AdminAnalytics from "../../components/AdminsComponents/AdminAnalytics";
import AdminOverview from "../../components/AdminsComponents/AdminOverview";
import AdminProducts from "../../components/AdminsComponents/AdminProducts";

export default function AdminPage() {
  const [activeTab, setActiveTab] = useState("overview");
  const [analytics, setAnalytics] = useState<AnalyticsData | null>(null);
  const [equipmentList, setEquipmentList] = useState<Equipment[]>([]);
  const [showAddModal, setShowAddModal] = useState(false);
  const [showEditModal, setShowEditModal] = useState(false);
  const [showDeleteModal, setShowDeleteModal] = useState(false);
  const [selectedEquipment, setSelectedEquipment] = useState<Equipment | null>(
    null
  );

  const handleTabChange = (tab: string) => {
    setActiveTab(tab);
  };

  return (
    <div style={{ padding: 20, maxWidth: 1200, margin: "0 auto" }}>
      <h1>Адмін-панель 📊</h1>

      {/* Навигация */}
      <div style={{ marginBottom: 20, borderBottom: "1px solid #ddd" }}>
        <button
          onClick={() => handleTabChange("overview")}
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
          onClick={() => handleTabChange("products")}
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
          onClick={() => handleTabChange("analytics")}
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

      {/* Контент вкладок */}
      {activeTab === "overview" && (
        <AdminOverview analytics={analytics} setAnalytics={setAnalytics} />
      )}

      {activeTab === "products" && (
        <AdminProducts
          equipmentList={equipmentList}
          setEquipmentList={setEquipmentList}
          showAddModal={showAddModal}
          setShowAddModal={setShowAddModal}
          showEditModal={showEditModal}
          setShowEditModal={setShowEditModal}
          showDeleteModal={showDeleteModal}
          setShowDeleteModal={setShowDeleteModal}
          selectedEquipment={selectedEquipment}
          setSelectedEquipment={setSelectedEquipment}
        />
      )}

      {activeTab === "analytics" && <AdminAnalytics analytics={analytics} />}
    </div>
  );
}
