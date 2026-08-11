# Calculadora de macros — Design Spec

## Alcance

Nueva pestaña "Calculadora" en `plan-alimentacion` (app existente, tabs + Firestore).
Permite buscar un alimento, cargar gramos consumidos y ver el progreso de macros del día
contra el objetivo real del perfil (`profile.macros`). El registro es por persona y por día,
navegable hacia atrás (historial), con edición de gramos y borrado de entradas. Se puede además
agregar alimentos nuevos a una base compartida entre Ángel y Gabriela.

Punto de partida: `c:\Users\meier\Downloads\calculadora-macros.jsx` (mockup con Tailwind y
`window.storage`, sin persona real ni historial). Se reimplementa siguiendo los patrones ya
usados en la app (estilos inline, Firestore, props `accent`/`person` como el resto de los tabs).

## Modelo de datos

**Base de alimentos fija** (`BASE_FOODS`): queda como constante en el código — misma lista que
trae el mockup (pollo, carne, pescado, huevo, arroz, avena, etc.), valores por 100g.

**Alimentos personalizados** — colección compartida entre los dos:

```
foods/custom (doc único)
{ list: [{ id: "custom-<timestamp>", name, kcal, prot, fat, carb }] }
```

**Registro diario** — un doc por persona por día:

```
macroLogs/{person}/days/{YYYY-MM-DD}
{
  entries: [
    { id: "<timestamp>", foodId: string, name: string, grams: number }
  ]
}
```

`{person}` es `"angel"` | `"gabriela"`. `{YYYY-MM-DD}` es la fecha local del registro (no UTC),
formato `2026-08-11`. Un doc por día permite navegar el historial documento por documento sin
traer todo el historial de una vez.

## firestoreApi.js — funciones nuevas

Siguiendo el patrón `subscribeX(cb, onError)` ya usado en el archivo:

- `subscribeCustomFoods(cb, onError)` — `onSnapshot` sobre `foods/custom`, `cb(list)`.
- `addCustomFood(food)` — `setDoc` con `arrayUnion` sobre `foods/custom.list`.
- `subscribeMacroLog(person, dateStr, cb, onError)` — `onSnapshot` sobre
  `macroLogs/{person}/days/{dateStr}`, `cb(entries)` (`[]` si el doc no existe).
- `addLogEntry(person, dateStr, entry)` — `setDoc` con `arrayUnion` sobre `entries` (merge:true,
  crea el doc del día si no existe).
- `updateLogEntry(person, dateStr, entryId, grams)` — lee el doc, reemplaza el entry por id,
  `setDoc` con el array completo (arrayUnion no sirve para reemplazar in-place).
- `deleteLogEntry(person, dateStr, entryId)` — lee el doc, filtra el entry por id, `setDoc` con
  el array resultante.

## UI

Nuevo archivo `src/tabs/CalculadoraTab.jsx`, agregado a `TABS` en `App.jsx` (ícono `Flame` de
lucide-react, ya usado en el mockup) y renderizado como los demás tabs:
`{tab === "calculadora" && <CalculadoraTab person={person} profile={profile} accent={profile.accent} />}`.

Estructura de la pantalla (reutiliza el layout del mockup, sin la columna de dos personas — acá
ya hay switch de persona global en el header de `App.jsx`):

1. **Selector de fecha**: arriba de todo, default hoy (`new Date()` formateada a
   `YYYY-MM-DD` en horario local). Flechas atrás/adelante o input `type="date"`. Al cambiar la
   fecha, resubscribe `subscribeMacroLog` con el nuevo `dateStr`.
2. **Buscador + lista de alimentos**: igual al mockup — input de texto filtra `BASE_FOODS +
   customFoods` por nombre, lista clickeable muestra kcal/100g.
3. **Input de gramos + botón "Agregar"**: agrega un `entry` al día seleccionado vía
   `addLogEntry`.
4. **Resumen de macros del día**: anillo (`MacroRing`) + barras (`MacroRow`) para
   kcal/prot/grasa/carbo, target = `profile.macros` (valores reales ya cargados en Firestore,
   no los hardcodeados del mockup). Recalculado sobre las `entries` del día actual.
5. **Lista de entradas del día**: cada fila muestra `{grams}g {name}`. Click en la fila la pone
   en modo edición (input numérico de gramos inline + botón guardar/cancelar) →
   `updateLogEntry`. Botón de borrar (ícono tacho) por fila → `deleteLogEntry`, elimina la
   entrada completa.
6. **"+ Agregar alimento nuevo a la base"**: mismo formulario del mockup (nombre + kcal/prot/
   grasa/carbo por 100g) → `addCustomFood`, queda disponible para los dos.

Estilos: se convierten las clases Tailwind del mockup a estilos inline (`style={{...}}`),
paleta y tipografía ya usada en `App.jsx` (fondo `#F7F4EC`, acento por persona, fuente
Inter/Fraunces). `MacroRing` y `MacroRow` se llevan como sub-componentes dentro de
`CalculadoraTab.jsx` (no hay carpeta de sub-componentes por tab hoy).

## Manejo de errores

Mismo patrón que el resto de la app: `subscribeX(cb, onError)` con `onError` seteando el mismo
`LOAD_ERROR_MESSAGE` genérico de `App.jsx` si falla la carga inicial. Escrituras (`addLogEntry`,
`updateLogEntry`, `deleteLogEntry`, `addCustomFood`) usan `try/catch` con `console.error`, sin
bloquear la UI (igual que `persistLog` del mockup, sin el `window.storage`).

## Fuera de alcance

- Sin login/autenticación nueva — la app ya no tiene auth (público), el registro por persona se
  identifica por el switch de persona existente, no por usuario logueado.
- Sin gráficos de tendencia entre días (solo el día seleccionado a la vez).
- Sin edición/borrado de alimentos personalizados una vez creados (se agregan, no se editan ni
  eliminan de la base).
- Sin unidades alternativas (tazas, cucharadas) para los alimentos — todo en gramos, como el
  mockup original.
