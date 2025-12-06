import { Link } from "react-router-dom";
import "./EquipmentListPage.scss";
import { useEquipmentListLogic } from "../../hooks/useEquipmentListLogic";

export default function EquipmentListPage() {
  const {
    items,
    loading,
    error,
    category,
    loadItems,
    addToCart,
    toggleFavorite,
    getFirstImage,
    isCategoryPage,
    isEmpty,
  } = useEquipmentListLogic();

  // Обробник кліку на картку товару
  const handleItemClick = (e: React.MouseEvent) => {
    // Якщо клік був на кнопці - не переходимо
    if ((e.target as HTMLElement).tagName === "BUTTON") {
      return;
    }
  };

  // Обробник кліку на кнопки
  const handleButtonClick = (e: React.MouseEvent, action: () => void) => {
    e.preventDefault();
    e.stopPropagation();
    action();
  };

  if (loading) {
    return (
      <div className="equipment-list__loading">
        <p>Завантаження...</p>
      </div>
    );
  }

  if (error) {
    return (
      <div className="equipment-list__error">
        <p className="error-message">{error}</p>
        <button onClick={loadItems} className="retry-button">
          Спробувати знову
        </button>
      </div>
    );
  }

  return (
    <div className="equipment-list">
      <div className="equipment-list__header">
        <Link to="/equipment" className="back-link">
          ← Всі категорії
        </Link>
        <h2 className="category-title">
          {category
            ? `Обладнання: ${decodeURIComponent(category)}`
            : "Всі обладнання"}
        </h2>
      </div>

      {isEmpty ? (
        <div className="equipment-list__empty">
          <p>Обладнання не знайдено</p>
        </div>
      ) : (
        <div className="equipment-list__grid">
          {items.map((item) => {
            const firstImage = getFirstImage(item);

            return (
              <Link
                key={item.id}
                to={`/equipment/item/${item.id}`}
                className="equipment-list__item"
                onClick={(e) => handleItemClick(e)}
              >
                <div className="item-card">
                  {firstImage ? (
                    <img
                      src={firstImage}
                      alt={item.name}
                      className="item-card__image"
                    />
                  ) : (
                    <div className="item-card__no-image">Фото відсутнє</div>
                  )}

                  <h3 className="item-card__title">
                    {item.name}
                    <span className="price"> — {item.price} ₴</span>
                  </h3>

                  <p className="item-card__description">{item.description}</p>

                  <span
                    className={`item-card__stock ${
                      item.stock > 0 ? "in-stock" : "out-of-stock"
                    }`}
                  >
                    {item.stock > 0
                      ? `В наявності: ${item.stock}`
                      : "Немає в наявності"}
                  </span>

                  <div className="item-card__actions">
                    <button
                      onClick={(e) =>
                        handleButtonClick(e, () => addToCart(item.id))
                      }
                      className="cart-button"
                      disabled={item.stock === 0}
                    >
                      🛒 До кошика
                    </button>
                    <button
                      onClick={(e) =>
                        handleButtonClick(e, () => toggleFavorite(item.id))
                      }
                      className="favorite-button"
                    >
                      ★ У обране
                    </button>
                  </div>

                  {item.category && (
                    <div className="item-card__category">
                      <span className="category-tag">{item.category}</span>
                    </div>
                  )}
                </div>
              </Link>
            );
          })}
        </div>
      )}

      <div className="equipment-list__footer">
        <p>
          Знайдено {items.length} товарів
          {isCategoryPage && ` у категорії "${decodeURIComponent(category!)}"`}
        </p>
      </div>
    </div>
  );
}
