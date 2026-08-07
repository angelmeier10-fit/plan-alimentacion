import Card from "../components/Card.jsx";
import Pill from "../components/Pill.jsx";
import SectionTitle from "../components/SectionTitle.jsx";
import Block from "../components/Block.jsx";
import { getIcon } from "../iconMap.js";

export default function FlexTab({ data, equivalences, variety, accent, accentSoft, person }) {
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
      {equivalences.map((e) => (
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
      {variety.map((v) => {
        const Icon = getIcon(v.icon);
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
