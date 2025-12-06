import { useEffect } from "react";
import "../pages/EquipmentDetailPage/EquipmentDetailPage.scss"; // Или отдельный файл стилей для модального окна

interface ImageModalProps {
  images: string[];
  currentIndex: number;
  onClose: () => void;
  onPrev: () => void;
  onNext: () => void;
  productName: string;
}

export default function ImageModal({
  images,
  currentIndex,
  onClose,
  onPrev,
  onNext,
  productName,
}: ImageModalProps) {
  // Закрытие при нажатии ESC
  useEffect(() => {
    const handleKeyDown = (e: KeyboardEvent) => {
      if (e.key === "Escape") {
        onClose();
      }
      if (e.key === "ArrowLeft") {
        onPrev();
      }
      if (e.key === "ArrowRight") {
        onNext();
      }
    };

    document.addEventListener("keydown", handleKeyDown);
    // Блокировка прокрутки страницы при открытом модальном окне
    document.body.style.overflow = "hidden";

    return () => {
      document.removeEventListener("keydown", handleKeyDown);
      document.body.style.overflow = "auto";
    };
  }, [onClose, onPrev, onNext]);

  // Закрытие при клике на оверлей
  const handleOverlayClick = (e: React.MouseEvent) => {
    if (e.target === e.currentTarget) {
      onClose();
    }
  };

  return (
    <div className="image-modal-overlay" onClick={handleOverlayClick}>
      <div className="image-modal">
        {/* Кнопка закрытия */}
        <button className="modal-close-button" onClick={onClose}>
          ✕
        </button>

        {/* Основное изображение */}
        <div className="modal-image-container">
          <img
            src={images[currentIndex]}
            alt={`${productName} - фото ${currentIndex + 1}`}
            className="modal-image"
          />
        </div>

        {/* Навигация */}
        <button
          className="modal-nav-button prev-button"
          onClick={onPrev}
          aria-label="Попереднє фото"
        >
          ◀
        </button>

        <button
          className="modal-nav-button next-button"
          onClick={onNext}
          aria-label="Наступне фото"
        >
          ▶
        </button>

        {/* Миниатюры внизу */}
        {images.length > 1 && (
          <div className="modal-thumbnails">
            {images.map((image, index) => (
              <div
                key={index}
                className={`modal-thumbnail-wrapper ${
                  index === currentIndex ? "active" : ""
                }`}
                onClick={() => {
                  // Прокрутка к выбранной миниатюре
                  document
                    .querySelector(
                      `.modal-thumbnail-wrapper:nth-child(${index + 1})`
                    )
                    ?.scrollIntoView({
                      behavior: "smooth",
                      block: "nearest",
                      inline: "center",
                    });
                }}
              >
                <img
                  src={image}
                  alt={`${productName} - мініатюра ${index + 1}`}
                  className="modal-thumbnail"
                />
              </div>
            ))}
          </div>
        )}

        {/* Счетчик */}
        <div className="modal-counter">
          <span>
            {currentIndex + 1} / {images.length}
          </span>
        </div>

        {/* Индикатор загрузки (опционально) */}
        <div className="modal-loading-indicator">
          Завантаження зображення...
        </div>
      </div>
    </div>
  );
}
