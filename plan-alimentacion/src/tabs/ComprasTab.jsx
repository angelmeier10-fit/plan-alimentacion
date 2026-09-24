import { useState, useEffect } from "react";
import { Plus, Trash2, Check, NotebookPen } from "lucide-react";
import Card from "../components/Card.jsx";
import SectionTitle from "../components/SectionTitle.jsx";
import { getIcon } from "../iconMap.js";
import { subscribeShoppingNotes, addShoppingNote, updateShoppingNotes } from "../firestoreApi.js";

function ShoppingNotes({ accent }) {
  const [notes, setNotes] = useState([]);
  const [text, setText] = useState("");
  const [error, setError] = useState(null);

  useEffect(() => subscribeShoppingNotes(setNotes, () => setError("No se pudieron cargar las notas.")), []);

  const run = (promise) => promise.catch((err) => {
    console.error("shoppingNotes error:", err);
    setError("No se pudo guardar. Revisá la conexión.");
  });

  const handleAdd = () => {
    const t = text.trim();
    if (!t) return;
    setError(null);
    run(addShoppingNote({ id: crypto.randomUUID(), text: t, done: false }).then(() => setText("")));
  };

  const toggle = (id) => run(updateShoppingNotes((list) => list.map((n) => (n.id === id ? { ...n, done: !n.done } : n))));
  const remove = (id) => run(updateShoppingNotes((list) => list.filter((n) => n.id !== id)));
  const clearDone = () => run(updateShoppingNotes((list) => list.filter((n) => !n.done)));

  const hasDone = notes.some((n) => n.done);

  return (
    <Card>
      <div style={{ display: "flex", alignItems: "center", gap: 8, marginBottom: 10 }}>
        <NotebookPen size={17} color={accent} />
        <p style={{ margin: 0, fontSize: 14.5, fontWeight: 700 }}>Mis notas</p>
      </div>

      <form
        onSubmit={(e) => { e.preventDefault(); handleAdd(); }}
        style={{ display: "flex", gap: 8, marginBottom: notes.length ? 12 : 0 }}
      >
        <input
          value={text}
          onChange={(e) => setText(e.target.value)}
          placeholder="Agregar algo para comprar…"
          style={{
            flex: 1, minWidth: 0, padding: "10px 14px", background: "#fff", border: "1px solid #ECE8DF",
            borderRadius: 12, fontSize: 14, fontFamily: "'Inter', sans-serif",
          }}
        />
        <button
          type="submit"
          aria-label="Agregar"
          style={{
            display: "flex", alignItems: "center", justifyContent: "center", padding: "0 14px", borderRadius: 12,
            color: "#fff", border: "none", cursor: "pointer", background: accent,
          }}
        >
          <Plus size={17} />
        </button>
      </form>

      {error && <p style={{ margin: "8px 0 0", fontSize: 12.5, color: "#B5443A" }}>{error}</p>}

      <ul style={{ margin: 0, padding: 0, listStyle: "none", display: "flex", flexDirection: "column", gap: 4 }}>
        {notes.map((n) => (
          <li key={n.id} style={{ display: "flex", alignItems: "center", gap: 10 }}>
            <button
              onClick={() => toggle(n.id)}
              aria-label={n.done ? "Desmarcar" : "Marcar como comprado"}
              style={{
                width: 22, height: 22, flexShrink: 0, borderRadius: 7, cursor: "pointer", padding: 0,
                display: "flex", alignItems: "center", justifyContent: "center",
                border: `1.5px solid ${n.done ? accent : "#CFC8BA"}`, background: n.done ? accent : "#fff",
              }}
            >
              {n.done && <Check size={14} color="#fff" />}
            </button>
            <span
              onClick={() => toggle(n.id)}
              style={{
                flex: 1, fontSize: 13.5, lineHeight: 1.5, cursor: "pointer", padding: "4px 0",
                color: n.done ? "#B3AC9C" : "#2B2823", textDecoration: n.done ? "line-through" : "none",
              }}
            >
              {n.text}
            </span>
            <button
              onClick={() => remove(n.id)}
              aria-label="Borrar"
              style={{ border: "none", background: "none", cursor: "pointer", color: "#B3AC9C", padding: 4, display: "flex" }}
            >
              <Trash2 size={15} />
            </button>
          </li>
        ))}
      </ul>

      {hasDone && (
        <button
          onClick={clearDone}
          style={{ marginTop: 10, border: "none", background: "none", color: accent, fontSize: 12.5, fontWeight: 600, cursor: "pointer", padding: 0 }}
        >
          Borrar los comprados
        </button>
      )}
    </Card>
  );
}

export default function ComprasTab({ data, accent }) {
  return (
    <div style={{ display: "flex", flexDirection: "column", gap: 14 }}>
      <SectionTitle sub="Para los 6 días del plan, Ángel + Gabriela">Lista de compras</SectionTitle>
      <ShoppingNotes accent={accent} />
      {data.map((s) => {
        const Icon = getIcon(s.icon);
        return (
          <Card key={s.cat}>
            <div style={{ display: "flex", alignItems: "center", gap: 8, marginBottom: 10 }}>
              <Icon size={17} color={accent} />
              <p style={{ margin: 0, fontSize: 14.5, fontWeight: 700 }}>{s.cat}</p>
            </div>
            <ul style={{ margin: 0, padding: 0, listStyle: "none", display: "flex", flexDirection: "column", gap: 6 }}>
              {s.items.map((it) => (
                <li key={it} style={{ display: "flex", gap: 8, fontSize: 13, lineHeight: 1.5, color: "#2B2823" }}>
                  <span style={{ color: accent, marginTop: 2 }}>•</span>
                  <span>{it}</span>
                </li>
              ))}
            </ul>
          </Card>
        );
      })}
    </div>
  );
}
