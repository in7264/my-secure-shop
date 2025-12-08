import { useState } from "react";
import type { AnalyticsData, Equipment } from "../../types";

export function useAdminPageLogic() {
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

  return {
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
  };
}