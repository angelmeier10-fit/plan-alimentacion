# Calculadora de macros Implementation Plan

> **For agentic workers:** REQUIRED SUB-SKILL: Use superpowers:subagent-driven-development (recommended) or superpowers:executing-plans to implement this plan task-by-task. Steps use checkbox (`- [ ]`) syntax for tracking.

**Goal:** Agregar una pestaña "Calculadora" a `plan-alimentacion` que permite cargar alimentos consumidos por gramos, ver el progreso de macros del día contra el objetivo real del perfil, y mantener un historial editable por persona y por día en Firestore.

**Architecture:** Nuevo tab `CalculadoraTab.jsx` siguiendo el patrón existente (estilos inline, props `person`/`accent`, suscripción a Firestore vía `firestoreApi.js`). Dos colecciones nuevas: `foods/custom` (compartida) y `macroLogs/{person}/days/{YYYY-MM-DD}` (historial por persona/día). Las reglas de Firestore actuales exigen auth para escribir y esta app no tiene login — se abre escritura pública solo para estas dos colecciones nuevas, sin tocar el resto.

**Tech Stack:** React 19, Firebase (Firestore), lucide-react, Vite. Sin framework de tests en el proyecto (`package.json` no tiene `test` script ni devDependency de testing) — la verificación de cada tarea es build (`npm run build`), lint (`npm run lint`) y comprobación manual con `npm run dev`, igual que el resto de la app.

## Global Constraints

- Estilos inline (`style={{...}}`), no Tailwind — el mockup fuente usa Tailwind y debe convertirse.
- Objetivos macro salen de `profile.macros` real (Firestore), no de valores hardcodeados.
- `foods/custom` es compartida entre `angel` y `gabriela` (no separada por persona).
- Un doc de Firestore por persona por día en `macroLogs/{person}/days/{YYYY-MM-DD}` (fecha local, formato `YYYY-MM-DD`).
- Se puede editar los gramos de una entrada in-line y también borrarla por completo.
- Sin login/auth nuevo, sin gráficos de tendencia, sin editar/borrar alimentos de la base una vez creados, sin unidades alternativas a gramos (ver "Fuera de alcance" del spec).
- Spec de referencia: `docs/superpowers/specs/2026-08-11-calculadora-macros-design.md`.

---

### Task 1: Reglas de Firestore para las colecciones nuevas

**Files:**
- Modify: `plan-alimentacion/firestore.rules`

**Interfaces:**
- Produces: reglas que permiten `read`/`write` público en `foods/custom` y en
  `macroLogs/{person}/days/{date}`, sin cambiar la regla general (`allow write: if request.auth != null`) para el resto de las colecciones.

- [ ] **Step 1: Editar `firestore.rules`**

Reemplazar el contenido completo por:

```
rules_version = '2';
service cloud.firestore {
  match /databases/{database}/documents {
    match /{document=**} {
      allow read: if true;
      allow write: if request.auth != null;
    }

    match /foods/custom {
      allow read, write: if true;
    }

    match /macroLogs/{person}/days/{date} {
      allow read, write: if true;
    }
  }
}
```

Nota: en las reglas de Firestore, la regla más específica (`match /foods/custom`) gana sobre la
regla general (`match /{document=**}`) para ese path exacto — no hace falta `allow` combinado.

- [ ] **Step 2: Verificar sintaxis de las reglas**

Run: `cd "plan-alimentacion" && firebase deploy --only firestore:rules --dry-run 2>&1 || true`

Si `--dry-run` no está soportado por la versión de `firebase-tools` instalada, alternativa:
Run: `firebase deploy --only firestore:rules` directamente (paso 3) — el comando falla antes de
aplicar cambios si hay un error de sintaxis en el archivo.

- [ ] **Step 3: Deploy de las reglas — CONFIRMAR CON EL USUARIO ANTES DE CORRER**

Este paso escribe en producción (reglas de seguridad del proyecto Firebase real). Pedir
confirmación explícita antes de ejecutar:

Run: `cd "plan-alimentacion" && firebase deploy --only firestore:rules`

Expected: `✔ Deploy complete!`

- [ ] **Step 4: Commit**

```bash
cd "C:\Users\meier\OneDrive\Documentos\Plan alimentacion"
git add plan-alimentacion/firestore.rules
git commit -m "Abrir escritura pública en foods/custom y macroLogs para la calculadora de macros"
```

---

### Task 2: Funciones de Firestore para alimentos y registro diario

**Files:**
- Modify: `plan-alimentacion/src/firestoreApi.js`

**Interfaces:**
- Consumes: `db` ya exportado desde `./firebaseConfig.js` (import existente en el archivo).
- Produces:
  - `subscribeCustomFoods(cb, onError)` → `cb(list: Food[])`, `Food = { id, name, kcal, prot, fat, carb }`
  - `addCustomFood(food: Food): Promise<void>`
  - `subscribeMacroLog(person: string, dateStr: string, cb, onError)` → `cb(entries: Entry[])`, `Entry = { id, foodId, name, grams }`
  - `addLogEntry(person: string, dateStr: string, entry: Entry): Promise<void>`
  - `updateLogEntry(person: string, dateStr: string, entryId: string, grams: number): Promise<void>`
  - `deleteLogEntry(person: string, dateStr: string, entryId: string): Promise<void>`

- [ ] **Step 1: Agregar imports necesarios**

En `plan-alimentacion/src/firestoreApi.js`, reemplazar la línea 2:

```js
import { collection, doc, onSnapshot, query } from "firebase/firestore";
```

por:

```js
import { collection, doc, onSnapshot, query, setDoc, getDoc, arrayUnion } from "firebase/firestore";
```

- [ ] **Step 2: Agregar las 6 funciones al final del archivo**

Agregar después de `subscribeRecipes` (después de la línea 102, antes del cierre de archivo):

```js

export function subscribeCustomFoods(cb, onError) {
  return onSnapshot(
    doc(db, "foods", "custom"),
    (snap) => cb(snap.data()?.list ?? []),
    (err) => {
      console.error("subscribeCustomFoods error:", err);
      onError?.(err);
    }
  );
}

export async function addCustomFood(food) {
  await setDoc(doc(db, "foods", "custom"), { list: arrayUnion(food) }, { merge: true });
}

export function subscribeMacroLog(person, dateStr, cb, onError) {
  return onSnapshot(
    doc(db, "macroLogs", person, "days", dateStr),
    (snap) => cb(snap.data()?.entries ?? []),
    (err) => {
      console.error("subscribeMacroLog error:", err);
      onError?.(err);
    }
  );
}

export async function addLogEntry(person, dateStr, entry) {
  await setDoc(
    doc(db, "macroLogs", person, "days", dateStr),
    { entries: arrayUnion(entry) },
    { merge: true }
  );
}

export async function updateLogEntry(person, dateStr, entryId, grams) {
  const ref = doc(db, "macroLogs", person, "days", dateStr);
  const snap = await getDoc(ref);
  const entries = snap.data()?.entries ?? [];
  const next = entries.map((e) => (e.id === entryId ? { ...e, grams } : e));
  await setDoc(ref, { entries: next });
}

export async function deleteLogEntry(person, dateStr, entryId) {
  const ref = doc(db, "macroLogs", person, "days", dateStr);
  const snap = await getDoc(ref);
  const entries = snap.data()?.entries ?? [];
  const next = entries.filter((e) => e.id !== entryId);
  await setDoc(ref, { entries: next });
}
```

- [ ] **Step 3: Verificar que el proyecto sigue compilando**

Run: `cd "plan-alimentacion" && npm run build`

Expected: build termina sin errores (exit code 0). Esto no ejecuta las funciones nuevas (no hay
tests), solo confirma que la sintaxis y los imports son válidos.

- [ ] **Step 4: Commit**

```bash
cd "C:\Users\meier\OneDrive\Documentos\Plan alimentacion"
git add plan-alimentacion/src/firestoreApi.js
git commit -m "Agregar funciones de Firestore para alimentos custom y registro diario de macros"
```

---

### Task 3: Componente CalculadoraTab

**Files:**
- Create: `plan-alimentacion/src/tabs/CalculadoraTab.jsx`

**Interfaces:**
- Consumes:
  - Props: `{ person: "angel" | "gabriela", profile: { macros: { kcal, prot, fat, carb }, accent: string } }`
  - De `../firestoreApi.js`: `subscribeCustomFoods`, `addCustomFood`, `subscribeMacroLog`,
    `addLogEntry`, `updateLogEntry`, `deleteLogEntry` (Task 2).
- Produces: `export default function CalculadoraTab(props)` — componente completo, sin más
  exports (consistente con el resto de `src/tabs/*.jsx`).

- [ ] **Step 1: Crear el archivo con la base de alimentos, helpers y sub-componentes**

Crear `plan-alimentacion/src/tabs/CalculadoraTab.jsx`:

```jsx
import React, { useState, useEffect, useMemo } from "react";
import { Plus, Trash2, Search, Check, X } from "lucide-react";
import {
  subscribeCustomFoods, addCustomFood,
  subscribeMacroLog, addLogEntry, updateLogEntry, deleteLogEntry,
} from "../firestoreApi.js";

const BASE_FOODS = [
  { id: "pollo", name: "Pollo (pechuga)", kcal: 165, prot: 31, fat: 3.5, carb: 0 },
  { id: "carne", name: "Carne vacuna magra", kcal: 190, prot: 27, fat: 9, carb: 0 },
  { id: "merluza", name: "Pescado (merluza)", kcal: 90, prot: 19, fat: 1, carb: 0 },
  { id: "atun", name: "Atún al natural (escurrido)", kcal: 116, prot: 26, fat: 1, carb: 0 },
  { id: "huevo", name: "Huevo entero", kcal: 140, prot: 12, fat: 10, carb: 1 },
  { id: "clara", name: "Clara de huevo", kcal: 52, prot: 11, fat: 0, carb: 0.7 },
  { id: "arroz", name: "Arroz / fideos (crudo)", kcal: 350, prot: 7, fat: 1, carb: 75 },
  { id: "avena", name: "Avena", kcal: 380, prot: 13, fat: 7, carb: 60 },
  { id: "papa", name: "Papa", kcal: 80, prot: 2, fat: 0, carb: 18 },
  { id: "batata", name: "Batata", kcal: 100, prot: 1.5, fat: 0, carb: 24 },
  { id: "banana", name: "Banana", kcal: 90, prot: 1, fat: 0, carb: 23 },
  { id: "manzana", name: "Manzana", kcal: 52, prot: 0.3, fat: 0.2, carb: 14 },
  { id: "palta", name: "Palta", kcal: 160, prot: 2, fat: 15, carb: 8 },
  { id: "frutossecos", name: "Frutos secos", kcal: 600, prot: 15, fat: 55, carb: 15 },
  { id: "aceite", name: "Aceite", kcal: 900, prot: 0, fat: 100, carb: 0 },
  { id: "yogur", name: "Yogur descremado", kcal: 45, prot: 4, fat: 0.5, carb: 6 },
  { id: "quesountable", name: "Queso untable light", kcal: 150, prot: 8, fat: 11, carb: 4 },
  { id: "quesocremoso", name: "Queso cremoso", kcal: 300, prot: 7, fat: 30, carb: 3 },
  { id: "panlactal", name: "Pan lactal integral", kcal: 250, prot: 9, fat: 4, carb: 44 },
  { id: "cacaoalcalino", name: "Cacao alcalino sin azúcar", kcal: 270, prot: 12, fat: 10, carb: 30 },
  { id: "proteina", name: "Proteína en polvo", kcal: 380, prot: 80, fat: 5, carb: 5 },
  { id: "miel", name: "Miel", kcal: 300, prot: 0.3, fat: 0, carb: 82 },
];

const round = (n) => Math.round(n * 10) / 10;
const scale = (food, grams) => {
  const f = grams / 100;
  return { kcal: food.kcal * f, prot: food.prot * f, fat: food.fat * f, carb: food.carb * f };
};

function todayStr() {
  const d = new Date();
  const yyyy = d.getFullYear();
  const mm = String(d.getMonth() + 1).padStart(2, "0");
  const dd = String(d.getDate()).padStart(2, "0");
  return `${yyyy}-${mm}-${dd}`;
}

function MacroRing({ value, target, colorHex }) {
  const pct = target ? Math.min(100, (value / target) * 100) : 0;
  const r = 26;
  const c = 2 * Math.PI * r;
  return (
    <svg width="64" height="64" viewBox="0 0 64 64" style={{ flexShrink: 0 }}>
      <circle cx="32" cy="32" r={r} fill="none" stroke="#ECE8DF" strokeWidth="6" />
      <circle
        cx="32" cy="32" r={r} fill="none" stroke={colorHex} strokeWidth="6"
        strokeDasharray={c} strokeDashoffset={c - (pct / 100) * c}
        strokeLinecap="round" transform="rotate(-90 32 32)"
        style={{ transition: "stroke-dashoffset 0.4s ease" }}
      />
      <text x="32" y="37" textAnchor="middle" fontSize="13" fontWeight="600" fill="#1C1B19" fontFamily="'JetBrains Mono', monospace">
        {Math.round(pct)}%
      </text>
    </svg>
  );
}

function MacroRow({ label, value, target, unit, colorHex }) {
  const pct = target ? Math.min(100, (value / target) * 100) : 0;
  const over = target && value > target;
  return (
    <div style={{ marginBottom: 10 }}>
      <div style={{ display: "flex", alignItems: "baseline", justifyContent: "space-between", marginBottom: 4 }}>
        <span style={{ fontSize: 11, textTransform: "uppercase", letterSpacing: "0.05em", color: "#6B6459", fontWeight: 500 }}>{label}</span>
        <span style={{ fontSize: 13, fontFamily: "'JetBrains Mono', monospace", color: "#1C1B19" }}>
          {round(value)}<span style={{ color: "#B3AC9C" }}>/{target}{unit}</span>
        </span>
      </div>
      <div style={{ height: 6, width: "100%", background: "#F1EEE5", borderRadius: 999, overflow: "hidden" }}>
        <div style={{ height: "100%", borderRadius: 999, width: `${pct}%`, background: over ? "#e11d48" : colorHex, transition: "width 0.4s ease" }} />
      </div>
    </div>
  );
}

export default function CalculadoraTab({ person, profile, accent }) {
  const [customFoods, setCustomFoods] = useState([]);
  const [dateStr, setDateStr] = useState(todayStr());
  const [entries, setEntries] = useState([]);
  const [query, setQuery] = useState("");
  const [selectedFoodId, setSelectedFoodId] = useState(BASE_FOODS[0].id);
  const [grams, setGrams] = useState(100);
  const [showAddFood, setShowAddFood] = useState(false);
  const [newFood, setNewFood] = useState({ name: "", kcal: "", prot: "", fat: "", carb: "" });
  const [editingId, setEditingId] = useState(null);
  const [editGrams, setEditGrams] = useState("");

  useEffect(() => subscribeCustomFoods(setCustomFoods, (err) => console.error(err)), []);
  useEffect(
    () => subscribeMacroLog(person, dateStr, setEntries, (err) => console.error(err)),
    [person, dateStr]
  );

  const foods = useMemo(() => [...BASE_FOODS, ...customFoods], [customFoods]);

  const filteredFoods = useMemo(() => {
    if (!query.trim()) return foods;
    const q = query.toLowerCase();
    return foods.filter((f) => f.name.toLowerCase().includes(q));
  }, [foods, query]);

  const selectedFood = foods.find((f) => f.id === selectedFoodId) || foods[0];

  const handleAddEntry = () => {
    if (!grams || grams <= 0) return;
    const entry = { id: String(Date.now()), foodId: selectedFood.id, name: selectedFood.name, grams: Number(grams) };
    addLogEntry(person, dateStr, entry).catch((err) => console.error("addLogEntry error:", err));
  };

  const handleDeleteEntry = (entryId) => {
    deleteLogEntry(person, dateStr, entryId).catch((err) => console.error("deleteLogEntry error:", err));
  };

  const startEdit = (entry) => {
    setEditingId(entry.id);
    setEditGrams(String(entry.grams));
  };

  const saveEdit = (entryId) => {
    const g = Number(editGrams);
    if (!g || g <= 0) return;
    updateLogEntry(person, dateStr, entryId, g).catch((err) => console.error("updateLogEntry error:", err));
    setEditingId(null);
  };

  const totals = entries.reduce(
    (acc, e) => {
      const food = foods.find((f) => f.id === e.foodId);
      if (!food) return acc;
      const s = scale(food, e.grams);
      return { kcal: acc.kcal + s.kcal, prot: acc.prot + s.prot, fat: acc.fat + s.fat, carb: acc.carb + s.carb };
    },
    { kcal: 0, prot: 0, fat: 0, carb: 0 }
  );

  const submitNewFood = () => {
    const { name, kcal, prot, fat, carb } = newFood;
    if (!name.trim() || kcal === "" || prot === "" || fat === "" || carb === "") return;
    const food = {
      id: "custom-" + Date.now(),
      name: name.trim(),
      kcal: Number(kcal), prot: Number(prot), fat: Number(fat), carb: Number(carb),
    };
    addCustomFood(food).catch((err) => console.error("addCustomFood error:", err));
    setSelectedFoodId(food.id);
    setNewFood({ name: "", kcal: "", prot: "", fat: "", carb: "" });
    setShowAddFood(false);
  };

  const inputStyle = {
    width: "100%", padding: "10px 14px", background: "#fff", border: "1px solid #ECE8DF",
    borderRadius: 12, fontSize: 14, fontFamily: "'Inter', sans-serif", boxSizing: "border-box",
  };
  const labelStyle = { fontSize: 11, textTransform: "uppercase", letterSpacing: "0.05em", color: "#6B6459", fontWeight: 500, display: "block", marginBottom: 4 };

  return (
    <div>
      <div style={{ display: "flex", alignItems: "center", gap: 8, marginBottom: 16 }}>
        <label style={labelStyle}>Día</label>
        <input
          type="date"
          value={dateStr}
          onChange={(e) => setDateStr(e.target.value)}
          style={{ ...inputStyle, width: "auto", padding: "8px 12px" }}
        />
        {dateStr !== todayStr() && (
          <button
            onClick={() => setDateStr(todayStr())}
            style={{ border: "none", background: "none", color: accent, fontSize: 12, fontWeight: 600, cursor: "pointer" }}
          >
            Volver a hoy
          </button>
        )}
      </div>

      <div style={{ position: "relative", marginBottom: 10 }}>
        <Search size={15} style={{ position: "absolute", left: 12, top: "50%", transform: "translateY(-50%)", color: "#B3AC9C" }} />
        <input
          value={query}
          onChange={(e) => setQuery(e.target.value)}
          placeholder="Buscar alimento…"
          style={{ ...inputStyle, paddingLeft: 36 }}
        />
      </div>

      <div style={{ maxHeight: 200, overflowY: "auto", background: "#fff", border: "1px solid #ECE8DF", borderRadius: 12, marginBottom: 14 }}>
        {filteredFoods.map((f) => (
          <button
            key={f.id}
            onClick={() => setSelectedFoodId(f.id)}
            style={{
              width: "100%", textAlign: "left", padding: "10px 14px", fontSize: 13.5,
              display: "flex", justifyContent: "space-between", alignItems: "center",
              border: "none", borderBottom: "1px solid #F1EEE5", cursor: "pointer",
              background: selectedFoodId === f.id ? "#F1EEE5" : "transparent",
            }}
          >
            <span>{f.name}</span>
            <span style={{ fontSize: 11, fontFamily: "'JetBrains Mono', monospace", color: "#B3AC9C" }}>{f.kcal} kcal/100g</span>
          </button>
        ))}
        {filteredFoods.length === 0 && <p style={{ padding: 14, fontSize: 13, color: "#B3AC9C" }}>Sin resultados.</p>}
      </div>

      <div style={{ display: "flex", alignItems: "flex-end", gap: 10, marginBottom: 10 }}>
        <div style={{ flex: 1 }}>
          <label style={labelStyle}>Gramos</label>
          <input type="number" value={grams} onChange={(e) => setGrams(e.target.value)} style={inputStyle} />
        </div>
        <button
          onClick={handleAddEntry}
          style={{
            display: "flex", alignItems: "center", gap: 6, padding: "10px 16px", borderRadius: 12,
            color: "#fff", fontSize: 14, fontWeight: 600, border: "none", cursor: "pointer", background: accent,
          }}
        >
          <Plus size={15} /> Agregar
        </button>
      </div>

      {selectedFood && grams > 0 && (
        <p style={{ fontSize: 12, color: "#6B6459", fontFamily: "'JetBrains Mono', monospace", marginBottom: 18 }}>
          {grams}g de {selectedFood.name} → {round(scale(selectedFood, grams).kcal)} kcal · {round(scale(selectedFood, grams).prot)}P · {round(scale(selectedFood, grams).fat)}G · {round(scale(selectedFood, grams).carb)}C
        </p>
      )}

      <button
        onClick={() => setShowAddFood((s) => !s)}
        style={{ border: "none", background: "none", color: "#6B6459", fontSize: 12.5, fontWeight: 600, cursor: "pointer", marginBottom: 12 }}
      >
        {showAddFood ? "Cancelar" : "+ Agregar alimento nuevo a la base"}
      </button>

      {showAddFood && (
        <div style={{ border: "1px solid #ECE8DF", background: "#fff", borderRadius: 12, padding: 14, marginBottom: 18 }}>
          <input
            placeholder="Nombre"
            value={newFood.name}
            onChange={(e) => setNewFood({ ...newFood, name: e.target.value })}
            style={{ ...inputStyle, marginBottom: 8 }}
          />
          <div style={{ display: "grid", gridTemplateColumns: "repeat(4, 1fr)", gap: 8, marginBottom: 8 }}>
            {["kcal", "prot", "fat", "carb"].map((k) => (
              <input
                key={k}
                type="number"
                placeholder={k === "fat" ? "grasa" : k === "carb" ? "carbo" : k}
                value={newFood[k]}
                onChange={(e) => setNewFood({ ...newFood, [k]: e.target.value })}
                style={{ ...inputStyle, padding: "8px 10px" }}
              />
            ))}
          </div>
          <p style={{ fontSize: 11, color: "#B3AC9C", marginBottom: 8 }}>Valores por 100g. Queda guardado para siempre.</p>
          <button
            onClick={submitNewFood}
            style={{ padding: "8px 14px", background: "#1C1B19", color: "#fff", fontSize: 12.5, fontWeight: 600, borderRadius: 10, border: "none", cursor: "pointer" }}
          >
            Guardar en la base
          </button>
        </div>
      )}

      <div style={{ background: "#fff", border: "1px solid #ECE8DF", borderRadius: 16, padding: 16 }}>
        <div style={{ display: "flex", alignItems: "center", gap: 12, marginBottom: 16 }}>
          <MacroRing value={totals.kcal} target={profile.macros.kcal} colorHex={accent} />
          <div>
            <h2 style={{ fontSize: 15, fontWeight: 600, margin: 0 }}>{profile.name}</h2>
            <p style={{ fontSize: 11, color: "#B3AC9C", margin: 0 }}>
              {entries.length} alimento{entries.length !== 1 ? "s" : ""} este día
            </p>
          </div>
        </div>

        <MacroRow label="Calorías" value={totals.kcal} target={profile.macros.kcal} unit="kcal" colorHex={accent} />
        <MacroRow label="Proteína" value={totals.prot} target={profile.macros.prot} unit="g" colorHex="#0f766e" />
        <MacroRow label="Grasa" value={totals.fat} target={profile.macros.fat} unit="g" colorHex="#b45309" />
        <MacroRow label="Carbohidrato" value={totals.carb} target={profile.macros.carb} unit="g" colorHex="#0369a1" />

        {entries.length > 0 && (
          <div style={{ marginTop: 12, paddingTop: 12, borderTop: "1px solid #F1EEE5" }}>
            {entries.map((e) => (
              <div key={e.id} style={{ display: "flex", alignItems: "center", justifyContent: "space-between", fontSize: 13, padding: "6px 0" }}>
                {editingId === e.id ? (
                  <>
                    <input
                      type="number"
                      value={editGrams}
                      onChange={(ev) => setEditGrams(ev.target.value)}
                      style={{ ...inputStyle, padding: "4px 8px", width: 70 }}
                    />
                    <span style={{ flex: 1, marginLeft: 8, color: "#6B6459" }}>{e.name}</span>
                    <button onClick={() => saveEdit(e.id)} style={{ border: "none", background: "none", color: "#0f766e", cursor: "pointer", marginRight: 6 }}>
                      <Check size={15} />
                    </button>
                    <button onClick={() => setEditingId(null)} style={{ border: "none", background: "none", color: "#B3AC9C", cursor: "pointer" }}>
                      <X size={15} />
                    </button>
                  </>
                ) : (
                  <>
                    <span onClick={() => startEdit(e)} style={{ color: "#1C1B19", cursor: "pointer" }}>
                      {e.grams}g {e.name}
                    </span>
                    <button onClick={() => handleDeleteEntry(e.id)} style={{ border: "none", background: "none", color: "#B3AC9C", cursor: "pointer" }}>
                      <Trash2 size={13} />
                    </button>
                  </>
                )}
              </div>
            ))}
          </div>
        )}
      </div>
    </div>
  );
}
```

- [ ] **Step 2: Verificar que compila**

Run: `cd "plan-alimentacion" && npm run build`

Expected: build termina sin errores.

- [ ] **Step 3: Commit**

```bash
cd "C:\Users\meier\OneDrive\Documentos\Plan alimentacion"
git add plan-alimentacion/src/tabs/CalculadoraTab.jsx
git commit -m "Agregar componente CalculadoraTab con historial de macros por día"
```

---

### Task 4: Integrar la pestaña en App.jsx

**Files:**
- Modify: `plan-alimentacion/src/App.jsx`

**Interfaces:**
- Consumes: `CalculadoraTab` (Task 3), props `{ person, profile, accent }`.

- [ ] **Step 1: Importar el ícono `Flame` y `CalculadoraTab`**

En `plan-alimentacion/src/App.jsx`, línea 3-4, agregar `Flame` al import de lucide-react:

```js
import {
  Sunrise, Carrot, ArrowLeftRight, Sparkles, ShoppingBasket, BookOpen, Flame,
} from "lucide-react";
```

Después de la línea 15 (`import RecetasTab from "./tabs/RecetasTab.jsx";`), agregar:

```js
import CalculadoraTab from "./tabs/CalculadoraTab.jsx";
```

- [ ] **Step 2: Agregar la pestaña a `TABS`**

Reemplazar el array `TABS` (líneas 17-24) por:

```js
const TABS = [
  { id: "plan", label: "Plan", icon: Sunrise },
  { id: "snacks", label: "Snacks", icon: Carrot },
  { id: "flex", label: "Flexible", icon: ArrowLeftRight },
  { id: "extra", label: "Extras", icon: Sparkles },
  { id: "compras", label: "Compras", icon: ShoppingBasket },
  { id: "recetas", label: "Recetas", icon: BookOpen },
  { id: "calculadora", label: "Calculadora", icon: Flame },
];
```

- [ ] **Step 3: Renderizar el tab**

Después de la línea (bloque) `{tab === "recetas" && recipes && <RecetasTab data={recipes} accent={profile.accent} person={person} />}`, agregar:

```jsx
{tab === "calculadora" && (
  <CalculadoraTab person={person} profile={profile} accent={profile.accent} />
)}
```

- [ ] **Step 4: Verificar build y lint**

Run: `cd "plan-alimentacion" && npm run build && npm run lint`

Expected: ambos comandos terminan sin errores.

- [ ] **Step 5: Verificación manual con el servidor de desarrollo**

Run: `cd "plan-alimentacion" && npm run dev` (dejar corriendo)

En el navegador (`http://localhost:5173` u el puerto que indique Vite):
1. Click en la pestaña "Calculadora" — debe aparecer el buscador de alimentos y el resumen de macros en 0.
2. Buscar "pollo", seleccionarlo, poner 200 gramos, click "Agregar" — debe aparecer en la lista de entradas de abajo y los anillos/barras deben actualizarse.
3. Click sobre la entrada agregada — debe entrar en modo edición; cambiar los gramos y confirmar con el check — el valor y los totales se actualizan.
4. Click en el ícono de tacho de una entrada — la entrada desaparece y los totales bajan.
5. Cambiar la fecha del selector a un día distinto — la lista de entradas debe vaciarse (día nuevo, sin registro). Volver a la fecha de hoy con "Volver a hoy" — las entradas cargadas antes deben seguir ahí.
6. Cambiar de persona (switch Á/G en el header) — el registro y los objetivos deben cambiar a los de la otra persona (registro independiente).
7. Abrir "+ Agregar alimento nuevo a la base", cargar un alimento de prueba, guardar — debe aparecer en la lista de búsqueda y quedar disponible también si se cambia de persona (colección compartida).

Parar el servidor (Ctrl+C) una vez verificado.

- [ ] **Step 6: Commit**

```bash
cd "C:\Users\meier\OneDrive\Documentos\Plan alimentacion"
git add plan-alimentacion/src/App.jsx
git commit -m "Integrar pestaña Calculadora en la navegación de la app"
```

---

### Task 5: Push

**Files:** (ninguno — solo integración)

- [ ] **Step 1: Push de los commits de las 4 tareas anteriores**

Run: `cd "C:\Users\meier\OneDrive\Documentos\Plan alimentacion" && git push`

Expected: push exitoso, sin conflictos (rama `main`).

- [ ] **Step 2: Confirmar deploy**

El deploy de hosting es automático vía GitHub Actions al pushear a `main` (según
`CLAUDE.md` del proyecto). Si el usuario pidió explícitamente "deploy", recordarle que las
reglas de Firestore (Task 1, Step 3) requieren `firebase deploy --only firestore:rules` aparte
— el GitHub Action de hosting no las despliega.
