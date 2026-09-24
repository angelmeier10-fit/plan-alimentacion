import { useState, useEffect } from "react";
import { Plus, Trash2, Check, NotebookPen } from "lucide-react";
import Card from "../components/Card.jsx";
import SectionTitle from "../components/SectionTitle.jsx";
import { getIcon } from "../iconMap.js";
import {
  subscribeShoppingNotes, addShoppingNote, updateShoppingNotes, setShoppingItemChecked, clearShoppingChecked,
} from "../firestoreApi.js";

function CheckRow({ text, done, onToggle, accent, fontSize = 13.5, children }) {
  return (
    <li style={{ display: "flex", alignItems: "center", gap: 10 }}>
      <button
        onClick={onToggle}
        aria-label={done ? "Desmarcar" : "Marcar como comprado"}
        style={{
          width: 22, height: 22, flexShrink: 0, borderRadius: 7, cursor: "pointer", padding: 0,
          display: "flex", alignItems: "center", justifyContent: "center",
          border: `1.5px solid ${done ? accent : "#CFC8BA"}`, background: done ? accent : "#fff",
        }}
      >
        {done && <Check size={14} color="#fff" />}
      </button>
      <span
        onClick={onToggle}
        style={{
          flex: 1, fontSize, lineHeight: 1.5, cursor: "pointer", padding: "4px 0",
          color: done ? "#B3AC9C" : "#2B2823", textDecoration: done ? "line-through" : "none",
        }}
      >
        {text}
      </span>
      {children}
    </li>
  );
}

const linkButtonStyle = (accent) => ({
  border: "none", background: "none", color: accent, fontSize: 12.5, fontWeight: 600, cursor: "pointer", padding: 0,
});

function ShoppingNotes({ notes, accent, run }) {
  const [text, setText] = useState("");

  const handleAdd = () => {
    const t = text.trim();
    if (!t) return;
    run(addShoppingNote({ id: crypto.randomUUID(), text: t, done: false }).then(() => setText("")));
  };

  const toggle = (id) => run(updateShoppingNotes((list) => list.map((n) => (n.id === id ? { ...n, done: !n.done } : n))));
  const remove = (id) => run(updateShoppingNotes((list) => list.filter((n) => n.id !== id)));
  const clearDone = () => run(updateShoppingNotes((list) => list.filter((n) => !n.done)));

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

      <ul style={{ margin: 0, padding: 0, listStyle: "none", display: "flex", flexDirection: "column", gap: 4 }}>
        {notes.map((n) => (
          <CheckRow key={n.id} text={n.text} done={n.done} onToggle={() => toggle(n.id)} accent={accent}>
            <button
              onClick={() => remove(n.id)}
              aria-label="Borrar"
              style={{ border: "none", background: "none", cursor: "pointer", color: "#B3AC9C", padding: 4, display: "flex" }}
            >
              <Trash2 size={15} />
            </button>
          </CheckRow>
        ))}
      </ul>

      {notes.some((n) => n.done) && (
        <button onClick={clearDone} style={{ ...linkButtonStyle(accent), marginTop: 10 }}>
          Borrar los comprados
        </button>
      )}
    </Card>
  );
}

export default function ComprasTab({ data, accent }) {
  const [notes, setNotes] = useState([]);
  const [checked, setChecked] = useState([]);
  const [error, setError] = useState(null);

  useEffect(() => subscribeShoppingNotes(
    ({ list, checked }) => { setNotes(list); setChecked(checked); },
    () => setError("No se pudieron cargar las notas."),
  ), []);

  const run = (promise) => {
    setError(null);
    return promise.catch((err) => {
      console.error("shoppingNotes error:", err);
      setError("No se pudo guardar. Revisá la conexión.");
    });
  };

  const checkedSet = new Set(checked);

  return (
    <div style={{ display: "flex", flexDirection: "column", gap: 14 }}>
      <SectionTitle sub="Para los 6 días del plan, Ángel + Gabriela">Lista de compras</SectionTitle>
      {error && <p style={{ margin: 0, fontSize: 12.5, color: "#B5443A" }}>{error}</p>}
      <ShoppingNotes notes={notes} accent={accent} run={run} />
      {checked.length > 0 && (
        <button onClick={() => run(clearShoppingChecked())} style={{ ...linkButtonStyle(accent), alignSelf: "flex-end" }}>
          Destachar toda la lista
        </button>
      )}
      {data.map((s) => {
        const Icon = getIcon(s.icon);
        return (
          <Card key={s.cat}>
            <div style={{ display: "flex", alignItems: "center", gap: 8, marginBottom: 10 }}>
              <Icon size={17} color={accent} />
              <p style={{ margin: 0, fontSize: 14.5, fontWeight: 700 }}>{s.cat}</p>
            </div>
            <ul style={{ margin: 0, padding: 0, listStyle: "none", display: "flex", flexDirection: "column", gap: 4 }}>
              {s.items.map((it) => (
                <CheckRow
                  key={it}
                  text={it}
                  done={checkedSet.has(it)}
                  onToggle={() => run(setShoppingItemChecked(it, !checkedSet.has(it)))}
                  accent={accent}
                  fontSize={13}
                />
              ))}
            </ul>
          </Card>
        );
      })}
    </div>
  );
}
