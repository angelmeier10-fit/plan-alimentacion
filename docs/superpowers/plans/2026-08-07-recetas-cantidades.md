# Cantidades por persona en Recetas — Implementation Plan

> **For agentic workers:** REQUIRED SUB-SKILL: Use superpowers:subagent-driven-development (recommended) or superpowers:executing-plans to implement this plan task-by-task. Steps use checkbox (`- [ ]`) syntax for tracking.

**Goal:** Cada ingrediente de las 6 recetas existentes muestra una cantidad distinta para Ángel y para Gabriela, siguiendo el switch A/G ya presente en la app.

**Architecture:** Los ingredientes pasan de `string[]` a `Ingredient[]` (`{item, angel, gabriela}`) en `recipes/main`. `RecetasTab` recibe una prop `person` nueva y arma el texto de cada ingrediente combinando `item` con la cantidad de la persona activa. Sin cambios en `steps`, en la suscripción de Firestore, ni en ninguna otra colección.

**Tech Stack:** Vite, React 19, `firebase` (Firestore JS SDK), `firebase-admin` (script de seed).

## Global Constraints

- `Ingredient = { item: string, angel: string, gabriela: string }` — reemplaza el `string` plano de cada ingrediente (spec: "Modelo de datos").
- Ingredientes sin cantidad medible llevan el mismo valor en `angel` y `gabriela` (ej. `"a gusto"`) (spec: "Modelo de datos").
- `steps` no cambia — mismas instrucciones para ambas personas (spec: "Modelo de datos").
- Texto renderizado por ingrediente: `` `${ing[person]} de ${ing.item}` `` — mismo formato visual que hoy (spec: "UI").
- Las 6 cantidades por receta son las del spec, sección "Cantidades por receta" — no se recalculan ni se inventan otras.
- No se modifica `firestore.rules`, `subscribeRecipes`, ni el modelo de ninguna otra colección (spec: "Fuera de alcance").

---

### Task 1: Actualizar `RECIPES` en `seedData.js` con ingredientes por persona

**Files:**
- Modify: `plan-alimentacion/scripts/seedData.js`

**Interfaces:**
- Produces: `RECIPES` con `ingredients: Ingredient[]` en vez de `string[]`, mismo `title`/`tag`/`steps` que ya existían. Consumido por Task 2 (`scripts/seed.js`, sin cambios propios — solo vuelve a correr con los datos nuevos).

- [ ] **Step 1: Reemplazar el array `ingredients` de cada una de las 6 recetas**

En `plan-alimentacion/scripts/seedData.js`, dentro de `export const RECIPES`, reemplazar el
array `ingredients` de cada receta (dejando `title`, `tag` y `steps` sin tocar) por:

**Receta 1 — Tortilla de claras con espinaca:**
```js
ingredients: [
  { item: "claras + huevo entero", angel: "4 claras + 1 huevo entero", gabriela: "3 claras + 1 huevo entero" },
  { item: "espinaca fresca", angel: "1 puñado grande", gabriela: "1 puñado" },
  { item: "sal, pimienta", angel: "a gusto", gabriela: "a gusto" },
  { item: "aceite de oliva", angel: "1 cdita", gabriela: "1 cdita" },
  { item: "pan integral", angel: "2 rodajas", gabriela: "1 rodaja" },
],
```

**Receta 2 — Pollo al horno con batatas y ensalada:**
```js
ingredients: [
  { item: "pechuga de pollo", angel: "200g", gabriela: "150g" },
  { item: "batata", angel: "1 batata mediana", gabriela: "1 batata chica" },
  { item: "ensalada verde", angel: "grande", gabriela: "grande" },
  { item: "aceite de oliva", angel: "1 cda", gabriela: "1 cdita" },
  { item: "orégano, sal, pimienta", angel: "a gusto", gabriela: "a gusto" },
],
```

**Receta 3 — Yogur con avena y frutos secos:**
```js
ingredients: [
  { item: "yogur casero", angel: "200g", gabriela: "150g" },
  { item: "avena en hojuelas", angel: "40g", gabriela: "25g" },
  { item: "nueces o almendras", angel: "30g", gabriela: "20g" },
  { item: "canela", angel: "a gusto", gabriela: "a gusto" },
],
```

**Receta 4 — Salmón con puré de calabaza y brócoli:**
```js
ingredients: [
  { item: "salmón", angel: "180g", gabriela: "130g" },
  { item: "calabaza", angel: "200g", gabriela: "150g" },
  { item: "brócoli", angel: "150g", gabriela: "100g" },
  { item: "aceite de oliva", angel: "1 cdita", gabriela: "1 cdita" },
  { item: "sal, pimienta, limón", angel: "a gusto", gabriela: "a gusto" },
],
```

**Receta 5 — Bowl de arroz integral con atún y verduras:**
```js
ingredients: [
  { item: "arroz integral cocido", angel: "80g", gabriela: "60g" },
  { item: "atún al natural", angel: "1 lata", gabriela: "1 lata" },
  { item: "verduras variadas (zanahoria, morrón, cebolla)", angel: "a gusto", gabriela: "a gusto" },
  { item: "aceite de oliva", angel: "1 cda", gabriela: "1 cdita" },
  { item: "sal, limón", angel: "a gusto", gabriela: "a gusto" },
],
```

**Receta 6 — Panqueques de avena y banana:**
```js
ingredients: [
  { item: "banana madura", angel: "1 banana mediana", gabriela: "1 banana chica" },
  { item: "huevos", angel: "2 huevos", gabriela: "1 huevo + 1 clara" },
  { item: "avena en hojuelas", angel: "40g", gabriela: "25g" },
  { item: "canela", angel: "a gusto", gabriela: "a gusto" },
  { item: "aceite en spray", angel: "a gusto", gabriela: "a gusto" },
],
```

- [ ] **Step 2: Verificar que el archivo sigue siendo JS válido**

Run:

```bash
cd plan-alimentacion
node --input-type=module -e "
import('./scripts/seedData.js').then(m => {
  console.log(Object.keys(m));
  console.log(m.RECIPES.length, 'recetas');
  console.log(m.RECIPES[0].ingredients[0]);
});
"
```

Expected: imprime las mismas 8 keys que antes (incluye `RECIPES`), `6 recetas`, y el primer
ingrediente como `{ item: 'claras + huevo entero', angel: '4 claras + 1 huevo entero', gabriela: '3 claras + 1 huevo entero' }`.

- [ ] **Step 3: Commit**

```bash
git add plan-alimentacion/scripts/seedData.js
git commit -m "Agregar cantidades por persona a los ingredientes de RECIPES"
```

---

### Task 2: Re-correr el seed de `recipes/main`

**Files:** ninguno (solo ejecución)

**Interfaces:**
- Consumes: `RECIPES` actualizado de `./seedData.js` (Task 1).
- Produces: documento `recipes/main` en Firestore sobrescrito con la nueva forma de `ingredients`.

- [ ] **Step 1: Correr el seed**

Run (PowerShell, requiere `GOOGLE_APPLICATION_CREDENTIALS` apuntando a una clave de cuenta de
servicio del proyecto — generar una nueva en Firebase Console → Configuración del proyecto →
Cuentas de servicio si no hay una vigente):

```powershell
cd plan-alimentacion
$env:GOOGLE_APPLICATION_CREDENTIALS = "<ruta a la clave>"
node scripts/seed.js
```

Expected: entre las líneas de salida aparece `recipes/main ok`, y termina con `Seed completo.`
sin errores. Este comando sobrescribe TODAS las colecciones (perfiles, días, snacks, etc.) con
los datos actuales de `seedData.js` — no solo recetas — porque `seed.js` no tiene un modo
selectivo; es el mismo comportamiento que ya tenía antes de este cambio.

- [ ] **Step 2: Verificar en Firestore**

Run:

```bash
cd plan-alimentacion
node -e "
const fs = require('fs');
const env = Object.fromEntries(fs.readFileSync('.env.local','utf8').trim().split(/\r?\n/).map(l=>l.split('=')));
const { initializeApp } = require('firebase/app');
const { getFirestore, doc, getDoc } = require('firebase/firestore');
const app = initializeApp({
  apiKey: env.VITE_FIREBASE_API_KEY,
  authDomain: env.VITE_FIREBASE_AUTH_DOMAIN,
  projectId: env.VITE_FIREBASE_PROJECT_ID,
  storageBucket: env.VITE_FIREBASE_STORAGE_BUCKET,
  messagingSenderId: env.VITE_FIREBASE_MESSAGING_SENDER_ID,
  appId: env.VITE_FIREBASE_APP_ID,
});
const db = getFirestore(app);
getDoc(doc(db, 'recipes', 'main')).then(snap => {
  console.log(JSON.stringify(snap.data().list[0].ingredients[0]));
  process.exit(0);
});
"
```

Expected: imprime
`{"item":"claras + huevo entero","angel":"4 claras + 1 huevo entero","gabriela":"3 claras + 1 huevo entero"}`.

No hay commit en este task — no se tocan archivos del repo.

---

### Task 3: `RecetasTab.jsx` — renderizar cantidad según persona

**Files:**
- Modify: `plan-alimentacion/src/tabs/RecetasTab.jsx`

**Interfaces:**
- Consumes: nueva prop `person` (`"angel"` | `"gabriela"`).
- Produces: `RecetasTab({ data, accent, person })` — mismo componente, firma extendida. Consumido por Task 4 (`App.jsx`).

- [ ] **Step 1: Agregar `person` a la firma y usar `ing[person]` al renderizar**

En `plan-alimentacion/src/tabs/RecetasTab.jsx`, cambiar la firma del componente:

```jsx
export default function RecetasTab({ data, accent, person }) {
```

Y cambiar el bloque que renderiza la lista de ingredientes (el `<ul>` que hoy hace
`{recipe.ingredients.map((ing) => <li key={ing}>{ing}</li>)}`) por:

```jsx
<ul style={{ margin: "0 0 12px", paddingLeft: 18, fontSize: 14, lineHeight: 1.5 }}>
  {recipe.ingredients.map((ing) => (
    <li key={ing.item}>{ing[person]} de {ing.item}</li>
  ))}
</ul>
```

No tocar el bloque de `steps` (sigue igual, sin depender de `person`).

- [ ] **Step 2: Verificar que no queden imports rotos**

Run: `cd plan-alimentacion && npx eslint src/tabs/RecetasTab.jsx` (o revisión manual) para
confirmar que el archivo sigue siendo JSX válido y no quedan referencias al formato viejo de
ingrediente (`string` plano).

- [ ] **Step 3: Commit**

```bash
git add plan-alimentacion/src/tabs/RecetasTab.jsx
git commit -m "Renderizar cantidad de ingredientes según persona activa en RecetasTab"
```

---

### Task 4: Pasar `person` desde `App.jsx`

**Files:**
- Modify: `plan-alimentacion/src/App.jsx`

**Interfaces:**
- Consumes: `RecetasTab` con la firma extendida de Task 3.
- Produces: tab "Recetas" mostrando cantidades correctas según el switch A/G.

- [ ] **Step 1: Agregar la prop `person` al render de `RecetasTab`**

En `plan-alimentacion/src/App.jsx`, cambiar la línea:

```jsx
{tab === "recetas" && recipes && <RecetasTab data={recipes} accent={profile.accent} />}
```

por:

```jsx
{tab === "recetas" && recipes && <RecetasTab data={recipes} accent={profile.accent} person={person} />}
```

(`person` ya existe como estado del componente — no hace falta declararlo de nuevo.)

- [ ] **Step 2: Correr la app y verificar visualmente**

Run: `cd plan-alimentacion && npm run dev`, abrir en el navegador. Confirmar:
- Con Ángel seleccionado, el tab "Recetas" muestra "200g de pechuga de pollo" en la receta de
  pollo al horno.
- Al tocar el switch a Gabriela, la misma receta pasa a mostrar "150g de pechuga de pollo" sin
  recargar la página.
- Los ingredientes "a gusto" (sal, pimienta, canela, etc.) se ven iguales para ambas personas.
- No hay errores en la consola del navegador.

- [ ] **Step 3: Commit**

```bash
git add plan-alimentacion/src/App.jsx
git commit -m "Pasar person a RecetasTab para mostrar cantidades por persona"
```

---

### Task 5: Verificación final y deploy

**Files:** ninguno (solo verificación y push)

- [ ] **Step 1: Confirmar build limpio**

Run: `cd plan-alimentacion && npm run build`
Expected: build termina sin errores ni warnings de imports rotos.

- [ ] **Step 2: Push a `main`**

```bash
git push
```

Expected: dispara el workflow `Deploy to GitHub Pages` (ya configurado en
`.github/workflows/deploy.yml`).

- [ ] **Step 3: Verificar el deploy**

Run: `gh run watch --repo angelmeier10-fit/plan-alimentacion` (o revisar la pestaña Actions en
GitHub). Expected: el workflow termina en verde.

- [ ] **Step 4: Confirmar en producción**

Abrir `https://angelmeier10-fit.github.io/plan-alimentacion/`, ir al tab "Recetas" con Ángel
seleccionado, confirmar cantidades de Ángel; tocar el switch a Gabriela y confirmar que las
cantidades cambian sin recargar. Sin errores en consola.
