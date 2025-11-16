import React, { useState } from "react";
import { supabase } from "../lib/supabase";

export default function EquipmentForm({ onAdded }: { onAdded?: () => void }) {
  const [name, setName] = useState("");
  const [price, setPrice] = useState("");
  const [stock, setStock] = useState(0);
  const [description, setDescription] = useState("");

  async function submit(e: React.FormEvent) {
    e.preventDefault();
    // Отримуємо поточного користувача, щоб записати owner
    const user = supabase.auth.getUser
      ? (await supabase.auth.getUser()).data.user
      : null;

    const { data, error } = await supabase.from("equipment").insert({
      name,
      price,
      stock,
      description,
      owner: user?.id ?? null,
    });

    if (error) {
      alert("Error: " + error.message);
      return;
    }

    setName("");
    setPrice("");
    setStock(0);
    setDescription("");
    onAdded?.();
  }

  return (
    <form onSubmit={submit} style={{ marginBottom: 20 }}>
      <h3>Додати обладнання</h3>
      <input
        placeholder="Назва"
        value={name}
        onChange={(e) => setName(e.target.value)}
        required
      />
      <input
        placeholder="Ціна"
        value={price}
        onChange={(e) => setPrice(e.target.value)}
        required
      />
      <input
        placeholder="Кількість"
        type="number"
        value={stock}
        onChange={(e) => setStock(Number(e.target.value))}
      />
      <textarea
        placeholder="Опис"
        value={description}
        onChange={(e) => setDescription(e.target.value)}
      />
      <button type="submit">Додати</button>
    </form>
  );
}
