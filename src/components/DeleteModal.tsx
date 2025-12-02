import { useState } from "react";

interface DeleteModalProps {
  equipmentName: string;
  onConfirm: () => void;
  onClose: () => void;
}

export default function DeleteModal({
  equipmentName,
  onConfirm,
  onClose,
}: DeleteModalProps) {
  const [loading, setLoading] = useState(false);

  const handleConfirm = async () => {
    setLoading(true);
    try {
      await onConfirm();
    } finally {
      setLoading(false);
    }
  };

  return (
    <div
      style={{
        position: "fixed",
        top: 0,
        left: 0,
        right: 0,
        bottom: 0,
        backgroundColor: "rgba(0,0,0,0.5)",
        display: "flex",
        alignItems: "center",
        justifyContent: "center",
        zIndex: 1000,
      }}
    >
      <div
        style={{
          backgroundColor: "white",
          padding: 30,
          borderRadius: 8,
          width: "90%",
          maxWidth: 400,
        }}
      >
        <h2>Підтвердіть видалення</h2>
        <p>
          Ви дійсно хочете видалити товар{" "}
          <strong>"{equipmentName}"</strong>?
        </p>
        <p style={{ color: "#dc3545", fontWeight: "bold" }}>
          Цю дію неможливо скасувати!
        </p>
        <div style={{ display: "flex", gap: 10, marginTop: 20 }}>
          <button
            onClick={handleConfirm}
            disabled={loading}
            style={{
              padding: "10px 20px",
              backgroundColor: "#dc3545",
              color: "white",
              border: "none",
              borderRadius: 4,
              cursor: loading ? "not-allowed" : "pointer",
              flex: 1,
              opacity: loading ? 0.7 : 1,
            }}
          >
            {loading ? "Видалення..." : "Видалити"}
          </button>
          <button
            onClick={onClose}
            disabled={loading}
            style={{
              padding: "10px 20px",
              backgroundColor: "#6c757d",
              color: "white",
              border: "none",
              borderRadius: 4,
              cursor: loading ? "not-allowed" : "pointer",
              flex: 1,
            }}
          >
            Скасувати
          </button>
        </div>
      </div>
    </div>
  );
}