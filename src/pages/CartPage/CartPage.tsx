import { useState } from "react";
import { Link } from "react-router-dom";
import { useAppState } from "../../contexts/AppContext";
import { useAppActions } from "../../hooks/useAppActions";

export default function CartPage() {
  const { cartItems } = useAppState();
  const { updateCartQuantity, removeFromCart } = useAppActions();
  const [loading, setLoading] = useState(false);

  const calculateTotal = () => {
    return cartItems.reduce((total, item) => {
      return total + item.equipment.price * item.quantity;
    }, 0);
  };

  const calculateTotalItems = () => {
    return cartItems.reduce((total, item) => total + item.quantity, 0);
  };

  const handleCheckout = async () => {
    setLoading(true);
    try {
      // Здесь будет логика оформления заказа
      alert("Заказ оформлен успешно!");
      // Очищаем корзину после успешного заказа
      cartItems.forEach((item) => removeFromCart(item.equipment.id));
    } catch (error) {
      console.error("Checkout error:", error);
      alert("Ошибка при оформлении заказа");
    } finally {
      setLoading(false);
    }
  };

  if (cartItems.length === 0) {
    return (
      <div style={{ padding: "2rem", textAlign: "center" }}>
        <h1>Кошик порожній</h1>
        <p>Додайте товари до кошика, щоб зробити замовлення</p>
        <Link
          to="/equipment"
          style={{
            padding: "0.5rem 1rem",
            backgroundColor: "#007bff",
            color: "white",
            textDecoration: "none",
            borderRadius: "4px",
          }}
        >
          Перейти до каталогу
        </Link>
      </div>
    );
  }

  return (
    <div style={{ padding: "2rem", maxWidth: "1200px", margin: "0 auto" }}>
      <h1>Кошик ({calculateTotalItems()} товарів)</h1>

      <div
        style={{
          display: "grid",
          gridTemplateColumns: "2fr 1fr",
          gap: "2rem",
          marginTop: "2rem",
        }}
      >
        {/* Список товаров */}
        <div>
          {cartItems.map((item) => (
            <div
              key={item.id}
              style={{
                border: "1px solid #ddd",
                borderRadius: "8px",
                padding: "1rem",
                marginBottom: "1rem",
                display: "flex",
                gap: "1rem",
                alignItems: "center",
              }}
            >
              {item.equipment.main_image && (
                <img
                  src={item.equipment.main_image}
                  alt={item.equipment.name}
                  style={{
                    width: "100px",
                    height: "100px",
                    objectFit: "cover",
                    borderRadius: "4px",
                  }}
                />
              )}

              <div style={{ flex: 1 }}>
                <Link
                  to={`/equipment/item/${item.equipment.id}`}
                  style={{ textDecoration: "none", color: "inherit" }}
                >
                  <h3 style={{ margin: "0 0 0.5rem 0" }}>
                    {item.equipment.name}
                  </h3>
                </Link>

                <div
                  style={{
                    display: "flex",
                    justifyContent: "space-between",
                    alignItems: "center",
                  }}
                >
                  <div>
                    <div
                      style={{
                        color: "#007bff",
                        fontWeight: "bold",
                        fontSize: "1.25rem",
                      }}
                    >
                      {item.equipment.price} ₴ × {item.quantity} ={" "}
                      {item.equipment.price * item.quantity} ₴
                    </div>

                    <div
                      style={{
                        display: "flex",
                        alignItems: "center",
                        gap: "0.5rem",
                        marginTop: "0.5rem",
                      }}
                    >
                      <button
                        onClick={() =>
                          updateCartQuantity(
                            item.equipment.id,
                            item.quantity - 1
                          )
                        }
                        disabled={item.quantity <= 1}
                        style={{
                          width: "30px",
                          height: "30px",
                          border: "1px solid #ddd",
                          backgroundColor: "white",
                          borderRadius: "4px",
                          cursor: item.quantity > 1 ? "pointer" : "not-allowed",
                        }}
                      >
                        -
                      </button>
                      <span style={{ fontWeight: "bold" }}>
                        {item.quantity}
                      </span>
                      <button
                        onClick={() =>
                          updateCartQuantity(
                            item.equipment.id,
                            item.quantity + 1
                          )
                        }
                        disabled={item.quantity >= item.equipment.stock}
                        style={{
                          width: "30px",
                          height: "30px",
                          border: "1px solid #ddd",
                          backgroundColor: "white",
                          borderRadius: "4px",
                          cursor:
                            item.quantity < item.equipment.stock
                              ? "pointer"
                              : "not-allowed",
                        }}
                      >
                        +
                      </button>
                    </div>
                  </div>

                  <button
                    onClick={() => removeFromCart(item.equipment.id)}
                    style={{
                      padding: "0.5rem 1rem",
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
            </div>
          ))}
        </div>

        {/* Сумма заказа */}
        <div
          style={{
            border: "1px solid #ddd",
            borderRadius: "8px",
            padding: "1.5rem",
            height: "fit-content",
          }}
        >
          <h2 style={{ margin: "0 0 1rem 0" }}>Замовлення</h2>

          <div style={{ marginBottom: "1rem" }}>
            <div
              style={{
                display: "flex",
                justifyContent: "space-between",
                marginBottom: "0.5rem",
              }}
            >
              <span>Товари ({calculateTotalItems()}):</span>
              <span>{calculateTotal()} ₴</span>
            </div>

            <div
              style={{
                display: "flex",
                justifyContent: "space-between",
                marginBottom: "0.5rem",
              }}
            >
              <span>Доставка:</span>
              <span>Безкоштовно</span>
            </div>

            <div
              style={{
                display: "flex",
                justifyContent: "space-between",
                marginTop: "1rem",
                paddingTop: "1rem",
                borderTop: "1px solid #ddd",
                fontWeight: "bold",
                fontSize: "1.25rem",
              }}
            >
              <span>Всього:</span>
              <span>{calculateTotal()} ₴</span>
            </div>
          </div>

          <button
            onClick={handleCheckout}
            disabled={loading}
            style={{
              width: "100%",
              padding: "1rem",
              backgroundColor: "#28a745",
              color: "white",
              border: "none",
              borderRadius: "4px",
              fontSize: "1.1rem",
              fontWeight: "bold",
              cursor: loading ? "not-allowed" : "pointer",
              marginBottom: "1rem",
            }}
          >
            {loading ? "Обробка..." : "Оформити замовлення"}
          </button>

          <Link
            to="/equipment"
            style={{
              display: "block",
              textAlign: "center",
              padding: "0.5rem",
              color: "#007bff",
              textDecoration: "none",
            }}
          >
            Продовжити покупки
          </Link>
        </div>
      </div>
    </div>
  );
}
