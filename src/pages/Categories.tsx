import { useEffect, useState } from 'react';
import { Link } from 'react-router-dom';

export default function Categories() {
  const [categories, setCategories] = useState<string[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  const API = import.meta.env.VITE_API as string;

  useEffect(() => {
    loadCategories();
  }, []);

  async function loadCategories() {
    try {
      setLoading(true);
      setError(null);
      
      const res = await fetch(`${API}/equipment/categories`);
      
      if (!res.ok) {
        throw new Error(`HTTP error! status: ${res.status}`);
      }
      
      const data = await res.json();
      setCategories(data.categories || []);
    } catch (err) {
      console.error('Error loading categories:', err);
      setError('Не вдалося завантажити категорії');
    } finally {
      setLoading(false);
    }
  }

  if (loading) {
    return (
      <div style={{ padding: 20, textAlign: 'center' }}>
        <h2>Категорії обладнання</h2>
        <p>Завантаження...</p>
      </div>
    );
  }

  if (error) {
    return (
      <div style={{ padding: 20, textAlign: 'center' }}>
        <h2>Категорії обладнання</h2>
        <p style={{ color: 'red' }}>{error}</p>
        <button onClick={loadCategories}>Спробувати знову</button>
      </div>
    );
  }

  return (
    <div style={{ padding: 20 }}>
      <h2>Категорії обладнання</h2>
      
      {categories.length === 0 ? (
        <p>Категорії не знайдено</p>
      ) : (
        <div style={{ 
          display: 'grid', 
          gridTemplateColumns: 'repeat(auto-fill, minmax(250px, 1fr))', 
          gap: '15px',
          marginTop: '20px'
        }}>
          {categories.map((category, index) => (
            <Link 
              key={index}
              to={`/equipment/category/${encodeURIComponent(category)}`}
              style={{
                display: 'block',
                border: '2px solid #007bff',
                borderRadius: '8px',
                padding: '20px',
                textAlign: 'center',
                textDecoration: 'none',
                color: '#007bff',
                fontWeight: 'bold',
                fontSize: '18px',
                transition: 'all 0.3s ease',
                backgroundColor: '#f8f9fa'
              }}
              onMouseEnter={(e) => {
                e.currentTarget.style.backgroundColor = '#007bff';
                e.currentTarget.style.color = 'white';
                e.currentTarget.style.transform = 'translateY(-2px)';
              }}
              onMouseLeave={(e) => {
                e.currentTarget.style.backgroundColor = '#f8f9fa';
                e.currentTarget.style.color = '#007bff';
                e.currentTarget.style.transform = 'translateY(0)';
              }}
            >
              {category}
            </Link>
          ))}
        </div>
      )}
    </div>
  );
}