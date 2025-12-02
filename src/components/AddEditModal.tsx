import { useState, useRef, type ChangeEvent, useEffect } from "react";
import { storageService } from "../services/supabaseStorage";

interface AddEditModalProps {
  title: string;
  formData: {
    name: string;
    description: string;
    price: string;
    stock: string;
    category: string;
    images: string;
  };
  setFormData: (data: typeof AddEditModalProps.prototype.formData) => void;
  onSubmit: (images?: string[], imagesToDelete?: string[]) => void;
  onClose: () => void;
  equipmentId?: number;
}

export default function AddEditModal({
  title,
  formData,
  setFormData,
  onSubmit,
  onClose,
  equipmentId,
}: AddEditModalProps) {
  const [loading, setLoading] = useState(false);
  const [uploadingImages, setUploadingImages] = useState(false);
  const [uploadProgress, setUploadProgress] = useState(0);

  // Состояние для хранения существующих изображений (только URL)
  const [existingImages, setExistingImages] = useState<string[]>([]);

  // Состояние для хранения новых файлов изображений
  const [newImages, setNewImages] = useState<File[]>([]);

  // Состояние для хранения изображений, помеченных на удаление
  const [imagesToDelete, setImagesToDelete] = useState<string[]>([]);

  const imagesInputRef = useRef<HTMLInputElement>(null);

  // Инициализация существующих изображений при монтировании или изменении equipmentId
  useEffect(() => {
    if (equipmentId && formData.images) {
      // Разделяем строку с изображениями на массив
      const imagesArray = formData.images
        .split(",")
        .map((img) => img.trim())
        .filter((img) => img.length > 0 && !img.startsWith("blob:"));

      setExistingImages(imagesArray);
      console.log("Existing images loaded:", imagesArray);
    }
  }, [equipmentId, formData.images]);

  // Обработка добавления новых файлов
  const handleImagesChange = (e: ChangeEvent<HTMLInputElement>) => {
    if (e.target.files) {
      const files = Array.from(e.target.files);

      const validFiles = files.filter((file) => {
        if (!file.type.startsWith("image/")) {
          alert(`Файл ${file.name} не є зображенням`);
          return false;
        }
        if (file.size > 5 * 1024 * 1024) {
          alert(`Файл ${file.name} занадто великий (макс 5MB)`);
          return false;
        }
        return true;
      });

      if (validFiles.length > 0) {
        setNewImages((prev) => [...prev, ...validFiles]);
        console.log(`Додано ${validFiles.length} нових зображень`);
      }
    }
  };

  // Удаление существующего изображения
  const removeExistingImage = (index: number) => {
    const imageUrl = existingImages[index];

    // Добавляем в список на удаление
    setImagesToDelete((prev) => [...prev, imageUrl]);

    // Удаляем из списка существующих
    const updatedImages = [...existingImages];
    updatedImages.splice(index, 1);
    setExistingImages(updatedImages);

    console.log(`Зображення ${index} помічено на видалення:`, imageUrl);
  };

  // Удаление нового изображения (еще не загруженного)
  const removeNewImage = (index: number) => {
    const updatedImages = [...newImages];
    updatedImages.splice(index, 1);
    setNewImages(updatedImages);
  };

  // Перемещение изображения вверх в списке
  const moveImageUp = (index: number, isExisting: boolean) => {
    if (index === 0) return;

    if (isExisting) {
      const updatedImages = [...existingImages];
      [updatedImages[index], updatedImages[index - 1]] = [
        updatedImages[index - 1],
        updatedImages[index],
      ];
      setExistingImages(updatedImages);
    } else {
      const updatedImages = [...newImages];
      [updatedImages[index], updatedImages[index - 1]] = [
        updatedImages[index - 1],
        updatedImages[index],
      ];
      setNewImages(updatedImages);
    }
  };

  // Перемещение изображения вниз в списке
  const moveImageDown = (index: number, isExisting: boolean) => {
    if (isExisting) {
      if (index === existingImages.length - 1) return;
      const updatedImages = [...existingImages];
      [updatedImages[index], updatedImages[index + 1]] = [
        updatedImages[index + 1],
        updatedImages[index],
      ];
      setExistingImages(updatedImages);
    } else {
      if (index === newImages.length - 1) return;
      const updatedImages = [...newImages];
      [updatedImages[index], updatedImages[index + 1]] = [
        updatedImages[index + 1],
        updatedImages[index],
      ];
      setNewImages(updatedImages);
    }
  };

  // Загрузка новых изображений на сервер
  const uploadNewImages = async (): Promise<string[]> => {
    if (newImages.length === 0) {
      return [];
    }

    setUploadingImages(true);
    setUploadProgress(10);

    let uploadId: number;

    if (equipmentId) {
      uploadId = equipmentId;
    } else {
      uploadId = Date.now();
    }

    console.log("Uploading new images with ID:", uploadId);

    try {
      // Загружаем все новые изображения
      const urls = await storageService.uploadMultipleFiles(
        newImages,
        uploadId
      );
      setUploadProgress(100);
      console.log("New images uploaded successfully:", urls);
      return urls;
    } catch (error) {
      console.error("Error uploading images:", error);
      const errorMessage =
        error instanceof Error ? error.message : "Unknown error occurred";
      throw new Error("Не вдалося завантажити зображення: " + errorMessage);
    } finally {
      setUploadingImages(false);
    }
  };

  // Обработка отправки формы
  const handleSubmit = async () => {
    setLoading(true);

    try {
      // 1. Загружаем новые изображения
      const newImageUrls = await uploadNewImages();

      // 2. Формируем финальный массив изображений в правильном порядке
      // Теперь можно оставить пустой массив, если все изображения удалены
      const allImageUrls = [...existingImages, ...newImageUrls];

      console.log("Final image array:", allImageUrls);
      console.log("Images to delete:", imagesToDelete);

      // 3. Передаем финальный массив и изображения для удаления в onSubmit
      // Даже если массив пустой, это нормально - товар будет без изображений
      onSubmit(allImageUrls, imagesToDelete);
    } catch (error: unknown) {
      const errorMessage =
        error instanceof Error
          ? error.message
          : "Помилка при завантаженні зображень";
      alert(errorMessage);
      setLoading(false);
      setUploadProgress(0);
    }
  };

  // Функция для удаления ВСЕХ существующих изображений
  const removeAllExistingImages = () => {
    if (existingImages.length === 0) return;

    if (
      confirm(
        `Ви дійсно хочете видалити всі ${existingImages.length} існуючих зображень?`
      )
    ) {
      // Добавляем все существующие изображения в список на удаление
      setImagesToDelete((prev) => [...prev, ...existingImages]);

      // Очищаем список существующих изображений
      setExistingImages([]);

      alert(`Всі ${existingImages.length} зображень помічено на видалення`);
    }
  };

  // Функция для удаления ВСЕХ новых изображений
  const removeAllNewImages = () => {
    if (newImages.length === 0) return;

    if (
      confirm(
        `Ви дійсно хочете видалити всі ${newImages.length} нових зображень?`
      )
    ) {
      // Очищаем список новых изображений
      setNewImages([]);

      alert(`Всі ${newImages.length} нових зображень видалено`);
    }
  };

  // Функция для удаления ВСЕХ изображений
  const removeAllImages = () => {
    const totalImages = existingImages.length + newImages.length;
    if (totalImages === 0) return;

    if (confirm(`Ви дійсно хочете видалити всі ${totalImages} зображень?`)) {
      // Для существующих добавляем в список на удаление
      if (existingImages.length > 0) {
        setImagesToDelete((prev) => [...prev, ...existingImages]);
      }

      // Очищаем все изображения
      setExistingImages([]);
      setNewImages([]);

      alert(`Всі ${totalImages} зображень видалено або помічено на видалення`);
    }
  };

  // Компонент для отображения миниатюр
  const ImageThumbnail = ({
    src,
    isFile = false,
    index,
    totalCount,
    isExisting = true,
    onRemove,
    onMoveUp,
    onMoveDown,
  }: {
    src: string | File;
    isFile?: boolean;
    index: number;
    totalCount: number;
    isExisting?: boolean;
    onRemove: () => void;
    onMoveUp: () => void;
    onMoveDown: () => void;
  }) => {
    const previewSrc = isFile
      ? URL.createObjectURL(src as File)
      : (src as string);

    return (
      <div
        style={{
          position: "relative",
          display: "inline-block",
          margin: "5px",
          border: "1px solid #ddd",
          borderRadius: "4px",
          padding: "5px",
          backgroundColor: "#fff",
        }}
      >
        <img
          src={previewSrc}
          alt={`Preview ${index + 1}`}
          style={{
            width: "100px",
            height: "100px",
            objectFit: "cover",
            borderRadius: "4px",
          }}
          onLoad={() => {
            if (isFile) {
              URL.revokeObjectURL(previewSrc);
            }
          }}
        />

        {/* Индекс изображения */}
        <div
          style={{
            position: "absolute",
            top: "5px",
            left: "5px",
            backgroundColor: "rgba(0, 0, 0, 0.7)",
            color: "white",
            borderRadius: "50%",
            width: "24px",
            height: "24px",
            display: "flex",
            alignItems: "center",
            justifyContent: "center",
            fontSize: "12px",
            fontWeight: "bold",
          }}
        >
          {index + 1}
        </div>

        {/* Кнопка удаления */}
        <button
          onClick={onRemove}
          style={{
            position: "absolute",
            top: "5px",
            right: "5px",
            backgroundColor: "#dc3545",
            color: "white",
            border: "none",
            borderRadius: "50%",
            width: "24px",
            height: "24px",
            fontSize: "14px",
            cursor: "pointer",
            display: "flex",
            alignItems: "center",
            justifyContent: "center",
          }}
          title="Видалити"
        >
          ×
        </button>

        {/* Кнопки перемещения */}
        <div
          style={{
            position: "absolute",
            bottom: "5px",
            left: "5px",
            right: "5px",
            display: "flex",
            justifyContent: "center",
            gap: "2px",
          }}
        >
          <button
            onClick={onMoveUp}
            disabled={index === 0}
            style={{
              backgroundColor: index === 0 ? "#ccc" : "#007bff",
              color: "white",
              border: "none",
              borderRadius: "3px",
              width: "24px",
              height: "24px",
              fontSize: "12px",
              cursor: index === 0 ? "not-allowed" : "pointer",
              display: "flex",
              alignItems: "center",
              justifyContent: "center",
            }}
            title="Перемістити вгору"
          >
            ↑
          </button>

          <button
            onClick={onMoveDown}
            disabled={index === totalCount - 1}
            style={{
              backgroundColor: index === totalCount - 1 ? "#ccc" : "#007bff",
              color: "white",
              border: "none",
              borderRadius: "3px",
              width: "24px",
              height: "24px",
              fontSize: "12px",
              cursor: index === totalCount - 1 ? "not-allowed" : "pointer",
              display: "flex",
              alignItems: "center",
              justifyContent: "center",
            }}
            title="Перемістити вниз"
          >
            ↓
          </button>
        </div>

        {/* Метка типа изображения */}
        <div
          style={{
            position: "absolute",
            bottom: "5px",
            right: "5px",
            backgroundColor: isExisting ? "#28a745" : "#ffc107",
            color: "white",
            padding: "2px 6px",
            borderRadius: "3px",
            fontSize: "10px",
            fontWeight: "bold",
          }}
        >
          {isExisting ? "Є" : "Нове"}
        </div>
      </div>
    );
  };

  const totalImages = existingImages.length + newImages.length;

  return (
    <div
      style={{
        position: "fixed",
        top: 0,
        left: 0,
        right: 0,
        bottom: 0,
        backgroundColor: "rgba(0,0,0,0.5)",
        display: "flex",
        alignItems: "center",
        justifyContent: "center",
        zIndex: 1000,
      }}
    >
      <div
        style={{
          backgroundColor: "white",
          padding: 30,
          borderRadius: 8,
          width: "90%",
          maxWidth: 800,
          maxHeight: "90vh",
          overflowY: "auto",
        }}
      >
        <h2>{title}</h2>

        {/* Прогресс бар для загрузки изображений */}
        {uploadingImages && (
          <div style={{ marginBottom: "15px" }}>
            <div
              style={{
                width: "100%",
                backgroundColor: "#e9ecef",
                borderRadius: "4px",
                overflow: "hidden",
                marginBottom: "5px",
              }}
            >
              <div
                style={{
                  width: `${uploadProgress}%`,
                  height: "20px",
                  backgroundColor: "#28a745",
                  transition: "width 0.3s",
                }}
              />
            </div>
            <small style={{ color: "#6c757d" }}>
              Завантаження зображень: {uploadProgress}%
            </small>
          </div>
        )}

        <div style={{ display: "flex", flexDirection: "column", gap: 15 }}>
          {/* Основные поля формы */}
          <input
            type="text"
            placeholder="Назва товару *"
            value={formData.name}
            onChange={(e) => setFormData({ ...formData, name: e.target.value })}
            style={{
              padding: 10,
              border: "1px solid #ddd",
              borderRadius: 4,
            }}
          />
          <textarea
            placeholder="Опис товару"
            value={formData.description}
            onChange={(e) =>
              setFormData({ ...formData, description: e.target.value })
            }
            style={{
              padding: 10,
              border: "1px solid #ddd",
              borderRadius: 4,
              minHeight: 80,
            }}
          />
          <input
            type="number"
            placeholder="Ціна *"
            value={formData.price}
            onChange={(e) =>
              setFormData({ ...formData, price: e.target.value })
            }
            style={{
              padding: 10,
              border: "1px solid #ddd",
              borderRadius: 4,
            }}
          />
          <input
            type="number"
            placeholder="Кількість на складі *"
            value={formData.stock}
            onChange={(e) =>
              setFormData({ ...formData, stock: e.target.value })
            }
            style={{
              padding: 10,
              border: "1px solid #ddd",
              borderRadius: 4,
            }}
          />
          <input
            type="text"
            placeholder="Категорія *"
            value={formData.category}
            onChange={(e) =>
              setFormData({ ...formData, category: e.target.value })
            }
            style={{
              padding: 10,
              border: "1px solid #ddd",
              borderRadius: 4,
            }}
          />

          {/* Блок работы с изображениями */}
          <div>
            <label
              style={{
                display: "block",
                marginBottom: "5px",
                fontWeight: "bold",
              }}
            >
              Зображення товару
            </label>

            <div
              style={{
                marginBottom: "15px",
                padding: "10px",
                backgroundColor: "#f8f9fa",
                borderRadius: "4px",
              }}
            >
              <p
                style={{
                  margin: "0 0 10px 0",
                  fontSize: "14px",
                  color: "#666",
                }}
              >
                Перше зображення буде головним. Ви можете змінювати порядок,
                натискаючи стрілки вгору/вниз.
              </p>

              {/* Кнопки массового удаления */}
              <div
                style={{
                  marginBottom: "15px",
                  display: "flex",
                  gap: "10px",
                  flexWrap: "wrap",
                }}
              >
                {existingImages.length > 0 && (
                  <button
                    type="button"
                    onClick={removeAllExistingImages}
                    style={{
                      padding: "5px 10px",
                      backgroundColor: "#dc3545",
                      color: "white",
                      border: "none",
                      borderRadius: "4px",
                      cursor: "pointer",
                      fontSize: "12px",
                    }}
                  >
                    Видалити всі існуючі ({existingImages.length})
                  </button>
                )}

                {newImages.length > 0 && (
                  <button
                    type="button"
                    onClick={removeAllNewImages}
                    style={{
                      padding: "5px 10px",
                      backgroundColor: "#ffc107",
                      color: "white",
                      border: "none",
                      borderRadius: "4px",
                      cursor: "pointer",
                      fontSize: "12px",
                    }}
                  >
                    Видалити всі нові ({newImages.length})
                  </button>
                )}

                {totalImages > 0 && (
                  <button
                    type="button"
                    onClick={removeAllImages}
                    style={{
                      padding: "5px 10px",
                      backgroundColor: "#000",
                      color: "white",
                      border: "none",
                      borderRadius: "4px",
                      cursor: "pointer",
                      fontSize: "12px",
                      fontWeight: "bold",
                    }}
                  >
                    Видалити ВСІ ({totalImages})
                  </button>
                )}
              </div>

              {/* Существующие изображения */}
              {existingImages.length > 0 && (
                <div style={{ marginBottom: "20px" }}>
                  <h4 style={{ marginBottom: "10px", color: "#28a745" }}>
                    Існуючі зображення ({existingImages.length})
                  </h4>
                  <div
                    style={{ display: "flex", flexWrap: "wrap", gap: "10px" }}
                  >
                    {existingImages.map((imgUrl, index) => (
                      <ImageThumbnail
                        key={`existing-${index}`}
                        src={imgUrl}
                        index={index}
                        totalCount={existingImages.length}
                        isExisting={true}
                        onRemove={() => removeExistingImage(index)}
                        onMoveUp={() => moveImageUp(index, true)}
                        onMoveDown={() => moveImageDown(index, true)}
                      />
                    ))}
                  </div>
                </div>
              )}

              {/* Новые изображения */}
              {newImages.length > 0 && (
                <div style={{ marginBottom: "20px" }}>
                  <h4 style={{ marginBottom: "10px", color: "#ffc107" }}>
                    Нові зображення ({newImages.length})
                  </h4>
                  <div
                    style={{ display: "flex", flexWrap: "wrap", gap: "10px" }}
                  >
                    {newImages.map((file, index) => (
                      <ImageThumbnail
                        key={`new-${index}`}
                        src={file}
                        isFile={true}
                        index={existingImages.length + index}
                        totalCount={totalImages}
                        isExisting={false}
                        onRemove={() => removeNewImage(index)}
                        onMoveUp={() => moveImageUp(index, false)}
                        onMoveDown={() => moveImageDown(index, false)}
                      />
                    ))}
                  </div>
                </div>
              )}

              {/* Кнопка добавления новых изображений */}
              <div style={{ marginTop: "15px" }}>
                <input
                  type="file"
                  accept="image/*"
                  multiple
                  onChange={handleImagesChange}
                  ref={imagesInputRef}
                  style={{ display: "none" }}
                />

                <button
                  type="button"
                  onClick={() => imagesInputRef.current?.click()}
                  style={{
                    padding: "10px 20px",
                    backgroundColor: "#007bff",
                    color: "white",
                    border: "none",
                    borderRadius: 4,
                    cursor: "pointer",
                    fontSize: "14px",
                  }}
                >
                  + Додати нові зображення
                </button>

                {/* Сообщение если нет изображений */}
                {totalImages === 0 && (
                  <div
                    style={{
                      marginTop: "10px",
                      padding: "10px",
                      backgroundColor: "#f8d7da",
                      color: "#721c24",
                      borderRadius: "4px",
                      fontSize: "14px",
                    }}
                  >
                    ⚠️ Цей товар не має зображень. Додайте хоча б одне для
                    кращого відображення.
                  </div>
                )}
              </div>
            </div>

            {/* Информация о изображениях */}
            <div style={{ fontSize: "14px", color: "#666" }}>
              <p>
                Всього зображень: {totalImages}
                {totalImages === 0 && " (товар без зображень)"}
              </p>
              {imagesToDelete.length > 0 && (
                <p style={{ color: "#dc3545" }}>
                  Помічено на видалення: {imagesToDelete.length} зображень
                </p>
              )}
            </div>
          </div>
        </div>

        <div style={{ display: "flex", gap: 10, marginTop: 20 }}>
          <button
            onClick={handleSubmit}
            disabled={loading || uploadingImages}
            style={{
              padding: "10px 20px",
              backgroundColor: title.includes("Додати") ? "#28a745" : "#007bff",
              color: "white",
              border: "none",
              borderRadius: 4,
              cursor: loading || uploadingImages ? "not-allowed" : "pointer",
              flex: 1,
              opacity: loading || uploadingImages ? 0.7 : 1,
            }}
          >
            {uploadingImages
              ? "Завантаження зображень..."
              : loading
              ? "Обробка..."
              : title.includes("Додати")
              ? "Додати"
              : "Зберегти"}
          </button>
          <button
            onClick={onClose}
            disabled={loading || uploadingImages}
            style={{
              padding: "10px 20px",
              backgroundColor: "#6c757d",
              color: "white",
              border: "none",
              borderRadius: 4,
              cursor: loading || uploadingImages ? "not-allowed" : "pointer",
              flex: 1,
            }}
          >
            Скасувати
          </button>
        </div>
      </div>
    </div>
  );
}
