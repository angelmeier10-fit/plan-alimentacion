import React, { useState } from "react";
import {
  Sunrise, Soup, Coffee, Moon, Carrot, Flame, Dumbbell,
  ShoppingBasket, Sparkles, ChevronRight, Beef, Fish, Egg,
  Droplet, Candy, Info, ArrowLeftRight, Leaf
} from "lucide-react";

/* ---------------------------------------------------------
   DATA
--------------------------------------------------------- */

const PROFILES = {
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

const DAYS = {
  angel: [
    {
      d: "Día 1",
      meals: [
        { m: "Desayuno", t: "3 huevos revueltos + 2 rodajas de pan integral tostado + 1 banana mediana." },
        { m: "Almuerzo", t: "200g de pechuga de pollo + 80g de arroz integral + ensalada verde grande + 1 cda de aceite de oliva." },
        { m: "Merienda", t: "200g de yogur casero + 40g de avena en hojuelas + 30g de nueces." },
        { m: "Cena", t: "180g de bife de carne vacuna magra + 200g de papa al horno + 150g de brócoli al vapor." },
      ],
    },
    {
      d: "Día 2",
      meals: [
        { m: "Desayuno", t: "200g de yogur casero + 40g de avena + 1 banana + 30g de nueces (todo en un bol)." },
        { m: "Almuerzo", t: "180g de bife magro + 80g de arroz blanco + 150g de calabaza al horno + 1 cda de aceite de oliva." },
        { m: "Merienda", t: "3 huevos duros + 2 rodajas de pan integral + 1 manzana verde." },
        { m: "Cena", t: "200g de pechuga de pollo + 200g de batata al horno + ensalada grande de hojas verdes y tomate." },
      ],
    },
    {
      d: "Día 3",
      meals: [
        { m: "Desayuno", t: "Tortilla dulce: 3 claras + 1 huevo entero + 40g de avena + banana pisada, a la sartén." },
        { m: "Almuerzo", t: "220g de merluza o pescado blanco + 80g de arroz integral + chauchas o brócoli + 1 cda de aceite de oliva." },
        { m: "Merienda", t: "200g de yogur casero + 2 tostadas integrales + 30g de palta pisada." },
        { m: "Cena", t: "200g de pollo picado + 80g de fideos integrales + salsa de tomate natural + ensalada grande." },
      ],
    },
    {
      d: "Día 4",
      meals: [
        { m: "Desayuno", t: "3 huevos en tortilla + 2 rodajas de pan integral + 1 manzana." },
        { m: "Almuerzo", t: "200g de pollo + 250g de papa hervida + ensalada de zanahoria y lechuga + 1 cda de aceite de oliva." },
        { m: "Merienda", t: "200g de yogur casero + 40g de avena + 30g de almendras." },
        { m: "Cena", t: "180g de bife magro + 80g de arroz blanco + zucchini y morrón a la plancha." },
      ],
    },
    {
      d: "Día 5",
      meals: [
        { m: "Desayuno", t: "Licuado: 200g de yogur + 40g de avena + banana + hielo. Acompañar con 2 huevos duros." },
        { m: "Almuerzo", t: "180g de bife magro + 80g de arroz integral + ensalada grande + 1 cda de aceite de oliva." },
        { m: "Merienda", t: "2 rodajas de pan integral + 60g de queso port salut light + 30g de nueces." },
        { m: "Cena", t: "200g de pollo + 200g de batata al horno + espinacas salteadas (spray vegetal)." },
      ],
    },
    {
      d: "Día 6",
      meals: [
        { m: "Desayuno", t: "3 huevos revueltos + 2 rodajas de pan integral tostado + 1 banana." },
        { m: "Almuerzo", t: "220g de pescado (merluza/atún al natural) + 80g de arroz blanco + ensalada mixta grande + 1 cda de aceite de oliva." },
        { m: "Merienda", t: "200g de yogur casero + 40g de avena + 30g de almendras." },
        { m: "Cena", t: "Hamburguesas caseras: 180g de carne magra a la plancha (sin pan) + 200g de papa al horno + ensalada." },
      ],
    },
  ],
  gabriela: [
    {
      d: "Día 1",
      meals: [
        { m: "Desayuno", t: "2 huevos revueltos + 1 rodaja de pan integral tostado + 1 banana chica." },
        { m: "Almuerzo", t: "150g de pechuga de pollo + 60g de arroz integral + ensalada verde grande + 1 cdita de aceite de oliva." },
        { m: "Merienda", t: "150g de yogur casero + 25g de avena + 20g de almendras." },
        { m: "Cena", t: "130g de bife magro + 150g de papa al horno + 100g de brócoli al vapor." },
      ],
    },
    {
      d: "Día 2",
      meals: [
        { m: "Desayuno", t: "150g de yogur casero + 25g de avena + 1 banana chica + 20g de nueces." },
        { m: "Almuerzo", t: "130g de bife magro + 60g de arroz blanco + 120g de calabaza al horno + 1 cdita de aceite de oliva." },
        { m: "Merienda", t: "2 huevos duros + 1 rodaja de pan integral + 1 manzana chica." },
        { m: "Cena", t: "150g de pechuga de pollo + 150g de batata al horno + ensalada grande." },
      ],
    },
    {
      d: "Día 3",
      meals: [
        { m: "Desayuno", t: "Tortilla dulce: 2 claras + 1 huevo + 25g de avena + banana chica pisada." },
        { m: "Almuerzo", t: "170g de merluza o pescado blanco + 60g de arroz integral + chauchas o brócoli + 1 cdita de aceite de oliva." },
        { m: "Merienda", t: "150g de yogur casero + 1 tostada integral + 20g de palta pisada." },
        { m: "Cena", t: "150g de pollo picado + 60g de fideos integrales + salsa de tomate natural + ensalada grande." },
      ],
    },
    {
      d: "Día 4",
      meals: [
        { m: "Desayuno", t: "2 huevos en tortilla + 1 rodaja de pan integral + 1 manzana chica." },
        { m: "Almuerzo", t: "150g de pollo + 180g de papa hervida + ensalada de zanahoria y lechuga + 1 cdita de aceite de oliva." },
        { m: "Merienda", t: "150g de yogur casero + 25g de avena + 20g de almendras." },
        { m: "Cena", t: "130g de bife magro + 60g de arroz blanco + zucchini y morrón a la plancha." },
      ],
    },
    {
      d: "Día 5",
      meals: [
        { m: "Desayuno", t: "Licuado: 150g de yogur + 25g de avena + banana chica. Acompañar con 1 huevo duro." },
        { m: "Almuerzo", t: "130g de bife magro + 60g de arroz integral + ensalada grande + 1 cdita de aceite de oliva." },
        { m: "Merienda", t: "1 rodaja de pan integral + 40g de queso port salut light + 20g de nueces." },
        { m: "Cena", t: "150g de pollo + 150g de batata al horno + espinacas salteadas." },
      ],
    },
    {
      d: "Día 6",
      meals: [
        { m: "Desayuno", t: "2 huevos revueltos + 1 rodaja de pan integral tostado + 1 banana chica." },
        { m: "Almuerzo", t: "170g de pescado (merluza/atún al natural) + 60g de arroz blanco + ensalada mixta grande + 1 cdita de aceite de oliva." },
        { m: "Merienda", t: "150g de yogur casero + 25g de avena + 20g de almendras." },
        { m: "Cena", t: "Hamburguesa casera: 130g de carne magra (sin pan) + 150g de papa al horno + ensalada abundante." },
      ],
    },
  ],
};

const MEAL_ICON = { Desayuno: Sunrise, Almuerzo: Soup, Merienda: Coffee, Cena: Moon };

const SNACKS = {
  libre: [
    "Pepino, apio o zanahoria en bastones",
    "Tomates cherry",
    "Rúcula o lechuga con limón y vinagre",
    "Gelatina light",
    "Mate, té o café sin azúcar",
    "Agua con gas + limón",
  ],
  proteina: [
    "1 huevo duro extra",
    "100-150g de yogur casero, solo",
    "1-2 claras de huevo cocidas",
  ],
  ansiedad: [
    "Chicle sin azúcar",
    "Infusión caliente (el ritual ayuda más que la comida)",
    "Tomar agua primero y esperar 10-15 min",
  ],
  horno: [
    "Zucchini o berenjena en rodajas finas, air fryer 12-15 min a 180°C",
    "Chips de batata (rodajas finas), 15-18 min a 190°C — suma carbohidrato, contarlo",
    "Garbanzos crocantes con especias, 15-18 min a 200°C — suma carbohidrato",
    "Coliflor o brócoli al horno con aceite y especias, 20 min a 200°C",
    "Huevos duros en air fryer: 15-16 min a 130°C, sin agua",
  ],
};

const INTERCHANGEABLE = {
  angel: {
    desayuno: [
      "3 huevos revueltos + 2 rodajas de pan integral + 1 banana",
      "200g de yogur casero + 40g de avena + 1 banana + 30g de nueces/almendras",
      "Tortilla dulce: 3 claras + 1 huevo + 40g de avena + banana pisada",
      "Licuado: 200g de yogur + 40g de avena + banana + 2 huevos duros aparte",
      "2 tostadas de pan lactal integral + queso untable Tregar light (1 cdita, ≈15g c/u) + 2 huevos revueltos + 1 fruta",
    ],
    almuerzo: {
      proteina: "200g de pollo / 180g de bife magro / 220g de pescado",
      carbo: "80g de arroz (blanco o integral) / 200-250g de papa hervida o al horno",
      verdura: "ensalada grande o brócoli/chauchas/calabaza al vapor",
    },
    merienda: [
      "200g de yogur casero + 40g de avena + 30g de nueces/almendras",
      "3 huevos duros + 2 rodajas de pan integral + 1 fruta",
      "2 tostadas integrales + 30g de palta pisada + 200g de yogur aparte",
      "2 rodajas de pan integral + 60g de queso port salut light + 30g de nueces",
      "200g de yogur casero + 70g de granola sin azúcar (revisar etiqueta; si no lleva frutos secos, sumar media cdita de aceite extra en el almuerzo)",
    ],
    cena: {
      proteina: "180g de bife magro / 200g de pollo / hamburguesa casera 180g",
      carbo: "200g de papa o batata al horno / 80g de arroz o fideos integrales",
      verdura: "brócoli, zucchini, morrón, espinaca salteada — porción generosa",
    },
  },
  gabriela: {
    desayuno: [
      "2 huevos revueltos + 1 rodaja de pan integral + 1 banana chica",
      "150g de yogur casero + 25g de avena + 1 banana chica + 20g de nueces/almendras",
      "Tortilla dulce: 2 claras + 1 huevo + 25g de avena + banana chica pisada",
      "Licuado: 150g de yogur + 25g de avena + banana chica + 1 huevo duro aparte",
      "1 tostada integral + queso untable Tregar light (1 cdita, ≈15g) + 2 huevos revueltos + 1 fruta chica",
      "2 huevos enteros + 2 claras extra + 1 tostada integral + 1 fruta chica (más saciedad, volumen con claras)",
    ],
    almuerzo: {
      proteina: "150g de pollo / 130g de bife magro / 170g de pescado",
      carbo: "60g de arroz (blanco o integral) / 150-180g de papa hervida o al horno",
      verdura: "ensalada grande o brócoli/chauchas/calabaza al vapor",
    },
    merienda: [
      "150g de yogur casero + 25g de avena + 20g de nueces/almendras",
      "2 huevos duros + 1 rodaja de pan integral + 1 fruta chica",
      "1 tostada integral + 20g de palta pisada + 150g de yogur aparte",
      "1 rodaja de pan integral + 40g de queso port salut light + 20g de nueces",
      "150g de yogur casero + 45g de granola sin azúcar (mismo criterio que Ángel para compensar grasa)",
    ],
    cena: {
      proteina: "130g de bife magro / 150g de pollo / hamburguesa casera 130g",
      carbo: "150g de papa o batata al horno / 60g de arroz o fideos integrales",
      verdura: "brócoli, zucchini, morrón, espinaca salteada — porción generosa",
    },
  },
};

const EQUIVALENCES = [
  { label: "Carbohidratos (≈30g crudo)", items: "30g arroz = 30g fideos = 80g papa = 60g batata = 1/2 banana = 15g avena" },
  { label: "Proteína (≈50g)", items: "50g pollo = 50g bife magro = 60g pescado = 1 huevo + 1 clara = 100g yogur" },
  { label: "Grasa (≈1 cdita)", items: "1 cdita aceite = 10g almendras/nueces = 15g palta = 15g queso port salut" },
];

const VARIETY = [
  { cat: "Proteína animal", icon: Beef, items: "Pavo, conejo · Cerdo (bondiola sin grasa, lomo), ternera premium · Salmón, atún fresco" },
  { cat: "Carbohidratos", icon: Leaf, items: "Quinoa, cuscús, fideos de legumbre · Choclo, legumbres (lentejas, garbanzos)" },
  { cat: "Verduras", icon: Carrot, items: "Coliflor, repollo, berenjena, hongos/champiñones" },
  { cat: "Grasas", icon: Droplet, items: "Semillas (chía, lino, girasol), manteca de maní natural" },
];

const SHOPPING = [
  {
    cat: "Carnes y pescado",
    icon: Beef,
    items: [
      "2,15 kg de pechuga de pollo (1,4 kg Ángel + 750g Gabriela)",
      "1,37 kg de carne vacuna magra (720g Ángel + 650g Gabriela)",
      "780g de pescado blanco o atún al natural (440g Ángel + 340g Gabriela)",
      "Opcional: pavo, conejo, cerdo, salmón, atún fresco",
    ],
  },
  {
    cat: "Despensa",
    icon: ShoppingBasket,
    items: [
      "Huevos (aprox. 35-38 unidades entre los dos)",
      "Arroz integral y arroz blanco",
      "Avena en hojuelas",
      "Granola sin azúcar agregada",
      "Pan lactal integral",
      "Almendras y/o nueces (o mix de frutos secos naturales)",
      "Fideos integrales",
      "Salsa de tomate natural (sin azúcar)",
      "Queso port salut light",
      "Pasta de maní natural, miel, chocolate amargo 70%+, cacao amargo en polvo",
      "Opcional: quinoa, cuscús, fideos de legumbre, semillas",
    ],
  },
  { cat: "Yogurtera", icon: Droplet, items: ["Leche — aprox. 2L por semana para el yogur casero de los dos"] },
  {
    cat: "Verdulería",
    icon: Carrot,
    items: [
      "Bananas, manzanas",
      "Papas, batatas, calabaza",
      "Brócoli, espinaca, zucchini, morrón, chauchas",
      "Zanahoria, tomate, lechuga, rúcula",
      "Pepino, apio, tomates cherry",
      "Palta, limón",
      "Opcional: coliflor, repollo, berenjena, hongos, choclo, legumbres",
    ],
  },
  { cat: "Grasas y otros", icon: Sparkles, items: ["Aceite de oliva virgen extra", "Gelatina light", "Chicle sin azúcar"] },
];

/* ---------------------------------------------------------
   UI PRIMITIVES
--------------------------------------------------------- */

function Card({ children, style }) {
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

function SectionTitle({ children, sub }) {
  return (
    <div style={{ marginBottom: 14 }}>
      <h2
        style={{
          fontFamily: "'Fraunces', serif",
          fontSize: 22,
          fontWeight: 600,
          color: "#1C1B19",
          margin: 0,
          letterSpacing: "-0.01em",
        }}
      >
        {children}
      </h2>
      {sub && <p style={{ margin: "4px 0 0", fontSize: 13.5, color: "#8A8478", lineHeight: 1.5 }}>{sub}</p>}
    </div>
  );
}

function Pill({ children, accent }) {
  return (
    <span
      style={{
        display: "inline-flex",
        alignItems: "center",
        gap: 4,
        fontFamily: "'JetBrains Mono', monospace",
        fontSize: 11.5,
        fontWeight: 500,
        color: accent,
        background: "transparent",
        border: `1px solid ${accent}33`,
        borderRadius: 999,
        padding: "3px 9px",
      }}
    >
      {children}
    </span>
  );
}

/* ---------------------------------------------------------
   MAIN APP
--------------------------------------------------------- */

export default function App() {
  const [person, setPerson] = useState("angel");
  const [tab, setTab] = useState("plan");
  const [dayIdx, setDayIdx] = useState(0);
  const profile = PROFILES[person];
  const days = DAYS[person];
  const inter = INTERCHANGEABLE[person];

  const TABS = [
    { id: "plan", label: "Plan", icon: Sunrise },
    { id: "snacks", label: "Snacks", icon: Carrot },
    { id: "flex", label: "Flexible", icon: ArrowLeftRight },
    { id: "extra", label: "Extras", icon: Sparkles },
    { id: "compras", label: "Compras", icon: ShoppingBasket },
  ];

  return (
    <div
      style={{
        minHeight: "100vh",
        background: "#F7F4EC",
        fontFamily: "'Inter', -apple-system, sans-serif",
        color: "#1C1B19",
        display: "flex",
        justifyContent: "center",
      }}
    >
      <link
        rel="stylesheet"
        href="https://fonts.googleapis.com/css2?family=Fraunces:opsz,wght@9..144,500;9..144,600&family=Inter:wght@400;500;600;700&family=JetBrains+Mono:wght@500&display=swap"
      />
      <div style={{ width: "100%", maxWidth: 480, minHeight: "100vh", display: "flex", flexDirection: "column" }}>
        {/* HEADER */}
        <div
          style={{
            background: profile.accent,
            padding: "22px 20px 20px",
            borderBottomLeftRadius: 28,
            borderBottomRightRadius: 28,
            color: "#fff",
            position: "relative",
            overflow: "hidden",
          }}
        >
          <div style={{ display: "flex", alignItems: "center", justifyContent: "space-between", marginBottom: 18 }}>
            <div>
              <p style={{ margin: 0, fontSize: 11.5, opacity: 0.75, letterSpacing: "0.08em", textTransform: "uppercase" }}>
                Plan de alimentación
              </p>
              <h1 style={{ margin: "2px 0 0", fontFamily: "'Fraunces', serif", fontSize: 26, fontWeight: 600 }}>
                {profile.name}
              </h1>
              <p style={{ margin: "2px 0 0", fontSize: 12.5, opacity: 0.85 }}>{profile.role}</p>
            </div>

            {/* person switch */}
            <div
              style={{
                display: "flex",
                background: "rgba(255,255,255,0.16)",
                borderRadius: 999,
                padding: 3,
                gap: 2,
              }}
            >
              {Object.keys(PROFILES).map((key) => (
                <button
                  key={key}
                  onClick={() => { setPerson(key); setDayIdx(0); }}
                  style={{
                    width: 34,
                    height: 34,
                    borderRadius: "50%",
                    border: "none",
                    cursor: "pointer",
                    fontFamily: "'Fraunces', serif",
                    fontWeight: 600,
                    fontSize: 14,
                    background: person === key ? "#fff" : "transparent",
                    color: person === key ? PROFILES[key].accent : "#fff",
                    transition: "all 0.15s ease",
                  }}
                >
                  {PROFILES[key].initial}
                </button>
              ))}
            </div>
          </div>

          {/* macro strip */}
          <div style={{ display: "flex", gap: 8 }}>
            {[
              ["kcal", profile.macros.kcal, ""],
              ["prot", profile.macros.prot, "g"],
              ["grasa", profile.macros.fat, "g"],
              ["carb", profile.macros.carb, "g"],
            ].map(([label, val, unit]) => (
              <div
                key={label}
                style={{
                  flex: 1,
                  background: "rgba(255,255,255,0.14)",
                  borderRadius: 12,
                  padding: "8px 6px",
                  textAlign: "center",
                }}
              >
                <div style={{ fontFamily: "'JetBrains Mono', monospace", fontSize: 16, fontWeight: 500 }}>
                  {val}{unit}
                </div>
                <div style={{ fontSize: 10, opacity: 0.75, textTransform: "uppercase", letterSpacing: "0.05em" }}>
                  {label}
                </div>
              </div>
            ))}
          </div>
        </div>

        {/* CONTENT */}
        <div style={{ flex: 1, padding: "20px 16px 100px" }}>
          {tab === "plan" && (
            <PlanTab days={days} dayIdx={dayIdx} setDayIdx={setDayIdx} accent={profile.accent} accentSoft={profile.accentSoft} />
          )}
          {tab === "snacks" && <SnacksTab accent={profile.accent} />}
          {tab === "flex" && <FlexTab data={inter} accent={profile.accent} accentSoft={profile.accentSoft} person={person} />}
          {tab === "extra" && <ExtraTab accent={profile.accent} person={person} />}
          {tab === "compras" && <ComprasTab accent={profile.accent} />}
        </div>

        {/* BOTTOM NAV */}
        <div
          style={{
            position: "fixed",
            bottom: 0,
            width: "100%",
            maxWidth: 480,
            background: "#FFFFFF",
            borderTop: "1px solid #ECE8DF",
            display: "flex",
            padding: "8px 6px calc(8px + env(safe-area-inset-bottom))",
            boxShadow: "0 -4px 16px rgba(28,27,25,0.05)",
          }}
        >
          {TABS.map((t) => {
            const Icon = t.icon;
            const active = tab === t.id;
            return (
              <button
                key={t.id}
                onClick={() => setTab(t.id)}
                style={{
                  flex: 1,
                  display: "flex",
                  flexDirection: "column",
                  alignItems: "center",
                  gap: 3,
                  padding: "6px 2px",
                  border: "none",
                  background: "none",
                  cursor: "pointer",
                  color: active ? profile.accent : "#B3AC9C",
                }}
              >
                <Icon size={19} strokeWidth={active ? 2.4 : 2} />
                <span style={{ fontSize: 10.5, fontWeight: active ? 600 : 500 }}>{t.label}</span>
              </button>
            );
          })}
        </div>
      </div>
    </div>
  );
}

/* ---------------------------------------------------------
   TABS
--------------------------------------------------------- */

function PlanTab({ days, dayIdx, setDayIdx, accent, accentSoft }) {
  const day = days[dayIdx];
  return (
    <div>
      {/* day selector */}
      <div style={{ display: "flex", gap: 8, overflowX: "auto", paddingBottom: 4, marginBottom: 18 }}>
        {days.map((d, i) => (
          <button
            key={d.d}
            onClick={() => setDayIdx(i)}
            style={{
              flexShrink: 0,
              padding: "8px 16px",
              borderRadius: 999,
              border: i === dayIdx ? "none" : "1px solid #DFD9C9",
              background: i === dayIdx ? accent : "#fff",
              color: i === dayIdx ? "#fff" : "#6B6459",
              fontSize: 13,
              fontWeight: 600,
              cursor: "pointer",
              whiteSpace: "nowrap",
            }}
          >
            {d.d}
          </button>
        ))}
      </div>

      <div style={{ display: "flex", flexDirection: "column", gap: 12 }}>
        {day.meals.map((meal) => {
          const Icon = MEAL_ICON[meal.m];
          return (
            <Card key={meal.m}>
              <div style={{ display: "flex", alignItems: "flex-start", gap: 12 }}>
                <div
                  style={{
                    width: 36,
                    height: 36,
                    borderRadius: 10,
                    background: accentSoft,
                    display: "flex",
                    alignItems: "center",
                    justifyContent: "center",
                    flexShrink: 0,
                  }}
                >
                  <Icon size={18} color={accent} strokeWidth={2} />
                </div>
                <div>
                  <p style={{ margin: 0, fontSize: 11.5, fontWeight: 700, color: accent, textTransform: "uppercase", letterSpacing: "0.04em" }}>
                    {meal.m}
                  </p>
                  <p style={{ margin: "3px 0 0", fontSize: 14, lineHeight: 1.55, color: "#2B2823" }}>{meal.t}</p>
                </div>
              </div>
            </Card>
          );
        })}
      </div>
    </div>
  );
}

function SnacksTab({ accent }) {
  const groups = [
    { title: "Volumen libre", sub: "Casi sin impacto calórico", items: SNACKS.libre },
    { title: "Con algo de proteína", sub: "Si el hambre es real", items: SNACKS.proteina },
    { title: "Para la ansiedad", sub: "No hambre fisiológica", items: SNACKS.ansiedad },
    { title: "Al horno / air fryer", sub: "Para dejar listos", items: SNACKS.horno },
  ];
  return (
    <div style={{ display: "flex", flexDirection: "column", gap: 18 }}>
      <SectionTitle sub="Para usar entre comidas sin romper el plan.">Snacks</SectionTitle>
      {groups.map((g) => (
        <Card key={g.title}>
          <p style={{ margin: 0, fontSize: 15, fontWeight: 700 }}>{g.title}</p>
          <p style={{ margin: "2px 0 10px", fontSize: 12.5, color: "#8A8478" }}>{g.sub}</p>
          <ul style={{ margin: 0, padding: 0, listStyle: "none", display: "flex", flexDirection: "column", gap: 7 }}>
            {g.items.map((it) => (
              <li key={it} style={{ display: "flex", gap: 8, fontSize: 13.5, lineHeight: 1.5, color: "#2B2823" }}>
                <span style={{ color: accent, marginTop: 2 }}>•</span>
                <span>{it}</span>
              </li>
            ))}
          </ul>
        </Card>
      ))}
      <Card style={{ background: "#FBF3E7", border: "1px solid #F0DFC0" }}>
        <div style={{ display: "flex", gap: 8 }}>
          <Info size={16} color="#B8862F" style={{ flexShrink: 0, marginTop: 2 }} />
          <p style={{ margin: 0, fontSize: 13, color: "#6B4F17", lineHeight: 1.5 }}>
            Evitar como snack libre: frutos secos o fruta extra sin compensar — ya están contados en el plan.
          </p>
        </div>
      </Card>
    </div>
  );
}

function FlexTab({ data, accent, accentSoft, person }) {
  return (
    <div style={{ display: "flex", flexDirection: "column", gap: 18 }}>
      <SectionTitle sub="Bloques intercambiables para armar la comida según lo que tengas a mano.">
        Comidas intercambiables
      </SectionTitle>

      <Card>
        <p style={{ margin: "0 0 10px", fontSize: 15, fontWeight: 700 }}>Desayuno · elegí 1</p>
        <ul style={{ margin: 0, padding: 0, listStyle: "none", display: "flex", flexDirection: "column", gap: 7 }}>
          {data.desayuno.map((it) => (
            <li key={it} style={{ display: "flex", gap: 8, fontSize: 13.5, lineHeight: 1.5 }}>
              <span style={{ color: accent, marginTop: 2 }}>•</span>
              <span>{it}</span>
            </li>
          ))}
        </ul>
      </Card>

      <Card>
        <p style={{ margin: "0 0 10px", fontSize: 15, fontWeight: 700 }}>Almuerzo</p>
        <Block label="Proteína" text={data.almuerzo.proteina} accent={accent} />
        <Block label="Carbo" text={data.almuerzo.carbo} accent={accent} />
        <Block label="Verdura" text={data.almuerzo.verdura} accent={accent} last />
      </Card>

      <Card>
        <p style={{ margin: "0 0 10px", fontSize: 15, fontWeight: 700 }}>Merienda · elegí 1</p>
        <ul style={{ margin: 0, padding: 0, listStyle: "none", display: "flex", flexDirection: "column", gap: 7 }}>
          {data.merienda.map((it) => (
            <li key={it} style={{ display: "flex", gap: 8, fontSize: 13.5, lineHeight: 1.5 }}>
              <span style={{ color: accent, marginTop: 2 }}>•</span>
              <span>{it}</span>
            </li>
          ))}
        </ul>
      </Card>

      <Card>
        <p style={{ margin: "0 0 10px", fontSize: 15, fontWeight: 700 }}>Cena</p>
        <Block label="Proteína" text={data.cena.proteina} accent={accent} />
        <Block label="Carbo" text={data.cena.carbo} accent={accent} />
        <Block label="Verdura" text={data.cena.verdura} accent={accent} last />
      </Card>

      <SectionTitle sub="Movés cantidad de una comida a otra sin cambiar el total del día.">
        Equivalencias
      </SectionTitle>
      {EQUIVALENCES.map((e) => (
        <Card key={e.label}>
          <Pill accent={accent}>{e.label}</Pill>
          <p style={{ margin: "8px 0 0", fontSize: 13.5, lineHeight: 1.6 }}>{e.items}</p>
        </Card>
      ))}
      <Card style={{ background: accentSoft, border: "none" }}>
        <p style={{ margin: 0, fontSize: 12.5, lineHeight: 1.55, color: "#4A453C" }}>
          Sacá una porción de la tabla de la comida donde hay menos hambre y sumala a la comida donde hay más —
          misma categoría (carbo por carbo, proteína por proteína). No mover más de 1-2 bloques por día.
        </p>
      </Card>

      <SectionTitle sub="Frutos secos como snack extra">Frutos secos extra</SectionTitle>
      <Card>
        <p style={{ margin: 0, fontSize: 13.5, lineHeight: 1.6 }}>
          10-15g como snack o sobre la ensalada, compensando: 10g de frutos secos ≈ 1 cdita de aceite —
          si sumás 15g, restá media cdita de aceite en el almuerzo o la cena de ese día.
        </p>
      </Card>

      <SectionTitle sub="Fuentes alternativas para rotar sin salir del plan">Más variedad</SectionTitle>
      {VARIETY.map((v) => {
        const Icon = v.icon;
        return (
          <Card key={v.cat}>
            <div style={{ display: "flex", gap: 10, alignItems: "flex-start" }}>
              <div style={{ width: 32, height: 32, borderRadius: 9, background: accentSoft, display: "flex", alignItems: "center", justifyContent: "center", flexShrink: 0 }}>
                <Icon size={16} color={accent} />
              </div>
              <div>
                <p style={{ margin: 0, fontSize: 13.5, fontWeight: 700 }}>{v.cat}</p>
                <p style={{ margin: "3px 0 0", fontSize: 13, lineHeight: 1.55, color: "#4A453C" }}>{v.items}</p>
              </div>
            </div>
          </Card>
        );
      })}
      <Card style={{ background: "#FBF3E7", border: "1px solid #F0DFC0" }}>
        <p style={{ margin: 0, fontSize: 12.5, color: "#6B4F17", lineHeight: 1.55 }}>
          "Nueces/almendras" se puede reemplazar por mix de frutos secos naturales en la misma cantidad —
          evitar mixes con sal en exceso o frutas deshidratadas.
        </p>
      </Card>
    </div>
  );
}

function Block({ label, text, accent, last }) {
  return (
    <div style={{ marginBottom: last ? 0 : 8 }}>
      <span style={{ fontSize: 11, fontWeight: 700, color: accent, textTransform: "uppercase", letterSpacing: "0.04em" }}>
        {label}
      </span>
      <p style={{ margin: "2px 0 0", fontSize: 13.5, lineHeight: 1.5 }}>{text}</p>
    </div>
  );
}

function ExtraTab({ accent, person }) {
  return (
    <div style={{ display: "flex", flexDirection: "column", gap: 18 }}>
      <SectionTitle>Fuentes de grasa</SectionTitle>
      <Card>
        <p style={{ margin: "0 0 8px", fontSize: 13.5, fontWeight: 700 }}>En el plan</p>
        <p style={{ margin: 0, fontSize: 13.5, lineHeight: 1.6, color: "#4A453C" }}>
          Huevos (yema), aceite de oliva, nueces/almendras, palta (Día 3), queso port salut light (Día 5),
          grasa natural de la carne.
        </p>
      </Card>
      <Card>
        <p style={{ margin: "0 0 6px", fontSize: 13.5, fontWeight: 700 }}>Queso untable Tregar light (real, según etiqueta)</p>
        <p style={{ margin: 0, fontSize: 13, lineHeight: 1.6, color: "#4A453C" }}>
          Por 30g (2 cdas): 50 kcal · 3,1g proteína · 3,9g grasa · 0,7g carbohidrato.
        </p>
        <p style={{ margin: "6px 0 0", fontSize: 13, lineHeight: 1.6, color: "#4A453C" }}>
          Para 1 cdita (≈15g), como en las tostadas: ~25 kcal, ~2g grasa, ~1,5g proteína, carbohidrato prácticamente nulo.
        </p>
      </Card>
      <Card>
        <p style={{ margin: "0 0 8px", fontSize: 13.5, fontWeight: 700 }}>Si sumás yemas extra, bajá de acá</p>
        <ul style={{ margin: 0, padding: 0, listStyle: "none", display: "flex", flexDirection: "column", gap: 6 }}>
          {[
            "Aceite: restá media cda ese día (~7g de grasa)",
            "Frutos secos: de 30g a 15-20g (~4-5g de grasa)",
            "Palta (Día 3): de 30g a 20g",
          ].map((it) => (
            <li key={it} style={{ display: "flex", gap: 8, fontSize: 13, lineHeight: 1.5 }}>
              <span style={{ color: accent }}>•</span>{it}
            </li>
          ))}
        </ul>
        <p style={{ margin: "10px 0 0", fontSize: 12, color: "#8A8478" }}>1 yema extra ≈ 5g de grasa.</p>
      </Card>

      <SectionTitle>Bebidas</SectionTitle>
      <Card>
        <p style={{ margin: "0 0 4px", fontSize: 13.5, fontWeight: 700 }}>Mate</p>
        <p style={{ margin: "0 0 12px", fontSize: 13, lineHeight: 1.55, color: "#4A453C" }}>
          Prácticamente sin impacto calórico. Tomalo cuando quieras.
        </p>
        <p style={{ margin: "0 0 4px", fontSize: 13.5, fontWeight: 700 }}>Café con leche</p>
        <p style={{ margin: 0, fontSize: 13, lineHeight: 1.55, color: "#4A453C" }}>
          1-2 veces al día sin azúcar: el margen del plan lo absorbe. 3+ veces o con azúcar: restá un poco
          de arroz/pan en la próxima comida.
        </p>
      </Card>
      <Card style={{ background: "#FBF3E7", border: "1px solid #F0DFC0" }}>
        <p style={{ margin: 0, fontSize: 12.5, color: "#6B4F17", lineHeight: 1.55 }}>
          Edulcorante: uso ocasional sin problema. La OMS desaconseja el uso habitual para bajar de peso;
          si se usa seguido, priorizar stevia por sobre aspartamo/sucralosa.
        </p>
      </Card>

      <SectionTitle>Si agregás un WOD suelto</SectionTitle>
      <Card>
        <p style={{ margin: "0 0 8px", fontSize: 13, lineHeight: 1.55, color: "#4A453C" }}>
          Parche para un WOD ocasional (no para sumarlo todos los días). Sumá 30-50g extra de carbohidrato:
        </p>
        <ul style={{ margin: 0, padding: 0, listStyle: "none", display: "flex", flexDirection: "column", gap: 6 }}>
          <li style={{ display: "flex", gap: 8, fontSize: 13 }}><span style={{ color: accent }}>•</span>Antes: 1 banana extra o 20g de avena</li>
          <li style={{ display: "flex", gap: 8, fontSize: 13 }}><span style={{ color: accent }}>•</span>Después: +30g de arroz o papa en la comida siguiente</li>
        </ul>
      </Card>

      <SectionTitle sub="Reemplaza una merienda completa, ideal 1-2 veces por semana">
        Antojo dulce: bocaditos
      </SectionTitle>
      <Card>
        <p style={{ margin: "0 0 8px", fontSize: 13.5, fontWeight: 700, color: accent }}>
          {person === "angel" ? "Versión Ángel" : "Versión Gabriela"}
        </p>
        <p style={{ margin: 0, fontSize: 13, lineHeight: 1.6, color: "#4A453C" }}>
          {person === "angel"
            ? "20g de pasta de maní natural + 15g de frutos secos picados + 1 cdita de miel (5g) + 15g de chocolate amargo 70%+ para la cobertura."
            : "12g de pasta de maní natural + 8g de frutos secos picados + 1 cdita de miel (5g) + 8g de chocolate amargo 70%+."}
        </p>
        <p style={{ margin: "10px 0 0", fontSize: 12, color: "#8A8478", lineHeight: 1.5 }}>
          Mezclar pasta de maní + frutos secos + miel, formar bocaditos, bañar con chocolate derretido y
          llevar al freezer 15-20 min.
        </p>
      </Card>

      <SectionTitle sub="Como postre puntual después de la cena, no reemplazo de comida">
        Postre nocturno
      </SectionTitle>
      <Card>
        <p style={{ margin: "0 0 10px", fontSize: 13, lineHeight: 1.55, color: "#4A453C" }}>
          Mini bocadito: 10g pasta de maní + 7g frutos secos + 1 cdita miel + 7g chocolate amargo.
          Compensar restando media cdita de aceite o 10g de frutos secos en otra comida del día.
        </p>
        <p style={{ margin: "0 0 8px", fontSize: 13.5, fontWeight: 700 }}>Opciones livianas + café</p>
        <ul style={{ margin: 0, padding: 0, listStyle: "none", display: "flex", flexDirection: "column", gap: 6 }}>
          {[
            "Yogur + 1 cdita de cacao amargo + edulcorante",
            "1-2 cuadraditos de chocolate amargo 70%+",
            "Gelatina light con canela",
            "Infusión de cacao amargo",
            "1 fruta asada con canela (contar dentro del cupo de carbo)",
          ].map((it) => (
            <li key={it} style={{ display: "flex", gap: 8, fontSize: 13, lineHeight: 1.5 }}>
              <span style={{ color: accent }}>•</span>{it}
            </li>
          ))}
        </ul>
      </Card>
    </div>
  );
}

function ComprasTab({ accent }) {
  return (
    <div style={{ display: "flex", flexDirection: "column", gap: 14 }}>
      <SectionTitle sub="Cantidades combinadas para Ángel + Gabriela">Lista de compras</SectionTitle>
      {SHOPPING.map((s) => {
        const Icon = s.icon;
        return (
          <Card key={s.cat}>
            <div style={{ display: "flex", alignItems: "center", gap: 8, marginBottom: 10 }}>
              <Icon size={17} color={accent} />
              <p style={{ margin: 0, fontSize: 14.5, fontWeight: 700 }}>{s.cat}</p>
            </div>
            <ul style={{ margin: 0, padding: 0, listStyle: "none", display: "flex", flexDirection: "column", gap: 6 }}>
              {s.items.map((it) => (
                <li key={it} style={{ display: "flex", gap: 8, fontSize: 13, lineHeight: 1.5, color: "#2B2823" }}>
                  <span style={{ color: accent, marginTop: 2 }}>•</span>
                  <span>{it}</span>
                </li>
              ))}
            </ul>
          </Card>
        );
      })}
    </div>
  );
}
