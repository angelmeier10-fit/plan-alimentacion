# Sección de Recetas — Design Spec

## Alcance

Agregar una sección de recetas de solo lectura a la app `plan-alimentacion`, como sexto tab
del bottom nav (junto a Plan, Snacks, Flexible, Extras, Compras). Compartida entre Ángel y
Gabriela (no hay una lista por persona). Arranca precargada con 5-6 recetas de ejemplo vía el
script de seed existente. Sin UI de carga/edición — mismo alcance de solo lectura que el resto
de la app en esta fase (ver spec original: "Alcance de esta fase").

## Modelo de datos

Un documento único en Firestore, mismo patrón que `variety/main` y `shopping/main`:

```
recipes/main: { list: Recipe[] }

Recipe = {
  title: string,
  tag: "Desayuno" | "Almuerzo" | "Merienda" | "Cena",
  ingredients: string[],
  steps: string[],
}
```

`tag` reutiliza las mismas 4 etiquetas de comida que ya existen en el resto de la app
(`MEAL_ICON` en `src/iconMap.js`), para no introducir un sistema de íconos nuevo.

La regla de Firestore actual (`allow read: if true` sobre `/{document=**}`) ya cubre esta
colección nueva sin cambios en `firestore.rules`.

## Datos de seed (5-6 recetas de ejemplo)

Se agregan a `scripts/seedData.js` como `export const RECIPES`, con recetas variadas por
etiqueta, en la misma línea de las comidas ya presentes en `DAYS` (proteína + carbohidrato +
verdura, porciones simples, sin ingredientes exóticos):

1. **Tortilla de claras con espinaca** — Desayuno
2. **Pollo al horno con batatas y ensalada** — Almuerzo
3. **Yogur con avena y frutos secos** — Merienda
4. **Salmón con puré de calabaza y brócoli** — Cena
5. **Bowl de arroz integral con atún y verduras** — Almuerzo
6. **Panqueques de avena y banana** — Desayuno

Cada una con 4-6 ingredientes y 3-5 pasos, texto simple sin cantidades exactas (igual de
informal que las descripciones de comidas ya existentes en `DAYS`).

## Backend / API

`src/firestoreApi.js` — agregar, siguiendo el patrón exacto de `subscribeVariety`:

```js
export function subscribeRecipes(cb) {
  return onSnapshot(doc(db, "recipes", "main"), (snap) => cb(snap.data()?.list ?? []));
}
```

`scripts/seed.js` — agregar, siguiendo el patrón exacto del bloque de `SHOPPING`:

```js
await setDoc(doc(db, "recipes", "main"), { list: RECIPES });
console.log("recipes/main ok");
```

## UI

**`src/tabs/RecetasTab.jsx`** (nuevo, mismo patrón que `ComprasTab.jsx`):
- Recibe `data` (array de `Recipe`) y `accent` como props.
- Un `SectionTitle` general ("Recetas").
- Un `Card` por receta: título, `Pill` con el nombre de la etiqueta (color `accent`), lista de
  ingredientes, lista de pasos numerados. Sin acordeón/colapso — todo visible, ya que son pocas
  recetas y el patrón de la app no usa interacciones de expandir/contraer en ningún otro tab.

**`src/iconMap.js`**: agregar `BookOpen` a los íconos importados de `lucide-react` (no
colisiona con `Sparkles`, ya usado por el tab Extras).

**`src/App.jsx`**:
- Agregar `{ id: "recetas", label: "Recetas", icon: BookOpen }` a `TABS`.
- Nuevo estado `recipes` (`useState(null)`), suscripción `useEffect(() =>
  subscribeRecipes(setRecipes), [])`.
- Render condicional: `{tab === "recetas" && recipes && <RecetasTab data={recipes}
  accent={profile.accent} />}`.

## Fuera de alcance

- Edición, borrado o agregado de recetas desde la UI (requeriría login — mismo punto que el
  resto de la app, documentado como fase futura en el spec original).
- Filtro por etiqueta o búsqueda — con 5-6 recetas no hace falta todavía.
- Cantidades exactas / tiempos de preparación / porciones — se mantiene el mismo nivel de
  detalle informal que las comidas del plan.
