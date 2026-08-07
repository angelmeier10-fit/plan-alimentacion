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

const PERSON_KEYS = ["angel", "gabriela"];

const LOAD_ERROR_MESSAGE = "Hubo un problema cargando el plan. Probá recargar la página.";

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
  const [error, setError] = useState(null);

  useEffect(() => subscribeProfiles((key, data) => setProfiles((p) => ({ ...p, [key]: data })), () => setError(LOAD_ERROR_MESSAGE)), []);
  useEffect(() => subscribeDays("angel", (d) => setDays((s) => ({ ...s, angel: d })), () => setError(LOAD_ERROR_MESSAGE)), []);
  useEffect(() => subscribeDays("gabriela", (d) => setDays((s) => ({ ...s, gabriela: d })), () => setError(LOAD_ERROR_MESSAGE)), []);
  useEffect(() => subscribeSnacks(setSnacks, () => setError(LOAD_ERROR_MESSAGE)), []);
  useEffect(() => subscribeInterchangeable("angel", (d) => setInter((s) => ({ ...s, angel: d })), () => setError(LOAD_ERROR_MESSAGE)), []);
  useEffect(() => subscribeInterchangeable("gabriela", (d) => setInter((s) => ({ ...s, gabriela: d })), () => setError(LOAD_ERROR_MESSAGE)), []);
  useEffect(() => subscribeEquivalences(setEquivalences, () => setError(LOAD_ERROR_MESSAGE)), []);
  useEffect(() => subscribeVariety(setVariety, () => setError(LOAD_ERROR_MESSAGE)), []);
  useEffect(() => subscribeShopping(setShopping, () => setError(LOAD_ERROR_MESSAGE)), []);

  const profile = profiles[person];
  const personDays = days[person];

  if (error) {
    return (
      <div style={{ minHeight: "100vh", display: "flex", alignItems: "center", justifyContent: "center", background: "#F7F4EC", fontFamily: "'Inter', sans-serif", color: "#6B6459", textAlign: "center", padding: 24 }}>
        {error}
      </div>
    );
  }

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
              {PERSON_KEYS.filter((key) => profiles[key]).map((key) => (
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
                    color: person === key ? profiles[key].accent : "#fff",
                    transition: "all 0.15s ease",
                  }}
                >
                  {profiles[key].initial}
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
