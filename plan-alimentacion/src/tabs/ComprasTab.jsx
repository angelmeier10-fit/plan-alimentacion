import Card from "../components/Card.jsx";
import SectionTitle from "../components/SectionTitle.jsx";
import { getIcon } from "../iconMap.js";

export default function ComprasTab({ data, accent }) {
  return (
    <div style={{ display: "flex", flexDirection: "column", gap: 14 }}>
      <SectionTitle sub="Cantidades combinadas para Ángel + Gabriela">Lista de compras</SectionTitle>
      {data.map((s) => {
        const Icon = getIcon(s.icon);
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
