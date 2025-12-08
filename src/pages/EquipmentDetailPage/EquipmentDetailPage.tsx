import { Link } from "react-router-dom";
import { useState } from "react";
import "./EquipmentDetailPage.scss";
import { useEquipmentDetailLogic } from "./useEquipmentDetailLogic";
import ImageModal from "../../components/ImageModal";

export default function EquipmentDetailPage() {
  const {
    // Состояние
    equipment,
    loading,
    error,
    activeImage,
    cartQuantity,
    addingToCart,
    addingToFavorites,

    // Логика
    isInCart,
    isInFavorites,

    // Обработчики
    setActiveImage,
    addToCartHandler,
    removeFromCartHandler,
    toggleFavoriteHandler,
    decreaseQuantity,
    increaseQuantity,

    // Навигация
    navigate,
  } = useEquipmentDetailLogic();

  // Состояние для модального окна
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [modalImageIndex, setModalImageIndex] = useState(0);

  // Функция для открытия модального окна с конкретным изображением
  const openModal = (index: number) => {
    setModalImageIndex(index);
    setIsModalOpen(true);
  };

  // Функция для переключения изображений в модальном окне
  const goToPrevImage = () => {
    setModalImageIndex((prev) => {
      const images = equipment?.images || [];
      return prev > 0 ? prev - 1 : images.length - 1;
    });
  };

  const goToNextImage = () => {
    setModalImageIndex((prev) => {
      const images = equipment?.images || [];
      return prev < images.length - 1 ? prev + 1 : 0;
    });
  };

  if (loading) {
    return (
      <div className="loading-state">
        <p>Завантаження...</p>
      </div>
    );
  }

  if (error || !equipment) {
    return (
      <div className="error-state">
        <p style={{ color: "red" }}>{error || "Обладнання не знайдено"}</p>
        <button onClick={() => navigate(-1)}>Назад</button>
      </div>
    );
  }

  const images = equipment.images || [];
  const mainImage =
    equipment.main_image || (images.length > 0 ? images[0] : null);

  return (
    <div className="equipment-detail">
      {/* Хлебные крошки */}
      <div className="equipment-detail__breadcrumbs">
        <Link to="/equipment">← Каталог</Link>
        {equipment.category && (
          <>
            <Link
              to={`/equipment/category/${encodeURIComponent(
                equipment.category
              )}`}
            >
              {equipment.category}
            </Link>
            <span>→</span>
          </>
        )}
        <span>{equipment.name}</span>
      </div>

      <div className="equipment-detail__container">
        {/* Блок с фотографиями */}
        <div className="equipment-detail__images">
          {mainImage ? (
            <>
              {/* Основное изображение с возможностью открыть в модальном окне */}
              <div
                className="main-image-wrapper"
                onClick={() => openModal(activeImage)}
                style={{ cursor: "pointer" }}
              >
                <img
                  src={mainImage}
                  alt={equipment.name}
                  className="main-image"
                />
                <div className="main-image-overlay">
                  <span className="zoom-icon">🔍</span>
                </div>
              </div>

              {/* Навигация по изображениям */}
              {images.length > 1 && (
                <div className="image-navigation">
                  <button
                    className="nav-button prev-button"
                    onClick={() =>
                      setActiveImage((prev) =>
                        prev > 0 ? prev - 1 : images.length - 1
                      )
                    }
                    aria-label="Попереднє зображення"
                  >
                    ◀
                  </button>

                  <div className="thumbnails">
                    {images.map((image, index) => (
                      <div
                        key={index}
                        className="thumbnail-wrapper"
                        onClick={() => setActiveImage(index)}
                      >
                        <img
                          src={image}
                          alt={`${equipment.name} ${index + 1}`}
                          className={`thumbnail ${
                            activeImage === index ? "active" : ""
                          }`}
                        />
                        {activeImage === index && (
                          <div className="thumbnail-indicator"></div>
                        )}
                      </div>
                    ))}
                  </div>

                  <button
                    className="nav-button next-button"
                    onClick={() =>
                      setActiveImage((prev) =>
                        prev < images.length - 1 ? prev + 1 : 0
                      )
                    }
                    aria-label="Наступне зображення"
                  >
                    ▶
                  </button>
                </div>
              )}

              {/* Счетчик изображений */}
              {images.length > 1 && (
                <div className="image-counter">
                  <span>
                    {activeImage + 1} / {images.length}
                  </span>
                </div>
              )}
            </>
          ) : (
            <div className="no-image">Фото відсутнє</div>
          )}
        </div>

        {/* Блок с информацией */}
        <div className="equipment-detail__info">
          <h1>{equipment.name}</h1>

          <div className="price-tag">{equipment.price} ₴</div>

          <div
            className={`stock-status ${
              equipment.stock > 0 ? "" : "out-of-stock"
            }`}
          >
            {equipment.stock > 0
              ? `✓ В наявності: ${equipment.stock} шт.`
              : "✗ Немає в наявності"}
          </div>

          <div className="description">
            <h3>Опис</h3>
            <p>{equipment.description}</p>
          </div>

          {/* Статистика */}
          <div className="equipment-detail__stats">
            <div className="stat-card">
              <div className="stat-value">{equipment.total_views || 0}</div>
              <div className="stat-label">переглядів</div>
            </div>
            <div className="stat-card">
              <div className="stat-value">{equipment.category}</div>
              <div className="stat-label">категорія</div>
            </div>
          </div>

          {/* Блок управления корзиной и избранным */}
          <div className="equipment-detail__actions">
            {isInCart ? (
              <div className="cart-controls">
                <span className="in-cart-badge">✓ В кошику</span>
                <div className="quantity-controls">
                  <button
                    onClick={decreaseQuantity}
                    disabled={cartQuantity <= 1}
                  >
                    -
                  </button>
                  <span className="quantity-value">{cartQuantity}</span>
                  <button
                    onClick={increaseQuantity}
                    disabled={cartQuantity >= equipment.stock}
                  >
                    +
                  </button>
                </div>
                <button className="remove-btn" onClick={removeFromCartHandler}>
                  Видалити
                </button>
              </div>
            ) : (
              <div className="add-to-cart-section">
                <span className="quantity-label">Кількість:</span>
                <div className="quantity-controls">
                  <button onClick={decreaseQuantity}>-</button>
                  <span className="quantity-value">{cartQuantity}</span>
                  <button onClick={increaseQuantity}>+</button>
                </div>
                <button
                  className="add-to-cart-btn"
                  onClick={addToCartHandler}
                  disabled={addingToCart || equipment.stock === 0}
                >
                  {addingToCart
                    ? "Додаємо..."
                    : equipment.stock > 0
                    ? "Додати до кошика"
                    : "Немає в наявності"}
                </button>
              </div>
            )}

            <div className="action-buttons">
              <button
                className={`favorite-btn ${
                  isInFavorites ? "in-favorites" : ""
                }`}
                onClick={toggleFavoriteHandler}
                disabled={addingToFavorites}
              >
                {addingToFavorites
                  ? "..."
                  : isInFavorites
                  ? "★ В обраному"
                  : "☆ Додати до обраного"}
              </button>

              <Link to="/cart" className="go-to-cart-btn">
                Перейти до кошика
              </Link>
            </div>
          </div>
        </div>
      </div>

      {/* Дополнительная информация */}
      <div className="equipment-detail__additional">
        <h3>Додаткова інформація</h3>
        <div className="equipment-detail__additional-grid">
          <div>
            <strong>ID товару:</strong> {equipment.id}
          </div>
          <div>
            <strong>Додано:</strong>{" "}
            {new Date(equipment.created_at).toLocaleDateString("uk-UA")}
          </div>
          <div>
            <strong>Категорія:</strong> {equipment.category}
          </div>
        </div>
      </div>

      {/* Модальное окно для просмотра изображений */}
      {isModalOpen && equipment && (
        <ImageModal
          images={images}
          currentIndex={modalImageIndex}
          onClose={() => setIsModalOpen(false)}
          onPrev={goToPrevImage}
          onNext={goToNextImage}
          productName={equipment.name}
        />
      )}
    </div>
  );
}
