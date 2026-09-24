import { useState, useEffect } from "react";
import { Plus, Trash2, Check, NotebookPen, Pencil, X } from "lucide-react";
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

function IconButton({ onClick, label, children, type = "button" }) {
  return (
    <button
      type={type}
      onClick={onClick}
      aria-label={label}
      style={{ border: "none", background: "none", cursor: "pointer", color: "#8A8376", padding: 6, display: "flex" }}
    >
      {children}
    </button>
  );
}

function NoteRow({ note, accent, fontSize, onToggle, onRemove, onRename }) {
  const [editing, setEditing] = useState(false);
  const [text, setText] = useState(note.text);

  const startEdit = () => { setText(note.text); setEditing(true); };

  const save = (e) => {
    e.preventDefault();
    const t = text.trim();
    if (!t || t === note.text) { setEditing(false); return; }
    onRename(t).then((ok) => ok && setEditing(false));
  };

  if (editing) {
    return (
      <li>
        <form onSubmit={save} style={{ display: "flex", alignItems: "center", gap: 4 }}>
          <input
            value={text}
            onChange={(e) => setText(e.target.value)}
            onKeyDown={(e) => e.key === "Escape" && setEditing(false)}
            autoFocus
            style={{
              flex: 1, minWidth: 0, padding: "8px 12px", background: "#fff", border: `1px solid ${accent}`,
              borderRadius: 10, fontSize, fontFamily: "'Inter', sans-serif",
            }}
          />
          <IconButton type="submit" label="Guardar"><Check size={17} color={accent} /></IconButton>
          <IconButton onClick={() => setEditing(false)} label="Cancelar"><X size={17} /></IconButton>
        </form>
      </li>
    );
  }

  return (
    <CheckRow text={note.text} done={note.done} onToggle={onToggle} accent={accent} fontSize={fontSize}>
      <IconButton onClick={startEdit} label="Editar"><Pencil size={15} /></IconButton>
      <IconButton onClick={onRemove} label="Borrar"><Trash2 size={15} /></IconButton>
    </CheckRow>
  );
}

function AddItemForm({ onAdd, accent, placeholder, autoFocus, style }) {
  const [text, setText] = useState("");

  const handleSubmit = (e) => {
    e.preventDefault();
    const t = text.trim();
    if (!t) return;
    onAdd(t).then((ok) => ok && setText(""));
  };

  return (
    <form onSubmit={handleSubmit} style={{ display: "flex", gap: 8, ...style }}>
      <input
        value={text}
        onChange={(e) => setText(e.target.value)}
        placeholder={placeholder}
        autoFocus={autoFocus}
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
  );
}

const linkButtonStyle = (accent) => ({
  border: "none", background: "none", color: accent, fontSize: 12.5, fontWeight: 600, cursor: "pointer", padding: 0,
});

const listStyle = { margin: 0, padding: 0, listStyle: "none", display: "flex", flexDirection: "column", gap: 4 };

function CategoryCard({ section, customItems, checkedSet, accent, run, addNote, toggleNote, removeNote, renameNote }) {
  const [adding, setAdding] = useState(false);
  const Icon = getIcon(section.icon);

  return (
    <Card>
      <div style={{ display: "flex", alignItems: "center", gap: 8, marginBottom: 10 }}>
        <Icon size={17} color={accent} />
        <p style={{ margin: 0, fontSize: 14.5, fontWeight: 700 }}>{section.cat}</p>
      </div>
      <ul style={listStyle}>
        {section.items.map((it) => (
          <CheckRow
            key={it}
            text={it}
            done={checkedSet.has(it)}
            onToggle={() => run(setShoppingItemChecked(it, !checkedSet.has(it)))}
            accent={accent}
            fontSize={13}
          />
        ))}
        {customItems.map((n) => (
          <NoteRow
            key={n.id}
            note={n}
            accent={accent}
            fontSize={13}
            onToggle={() => toggleNote(n.id)}
            onRemove={() => removeNote(n.id)}
            onRename={(text) => renameNote(n.id, text)}
          />
        ))}
      </ul>
      {adding ? (
        <AddItemForm
          onAdd={(text) => addNote(text, section.cat)}
          accent={accent}
          placeholder={`Agregar a ${section.cat}…`}
          autoFocus
          style={{ marginTop: 10 }}
        />
      ) : (
        <button onClick={() => setAdding(true)} style={{ ...linkButtonStyle(accent), marginTop: 10 }}>
          + Agregar ítem
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
    return promise.then(() => true, (err) => {
      console.error("shoppingNotes error:", err);
      setError("No se pudo guardar. Revisá la conexión.");
      return false;
    });
  };

  const addNote = (text, cat) =>
    run(addShoppingNote({ id: crypto.randomUUID(), text, done: false, ...(cat && { cat }) }));
  const toggleNote = (id) => run(updateShoppingNotes((list) => list.map((n) => (n.id === id ? { ...n, done: !n.done } : n))));
  const renameNote = (id, text) => run(updateShoppingNotes((list) => list.map((n) => (n.id === id ? { ...n, text } : n))));
  const removeNote = (id) => run(updateShoppingNotes((list) => list.filter((n) => n.id !== id)));
  const clearDoneNotes = () => run(updateShoppingNotes((list) => list.filter((n) => n.cat || !n.done)));
  const uncheckAll = () => run(Promise.all([
    clearShoppingChecked(),
    updateShoppingNotes((list) => list.map((n) => (n.cat ? { ...n, done: false } : n))),
  ]));

  const checkedSet = new Set(checked);
  const freeNotes = notes.filter((n) => !n.cat);
  const hasCheckedInList = checked.length > 0 || notes.some((n) => n.cat && n.done);

  return (
    <div style={{ display: "flex", flexDirection: "column", gap: 14 }}>
      <SectionTitle sub="Para los 6 días del plan, Ángel + Gabriela">Lista de compras</SectionTitle>
      {error && <p style={{ margin: 0, fontSize: 12.5, color: "#B5443A" }}>{error}</p>}

      <Card>
        <div style={{ display: "flex", alignItems: "center", gap: 8, marginBottom: 10 }}>
          <NotebookPen size={17} color={accent} />
          <p style={{ margin: 0, fontSize: 14.5, fontWeight: 700 }}>Mis notas</p>
        </div>
        <AddItemForm
          onAdd={(text) => addNote(text)}
          accent={accent}
          placeholder="Agregar algo para comprar…"
          style={{ marginBottom: freeNotes.length ? 12 : 0 }}
        />
        <ul style={listStyle}>
          {freeNotes.map((n) => (
            <NoteRow
              key={n.id}
              note={n}
              accent={accent}
              fontSize={13.5}
              onToggle={() => toggleNote(n.id)}
              onRemove={() => removeNote(n.id)}
              onRename={(text) => renameNote(n.id, text)}
            />
          ))}
        </ul>
        {freeNotes.some((n) => n.done) && (
          <button onClick={clearDoneNotes} style={{ ...linkButtonStyle(accent), marginTop: 10 }}>
            Borrar los comprados
          </button>
        )}
      </Card>

      {hasCheckedInList && (
        <button onClick={uncheckAll} style={{ ...linkButtonStyle(accent), alignSelf: "flex-end" }}>
          Destachar toda la lista
        </button>
      )}

      {data.map((s) => (
        <CategoryCard
          key={s.cat}
          section={s}
          customItems={notes.filter((n) => n.cat === s.cat)}
          checkedSet={checkedSet}
          accent={accent}
          run={run}
          addNote={addNote}
          toggleNote={toggleNote}
          removeNote={removeNote}
          renameNote={renameNote}
        />
      ))}
    </div>
  );
}
