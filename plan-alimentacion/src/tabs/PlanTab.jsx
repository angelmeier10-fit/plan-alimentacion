import Card from "../components/Card.jsx";
import { MEAL_ICON } from "../iconMap.js";

export default function PlanTab({ days, dayIdx, setDayIdx, accent, accentSoft }) {
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
