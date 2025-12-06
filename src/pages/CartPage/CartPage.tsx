import { Link } from "react-router-dom";
import "./CartPage.scss";
import { useCartLogic } from "../../hooks/useCartLogic";

export default function CartPage() {
  const {
    cartItems,
    loading,
    calculateTotal,
    calculateTotalItems,
    handleCheckout,
    handleUpdateQuantity,
    handleRemoveItem,
    isCartEmpty,
  } = useCartLogic();

  if (isCartEmpty) {
    return (
      <div className="cart-page__empty">
        <h1>Кошик порожній</h1>
        <p>Додайте товари до кошика, щоб зробити замовлення</p>
        <Link to="/equipment" className="catalog-link">
          Перейти до каталогу
        </Link>
      </div>
    );
  }

  return (
    <div className="cart-page">
      <div className="cart-page__header">
        <h1>
          Кошик{" "}
          <span className="items-count">({calculateTotalItems()} товарів)</span>
        </h1>
      </div>

      <div className="cart-page__container">
        {/* Список товарів */}
        <div className="cart-page__items">
          {cartItems.map((item) => (
            <div key={item.id} className="cart-item">
              {item.equipment.main_image && (
                <img
                  src={item.equipment.main_image}
                  alt={item.equipment.name}
                  className="cart-item__image"
                />
              )}

              <div className="cart-item__content">
                <h3 className="cart-item__title">
                  <Link to={`/equipment/item/${item.equipment.id}`}>
                    {item.equipment.name}
                  </Link>
                </h3>

                <div className="cart-item__price">
                  {item.equipment.price} ₴ × {item.quantity} ={" "}
                  {item.equipment.price * item.quantity} ₴
                </div>

                <div className="cart-item__controls">
                  <div className="cart-item__quantity">
                    <button
                      onClick={() =>
                        handleUpdateQuantity(
                          item.equipment.id,
                          item.quantity - 1
                        )
                      }
                      disabled={item.quantity <= 1}
                    >
                      -
                    </button>
                    <span>{item.quantity}</span>
                    <button
                      onClick={() =>
                        handleUpdateQuantity(
                          item.equipment.id,
                          item.quantity + 1
                        )
                      }
                      disabled={item.quantity >= item.equipment.stock}
                    >
                      +
                    </button>
                  </div>

                  <button
                    onClick={() => handleRemoveItem(item.equipment.id)}
                    className="cart-item__remove"
                  >
                    Видалити
                  </button>
                </div>
              </div>
            </div>
          ))}
        </div>

        {/* Сума замовлення */}
        <div className="cart-page__order">
          <h2>Замовлення</h2>

          <div className="cart-page__order__summary">
            <div className="summary-row">
              <span>Товари ({calculateTotalItems()}):</span>
              <span>{calculateTotal()} ₴</span>
            </div>

            <div className="summary-row">
              <span>Доставка:</span>
              <span>Безкоштовно</span>
            </div>

            <div className="summary-row total">
              <span>Всього:</span>
              <span>{calculateTotal()} ₴</span>
            </div>
          </div>

          <button
            onClick={handleCheckout}
            disabled={loading}
            className="cart-page__order__checkout"
          >
            {loading ? "Обробка..." : "Оформити замовлення"}
          </button>

          <Link to="/equipment" className="cart-page__order__continue">
            Продовжити покупки
          </Link>
        </div>
      </div>
    </div>
  );
}
