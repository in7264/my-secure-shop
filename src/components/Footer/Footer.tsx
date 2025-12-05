import { Link } from "react-router-dom";
import "../../App.scss";

export default function Footer() {
  return (
    <footer className="footer">
      <div className="footer-content">
        <div className="footer-section">
          <h3>Технічне обладнання</h3>
          <p>Магазин якісного технічного обладнання</p>
          <p>© 2024 Всі права захищені</p>
        </div>
        <div className="footer-section">
          <h3>Категорії</h3>
          <ul className="footer-links">
            <li>
              <Link to="/equipment/category/phones">Телефони</Link>
            </li>
            <li>
              <Link to="/equipment/category/laptops">Ноутбуки</Link>
            </li>
            <li>
              <Link to="/equipment/category/tablets">Планшети</Link>
            </li>
            <li>
              <Link to="/equipment/category/accessories">Аксесуари</Link>
            </li>
          </ul>
        </div>
        <div className="footer-section">
          <h3>Користувачу</h3>
          <ul className="footer-links">
            <li>
              <Link to="/cart">Кошик</Link>
            </li>
            <li>
              <Link to="/favorites">Обране</Link>
            </li>
            <li>
              <Link to="/auth">Особистий кабінет</Link>
            </li>
            <li>
              <Link to="/equipment">Каталог</Link>
            </li>
          </ul>
        </div>
        <div className="footer-section">
          <h3>Контакти</h3>
          <p>Email: support@equipment.com</p>
          <p>Телефон: +380 12 345 6789</p>
          <p>Графік: Пн-Пт 9:00-18:00</p>
        </div>
      </div>
      <div className="copyright">
        <p>© 2024 Equipment Store. Всі права захищені.</p>
      </div>
    </footer>
  );
}
