import { Link } from "react-router-dom";
import "./CategoriesPage.scss";
import { useCategoriesLogic } from "../../hooks/useCategoriesLogic";

export default function CategoriesPage() {
  const {
    categories,
    loading,
    error,
    loadCategories,
    getCategoryUrl,
    getCategoryDisplayName,
    isEmpty,
    categoriesCount,
  } = useCategoriesLogic();

  // Функція для отримання іконки категорії
  const getCategoryIcon = (category: string): string => {
    const lowerCategory = category.toLowerCase();

    if (lowerCategory.includes("phone")) return "📱";
    if (lowerCategory.includes("laptop")) return "💻";
    if (lowerCategory.includes("tablet")) return "📱";
    if (lowerCategory.includes("accessor")) return "🎧";
    if (lowerCategory.includes("electron")) return "🔌";
    if (lowerCategory.includes("computer")) return "🖥️";
    if (lowerCategory.includes("camera")) return "📷";
    if (lowerCategory.includes("audio") || lowerCategory.includes("sound"))
      return "🔊";
    return "📦";
  };

  if (loading) {
    return (
      <div className="categories-page">
        <div className="categories-page__header">
          <h2>Категорії обладнання</h2>
          <p className="subtitle">Завантаження списку категорій...</p>
        </div>
        <div className="categories-page__loading">
          <div className="loading-spinner"></div>
          <p className="loading-text">Завантаження...</p>
        </div>
      </div>
    );
  }

  if (error) {
    return (
      <div className="categories-page">
        <div className="categories-page__header">
          <h2>Категорії обладнання</h2>
        </div>
        <div className="categories-page__error">
          <h3 className="error-title">Сталася помилка</h3>
          <p className="error-message">{error}</p>
          <button onClick={loadCategories} className="retry-button">
            Спробувати знову
          </button>
        </div>
      </div>
    );
  }

  return (
    <div className="categories-page">
      <div className="categories-page__header">
        <h2>Категорії обладнання</h2>
        <p className="subtitle">Оберіть категорію для перегляду товарів</p>
      </div>

      {isEmpty ? (
        <div className="categories-page__empty">
          <h3 className="empty-title">Категорії не знайдено</h3>
          <p className="empty-message">
            На жаль, наразі немає доступних категорій обладнання.
          </p>
        </div>
      ) : (
        <>
          <div className="categories-page__grid">
            {categories.map((category, index) => (
              <Link
                key={index}
                to={getCategoryUrl(category)}
                className="categories-page__category-card"
              >
                <div className="categories-page__category-card__icon">
                  {getCategoryIcon(category)}
                </div>
                <span className="categories-page__category-card__name">
                  {getCategoryDisplayName(category)}
                </span>
                <span className="categories-page__category-card__count">
                  Переглянути
                </span>
              </Link>
            ))}
          </div>

          <div className="categories-page__all-equipment">
            <Link to="/equipment/all" className="all-equipment-link">
              📋 Переглянути всі товари
            </Link>
          </div>
        </>
      )}

      <div className="categories-page__footer">
        <p>
          Доступно категорій:
          <span className="count-badge">{categoriesCount}</span>
        </p>
      </div>
    </div>
  );
}
