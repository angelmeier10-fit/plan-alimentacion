import { useState, useEffect, useRef } from "react";
import {
  Plus, Trash2, Check, Pencil, X, ChevronUp, ChevronDown, RefreshCw, Undo2,
  Beef, Fish, Egg, Milk, Carrot, Apple, Wheat, Croissant, Droplet, Candy, Snowflake,
  SprayCan, Package, Sparkles, ShoppingBasket, NotebookPen,
} from "lucide-react";
import Card from "../components/Card.jsx";
import SectionTitle from "../components/SectionTitle.jsx";
import { subscribeShoppingList, updateShoppingList } from "../firestoreApi.js";

const CATEGORY_ICONS = {
  ShoppingBasket, Beef, Fish, Egg, Milk, Carrot, Apple, Wheat, Croissant,
  Droplet, Candy, Snowflake, SprayCan, Package, Sparkles, NotebookPen,
};
const DEFAULT_ICON = "ShoppingBasket";
const UNDO_MS = 6000;

const newId = () => crypto.randomUUID();

const linkButtonStyle = (color) => ({
  border: "none", background: "none", color, fontSize: 12.5, fontWeight: 600, cursor: "pointer", padding: 0,
});
const listStyle = { margin: 0, padding: 0, listStyle: "none", display: "flex", flexDirection: "column", gap: 4 };
const inputStyle = {
  flex: 1, minWidth: 0, padding: "10px 14px", background: "#fff", border: "1px solid #ECE8DF",
  borderRadius: 12, fontSize: 14, fontFamily: "'Inter', sans-serif", boxSizing: "border-box",
};

// Lo comprado va al final de su categoría.
const displayOrder = (items) => [...items.filter((i) => !i.done), ...items.filter((i) => i.done)];

const insertAt = (arr, index, value) => [...arr.slice(0, index), value, ...arr.slice(index)];

function IconButton({ onClick, label, children, type = "button", disabled }) {
  return (
    <button
      type={type}
      onClick={onClick}
      aria-label={label}
      disabled={disabled}
      style={{
        border: "none", background: "none", cursor: disabled ? "default" : "pointer",
        color: "#8A8376", opacity: disabled ? 0.3 : 1, padding: 6, display: "flex",
      }}
    >
      {children}
    </button>
  );
}

function PrimaryButton({ children, onClick, accent, type = "button", label }) {
  return (
    <button
      type={type}
      onClick={onClick}
      aria-label={label}
      style={{
        display: "flex", alignItems: "center", justifyContent: "center", gap: 6, padding: "0 14px", minHeight: 40,
        borderRadius: 12, color: "#fff", border: "none", cursor: "pointer", background: accent, fontSize: 13.5, fontWeight: 600,
      }}
    >
      {children}
    </button>
  );
}

function CheckRow({ text, done, onToggle, accent, children }) {
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
          flex: 1, fontSize: 13.5, lineHeight: 1.5, cursor: "pointer", padding: "4px 0",
          color: done ? "#B3AC9C" : "#2B2823", textDecoration: done ? "line-through" : "none",
        }}
      >
        {text}
      </span>
      {children}
    </li>
  );
}

function ItemRow({ item, categories, accent, reordering, actions, onMoveUp, onMoveDown }) {
  const [editing, setEditing] = useState(false);
  const [text, setText] = useState(item.text);
  const [catId, setCatId] = useState(item.catId);

  const startEdit = () => { setText(item.text); setCatId(item.catId); setEditing(true); };

  const save = (e) => {
    e.preventDefault();
    const t = text.trim();
    if (!t) return;
    if (t === item.text && catId === item.catId) { setEditing(false); return; }
    actions.saveItem(item.id, t, catId).then((ok) => ok && setEditing(false));
  };

  if (editing) {
    return (
      <li>
        <form onSubmit={save} style={{ display: "flex", flexDirection: "column", gap: 6, padding: "4px 0" }}>
          <input
            value={text}
            onChange={(e) => setText(e.target.value)}
            onKeyDown={(e) => e.key === "Escape" && setEditing(false)}
            autoFocus
            style={{ ...inputStyle, border: `1px solid ${accent}` }}
          />
          <div style={{ display: "flex", alignItems: "center", gap: 4 }}>
            <select
              value={catId}
              onChange={(e) => setCatId(e.target.value)}
              aria-label="Categoría"
              style={{ ...inputStyle, padding: "8px 10px" }}
            >
              {categories.map((c) => <option key={c.id} value={c.id}>{c.name}</option>)}
            </select>
            <IconButton type="submit" label="Guardar"><Check size={18} color={accent} /></IconButton>
            <IconButton onClick={() => setEditing(false)} label="Cancelar"><X size={18} /></IconButton>
          </div>
        </form>
      </li>
    );
  }

  return (
    <CheckRow text={item.text} done={item.done} onToggle={() => actions.toggleItem(item.id)} accent={accent}>
      {reordering ? (
        <>
          <IconButton onClick={onMoveUp} disabled={!onMoveUp} label="Subir"><ChevronUp size={18} /></IconButton>
          <IconButton onClick={onMoveDown} disabled={!onMoveDown} label="Bajar"><ChevronDown size={18} /></IconButton>
        </>
      ) : (
        <>
          <IconButton onClick={startEdit} label="Editar"><Pencil size={15} /></IconButton>
          <IconButton onClick={() => actions.removeItem(item.id)} label="Borrar"><Trash2 size={15} /></IconButton>
        </>
      )}
    </CheckRow>
  );
}

function AddItemForm({ onAdd, accent, placeholder, onCancel }) {
  const [text, setText] = useState("");

  const handleSubmit = (e) => {
    e.preventDefault();
    const t = text.trim();
    if (!t) return;
    onAdd(t).then((ok) => ok && setText(""));
  };

  return (
    <form onSubmit={handleSubmit} style={{ display: "flex", gap: 8, marginTop: 10 }}>
      <input
        value={text}
        onChange={(e) => setText(e.target.value)}
        onKeyDown={(e) => e.key === "Escape" && onCancel()}
        placeholder={placeholder}
        autoFocus
        style={inputStyle}
      />
      <PrimaryButton type="submit" accent={accent} label="Agregar"><Plus size={17} /></PrimaryButton>
    </form>
  );
}

function IconPicker({ value, onChange, accent }) {
  return (
    <div style={{ display: "flex", flexWrap: "wrap", gap: 6 }}>
      {Object.entries(CATEGORY_ICONS).map(([name, Icon]) => (
        <button
          key={name}
          type="button"
          onClick={() => onChange(name)}
          aria-label={`Ícono ${name}`}
          style={{
            width: 36, height: 36, borderRadius: 10, cursor: "pointer", display: "flex", alignItems: "center", justifyContent: "center",
            border: `1.5px solid ${value === name ? accent : "#ECE8DF"}`, background: value === name ? `${accent}14` : "#fff",
          }}
        >
          <Icon size={17} color={value === name ? accent : "#6B6459"} />
        </button>
      ))}
    </div>
  );
}

function CategoryEditor({ category, categories, itemCount, accent, actions, onClose }) {
  const [name, setName] = useState(category.name);
  const [icon, setIcon] = useState(category.icon ?? DEFAULT_ICON);
  const [confirmDelete, setConfirmDelete] = useState(false);
  const others = categories.filter((c) => c.id !== category.id);
  const [targetId, setTargetId] = useState(others[0]?.id ?? "");
  const index = categories.findIndex((c) => c.id === category.id);

  const save = (e) => {
    e.preventDefault();
    const n = name.trim();
    if (!n) return;
    actions.saveCategory(category.id, n, icon).then((ok) => ok && onClose());
  };

  const remove = (moveToId) => actions.deleteCategory(category.id, moveToId).then((ok) => ok && onClose());

  return (
    <form onSubmit={save} style={{ display: "flex", flexDirection: "column", gap: 10, marginBottom: 12 }}>
      <input value={name} onChange={(e) => setName(e.target.value)} autoFocus style={{ ...inputStyle, border: `1px solid ${accent}` }} />
      <IconPicker value={icon} onChange={setIcon} accent={accent} />
      <div style={{ display: "flex", alignItems: "center", gap: 4 }}>
        <span style={{ fontSize: 12.5, color: "#6B6459", flex: 1 }}>Posición de la categoría</span>
        <IconButton onClick={() => actions.moveCategory(category.id, -1)} disabled={index === 0} label="Subir categoría">
          <ChevronUp size={18} />
        </IconButton>
        <IconButton onClick={() => actions.moveCategory(category.id, 1)} disabled={index === categories.length - 1} label="Bajar categoría">
          <ChevronDown size={18} />
        </IconButton>
      </div>

      {confirmDelete ? (
        <div style={{ background: "#FBF3EF", borderRadius: 12, padding: 12, display: "flex", flexDirection: "column", gap: 8 }}>
          {itemCount === 0 ? (
            <p style={{ margin: 0, fontSize: 13 }}>¿Borrar la categoría "{category.name}"?</p>
          ) : (
            <>
              <p style={{ margin: 0, fontSize: 13, lineHeight: 1.5 }}>
                "{category.name}" tiene {itemCount} {itemCount === 1 ? "ítem" : "ítems"}. Podés pasarlos a otra categoría o borrar todo.
              </p>
              {others.length > 0 && (
                <div style={{ display: "flex", gap: 6, alignItems: "center" }}>
                  <select value={targetId} onChange={(e) => setTargetId(e.target.value)} aria-label="Mover a" style={{ ...inputStyle, padding: "8px 10px" }}>
                    {others.map((c) => <option key={c.id} value={c.id}>{c.name}</option>)}
                  </select>
                  <PrimaryButton accent={accent} onClick={() => remove(targetId)}>Mover y borrar</PrimaryButton>
                </div>
              )}
            </>
          )}
          <div style={{ display: "flex", gap: 16 }}>
            <button type="button" onClick={() => remove(null)} style={linkButtonStyle("#B5443A")}>
              {itemCount === 0 ? "Borrar" : "Borrar todo"}
            </button>
            <button type="button" onClick={() => setConfirmDelete(false)} style={linkButtonStyle("#6B6459")}>Cancelar</button>
          </div>
        </div>
      ) : (
        <div style={{ display: "flex", alignItems: "center", gap: 16 }}>
          <PrimaryButton type="submit" accent={accent}>Guardar</PrimaryButton>
          <button type="button" onClick={onClose} style={linkButtonStyle("#6B6459")}>Cancelar</button>
          <button type="button" onClick={() => setConfirmDelete(true)} style={{ ...linkButtonStyle("#B5443A"), marginLeft: "auto" }}>
            Borrar categoría
          </button>
        </div>
      )}
    </form>
  );
}

function CategoryCard({ category, categories, items, accent, actions }) {
  const [adding, setAdding] = useState(false);
  const [reordering, setReordering] = useState(false);
  const [editing, setEditing] = useState(false);
  const Icon = CATEGORY_ICONS[category.icon] ?? CATEGORY_ICONS[DEFAULT_ICON];
  const shown = displayOrder(items);

  // Las flechas mueven dentro del mismo grupo (pendientes o comprados) para respetar el orden visible.
  const canMove = (i, dir) => {
    const j = i + dir;
    return j >= 0 && j < shown.length && shown[j].done === shown[i].done;
  };

  return (
    <Card>
      <div style={{ display: "flex", alignItems: "center", gap: 8, marginBottom: 10 }}>
        <Icon size={17} color={accent} />
        <p style={{ margin: 0, fontSize: 14.5, fontWeight: 700, flex: 1 }}>{category.name}</p>
        {!editing && items.length > 1 && (
          <button onClick={() => setReordering((r) => !r)} style={linkButtonStyle(accent)}>
            {reordering ? "Listo" : "Ordenar"}
          </button>
        )}
        {!editing && !reordering && (
          <IconButton onClick={() => setEditing(true)} label="Editar categoría"><Pencil size={15} /></IconButton>
        )}
      </div>

      {editing && (
        <CategoryEditor
          category={category}
          categories={categories}
          itemCount={items.length}
          accent={accent}
          actions={actions}
          onClose={() => setEditing(false)}
        />
      )}

      <ul style={listStyle}>
        {shown.map((item, i) => (
          <ItemRow
            key={item.id}
            item={item}
            categories={categories}
            accent={accent}
            reordering={reordering}
            actions={actions}
            onMoveUp={canMove(i, -1) ? () => actions.swapItems(item.id, shown[i - 1].id) : null}
            onMoveDown={canMove(i, 1) ? () => actions.swapItems(item.id, shown[i + 1].id) : null}
          />
        ))}
      </ul>
      {items.length === 0 && !adding && <p style={{ margin: 0, fontSize: 12.5, color: "#B3AC9C" }}>Sin ítems.</p>}

      {adding ? (
        <AddItemForm
          onAdd={(text) => actions.addItem(text, category.id)}
          accent={accent}
          placeholder={`Agregar a ${category.name}…`}
          onCancel={() => setAdding(false)}
        />
      ) : (
        <div style={{ display: "flex", alignItems: "center", marginTop: 10 }}>
          <button onClick={() => setAdding(true)} style={linkButtonStyle(accent)}>+ Agregar ítem</button>
          {items.some((i) => i.done) && (
            <button onClick={() => actions.clearDone(category.id)} style={{ ...linkButtonStyle("#6B6459"), marginLeft: "auto" }}>
              Borrar los comprados
            </button>
          )}
        </div>
      )}
    </Card>
  );
}

function NewCategoryForm({ accent, actions }) {
  const [open, setOpen] = useState(false);
  const [name, setName] = useState("");
  const [icon, setIcon] = useState(DEFAULT_ICON);

  const submit = (e) => {
    e.preventDefault();
    const n = name.trim();
    if (!n) return;
    actions.addCategory(n, icon).then((ok) => {
      if (!ok) return;
      setName("");
      setIcon(DEFAULT_ICON);
      setOpen(false);
    });
  };

  if (!open) {
    return (
      <button onClick={() => setOpen(true)} style={{ ...linkButtonStyle(accent), alignSelf: "flex-start" }}>
        + Nueva categoría
      </button>
    );
  }

  return (
    <Card>
      <form onSubmit={submit} style={{ display: "flex", flexDirection: "column", gap: 10 }}>
        <p style={{ margin: 0, fontSize: 14.5, fontWeight: 700 }}>Nueva categoría</p>
        <input
          value={name}
          onChange={(e) => setName(e.target.value)}
          placeholder="Nombre (ej: Limpieza)"
          autoFocus
          style={inputStyle}
        />
        <IconPicker value={icon} onChange={setIcon} accent={accent} />
        <div style={{ display: "flex", alignItems: "center", gap: 16 }}>
          <PrimaryButton type="submit" accent={accent}>Crear</PrimaryButton>
          <button type="button" onClick={() => setOpen(false)} style={linkButtonStyle("#6B6459")}>Cancelar</button>
        </div>
      </form>
    </Card>
  );
}

function RegenerateButton({ accent, onConfirm }) {
  const [confirming, setConfirming] = useState(false);

  if (!confirming) {
    return (
      <button
        onClick={() => setConfirming(true)}
        style={{ ...linkButtonStyle("#6B6459"), display: "flex", alignItems: "center", gap: 6, alignSelf: "flex-start" }}
      >
        <RefreshCw size={13} /> Regenerar la lista desde el plan
      </button>
    );
  }

  return (
    <Card style={{ background: "#FBF8F2" }}>
      <p style={{ margin: "0 0 10px", fontSize: 13, lineHeight: 1.5 }}>
        Los ítems que vienen del plan se reemplazan por las cantidades actuales del plan (también los que editaste).
        Tus ítems propios y tus categorías no se tocan.
      </p>
      <div style={{ display: "flex", alignItems: "center", gap: 16 }}>
        <PrimaryButton accent={accent} onClick={() => onConfirm().then((ok) => ok && setConfirming(false))}>Regenerar</PrimaryButton>
        <button onClick={() => setConfirming(false)} style={linkButtonStyle("#6B6459")}>Cancelar</button>
      </div>
    </Card>
  );
}

function UndoToast({ undo, onUndo }) {
  if (!undo) return null;
  return (
    <div
      role="status"
      style={{
        position: "fixed", left: "50%", transform: "translateX(-50%)", bottom: 96, zIndex: 20,
        width: "calc(100% - 32px)", maxWidth: 440, boxSizing: "border-box",
        display: "flex", alignItems: "center", gap: 12, padding: "12px 16px", borderRadius: 14,
        background: "#2B2823", color: "#fff", boxShadow: "0 8px 24px -8px rgba(0,0,0,0.35)",
      }}
    >
      <span style={{ flex: 1, fontSize: 13.5 }}>{undo.message}</span>
      <button onClick={onUndo} style={{ ...linkButtonStyle("#fff"), display: "flex", alignItems: "center", gap: 6, fontSize: 13.5 }}>
        <Undo2 size={15} /> Deshacer
      </button>
    </div>
  );
}

export default function ComprasTab({ data, accent }) {
  const [shopping, setShopping] = useState({ categories: [], list: [] });
  const [error, setError] = useState(null);
  const [undo, setUndo] = useState(null);
  const undoTimer = useRef(null);

  useEffect(() => subscribeShoppingList(setShopping, () => setError("No se pudo cargar la lista.")), []);
  useEffect(() => () => clearTimeout(undoTimer.current), []);

  const update = (fn) => {
    setError(null);
    return updateShoppingList(fn).then(() => true, (err) => {
      console.error("updateShoppingList error:", err);
      setError("No se pudo guardar. Revisá la conexión.");
      return false;
    });
  };

  const offerUndo = (message, revert) => {
    clearTimeout(undoTimer.current);
    setUndo({ message, revert });
    undoTimer.current = setTimeout(() => setUndo(null), UNDO_MS);
  };

  const handleUndo = () => {
    clearTimeout(undoTimer.current);
    const { revert } = undo;
    setUndo(null);
    update(revert);
  };

  const mapItem = (id, fn) => (d) => ({ ...d, list: d.list.map((i) => (i.id === id ? fn(i) : i)) });

  // El deshacer re-inserta lo borrado en vez de restaurar una copia vieja, para no pisar cambios del otro celular.
  const actions = {
    addItem: (text, catId) => update((d) => ({ ...d, list: [...d.list, { id: newId(), text, done: false, catId }] })),
    toggleItem: (id) => update(mapItem(id, (i) => ({ ...i, done: !i.done }))),
    saveItem: (id, text, catId) => update((d) => {
      const item = d.list.find((i) => i.id === id);
      if (!item) return d;
      const next = { ...item, text, catId };
      // Al cambiar de categoría queda al final de la nueva.
      if (catId === item.catId) return mapItem(id, () => next)(d);
      return { ...d, list: [...d.list.filter((i) => i.id !== id), next] };
    }),
    swapItems: (idA, idB) => update((d) => {
      const a = d.list.findIndex((i) => i.id === idA);
      const b = d.list.findIndex((i) => i.id === idB);
      if (a < 0 || b < 0) return d;
      const list = [...d.list];
      [list[a], list[b]] = [list[b], list[a]];
      return { ...d, list };
    }),
    removeItem: (id) => {
      const index = shopping.list.findIndex((i) => i.id === id);
      const item = shopping.list[index];
      if (!item) return Promise.resolve(false);
      return update((d) => ({ ...d, list: d.list.filter((i) => i.id !== id) })).then((ok) => {
        if (ok) offerUndo(`Borraste "${item.text}"`, (d) => (
          d.list.some((i) => i.id === id) ? d : { ...d, list: insertAt(d.list, Math.min(index, d.list.length), item) }
        ));
        return ok;
      });
    },
    clearDone: (catId) => {
      const removed = shopping.list.map((item, index) => ({ item, index })).filter(({ item }) => item.catId === catId && item.done);
      if (removed.length === 0) return Promise.resolve(false);
      const ids = new Set(removed.map(({ item }) => item.id));
      return update((d) => ({ ...d, list: d.list.filter((i) => !ids.has(i.id)) })).then((ok) => {
        if (ok) offerUndo(`Borraste ${removed.length} ${removed.length === 1 ? "comprado" : "comprados"}`, (d) => {
          let list = d.list;
          for (const { item, index } of removed) {
            if (!list.some((i) => i.id === item.id)) list = insertAt(list, Math.min(index, list.length), item);
          }
          return { ...d, list };
        });
        return ok;
      });
    },
    addCategory: (name, icon) => update((d) => ({ ...d, categories: [...d.categories, { id: newId(), name, icon }] })),
    saveCategory: (id, name, icon) => update((d) => ({
      ...d, categories: d.categories.map((c) => (c.id === id ? { ...c, name, icon } : c)),
    })),
    moveCategory: (id, dir) => update((d) => {
      const i = d.categories.findIndex((c) => c.id === id);
      const j = i + dir;
      if (i < 0 || j < 0 || j >= d.categories.length) return d;
      const categories = [...d.categories];
      [categories[i], categories[j]] = [categories[j], categories[i]];
      return { ...d, categories };
    }),
    deleteCategory: (id, moveToId) => {
      const catIndex = shopping.categories.findIndex((c) => c.id === id);
      const category = shopping.categories[catIndex];
      if (!category) return Promise.resolve(false);
      const affected = shopping.list.map((item, index) => ({ item, index })).filter(({ item }) => item.catId === id);
      return update((d) => ({
        categories: d.categories.filter((c) => c.id !== id),
        list: moveToId
          ? d.list.map((i) => (i.catId === id ? { ...i, catId: moveToId } : i))
          : d.list.filter((i) => i.catId !== id),
      })).then((ok) => {
        if (ok) offerUndo(`Borraste la categoría "${category.name}"`, (d) => {
          const categories = d.categories.some((c) => c.id === id)
            ? d.categories
            : insertAt(d.categories, Math.min(catIndex, d.categories.length), category);
          if (moveToId) {
            const ids = new Set(affected.map(({ item }) => item.id));
            return { categories, list: d.list.map((i) => (ids.has(i.id) ? { ...i, catId: id } : i)) };
          }
          let list = d.list;
          for (const { item, index } of affected) {
            if (!list.some((i) => i.id === item.id)) list = insertAt(list, Math.min(index, list.length), item);
          }
          return { categories, list };
        });
        return ok;
      });
    },
  };

  const uncheckAll = () => update((d) => ({ ...d, list: d.list.map((i) => ({ ...i, done: false })) }));

  // Reemplaza los ítems del plan por los de shopping/main y crea las categorías del plan que falten.
  const regenerate = () => update((d) => {
    const categories = [...d.categories];
    const planItems = data.flatMap((section) => {
      let cat = categories.find((c) => c.planCat === section.cat);
      if (!cat) {
        cat = { id: newId(), name: section.cat, icon: section.icon, planCat: section.cat };
        categories.push(cat);
      }
      return section.items.map((text) => ({ id: newId(), text, done: false, catId: cat.id, fromPlan: true }));
    });
    return { categories, list: [...planItems, ...d.list.filter((i) => !i.fromPlan)] };
  });

  return (
    <div style={{ display: "flex", flexDirection: "column", gap: 14 }}>
      <SectionTitle sub="Para los 6 días del plan, Ángel + Gabriela">Lista de compras</SectionTitle>
      {error && <p style={{ margin: 0, fontSize: 12.5, color: "#B5443A" }}>{error}</p>}

      {shopping.list.some((i) => i.done) && (
        <button onClick={uncheckAll} style={{ ...linkButtonStyle(accent), alignSelf: "flex-end" }}>
          Destachar toda la lista
        </button>
      )}

      {shopping.categories.map((c) => (
        <CategoryCard
          key={c.id}
          category={c}
          categories={shopping.categories}
          items={shopping.list.filter((i) => i.catId === c.id)}
          accent={accent}
          actions={actions}
        />
      ))}

      <NewCategoryForm accent={accent} actions={actions} />
      <RegenerateButton accent={accent} onConfirm={regenerate} />
      <UndoToast undo={undo} onUndo={handleUndo} />
    </div>
  );
}
