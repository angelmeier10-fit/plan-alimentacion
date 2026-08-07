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
