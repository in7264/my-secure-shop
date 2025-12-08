// src/pages/AdminPage/components/AdminProducts/AdminProducts.tsx
import { useState, useEffect } from "react";
import { useAdminProductsLogic } from "./AdminProducts.logic";
import "./AdminProducts.styles.scss";
import type { Equipment, EquipmentFormData } from "../../../types";
import AddEditModal from "../../AddEditModal";
import DeleteModal from "../../DeleteModal";

interface AdminProductsProps {
  equipmentList: Equipment[];
  setEquipmentList: (list: Equipment[]) => void;
  showAddModal: boolean;
  setShowAddModal: (show: boolean) => void;
  showEditModal: boolean;
  setShowEditModal: (show: boolean) => void;
  showDeleteModal: boolean;
  setShowDeleteModal: (show: boolean) => void;
  selectedEquipment: Equipment | null;
  setSelectedEquipment: (equipment: Equipment | null) => void;
}

export default function AdminProducts({
  equipmentList,
  setEquipmentList,
  showAddModal,
  setShowAddModal,
  showEditModal,
  setShowEditModal,
  showDeleteModal,
  setShowDeleteModal,
  selectedEquipment,
  setSelectedEquipment,
}: AdminProductsProps) {
  const [formData, setFormData] = useState<EquipmentFormData>({
    name: "",
    description: "",
    price: "",
    stock: "",
    category: "",
    images: "",
  });

  const {
    loading,
    loadEquipmentList,
    resetForm,
    openEditModal,
    openDeleteModal,
    handleAddEquipment,
    handleEditEquipment,
    handleDeleteEquipment,
  } = useAdminProductsLogic({
    setEquipmentList,
    setSelectedEquipment,
    setFormData,
    setShowEditModal,
    setShowDeleteModal,
  });

  // Автоматическое обновление списка при монтировании
  useEffect(() => {
    loadEquipmentList();
  }, [loadEquipmentList]);

  if (loading) {
    return (
      <div className="admin-products admin-products--loading">
        <p>Завантаження...</p>
      </div>
    );
  }

  const handleOpenEditModal = (equipment: Equipment) => {
    setSelectedEquipment(equipment);
    openEditModal(equipment);
  };

  const handleOpenDeleteModal = (equipment: Equipment) => {
    setSelectedEquipment(equipment);
    openDeleteModal(equipment);
  };

  const handleEditSubmit = (images?: string[], imagesToDelete?: string[]) => {
    if (!selectedEquipment) return;
    handleEditEquipment(images, imagesToDelete, selectedEquipment);
  };

  const handleDeleteConfirm = () => {
    if (!selectedEquipment) return;
    handleDeleteEquipment(selectedEquipment);
  };

  return (
    <div className="admin-products">
      <div className="admin-products__header">
        <h3 className="admin-products__title">
          Всі товари ({equipmentList.length})
        </h3>
        <button
          onClick={() => setShowAddModal(true)}
          className="admin-products__add-button"
        >
          + Додати товар
        </button>
      </div>

      <div className="admin-products__list">
        {equipmentList.map((product) => (
          <div key={product.id} className="admin-products__item">
            <div className="admin-products__item-info">
              <strong className="admin-products__item-name">
                {product.name}
              </strong>
              <div className="admin-products__item-details">
                Ціна: {product.price} ₴ | На складі: {product.stock} |
                Категорія: {product.category}
              </div>
              <div className="admin-products__item-views">
                Переглядів: {product.total_views || 0}
              </div>
            </div>
            <div className="admin-products__item-price">
              <div className="admin-products__item-price-value">
                {product.price} ₴
              </div>
              <div className="admin-products__item-price-label">ціна</div>
            </div>
            <div className="admin-products__item-stock">
              <div
                className={`admin-products__item-stock-value ${
                  product.stock > 5
                    ? "admin-products__item-stock-value--high"
                    : "admin-products__item-stock-value--low"
                }`}
              >
                {product.stock}
              </div>
              <div className="admin-products__item-stock-label">на складі</div>
            </div>
            <div className="admin-products__item-actions">
              <button
                onClick={() => handleOpenEditModal(product)}
                className="admin-products__action-button admin-products__action-button--edit"
              >
                Редагувати
              </button>
              <button
                onClick={() => handleOpenDeleteModal(product)}
                className="admin-products__action-button admin-products__action-button--delete"
              >
                Видалити
              </button>
            </div>
          </div>
        ))}
      </div>

      {/* Модальные окна */}
      {showAddModal && (
        <AddEditModal
          title="Додати новий товар"
          formData={formData}
          setFormData={setFormData}
          onSubmit={(images) => handleAddEquipment(images)}
          onClose={() => {
            setShowAddModal(false);
            resetForm();
          }}
        />
      )}

      {showEditModal && selectedEquipment && (
        <AddEditModal
          title={`Редагувати товар: ${selectedEquipment.name}`}
          formData={formData}
          setFormData={setFormData}
          onSubmit={handleEditSubmit}
          onClose={() => {
            setShowEditModal(false);
            resetForm();
            setSelectedEquipment(null);
          }}
          equipmentId={selectedEquipment.id}
        />
      )}

      {showDeleteModal && selectedEquipment && (
        <DeleteModal
          equipmentName={selectedEquipment.name}
          onConfirm={handleDeleteConfirm}
          onClose={() => {
            setShowDeleteModal(false);
            setSelectedEquipment(null);
          }}
        />
      )}
    </div>
  );
}
