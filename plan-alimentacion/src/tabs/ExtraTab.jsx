import Card from "../components/Card.jsx";
import SectionTitle from "../components/SectionTitle.jsx";

export default function ExtraTab({ accent, person }) {
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
