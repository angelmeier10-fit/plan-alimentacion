# Cantidades por persona en Recetas — Design Spec

## Alcance

Las 6 recetas ya existentes (`recipes/main` en Firestore, tab "Recetas") muestran una sola
cantidad genérica por ingrediente (ej. "200g de pechuga de pollo"). Se reemplaza por cantidades
separadas para Ángel y Gabriela, en la misma proporción que ya usa el plan de comidas (`DAYS`)
para porciones equivalentes. El tab de Recetas ya renderiza distinto color de acento según la
persona activa (switch A/G) — ahora también va a renderizar la cantidad correspondiente.

## Modelo de datos

Cada ingrediente pasa de `string` a un objeto:

```
Recipe = {
  title: string,
  tag: "Desayuno" | "Almuerzo" | "Merienda" | "Cena",
  ingredients: Ingredient[],
  steps: string[],   // sin cambios — la preparación es igual para los dos
}

Ingredient = {
  item: string,       // ej. "pechuga de pollo"
  angel: string,       // ej. "200g"
  gabriela: string,    // ej. "150g"
}
```

Para ingredientes sin cantidad medible (sal, pimienta, condimentos, canela), `angel` y
`gabriela` llevan el mismo valor (`"a gusto"`), igual que ya se hace en el texto libre actual.

`recipes/main: { list: Recipe[] }` mantiene la misma forma general — solo cambia la forma
interna de cada ingrediente.

## Cantidades por receta

Proporciones alineadas a las porciones ya existentes en `DAYS` para comidas equivalentes
(Ángel recibe más cantidad que Gabriela en los ítems que se miden, igual que hoy en el plan
diario; los condimentos/aromáticos quedan "a gusto" para ambos).

1. **Tortilla de claras con espinaca** (Desayuno)
   - Claras + huevo: Ángel "4 claras + 1 huevo entero" / Gabriela "3 claras + 1 huevo entero"
   - Espinaca fresca: Ángel "1 puñado grande" / Gabriela "1 puñado"
   - Sal, pimienta: "a gusto" / "a gusto"
   - Aceite de oliva: Ángel "1 cdita" / Gabriela "1 cdita"
   - Pan integral: Ángel "2 rodajas" / Gabriela "1 rodaja"

2. **Pollo al horno con batatas y ensalada** (Almuerzo)
   - Pechuga de pollo: Ángel "200g" / Gabriela "150g"
   - Batata: Ángel "1 batata mediana" / Gabriela "1 batata chica"
   - Ensalada verde: Ángel "grande" / Gabriela "grande"
   - Aceite de oliva: Ángel "1 cda" / Gabriela "1 cdita"
   - Orégano, sal, pimienta: "a gusto" / "a gusto"

3. **Yogur con avena y frutos secos** (Merienda)
   - Yogur casero: Ángel "200g" / Gabriela "150g"
   - Avena en hojuelas: Ángel "40g" / Gabriela "25g"
   - Nueces o almendras: Ángel "30g" / Gabriela "20g"
   - Canela: "a gusto" / "a gusto"

4. **Salmón con puré de calabaza y brócoli** (Cena)
   - Salmón: Ángel "180g" / Gabriela "130g"
   - Calabaza: Ángel "200g" / Gabriela "150g"
   - Brócoli: Ángel "150g" / Gabriela "100g"
   - Aceite de oliva: Ángel "1 cdita" / Gabriela "1 cdita"
   - Sal, pimienta, limón: "a gusto" / "a gusto"

5. **Bowl de arroz integral con atún y verduras** (Almuerzo)
   - Arroz integral cocido: Ángel "80g" / Gabriela "60g"
   - Atún al natural: Ángel "1 lata" / Gabriela "1 lata"
   - Verduras variadas (zanahoria, morrón, cebolla): Ángel "a gusto" / Gabriela "a gusto"
   - Aceite de oliva: Ángel "1 cda" / Gabriela "1 cdita"
   - Sal, limón: "a gusto" / "a gusto"

6. **Panqueques de avena y banana** (Desayuno)
   - Banana madura: Ángel "1 banana mediana" / Gabriela "1 banana chica"
   - Huevos: Ángel "2 huevos" / Gabriela "1 huevo + 1 clara"
   - Avena en hojuelas: Ángel "40g" / Gabriela "25g"
   - Canela: "a gusto" / "a gusto"
   - Aceite en spray: "a gusto" / "a gusto"

## UI

`RecetasTab` recibe una prop nueva `person` (`"angel"` | `"gabriela"`, mismo valor que ya
maneja el estado `person` de `App.jsx`). Cada línea de ingrediente se arma en el render como
`` `${ing[person]} de ${ing.item}` `` (ej. "200g de pechuga de pollo"), en vez de imprimir el
string del ingrediente tal cual. Formato de salida idéntico al actual — solo cambia de dónde
sale el texto.

`App.jsx`: al renderizar `RecetasTab`, agregar `person={person}` a las props ya existentes
(`data`, `accent`).

Al cambiar el switch A/G, la lista de ingredientes se recalcula sola porque `person` ya es
parte del estado que dispara el re-render — no hace falta ninguna suscripción ni estado nuevo.

## Fuera de alcance

- No se agregan más recetas ni se cambia `tag`/`steps`.
- No se toca el modelo de `DAYS`, `snacks`, ni ninguna otra colección.
- Sin cálculo automático de cantidades por macros — son valores fijos escritos a mano, igual
  que el resto de las porciones de la app.
