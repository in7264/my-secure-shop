import { useEffect, useState } from "react";
import type { Equipment } from "../types";
import AddEditModal from "../components/AddEditModal";
import DeleteModal from "../components/DeleteModal";

const API = import.meta.env.VITE_API as string;
console.log("API URL:", API); // Добавьте эту строку для отладки

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
  const [loading, setLoading] = useState(true);
  const [formData, setFormData] = useState({
    name: "",
    description: "",
    price: "",
    stock: "",
    category: "",
    images: "",
  });

  const API = import.meta.env.VITE_API as string;

  useEffect(() => {
    loadEquipmentList();
  }, []);

  // В AdminProducts компоненте
  useEffect(() => {
    checkServerConnection();
    loadEquipmentList();
  }, []);

  const checkServerConnection = async () => {
    try {
      const response = await fetch(`${API}/`, {
        method: "GET",
        credentials: "include",
      });
      const text = await response.text();
      console.log("Server connection test:", {
        status: response.status,
        ok: response.ok,
        text: text.substring(0, 100),
      });
    } catch (error) {
      console.error("Server connection failed:", error);
      alert("Не удалось подключиться к серверу. Проверьте что сервер запущен.");
    }
  };

  const loadEquipmentList = async () => {
    try {
      setLoading(true);
      const res = await fetch(`${API}/equipment`);
      const data = await res.json();
      setEquipmentList(data.items || []);
    } catch (error) {
      console.error("Error loading equipment list:", error);
    } finally {
      setLoading(false);
    }
  };

  const resetForm = () => {
    setFormData({
      name: "",
      description: "",
      price: "",
      stock: "",
      category: "",
      images: "",
    });
  };

  // В AdminProducts.tsx при открытии модалки редактирования
  const openEditModal = (equipment: Equipment) => {
    setSelectedEquipment(equipment);

    // Фильтруем blob URLs, оставляем только реальные URL
    const existingImages = equipment.images
      ? equipment.images.filter(
          (img) => typeof img === "string" && !img.startsWith("blob:")
        )
      : [];

    setFormData({
      name: equipment.name,
      description: equipment.description || "",
      price: equipment.price.toString(),
      stock: equipment.stock.toString(),
      category: equipment.category,
      images: existingImages.join(", "), // Только реальные URL
    });
    setShowEditModal(true);
  };

  const openDeleteModal = (equipment: Equipment) => {
    setSelectedEquipment(equipment);
    setShowDeleteModal(true);
  };

  const handleAddEquipment = async (uploadedImages?: string[]) => {
    try {
      // Используем загруженные изображения или парсим из formData
      let imagesArray: string[] = [];

      if (uploadedImages && uploadedImages.length > 0) {
        imagesArray = uploadedImages;
      } else if (formData.images && formData.images.trim() !== "") {
        imagesArray = formData.images
          .split(",")
          .map((img) => img.trim())
          .filter((img) => img.length > 0);
      }

      console.log("Add data:", {
        name: formData.name,
        price: parseFloat(formData.price),
        stock: parseInt(formData.stock),
        category: formData.category,
        images: imagesArray,
      });

      const response = await fetch(`${API}/equipment`, {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify({
          name: formData.name,
          description: formData.description,
          price: parseFloat(formData.price),
          stock: parseInt(formData.stock),
          category: formData.category,
          images: imagesArray,
        }),
        credentials: "include",
      });

      const responseText = await response.text();
      console.log("Response status:", response.status);
      console.log("Response text:", responseText);

      try {
        const data = JSON.parse(responseText);

        if (response.ok) {
          alert(data.message || "Товар успешно добавлен");
          setShowAddModal(false);
          resetForm();
          loadEquipmentList();
        } else {
          alert("Ошибка: " + (data.error || "Неизвестная ошибка"));
        }
      } catch (jsonError) {
        console.error("Failed to parse JSON:", jsonError);
        alert("Неверный формат ответа от сервера");
      }
    } catch (error) {
      console.error("Error adding equipment:", error);
      alert("Ошибка при добавлении товара: " + error.message);
    }
  };

  // В AdminProducts.tsx, в функции handleEditEquipment
  const handleEditEquipment = async (
    images?: string[],
    imagesToDelete?: string[]
  ) => {
    if (!selectedEquipment) return;

    try {
      // Формируем массив изображений для отправки
      let imagesArray: string[] = [];

      if (images && images.length > 0) {
        // Используем загруженные изображения
        imagesArray = images;
      }

      console.log("Update data being sent to server:", {
        name: formData.name,
        price: parseFloat(formData.price),
        stock: parseInt(formData.stock),
        category: formData.category,
        images: imagesArray,
        imagesToDelete: imagesToDelete || [],
        imagesCount: imagesArray.length,
        equipmentId: selectedEquipment.id,
      });

      const response = await fetch(`${API}/equipment/${selectedEquipment.id}`, {
        method: "PUT",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify({
          name: formData.name,
          description: formData.description,
          price: parseFloat(formData.price),
          stock: parseInt(formData.stock),
          category: formData.category,
          images: imagesArray,
          imagesToDelete: imagesToDelete || [], // Добавляем массив для удаления
        }),
        credentials: "include",
      });

      const responseText = await response.text();
      console.log("Response status:", response.status);
      console.log("Full response text:", responseText);

      try {
        const data = JSON.parse(responseText);

        if (response.ok) {
          console.log("Server response equipment:", data.equipment);
          console.log("Images in response:", data.equipment.images);
          alert(data.message || "Товар успешно обновлен");
          setShowEditModal(false);
          resetForm();
          setSelectedEquipment(null);
          loadEquipmentList();
        } else {
          alert("Ошибка: " + (data.error || "Неизвестная ошибка"));
        }
      } catch (jsonError) {
        console.error("Failed to parse JSON:", jsonError);
        console.error("Raw response:", responseText);
        alert("Неверный формат ответа от сервера");
      }
    } catch (error: any) {
      console.error("Error editing equipment:", error);
      alert("Помилка при обновленні товара: " + error.message);
    }
  };

  const handleDeleteEquipment = async () => {
    if (!selectedEquipment) return;

    try {
      const response = await fetch(`${API}/equipment/${selectedEquipment.id}`, {
        method: "DELETE",
        credentials: "include",
      });

      if (response.ok) {
        const data = await response.json();
        alert(data.message || "Товар успешно удален");
        setShowDeleteModal(false);
        setSelectedEquipment(null);
        loadEquipmentList();
      } else {
        const errorData = await response.json();
        alert("Ошибка: " + errorData.error);
      }
    } catch (error) {
      console.error("Error deleting equipment:", error);
      alert("Ошибка при удалении товара");
    }
  };

  if (loading) {
    return (
      <div style={{ padding: 20, textAlign: "center" }}>
        <p>Завантаження...</p>
      </div>
    );
  }

  return (
    <div>
      <div
        style={{
          display: "flex",
          justifyContent: "space-between",
          alignItems: "center",
          marginBottom: 20,
        }}
      >
        <h3>Всі товари ({equipmentList.length})</h3>
        <button
          onClick={() => setShowAddModal(true)}
          style={{
            padding: "10px 20px",
            backgroundColor: "#28a745",
            color: "white",
            border: "none",
            borderRadius: "5px",
            cursor: "pointer",
          }}
        >
          + Додати товар
        </button>
      </div>

      <div style={{ display: "grid", gap: 15 }}>
        {equipmentList.map((product) => (
          <div
            key={product.id}
            style={{
              padding: 15,
              border: "1px solid #ddd",
              borderRadius: 8,
              display: "grid",
              gridTemplateColumns: "1fr auto auto auto",
              gap: 10,
              alignItems: "center",
            }}
          >
            <div>
              <strong>{product.name}</strong>
              <div style={{ fontSize: 14, color: "#666" }}>
                Ціна: {product.price} ₴ | На складі: {product.stock} |
                Категорія: {product.category}
              </div>
              <div style={{ fontSize: 12, color: "#888", marginTop: 5 }}>
                Переглядів: {product.total_views || 0}
              </div>
            </div>
            <div style={{ textAlign: "center" }}>
              <div style={{ fontWeight: "bold", color: "#0088FE" }}>
                {product.price} ₴
              </div>
              <div style={{ fontSize: 12, color: "#666" }}>ціна</div>
            </div>
            <div style={{ textAlign: "center" }}>
              <div
                style={{
                  fontWeight: "bold",
                  color: product.stock > 5 ? "#28a745" : "#dc3545",
                }}
              >
                {product.stock}
              </div>
              <div style={{ fontSize: 12, color: "#666" }}>на складі</div>
            </div>
            <div style={{ display: "flex", gap: "5px" }}>
              <button
                onClick={() => openEditModal(product)}
                style={{
                  padding: "5px 10px",
                  backgroundColor: "#007bff",
                  color: "white",
                  border: "none",
                  borderRadius: "4px",
                  cursor: "pointer",
                }}
              >
                Редагувати
              </button>
              <button
                onClick={() => openDeleteModal(product)}
                style={{
                  padding: "5px 10px",
                  backgroundColor: "#dc3545",
                  color: "white",
                  border: "none",
                  borderRadius: "4px",
                  cursor: "pointer",
                }}
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
          onSubmit={(images) => handleAddEquipment(images)} // Передаем images
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
          onSubmit={(images, imagesToDelete) =>
            handleEditEquipment(images, imagesToDelete)
          } // Обновлено
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
          onConfirm={handleDeleteEquipment}
          onClose={() => {
            setShowDeleteModal(false);
            setSelectedEquipment(null);
          }}
        />
      )}
    </div>
  );
}
