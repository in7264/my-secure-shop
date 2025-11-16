import React, { useEffect, useState } from 'react';
import { supabase } from '../lib/supabase';
import type { Equipment } from '../types/equipment';

export default function EquipmentList() {
  const [items, setItems] = useState<Equipment[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    loadItems();
    // Опціонально: підписка на realtime оновлення
  }, []);

  async function loadItems() {
    setLoading(true);
    const { data, error } = await supabase
      .from<Equipment>('equipment')
      .select('*')
      .order('created_at', { ascending: false });

    if (error) {
      console.error(error);
      setLoading(false);
      return;
    }
    setItems(data ?? []);
    setLoading(false);
  }

  return (
    <div style={{ padding: 20 }}>
      <h2>Каталог обладнання</h2>
      {loading ? <p>Завантаження...</p> : (
        <div>
          {items.map(it => (
            <div key={it.id} style={{ border: '1px solid #ddd', padding: 10, marginBottom: 10 }}>
              <h3>{it.name} — {it.price} ₴</h3>
              <p>{it.description}</p>
              <small>В наявності: {it.stock}</small>
            </div>
          ))}
        </div>
      )}
    </div>
  );
}
