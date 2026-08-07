# Plan de Alimentación — Traspaso a Claude Code (VS Code)

## Qué es
App tipo mobile con el plan de alimentación de Ángel y Gabriela (déficit calórico, 6 días,
snacks, comidas intercambiables, extras, lista de compras). Ya existe como componente React
funcionando (`plan_alimentacion.jsx`, adjunto en esta conversación).

## Objetivo de esta migración
Pasar de "artifact de Claude" a una app real, online, siempre actualizada para los dos —
mismo patrón que ya usás en `angelmeier10-fit.github.io/angelmeier-fit`:
- **GitHub** → control de versiones + hosting (GitHub Pages)
- **Firebase** → backend, para que los datos vivan en un solo lugar y se vean actualizados
  en el celular de Gabriela sin que ella tenga que hacer nada

## Por qué Firebase acá (y no solo HTML estático)
Con HTML estático, cada cambio requiere resubir el archivo. Con Firebase (Firestore), el
plan vive en una base de datos: vos actualizás un dato una sola vez (desde un panel simple o
directo en Firestore) y se refleja solo en la app de ambos, en tiempo real.

## Estructura de datos sugerida (Firestore)
```
/profiles/angel        { name, accent, role, macros: {kcal, prot, fat, carb} }
/profiles/gabriela      { name, accent, role, macros: {...} }
/days/angel/day1        { meals: [{m, t}, ...] }
/days/gabriela/day1     { meals: [...] }
... day2...day6
/snacks                 { libre: [...], proteina: [...], ansiedad: [...], horno: [...] }
/interchangeable/angel  { desayuno: [...], almuerzo: {...}, merienda: [...], cena: {...} }
/interchangeable/gabriela { ... }
/extras                 { fatSources, drinks, wod, dulce: {...} }
/shopping               [{ cat, items: [...] }, ...]
```
Esto reemplaza los objetos `PROFILES`, `DAYS`, `SNACKS`, `INTERCHANGEABLE`, `SHOPPING` que
hoy están hardcodeados en el componente — se leen con `onSnapshot` de Firestore en vez de
ser constantes, así cualquier edición se refleja al instante en los dos celulares.

## Pasos sugeridos en Claude Code
1. `npx create-vite@latest plan-alimentacion --template react`
2. Instalar Firebase: `npm install firebase`
3. Crear proyecto en [Firebase Console](https://console.firebase.google.com), activar
   Firestore (modo producción, reglas simples de lectura pública + escritura solo para
   ustedes dos, o con auth simple)
4. Cargar los datos actuales (los que están en `plan_alimentacion.jsx`) a Firestore una
   sola vez — Claude Code puede armar un script de seed para esto
5. Adaptar el componente para leer de Firestore en vez de las constantes locales
6. Deploy a GitHub Pages (mismo flujo que `angelmeier-fit`) o a Firebase Hosting directamente
   (más simple si ya usás Firestore, todo queda en un solo lugar)
7. Compartir el link final con Gabriela — funciona como una PWA, se puede "agregar a
   pantalla de inicio" en el celular y se siente como una app nativa

## Archivo base para arrancar
`plan_alimentacion.jsx` (adjunto) — componente React completo y funcional, con toda la
data actual de Ángel y Gabriela ya cargada. Es el punto de partida: Claude Code solo
necesita reemplazar las constantes por lecturas de Firestore, no rehacer el diseño.

## Datos de referencia (macros actuales)
- **Ángel**: 2.200 kcal | 170g proteína | 68g grasa | 227g carbohidratos
- **Gabriela**: 1.750 kcal | 150g proteína | 55g grasa | 164g carbohidratos

## Nota
Ángel maneja el código en VS Code; el rol de Claude (chat) es estrategia de contenido y
nutrición, no implementación técnica — la parte de código se resuelve en Claude Code.
