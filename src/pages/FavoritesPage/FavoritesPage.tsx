import { Link } from "react-router-dom";
import "./FavoritesPage.scss";
import { useFavoritesLogic } from "./useFavoritesLogic";

export default function FavoritesPage() {
  const {
    favorites,
    loading,
    removeFromFavorites,
    addToCart,
    isFavoritesEmpty,
  } = useFavoritesLogic();

  if (loading) {
    return (
      <div className="loading-state">
        <p>Завантаження...</p>
      </div>
    );
  }

  if (isFavoritesEmpty) {
    return (
      <div className="favorites-page__empty">
        <h1>Список обраного порожній</h1>
        <p>Додайте товари до обраного, щоб повернутися до них пізніше</p>
        <Link to="/equipment" className="catalog-link">
          Перейти до каталогу
        </Link>
      </div>
    );
  }

  return (
    <div className="favorites-page">
      <div className="favorites-page__header">
        <h1>
          Обране{" "}
          <span className="items-count">({favorites.length} товарів)</span>
        </h1>
      </div>

      <div className="favorites-page__grid">
        {favorites.map((fav) => (
          <div key={fav.id} className="favorites-page__item">
            <Link to={`/equipment/item/${fav.equipment.id}`}>
              {fav.equipment.main_image && (
                <img
                  src={fav.equipment.main_image}
                  alt={fav.equipment.name}
                  className="favorites-page__item__image"
                />
              )}

              <h3 className="favorites-page__item__title">
                {fav.equipment.name}
              </h3>

              <p className="favorites-page__item__description">
                {fav.equipment.description}
              </p>

              <div className="favorites-page__item__info">
                <span className="favorites-page__item__price">
                  {fav.equipment.price} ₴
                </span>

                <span
                  className={`favorites-page__item__stock ${
                    fav.equipment.stock > 0 ? "in-stock" : "out-of-stock"
                  }`}
                >
                  {fav.equipment.stock > 0
                    ? "В наявності"
                    : "Немає в наявності"}
                </span>
              </div>
            </Link>

            <div className="favorites-page__item__actions">
              <button
                onClick={() => addToCart(fav.equipment)}
                disabled={fav.equipment.stock === 0}
                className="add-to-cart"
              >
                До кошика
              </button>

              <button
                onClick={() => removeFromFavorites(fav.equipment.id)}
                className="remove"
              >
                Видалити
              </button>
            </div>
          </div>
        ))}
      </div>
    </div>
  );
}
