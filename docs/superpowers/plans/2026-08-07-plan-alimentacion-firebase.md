# Plan de Alimentación — Migración a Firebase — Implementation Plan

> **For agentic workers:** REQUIRED SUB-SKILL: Use superpowers:subagent-driven-development (recommended) or superpowers:executing-plans to implement this plan task-by-task. Steps use checkbox (`- [ ]`) syntax for tracking.

**Goal:** Convertir `plan_alimentacion.jsx` en una app Vite + React que lee sus datos desde Firestore en tiempo real, con Firebase Auth preparado (sin UI de login todavía), y deployarla a GitHub Pages.

**Architecture:** Se extraen los datos hardcodeados a un módulo de seed, se suben una vez a Firestore con un script Node, y el componente original se separa en `components/` + `tabs/` que leen esos datos vía `onSnapshot`. El diseño visual no cambia. Deploy automático a GitHub Pages vía GitHub Actions en cada push a `main`.

**Tech Stack:** Vite, React 18, `firebase` (Firestore + Auth JS SDK), `lucide-react`, GitHub Actions.

## Global Constraints

- App de solo lectura pública en esta fase — sin UI de login ni edición (spec: "Alcance de esta fase").
- Reglas Firestore: `allow read: if true; allow write: if request.auth != null;` (spec: "Reglas de Firestore").
- Repo: `angelmeier10/plan-alimentacion`; Vite `base: '/plan-alimentacion/'` (spec: "Deploy").
- Los íconos de `lucide-react` no se guardan en Firestore — se guarda un string clave y el cliente mapea (spec: "Modelo de datos").
- Credenciales de Firebase vía `import.meta.env.VITE_*`, documentadas en `.env.example`, cargadas como GitHub Secrets en CI (spec: "Deploy").
- El diseño visual/JSX de `plan_alimentacion.jsx` se preserva tal cual — solo cambia el origen de los datos.

---

### Task 1: Scaffold del proyecto Vite

**Files:**
- Create: `plan-alimentacion/` (proyecto Vite nuevo, generado por `create-vite`)
- Modify: `plan-alimentacion/vite.config.js`
- Create: `plan-alimentacion/.gitignore` (agregar `.env`, `.env.local`)

**Interfaces:**
- Produces: proyecto Vite corriendo en `npm run dev`, con `lucide-react` instalado, listo para que las tareas siguientes agreguen código.

- [ ] **Step 1: Generar el proyecto**

```bash
cd "/c/Users/meier/OneDrive/Documentos/Plan alimentacion"
npm create vite@latest plan-alimentacion -- --template react
cd plan-alimentacion
npm install
npm install lucide-react firebase
```

- [ ] **Step 2: Configurar `base` para GitHub Pages**

Editar `plan-alimentacion/vite.config.js`:

```js
import { defineConfig } from 'vite'
import react from '@vitejs/plugin-react'

export default defineConfig({
  plugins: [react()],
  base: '/plan-alimentacion/',
})
```

- [ ] **Step 3: Ignorar archivos de entorno**

Agregar a `plan-alimentacion/.gitignore` (create-vite ya trae uno, solo agregar estas líneas si faltan):

```
.env
.env.local
```

- [ ] **Step 4: Verificar que levanta**

Run: `npm run dev` (dentro de `plan-alimentacion/`), abrir la URL que imprime, confirmar que se ve la página default de Vite+React sin errores en consola. Detener el server con Ctrl+C.

- [ ] **Step 5: Commit**

```bash
cd "/c/Users/meier/OneDrive/Documentos/Plan alimentacion"
git add plan-alimentacion
git commit -m "Scaffold proyecto Vite para plan-alimentacion"
```

---

### Task 2: Datos de seed (sin componentes de ícono)

**Files:**
- Create: `plan-alimentacion/scripts/seedData.js`

**Interfaces:**
- Consumes: contenido de `plan_alimentacion.jsx` (raíz del repo), constantes `PROFILES`, `DAYS`, `SNACKS`, `INTERCHANGEABLE`, `EQUIVALENCES`, `VARIETY`, `SHOPPING`.
- Produces: mismas constantes exportadas como JS plano (sin imports de `lucide-react`), con los íconos reemplazados por su nombre string (ej. `icon: "Beef"` en vez de `icon: Beef`). Consumido por Task 4 (`scripts/seed.js`) y por Task 6 (mapa de íconos del cliente, que debe usar las mismas claves string).

- [ ] **Step 1: Crear el archivo de datos**

Copiar el contenido de las constantes de `plan_alimentacion.jsx` (líneas 12–288 del archivo original) a `plan-alimentacion/scripts/seedData.js`, con estos cambios:
- Quitar el import de `lucide-react`.
- En `VARIETY` y `SHOPPING`, reemplazar cada `icon: Beef` → `icon: "Beef"`, `icon: Leaf` → `icon: "Leaf"`, `icon: Carrot` → `icon: "Carrot"`, `icon: Droplet` → `icon: "Droplet"`, `icon: ShoppingBasket` → `icon: "ShoppingBasket"`, `icon: Sparkles` → `icon: "Sparkles"` (usar el nombre exacto del componente que ya está en cada entrada del original).
- Exportar todo con `export const`.

```js
// plan-alimentacion/scripts/seedData.js

export const PROFILES = {
  angel: {
    name: "Ángel",
    initial: "A",
    accent: "#2F6B4F",
    accentSoft: "#E7F1EB",
    role: "37 años · 175cm · 85kg · Fuerza 5x/sem",
    macros: { kcal: 2200, prot: 170, fat: 68, carb: 227 },
  },
  gabriela: {
    name: "Gabriela",
    initial: "G",
    accent: "#7D4F9C",
    accentSoft: "#F1EBF6",
    role: "33 años · 163cm · 72kg · Fuerza 5x/sem",
    macros: { kcal: 1750, prot: 150, fat: 55, carb: 164 },
  },
};

export const DAYS = {
  angel: [ /* copiar los 6 días de Ángel tal cual del original, líneas 32-87 */ ],
  gabriela: [ /* copiar los 6 días de Gabriela tal cual del original, líneas 88-143 */ ],
};

export const SNACKS = {
  libre: [ /* copiar tal cual, líneas 149-156 */ ],
  proteina: [ /* líneas 157-161 */ ],
  ansiedad: [ /* líneas 162-166 */ ],
  horno: [ /* líneas 167-173 */ ],
};

export const INTERCHANGEABLE = {
  angel: { /* copiar tal cual, líneas 177-202 */ },
  gabriela: { /* líneas 203-229 */ },
};

export const EQUIVALENCES = [ /* copiar tal cual, líneas 232-236 */ ];

export const VARIETY = [
  { cat: "Proteína animal", icon: "Beef", items: "Pavo, conejo · Cerdo (bondiola sin grasa, lomo), ternera premium · Salmón, atún fresco" },
  { cat: "Carbohidratos", icon: "Leaf", items: "Quinoa, cuscús, fideos de legumbre · Choclo, legumbres (lentejas, garbanzos)" },
  { cat: "Verduras", icon: "Carrot", items: "Coliflor, repollo, berenjena, hongos/champiñones" },
  { cat: "Grasas", icon: "Droplet", items: "Semillas (chía, lino, girasol), manteca de maní natural" },
];

export const SHOPPING = [
  { cat: "Carnes y pescado", icon: "Beef", items: [ /* líneas 249-254 */ ] },
  { cat: "Despensa", icon: "ShoppingBasket", items: [ /* líneas 259-271 */ ] },
  { cat: "Yogurtera", icon: "Droplet", items: ["Leche — aprox. 2L por semana para el yogur casero de los dos"] },
  { cat: "Verdulería", icon: "Carrot", items: [ /* líneas 277-285 */ ] },
  { cat: "Grasas y otros", icon: "Sparkles", items: ["Aceite de oliva virgen extra", "Gelatina light", "Chicle sin azúcar"] },
];
```

(El contenido literal de cada array se copia tal cual del `plan_alimentacion.jsx` original, sin modificar textos.)

- [ ] **Step 2: Verificar que el archivo es JS válido**

Run:

```bash
node --input-type=module -e "import('./scripts/seedData.js').then(m => console.log(Object.keys(m)))"
```

Expected: imprime `[ 'PROFILES', 'DAYS', 'SNACKS', 'INTERCHANGEABLE', 'EQUIVALENCES', 'VARIETY', 'SHOPPING' ]`.

- [ ] **Step 3: Commit**

```bash
git add plan-alimentacion/scripts/seedData.js
git commit -m "Agregar datos de seed extraídos del jsx original"
```

---

### Task 3: Config de Firebase en el cliente

**Files:**
- Create: `plan-alimentacion/src/firebaseConfig.js`
- Create: `plan-alimentacion/.env.example`

**Interfaces:**
- Produces: `db` (instancia de Firestore) y `auth` (instancia de Auth) exportados desde `firebaseConfig.js`. Consumido por Task 5 (`firestoreApi.js`) y Task 4 (`scripts/seed.js`).

**Nota:** este task requiere que el usuario haya creado el proyecto en console.firebase.google.com y tenga las credenciales (`apiKey`, `authDomain`, `projectId`, `storageBucket`, `messagingSenderId`, `appId`). Si no las tiene todavía, dejar `.env.local` sin completar y continuar — Task 4/8 son donde se necesitan de verdad.

- [ ] **Step 1: Crear `.env.example`**

```
VITE_FIREBASE_API_KEY=
VITE_FIREBASE_AUTH_DOMAIN=
VITE_FIREBASE_PROJECT_ID=
VITE_FIREBASE_STORAGE_BUCKET=
VITE_FIREBASE_MESSAGING_SENDER_ID=
VITE_FIREBASE_APP_ID=
```

- [ ] **Step 2: Crear `src/firebaseConfig.js`**

```js
import { initializeApp } from "firebase/app";
import { getFirestore } from "firebase/firestore";
import { getAuth } from "firebase/auth";

const firebaseConfig = {
  apiKey: import.meta.env.VITE_FIREBASE_API_KEY,
  authDomain: import.meta.env.VITE_FIREBASE_AUTH_DOMAIN,
  projectId: import.meta.env.VITE_FIREBASE_PROJECT_ID,
  storageBucket: import.meta.env.VITE_FIREBASE_STORAGE_BUCKET,
  messagingSenderId: import.meta.env.VITE_FIREBASE_MESSAGING_SENDER_ID,
  appId: import.meta.env.VITE_FIREBASE_APP_ID,
};

const app = initializeApp(firebaseConfig);

export const db = getFirestore(app);
export const auth = getAuth(app);
```

- [ ] **Step 3: Crear `.env.local` local (no versionado) con las credenciales reales**

Pedirle al usuario las credenciales del proyecto Firebase creado y volcarlas en `plan-alimentacion/.env.local` con las mismas claves que `.env.example`. Este archivo ya está en `.gitignore` (Task 1).

- [ ] **Step 4: Commit (solo el example, no el .env.local)**

```bash
git add plan-alimentacion/src/firebaseConfig.js plan-alimentacion/.env.example
git commit -m "Agregar configuración de Firebase (Firestore + Auth)"
```

---

### Task 4: Reglas de Firestore y script de seed

**Files:**
- Create: `plan-alimentacion/firestore.rules`
- Create: `plan-alimentacion/scripts/seed.js`

**Interfaces:**
- Consumes: `PROFILES`, `DAYS`, `SNACKS`, `INTERCHANGEABLE`, `EQUIVALENCES`, `VARIETY`, `SHOPPING` de `scripts/seedData.js` (Task 2); `db` de `../src/firebaseConfig.js` (Task 3).
- Produces: colecciones en Firestore pobladas según el modelo de datos de la spec: `profiles/{persona}`, `days/{persona}/list/{dayN}`, `snacks/main`, `interchangeable/{persona}`, `equivalences/main`, `variety/main`, `shopping/main`.

- [ ] **Step 1: Crear `firestore.rules`**

```
rules_version = '2';
service cloud.firestore {
  match /databases/{database}/documents {
    match /{document=**} {
      allow read: if true;
      allow write: if request.auth != null;
    }
  }
}
```

- [ ] **Step 2: Crear `scripts/seed.js`**

```js
// plan-alimentacion/scripts/seed.js
// Correr una sola vez: node scripts/seed.js
import { doc, setDoc } from "firebase/firestore";
import { db } from "../src/firebaseConfig.js";
import {
  PROFILES, DAYS, SNACKS, INTERCHANGEABLE, EQUIVALENCES, VARIETY, SHOPPING,
} from "./seedData.js";

async function seed() {
  for (const [key, profile] of Object.entries(PROFILES)) {
    await setDoc(doc(db, "profiles", key), profile);
    console.log(`profiles/${key} ok`);
  }

  for (const [person, days] of Object.entries(DAYS)) {
    for (let i = 0; i < days.length; i++) {
      await setDoc(doc(db, "days", person, "list", `day${i + 1}`), days[i]);
      console.log(`days/${person}/list/day${i + 1} ok`);
    }
  }

  await setDoc(doc(db, "snacks", "main"), SNACKS);
  console.log("snacks/main ok");

  for (const [person, data] of Object.entries(INTERCHANGEABLE)) {
    await setDoc(doc(db, "interchangeable", person), data);
    console.log(`interchangeable/${person} ok`);
  }

  await setDoc(doc(db, "equivalences", "main"), { list: EQUIVALENCES });
  console.log("equivalences/main ok");

  await setDoc(doc(db, "variety", "main"), { list: VARIETY });
  console.log("variety/main ok");

  await setDoc(doc(db, "shopping", "main"), { list: SHOPPING });
  console.log("shopping/main ok");

  console.log("Seed completo.");
  process.exit(0);
}

seed().catch((err) => {
  console.error("Error en seed:", err);
  process.exit(1);
});
```

Nota de diseño: `days/{persona}/day1` como *documento* no es válido en Firestore como colección
raíz (un documento no puede colgar directo de otro documento sin nombre de subcolección) — se
usa `days/{persona}/list/{dayN}` como subcolección explícita. `EQUIVALENCES`, `VARIETY` y
`SHOPPING` son arrays de nivel raíz en el jsx original, así que se guardan envueltos en
`{ list: [...] }` porque Firestore no permite que un array sea el documento completo.

- [ ] **Step 3: Correr el seed (requiere `.env.local` con credenciales reales del Task 3, Step 3)**

Run: `cd plan-alimentacion && node scripts/seed.js`
Expected: imprime `ok` para cada doc y termina con `Seed completo.` sin errores.

- [ ] **Step 4: Verificar en la consola de Firebase**

Abrir Firestore Database en console.firebase.google.com del proyecto y confirmar que existen las colecciones `profiles`, `days`, `snacks`, `interchangeable`, `equivalences`, `variety`, `shopping` con los documentos esperados.

- [ ] **Step 5: Deployar las reglas**

Run: `firebase deploy --only firestore:rules` (requiere `firebase init firestore` previo, seleccionando el proyecto creado y aceptando `firestore.rules` como archivo de reglas existente).

- [ ] **Step 6: Commit**

```bash
git add plan-alimentacion/firestore.rules plan-alimentacion/scripts/seed.js
git commit -m "Agregar reglas de Firestore y script de seed"
```

---

### Task 5: `firestoreApi.js` — lectura en tiempo real

**Files:**
- Create: `plan-alimentacion/src/firestoreApi.js`

**Interfaces:**
- Consumes: `db` de `./firebaseConfig.js` (Task 3).
- Produces: `subscribeProfiles(cb)` (cb recibe `(personKey, data)` por cada perfil), `subscribeDays(person, cb)` (cb recibe `Array<{d, meals}>`), `subscribeSnacks(cb)` (cb recibe `{libre, proteina, ansiedad, horno}`), `subscribeInterchangeable(person, cb)` (cb recibe `{desayuno, almuerzo, merienda, cena}`), `subscribeEquivalences(cb)` (cb recibe `Array<{label, items}>`), `subscribeVariety(cb)` (cb recibe `Array<{cat, icon, items}>`), `subscribeShopping(cb)` (cb recibe `Array<{cat, icon, items}>`) — todas devuelven la función `unsubscribe`. Consumido por `App.jsx` (Task 7).

- [ ] **Step 1: Crear el archivo**

```js
// plan-alimentacion/src/firestoreApi.js
import { collection, doc, onSnapshot, query } from "firebase/firestore";
import { db } from "./firebaseConfig.js";

export function subscribeProfiles(cb) {
  const unsubs = ["angel", "gabriela"].map((key) =>
    onSnapshot(doc(db, "profiles", key), (snap) => {
      cb(key, snap.data());
    })
  );
  return () => unsubs.forEach((u) => u());
}

export function subscribeDays(person, cb) {
  const q = query(collection(db, "days", person, "list"));
  return onSnapshot(q, (snap) => {
    const days = snap.docs
      .sort((a, b) => a.id.localeCompare(b.id, undefined, { numeric: true }))
      .map((d) => d.data());
    cb(days);
  });
}

export function subscribeSnacks(cb) {
  return onSnapshot(doc(db, "snacks", "main"), (snap) => cb(snap.data()));
}

export function subscribeInterchangeable(person, cb) {
  return onSnapshot(doc(db, "interchangeable", person), (snap) => cb(snap.data()));
}

export function subscribeEquivalences(cb) {
  return onSnapshot(doc(db, "equivalences", "main"), (snap) => cb(snap.data()?.list ?? []));
}

export function subscribeVariety(cb) {
  return onSnapshot(doc(db, "variety", "main"), (snap) => cb(snap.data()?.list ?? []));
}

export function subscribeShopping(cb) {
  return onSnapshot(doc(db, "shopping", "main"), (snap) => cb(snap.data()?.list ?? []));
}
```

- [ ] **Step 2: Commit**

```bash
git add plan-alimentacion/src/firestoreApi.js
git commit -m "Agregar firestoreApi con suscripciones en tiempo real"
```

---

### Task 6: Componentes, mapa de íconos y tabs

**Files:**
- Create: `plan-alimentacion/src/iconMap.js`
- Create: `plan-alimentacion/src/components/Card.jsx`
- Create: `plan-alimentacion/src/components/SectionTitle.jsx`
- Create: `plan-alimentacion/src/components/Pill.jsx`
- Create: `plan-alimentacion/src/components/Block.jsx`
- Create: `plan-alimentacion/src/tabs/PlanTab.jsx`
- Create: `plan-alimentacion/src/tabs/SnacksTab.jsx`
- Create: `plan-alimentacion/src/tabs/FlexTab.jsx`
- Create: `plan-alimentacion/src/tabs/ExtraTab.jsx`
- Create: `plan-alimentacion/src/tabs/ComprasTab.jsx`

**Interfaces:**
- Consumes: nada de Firestore directamente — reciben los datos ya cargados como props desde `App.jsx` (Task 7).
- Produces: `Card({children, style})`, `SectionTitle({children, sub})`, `Pill({children, accent})`, `Block({label, text, accent, last})`, `PlanTab({days, dayIdx, setDayIdx, accent, accentSoft})`, `SnacksTab({data, accent})`, `FlexTab({data, equivalences, variety, accent, accentSoft, person})`, `ExtraTab({accent, person})`, `ComprasTab({data, accent})`, más `getIcon(name)` y `MEAL_ICON` en `iconMap.js`. Respecto al `plan_alimentacion.jsx` original, `SnacksTab`, `FlexTab` y `ComprasTab` ahora reciben los datos como props en vez de leer constantes del módulo — es el único cambio de interfaz.

- [ ] **Step 1: Crear `iconMap.js`**

```js
// plan-alimentacion/src/iconMap.js
import {
  Sunrise, Soup, Coffee, Moon, Carrot, Flame, Dumbbell,
  ShoppingBasket, Sparkles, ChevronRight, Beef, Fish, Egg,
  Droplet, Candy, Info, ArrowLeftRight, Leaf,
} from "lucide-react";

const ICONS = {
  Sunrise, Soup, Coffee, Moon, Carrot, Flame, Dumbbell,
  ShoppingBasket, Sparkles, ChevronRight, Beef, Fish, Egg,
  Droplet, Candy, Info, ArrowLeftRight, Leaf,
};

export const MEAL_ICON = { Desayuno: Sunrise, Almuerzo: Soup, Merienda: Coffee, Cena: Moon };

export function getIcon(name) {
  return ICONS[name] ?? Info;
}
```

- [ ] **Step 2: Crear `components/Card.jsx`, `SectionTitle.jsx`, `Pill.jsx`, `Block.jsx`**

Copiar tal cual las funciones `Card`, `SectionTitle`, `Pill` (líneas 294-351 del `plan_alimentacion.jsx` original) y `Block` (líneas 730-739) a sus propios archivos, cada uno con `export default function NombreDelComponente(...) { ... }` y sin cambios en el JSX/estilos.

Ejemplo `components/Card.jsx`:

```jsx
export default function Card({ children, style }) {
  return (
    <div
      style={{
        background: "#FFFFFF",
        borderRadius: 18,
        padding: "18px 18px",
        boxShadow: "0 1px 2px rgba(28,27,25,0.04), 0 8px 24px -12px rgba(28,27,25,0.10)",
        border: "1px solid #ECE8DF",
        ...style,
      }}
    >
      {children}
    </div>
  );
}
```

(Repetir el mismo patrón para `SectionTitle`, `Pill`, `Block`, copiando el JSX exacto del original.)

- [ ] **Step 3: Crear `tabs/PlanTab.jsx`**

Copiar `PlanTab` (líneas 535-596 del original) tal cual, cambiando los imports a `Card` desde `../components/Card.jsx` y `MEAL_ICON` desde `../iconMap.js`. La firma de props no cambia (`days`, `dayIdx`, `setDayIdx`, `accent`, `accentSoft`).

- [ ] **Step 4: Crear `tabs/SnacksTab.jsx`**

Copiar `SnacksTab` (líneas 598-632) pero reemplazar la referencia a la constante `SNACKS` por una prop `data`:

```jsx
import Card from "../components/Card.jsx";
import SectionTitle from "../components/SectionTitle.jsx";
import { Info } from "lucide-react";

export default function SnacksTab({ data, accent }) {
  const groups = [
    { title: "Volumen libre", sub: "Casi sin impacto calórico", items: data.libre },
    { title: "Con algo de proteína", sub: "Si el hambre es real", items: data.proteina },
    { title: "Para la ansiedad", sub: "No hambre fisiológica", items: data.ansiedad },
    { title: "Al horno / air fryer", sub: "Para dejar listos", items: data.horno },
  ];
  // resto del JSX idéntico al original (líneas 606-631)
}
```

- [ ] **Step 5: Crear `tabs/FlexTab.jsx`**

Copiar `FlexTab` (líneas 634-728) tal cual en cuanto a JSX/estilos, agregando dos props nuevas: `equivalences` y `variety` (reemplazan las constantes `EQUIVALENCES` y `VARIETY` del módulo original), y usando `getIcon(v.icon)` de `../iconMap.js` en vez del componente de ícono directo:

```jsx
import Card from "../components/Card.jsx";
import Pill from "../components/Pill.jsx";
import SectionTitle from "../components/SectionTitle.jsx";
import Block from "../components/Block.jsx";
import { getIcon } from "../iconMap.js";

export default function FlexTab({ data, equivalences, variety, accent, accentSoft, person }) {
  // JSX idéntico al original, pero:
  // - "EQUIVALENCES.map" -> "equivalences.map"
  // - "VARIETY.map" -> "variety.map"
  // - dentro del map de variety: "const Icon = v.icon;" -> "const Icon = getIcon(v.icon);"
}
```

- [ ] **Step 6: Crear `tabs/ExtraTab.jsx`**

Copiar `ExtraTab` (líneas 741-850) tal cual — este tab no depende de ninguna constante de datos (todo el contenido está inline en el JSX), así que no cambia de firma: `ExtraTab({ accent, person })`.

- [ ] **Step 7: Crear `tabs/ComprasTab.jsx`**

Copiar `ComprasTab` (líneas 852-877) reemplazando `SHOPPING.map` por una prop `data`:

```jsx
import Card from "../components/Card.jsx";
import SectionTitle from "../components/SectionTitle.jsx";
import { getIcon } from "../iconMap.js";

export default function ComprasTab({ data, accent }) {
  return (
    <div style={{ display: "flex", flexDirection: "column", gap: 14 }}>
      {/* SectionTitle idéntico al original */}
      {data.map((s) => {
        const Icon = getIcon(s.icon);
        // resto del JSX idéntico a las líneas 858-873 del original
      })}
    </div>
  );
}
```

- [ ] **Step 8: Verificar que no queden imports rotos**

Run: `cd plan-alimentacion && npx eslint src/components src/tabs src/iconMap.js` (o revisar manualmente cada archivo) para confirmar que cada uno importa lo que usa y no referencia nada que no exista todavía (`App.jsx` se crea en el próximo task, así que no debería ser importado desde acá).

- [ ] **Step 9: Commit**

```bash
git add plan-alimentacion/src/iconMap.js plan-alimentacion/src/components plan-alimentacion/src/tabs
git commit -m "Extraer componentes y tabs del plan_alimentacion.jsx original"
```

---

### Task 7: `App.jsx` — orquestación con Firestore

**Files:**
- Modify: `plan-alimentacion/src/App.jsx` (reemplaza el generado por create-vite)

**Interfaces:**
- Consumes: `subscribeProfiles`, `subscribeDays`, `subscribeSnacks`, `subscribeInterchangeable`, `subscribeEquivalences`, `subscribeVariety`, `subscribeShopping` de `./firestoreApi.js` (Task 5); `PlanTab`, `SnacksTab`, `FlexTab`, `ExtraTab`, `ComprasTab` con las firmas exactas de Task 6.
- Produces: la app completa renderizando el mismo layout que el original (header con switch de persona, macro strip, bottom nav con 5 tabs), con un loader mientras no llegó el primer snapshot de perfil/días de la persona activa.

- [ ] **Step 1: Escribir `App.jsx`**

```jsx
import React, { useState, useEffect } from "react";
import {
  Sunrise, Carrot, ArrowLeftRight, Sparkles, ShoppingBasket,
} from "lucide-react";
import {
  subscribeProfiles, subscribeDays, subscribeSnacks,
  subscribeInterchangeable, subscribeEquivalences, subscribeVariety, subscribeShopping,
} from "./firestoreApi.js";
import PlanTab from "./tabs/PlanTab.jsx";
import SnacksTab from "./tabs/SnacksTab.jsx";
import FlexTab from "./tabs/FlexTab.jsx";
import ExtraTab from "./tabs/ExtraTab.jsx";
import ComprasTab from "./tabs/ComprasTab.jsx";

const TABS = [
  { id: "plan", label: "Plan", icon: Sunrise },
  { id: "snacks", label: "Snacks", icon: Carrot },
  { id: "flex", label: "Flexible", icon: ArrowLeftRight },
  { id: "extra", label: "Extras", icon: Sparkles },
  { id: "compras", label: "Compras", icon: ShoppingBasket },
];

export default function App() {
  const [person, setPerson] = useState("angel");
  const [tab, setTab] = useState("plan");
  const [dayIdx, setDayIdx] = useState(0);

  const [profiles, setProfiles] = useState({});
  const [days, setDays] = useState({ angel: null, gabriela: null });
  const [snacks, setSnacks] = useState(null);
  const [inter, setInter] = useState({ angel: null, gabriela: null });
  const [equivalences, setEquivalences] = useState(null);
  const [variety, setVariety] = useState(null);
  const [shopping, setShopping] = useState(null);

  useEffect(() => subscribeProfiles((key, data) => setProfiles((p) => ({ ...p, [key]: data }))), []);
  useEffect(() => subscribeDays("angel", (d) => setDays((s) => ({ ...s, angel: d }))), []);
  useEffect(() => subscribeDays("gabriela", (d) => setDays((s) => ({ ...s, gabriela: d }))), []);
  useEffect(() => subscribeSnacks(setSnacks), []);
  useEffect(() => subscribeInterchangeable("angel", (d) => setInter((s) => ({ ...s, angel: d }))), []);
  useEffect(() => subscribeInterchangeable("gabriela", (d) => setInter((s) => ({ ...s, gabriela: d }))), []);
  useEffect(() => subscribeEquivalences(setEquivalences), []);
  useEffect(() => subscribeVariety(setVariety), []);
  useEffect(() => subscribeShopping(setShopping), []);

  const profile = profiles[person];
  const personDays = days[person];

  if (!profile || !personDays) {
    return (
      <div style={{ minHeight: "100vh", display: "flex", alignItems: "center", justifyContent: "center", background: "#F7F4EC", fontFamily: "'Inter', sans-serif", color: "#6B6459" }}>
        Cargando plan...
      </div>
    );
  }

  return (
    <div style={{ minHeight: "100vh", background: "#F7F4EC", fontFamily: "'Inter', -apple-system, sans-serif", color: "#1C1B19", display: "flex", justifyContent: "center" }}>
      <link
        rel="stylesheet"
        href="https://fonts.googleapis.com/css2?family=Fraunces:opsz,wght@9..144,500;9..144,600&family=Inter:wght@400;500;600;700&family=JetBrains+Mono:wght@500&display=swap"
      />
      <div style={{ width: "100%", maxWidth: 480, minHeight: "100vh", display: "flex", flexDirection: "column" }}>
        {/* HEADER: copiar tal cual del original líneas 390-473, reemplazando
            Object.keys(PROFILES) -> Object.keys(profiles) y PROFILES[key] -> profiles[key] */}

        <div style={{ flex: 1, padding: "20px 16px 100px" }}>
          {tab === "plan" && (
            <PlanTab days={personDays} dayIdx={dayIdx} setDayIdx={setDayIdx} accent={profile.accent} accentSoft={profile.accentSoft} />
          )}
          {tab === "snacks" && snacks && <SnacksTab data={snacks} accent={profile.accent} />}
          {tab === "flex" && inter[person] && equivalences && variety && (
            <FlexTab data={inter[person]} equivalences={equivalences} variety={variety} accent={profile.accent} accentSoft={profile.accentSoft} person={person} />
          )}
          {tab === "extra" && <ExtraTab accent={profile.accent} person={person} />}
          {tab === "compras" && shopping && <ComprasTab data={shopping} accent={profile.accent} />}
        </div>

        {/* BOTTOM NAV: copiar tal cual del original líneas 486-525, usando la constante TABS local */}
      </div>
    </div>
  );
}
```

Nota para quien implemente: completar los bloques HEADER y BOTTOM NAV copiando el JSX exacto
de `plan_alimentacion.jsx` líneas 390-473 y 486-525 sin modificar estilos ni textos, solo
reemplazando las referencias a `PROFILES` (constante del módulo original) por `profiles`
(estado local) como se indica arriba.

- [ ] **Step 2: Correr la app y verificar visualmente**

Run: `cd plan-alimentacion && npm run dev`, abrir en el navegador. Confirmar:
- Aparece "Cargando plan..." brevemente y después el plan de Ángel.
- El switch A/G cambia de persona y de color de acento.
- Los 5 tabs (Plan, Snacks, Flexible, Extras, Compras) muestran contenido igual al `plan_alimentacion.jsx` original.
- No hay errores en la consola del navegador.

- [ ] **Step 3: Commit**

```bash
git add plan-alimentacion/src/App.jsx
git commit -m "Conectar App.jsx a Firestore vía firestoreApi"
```

---

### Task 8: PWA manifest

**Files:**
- Create: `plan-alimentacion/public/manifest.json`
- Create: `plan-alimentacion/public/icon.png`
- Modify: `plan-alimentacion/index.html`

**Interfaces:**
- Produces: manifest linkeado desde `index.html`, permite "agregar a pantalla de inicio" en el celular.

- [ ] **Step 1: Crear `public/manifest.json`**

```json
{
  "name": "Plan de Alimentación",
  "short_name": "Plan",
  "start_url": "/plan-alimentacion/",
  "display": "standalone",
  "background_color": "#F7F4EC",
  "theme_color": "#2F6B4F",
  "icons": [
    { "src": "icon.png", "sizes": "512x512", "type": "image/png" }
  ]
}
```

- [ ] **Step 2: Agregar un ícono**

Colocar un PNG cuadrado de 512x512 en `plan-alimentacion/public/icon.png` (puede ser un ícono simple provisorio; el usuario lo puede reemplazar después).

- [ ] **Step 3: Linkear el manifest en `index.html`**

Agregar dentro del `<head>` de `plan-alimentacion/index.html`:

```html
<link rel="manifest" href="/plan-alimentacion/manifest.json" />
<meta name="theme-color" content="#2F6B4F" />
```

- [ ] **Step 4: Verificar**

Run: `npm run build && npm run preview`, abrir la URL, abrir DevTools → Application → Manifest y confirmar que carga sin errores.

- [ ] **Step 5: Commit**

```bash
git add plan-alimentacion/public/manifest.json plan-alimentacion/public/icon.png plan-alimentacion/index.html
git commit -m "Agregar manifest PWA"
```

---

### Task 9: GitHub Actions — deploy a GitHub Pages

**Files:**
- Create: `plan-alimentacion/.github/workflows/deploy.yml`

**Interfaces:**
- Consumes: GitHub Secrets `VITE_FIREBASE_API_KEY`, `VITE_FIREBASE_AUTH_DOMAIN`, `VITE_FIREBASE_PROJECT_ID`, `VITE_FIREBASE_STORAGE_BUCKET`, `VITE_FIREBASE_MESSAGING_SENDER_ID`, `VITE_FIREBASE_APP_ID` (mismos nombres que `.env.example` de Task 3).
- Produces: deploy automático del `dist/` a GitHub Pages en cada push a `main`.

- [ ] **Step 1: Crear el workflow**

```yaml
name: Deploy to GitHub Pages

on:
  push:
    branches: [main]

permissions:
  contents: read
  pages: write
  id-token: write

concurrency:
  group: pages
  cancel-in-progress: true

jobs:
  build:
    runs-on: ubuntu-latest
    defaults:
      run:
        working-directory: plan-alimentacion
    steps:
      - uses: actions/checkout@v4
      - uses: actions/setup-node@v4
        with:
          node-version: 20
      - run: npm ci
      - run: npm run build
        env:
          VITE_FIREBASE_API_KEY: ${{ secrets.VITE_FIREBASE_API_KEY }}
          VITE_FIREBASE_AUTH_DOMAIN: ${{ secrets.VITE_FIREBASE_AUTH_DOMAIN }}
          VITE_FIREBASE_PROJECT_ID: ${{ secrets.VITE_FIREBASE_PROJECT_ID }}
          VITE_FIREBASE_STORAGE_BUCKET: ${{ secrets.VITE_FIREBASE_STORAGE_BUCKET }}
          VITE_FIREBASE_MESSAGING_SENDER_ID: ${{ secrets.VITE_FIREBASE_MESSAGING_SENDER_ID }}
          VITE_FIREBASE_APP_ID: ${{ secrets.VITE_FIREBASE_APP_ID }}
      - uses: actions/upload-pages-artifact@v3
        with:
          path: plan-alimentacion/dist

  deploy:
    needs: build
    runs-on: ubuntu-latest
    environment:
      name: github-pages
      url: ${{ steps.deployment.outputs.page_url }}
    steps:
      - id: deployment
        uses: actions/deploy-pages@v4
```

- [ ] **Step 2: Commit**

```bash
git add plan-alimentacion/.github/workflows/deploy.yml
git commit -m "Agregar workflow de deploy a GitHub Pages"
```

- [ ] **Step 3: Crear el repo remoto, cargar secrets y pushear**

```bash
gh repo create angelmeier10/plan-alimentacion --public --source=. --remote=origin
gh secret set VITE_FIREBASE_API_KEY --body "<valor real>"
gh secret set VITE_FIREBASE_AUTH_DOMAIN --body "<valor real>"
gh secret set VITE_FIREBASE_PROJECT_ID --body "<valor real>"
gh secret set VITE_FIREBASE_STORAGE_BUCKET --body "<valor real>"
gh secret set VITE_FIREBASE_MESSAGING_SENDER_ID --body "<valor real>"
gh secret set VITE_FIREBASE_APP_ID --body "<valor real>"
git push -u origin main
```

En GitHub, ir a Settings → Pages → Source → seleccionar "GitHub Actions" (paso manual, una sola vez).

- [ ] **Step 4: Verificar el deploy**

Run: `gh run watch` (o revisar la pestaña Actions en GitHub). Expected: el workflow `Deploy to GitHub Pages` termina en verde. Abrir `https://angelmeier10.github.io/plan-alimentacion/` y confirmar que la app carga y muestra los datos de Firestore.

---

### Task 10: Verificación final end-to-end

**Files:** ninguno (solo verificación manual)

- [ ] **Step 1: Confirmar reflejo en tiempo real**

Con la app abierta en `https://angelmeier10.github.io/plan-alimentacion/` (o `npm run dev` local), editar manualmente un campo en la consola de Firestore (ej. el texto de una comida en `days/angel/list/day1`) y confirmar que el cambio aparece en la app sin recargar la página.

- [ ] **Step 2: Confirmar build limpio**

Run: `cd plan-alimentacion && npm run build`
Expected: build termina sin errores ni warnings de imports rotos.

- [ ] **Step 3: Confirmar paridad visual con el original**

Comparar los 5 tabs de la app deployada contra `plan_alimentacion.jsx` original: mismos textos, mismo layout, mismos colores por persona.

- [ ] **Step 4: Commit final si hubo ajustes**

```bash
git add -A
git commit -m "Ajustes finales post-verificación"
git push
```
