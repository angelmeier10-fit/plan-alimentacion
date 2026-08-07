# Plan de Alimentación — Migración a app con Firebase

Fecha: 2026-08-07

## Contexto

Existe un componente React funcional (`plan_alimentacion.jsx`) con el plan de alimentación
de Ángel y Gabriela, datos hardcodeados en constantes JS. Se migra a una app real: Vite +
React + Firebase (Firestore + Auth), deployada en GitHub Pages, para que los datos vivan en
un solo lugar y se actualicen en el celular de ambos sin resubir código.

## Alcance de esta fase

- App de **solo lectura pública**, sin panel de edición en la UI.
- Auth de Firebase queda preparado en las reglas de Firestore para habilitar escritura en el
  futuro, pero no hay login ni UI de edición todavía.
- Edición de datos: directo en la consola de Firestore.
- Fase futura (fuera de este alcance): panel de edición protegido por login.

## Stack

- Vite + React (mismo patrón visual y de componentes que `plan_alimentacion.jsx`)
- Firebase: Firestore (datos) + Auth (preparado, sin uso activo aún)
- Hosting: GitHub Pages vía GitHub Actions (mismo flujo que `angelmeier-fit`)
- Repo: `angelmeier10/plan-alimentacion`
- Proyecto Firebase: nuevo, a crear en la consola (nombre sugerido `plan-alimentacion`)

## Estructura del proyecto

```
plan-alimentacion/
  src/
    firebaseConfig.js
    firestoreApi.js        # funciones subscribeX(cb) por colección, con onSnapshot
    App.jsx                # mismo layout/lógica de navegación que el original, lee de Firestore
    components/            # Card, SectionTitle, Pill, Block (extraídos del jsx actual)
    tabs/                  # PlanTab, SnacksTab, FlexTab, ExtraTab, ComprasTab
  scripts/
    seed.js                # carga los datos actuales del jsx a Firestore, se corre una sola vez
  public/
    manifest.json           # PWA básica (agregar a pantalla de inicio)
    icon.png
  .env.example
  .github/workflows/deploy.yml
  firestore.rules
```

## Modelo de datos (Firestore)

Estructura ya definida en `HANDOFF.md`, se mantiene sin cambios:

```
/profiles/angel        { name, initial, accent, accentSoft, role, macros: {kcal, prot, fat, carb} }
/profiles/gabriela      { ... }
/days/angel/day1        { d: "Día 1", meals: [{ m, t }, ...] }
... angel/day2..day6, gabriela/day1..day6
/snacks/main            { libre: [...], proteina: [...], ansiedad: [...], horno: [...] }
/interchangeable/angel  { desayuno: [...], almuerzo: {proteina, carbo, verdura}, merienda: [...], cena: {...} }
/interchangeable/gabriela { ... }
/extras/main            { fatSources, cheese, wod, dulce: {...}, ... } // contenido estático de ExtraTab
/equivalences/main      [{ label, items }, ...]
/variety/main           [{ cat, items }, ...]   // icon se resuelve por nombre en el cliente
/shopping/main          [{ cat, items: [...] }, ...]  // icon se resuelve por nombre en el cliente
```

Nota: los campos `icon` (componentes de `lucide-react`) no se guardan en Firestore — se guarda
un string clave (`"Beef"`, `"Carrot"`, etc.) y el cliente mapea a los componentes de ícono
igual que hoy hace `MEAL_ICON`.

## Flujo de datos

1. **Seed único** (`scripts/seed.js`): script Node que usa el SDK de Firebase (cliente o
   `firebase-admin`) para leer los objetos `PROFILES`, `DAYS`, `SNACKS`, `INTERCHANGEABLE`,
   `EQUIVALENCES`, `VARIETY`, `SHOPPING` tal cual están en `plan_alimentacion.jsx` y subirlos
   a las colecciones de arriba. Se corre una sola vez con `node scripts/seed.js`.
2. **Lectura en la app:** `firestoreApi.js` expone `subscribeProfiles(cb)`, `subscribeDays(person, cb)`,
   `subscribeSnacks(cb)`, `subscribeInterchangeable(person, cb)`, `subscribeExtras(cb)`,
   `subscribeShopping(cb)`, todas usando `onSnapshot`. `App.jsx` y cada tab reemplazan sus
   `useState`/constantes locales por estos hooks. Mientras carga el primer snapshot se muestra
   un loader simple (spinner o skeleton mínimo); el resto del diseño/JSX visual no cambia.
3. **Actualización futura:** edición manual de un doc en la consola de Firestore → `onSnapshot`
   empuja el cambio → se refleja sin redeploy en los celulares de Ángel y Gabriela.

## Reglas de Firestore

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

## Deploy

- **GitHub Actions** (`.github/workflows/deploy.yml`): en cada push a `main`, `npm ci && npm run build`,
  luego deploy del `dist/` a GitHub Pages (mismo flujo que `angelmeier-fit`).
- **Vite config:** `base: '/plan-alimentacion/'`.
- **Variables de entorno:** credenciales de Firebase como GitHub Secrets, inyectadas en build
  time vía `import.meta.env.VITE_*`. `.env.example` documenta las claves esperadas
  (`VITE_FIREBASE_API_KEY`, `VITE_FIREBASE_AUTH_DOMAIN`, `VITE_FIREBASE_PROJECT_ID`, etc.).
- **PWA:** `manifest.json` básico + ícono para "agregar a pantalla de inicio". Sin service
  worker (no se requiere soporte offline).

## Fuera de alcance (fase futura)

- Panel de edición del plan protegido por login (Firebase Auth ya queda preparado en las reglas).
- Soporte offline / service worker.
- Notificaciones push.

## Testing / verificación

- Verificar visualmente que la app renderiza igual que el `plan_alimentacion.jsx` original
  (mismos tabs, mismo diseño) pero con datos viniendo de Firestore.
- Verificar que un cambio manual en un doc de Firestore se refleja en la app sin redeploy
  (probar con la consola abierta + la app corriendo).
- Verificar el build de producción (`npm run build`) y el deploy a GitHub Pages funcionando
  en la URL final.
