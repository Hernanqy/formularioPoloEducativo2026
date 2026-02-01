import React, { useEffect, useMemo, useState } from "react";
import { deleteTaller, listTalleres } from "./lib/talleres";

export default function Talleres({ onOpen, theme }) {
  const [items, setItems] = useState([]);
  const [q, setQ] = useState("");

  const refresh = async () => setItems(await listTalleres());

  useEffect(() => {
    refresh();
  }, []);

  const filtered = useMemo(() => {
    const s = q.trim().toLowerCase();
    if (!s) return items;
    return items.filter((t) => {
      const nombre = (t.nombre || "").toLowerCase();
      const resp = (t.responsables || "").toLowerCase();
      const ejes = (t.ejes || "").toLowerCase();
      return nombre.includes(s) || resp.includes(s) || ejes.includes(s);
    });
  }, [items, q]);

  const fmt = (v) => (v ? v : "—");

  return (
    <div style={{ display: "grid", gap: 14 }}>
      <div style={{ display: "flex", gap: 10, flexWrap: "wrap" }}>
        <input
          value={q}
          onChange={(e) => setQ(e.target.value)}
          placeholder="Buscar por nombre, responsable o ejes…"
          style={{
            flex: "1 1 260px",
            padding: "12px 14px",
            borderRadius: 14,
            border: `1px solid ${theme.line}`,
            fontSize: 16,
            outline: "none",
          }}
        />
        <button
          onClick={refresh}
          style={{
            padding: "12px 14px",
            borderRadius: 14,
            border: `1px solid ${theme.line}`,
            background: "#fff",
            fontWeight: 900,
            cursor: "pointer",
          }}
        >
          Actualizar
        </button>
      </div>

      <div
        style={{
          display: "grid",
          gridTemplateColumns: "repeat(auto-fit, minmax(260px, 1fr))",
          gap: 12,
        }}
      >
        {filtered.map((t) => (
          <div
            key={t.id}
            style={{
              borderRadius: 18,
              border: `1px solid ${theme.line}`,
              background: "#fff",
              padding: 14,
              boxShadow: "0 10px 30px rgba(17,17,17,0.06)",
              display: "grid",
              gap: 8,
            }}
          >
            <div style={{ fontWeight: 950, fontSize: 16 }}>
              {t.nombre || "Sin nombre"}
            </div>

            <div style={{ opacity: 0.78, fontSize: 13 }}>
              ⏱️ {fmt(t.operativa?.duracion)} · 👥 {fmt(t.operativa?.cupo)}
            </div>

            <div style={{ opacity: 0.78, fontSize: 13 }}>
              🤝 {fmt(t.responsables)}
            </div>

            <div style={{ display: "flex", gap: 10, flexWrap: "wrap", marginTop: 6 }}>
              <button
                onClick={() => onOpen?.(t)}
                style={{
                  padding: "10px 12px",
                  borderRadius: 14,
                  border: "1px solid transparent",
                  background: theme.green,
                  color: "#fff",
                  fontWeight: 900,
                  cursor: "pointer",
                }}
              >
                Abrir
              </button>

              <button
                onClick={async () => {
                  const ok = confirm("¿Eliminar este taller? No se puede deshacer.");
                  if (!ok) return;
                  await deleteTaller(t.id);
                  await refresh();
                }}
                style={{
                  padding: "10px 12px",
                  borderRadius: 14,
                  border: `1px solid ${theme.line}`,
                  background: "#fff",
                  fontWeight: 900,
                  cursor: "pointer",
                }}
              >
                Eliminar
              </button>
            </div>
          </div>
        ))}
      </div>

      {!filtered.length && (
        <div style={{ opacity: 0.7, fontWeight: 800 }}>
          No hay talleres guardados todavía.
        </div>
      )}
    </div>
  );
}
