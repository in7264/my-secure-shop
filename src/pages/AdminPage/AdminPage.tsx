// src/pages/AdminPage/AdminPage.tsx
import AdminAnalytics from "../../components/AdminsComponents/AdminAnalytics/AdminAnalytics";
import AdminOverview from "../../components/AdminsComponents/AdminOverview/AdminOverview";
import AdminProducts from "../../components/AdminsComponents/AdminProducts/AdminProducts";
import { useAdminPageLogic } from "./AdminPage.logic";
import "./AdminPage.styles.scss";

export default function AdminPage() {
  const {
    activeTab,
    analytics,
    equipmentList,
    showAddModal,
    showEditModal,
    showDeleteModal,
    selectedEquipment,
    handleTabChange,
    setAnalytics,
    setEquipmentList,
    setShowAddModal,
    setShowEditModal,
    setShowDeleteModal,
    setSelectedEquipment,
  } = useAdminPageLogic();

  return (
    <div className="admin-page">
      <h1 className="admin-page__title">Адмін-панель 📊</h1>

      {/* Навигация */}
      <div className="admin-page__tabs">
        <button
          onClick={() => handleTabChange("overview")}
          className={`admin-page__tab ${
            activeTab === "overview" ? "admin-page__tab--active" : ""
          }`}
        >
          Огляд
        </button>
        <button
          onClick={() => handleTabChange("products")}
          className={`admin-page__tab ${
            activeTab === "products" ? "admin-page__tab--active" : ""
          }`}
        >
          Товари
        </button>
        <button
          onClick={() => handleTabChange("analytics")}
          className={`admin-page__tab ${
            activeTab === "analytics" ? "admin-page__tab--active" : ""
          }`}
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
