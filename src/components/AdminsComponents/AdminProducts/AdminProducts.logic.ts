// src/pages/AdminPage/components/AdminProducts/AdminProducts.logic.ts
import { useEffect, useState, useCallback } from "react";
import type { Equipment, EquipmentFormData } from "../../../types";

const API = import.meta.env.VITE_API as string;

interface UseAdminProductsLogicProps {
  setEquipmentList: (list: Equipment[]) => void;
  setSelectedEquipment: (equipment: Equipment | null) => void;
  setFormData: (data: EquipmentFormData) => void;
  setShowEditModal: (show: boolean) => void;
  setShowDeleteModal: (show: boolean) => void;
}

export function useAdminProductsLogic({
  setEquipmentList,
  setSelectedEquipment,
  setFormData: externalSetFormData,
  setShowEditModal,
  setShowDeleteModal,
}: UseAdminProductsLogicProps) {
  const [loading, setLoading] = useState(true);
  const [internalFormData, setInternalFormData] = useState<EquipmentFormData>({
    name: "",
    description: "",
    price: "",
    stock: "",
    category: "",
    images: "",
  });

  const setFormData = (data: EquipmentFormData) => {
    setInternalFormData(data);
    externalSetFormData(data);
  };

  const checkServerConnection = useCallback(async () => {
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
  }, []);

  const loadEquipmentList = useCallback(async () => {
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
  }, [setEquipmentList]);

  useEffect(() => {
    checkServerConnection();
    loadEquipmentList();
  }, [checkServerConnection, loadEquipmentList]); // Добавлены зависимости

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

  const openEditModal = (equipment: Equipment) => {
    setSelectedEquipment(equipment);

    // Фильтруем blob URLs
    const existingImages = equipment.images
      ? equipment.images.filter(
          (img: string) => typeof img === "string" && !img.startsWith("blob:")
        )
      : [];

    setFormData({
      name: equipment.name,
      description: equipment.description || "",
      price: equipment.price.toString(),
      stock: equipment.stock.toString(),
      category: equipment.category,
      images: existingImages.join(", "),
    });
    setShowEditModal(true);
  };

  const openDeleteModal = (equipment: Equipment) => {
    setSelectedEquipment(equipment);
    setShowDeleteModal(true);
  };

  const handleAddEquipment = async (uploadedImages?: string[]) => {
    try {
      let imagesArray: string[] = [];

      if (uploadedImages && uploadedImages.length > 0) {
        imagesArray = uploadedImages;
      } else if (
        internalFormData.images &&
        internalFormData.images.trim() !== ""
      ) {
        imagesArray = internalFormData.images
          .split(",")
          .map((img: string) => img.trim())
          .filter((img: string) => img.length > 0);
      }

      const response = await fetch(`${API}/equipment`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          name: internalFormData.name,
          description: internalFormData.description,
          price: parseFloat(internalFormData.price),
          stock: parseInt(internalFormData.stock),
          category: internalFormData.category,
          images: imagesArray,
        }),
        credentials: "include",
      });

      const responseText = await response.text();

      try {
        const data = JSON.parse(responseText);

        if (response.ok) {
          alert(data.message || "Товар успешно добавлен");
          await loadEquipmentList();
          return true;
        } else {
          alert("Ошибка: " + (data.error || "Неизвестная ошибка"));
          return false;
        }
      } catch (jsonError) {
        console.error("Failed to parse JSON:", jsonError);
        alert("Неверный формат ответа от сервера");
        return false;
      }
    } catch (error: unknown) {
      console.error("Error adding equipment:", error);
      const errorMessage =
        error instanceof Error ? error.message : "Unknown error";
      alert("Ошибка при добавлении товара: " + errorMessage);
      return false;
    }
  };

  const handleEditEquipment = async (
    images?: string[],
    imagesToDelete?: string[],
    selectedEquipment?: Equipment | null
  ) => {
    if (!selectedEquipment) {
      alert("Не выбран товар для редактирования");
      return false;
    }

    try {
      let imagesArray: string[] = [];

      if (images && images.length > 0) {
        imagesArray = images;
      }

      const response = await fetch(`${API}/equipment/${selectedEquipment.id}`, {
        method: "PUT",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          name: internalFormData.name,
          description: internalFormData.description,
          price: parseFloat(internalFormData.price),
          stock: parseInt(internalFormData.stock),
          category: internalFormData.category,
          images: imagesArray,
          imagesToDelete: imagesToDelete || [],
        }),
        credentials: "include",
      });

      const responseText = await response.text();

      try {
        const data = JSON.parse(responseText);

        if (response.ok) {
          alert(data.message || "Товар успешно обновлен");
          await loadEquipmentList();
          return true;
        } else {
          alert("Ошибка: " + (data.error || "Неизвестная ошибка"));
          return false;
        }
      } catch (jsonError) {
        console.error("Failed to parse JSON:", jsonError);
        alert("Неверный формат ответа от сервера");
        return false;
      }
    } catch (error: unknown) {
      console.error("Error editing equipment:", error);
      const errorMessage =
        error instanceof Error ? error.message : "Unknown error";
      alert("Помилка при обновленні товара: " + errorMessage);
      return false;
    }
  };

  const handleDeleteEquipment = async (
    selectedEquipment?: Equipment | null
  ) => {
    if (!selectedEquipment) {
      alert("Не выбран товар для удаления");
      return false;
    }

    try {
      const response = await fetch(`${API}/equipment/${selectedEquipment.id}`, {
        method: "DELETE",
        credentials: "include",
      });

      if (response.ok) {
        const data = await response.json();
        alert(data.message || "Товар успешно удален");
        await loadEquipmentList();
        return true;
      } else {
        const errorData = await response.json();
        alert("Ошибка: " + errorData.error);
        return false;
      }
    } catch (error) {
      console.error("Error deleting equipment:", error);
      alert("Ошибка при удалении товара");
      return false;
    }
  };

  return {
    loading,
    formData: internalFormData,
    setFormData,
    loadEquipmentList,
    resetForm,
    openEditModal,
    openDeleteModal,
    handleAddEquipment,
    handleEditEquipment: (
      images?: string[],
      imagesToDelete?: string[],
      selectedEquipment?: Equipment | null
    ) => handleEditEquipment(images, imagesToDelete, selectedEquipment),
    handleDeleteEquipment: (selectedEquipment?: Equipment | null) =>
      handleDeleteEquipment(selectedEquipment),
  };
}
