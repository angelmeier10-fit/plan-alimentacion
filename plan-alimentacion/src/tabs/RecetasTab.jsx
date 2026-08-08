import Card from "../components/Card.jsx";
import SectionTitle from "../components/SectionTitle.jsx";
import Pill from "../components/Pill.jsx";

export default function RecetasTab({ data, accent, person }) {
  return (
    <div style={{ display: "flex", flexDirection: "column", gap: 14 }}>
      <SectionTitle sub="Ideas para variar el menú">Recetas</SectionTitle>
      {data.map((recipe) => (
        <Card key={recipe.title}>
          <div style={{ display: "flex", alignItems: "center", justifyContent: "space-between", marginBottom: 10 }}>
            <div style={{ fontFamily: "'Fraunces', serif", fontSize: 17, fontWeight: 600 }}>
              {recipe.title}
            </div>
            <Pill accent={accent}>{recipe.tag}</Pill>
          </div>
          <div style={{ fontSize: 13, fontWeight: 600, color: "#6B6459", marginBottom: 4 }}>
            Ingredientes
          </div>
          <ul style={{ margin: "0 0 12px", paddingLeft: 18, fontSize: 14, lineHeight: 1.5 }}>
            {recipe.ingredients.map((ing) => (
              <li key={ing.item}>{ing[person]}</li>
            ))}
          </ul>
          <div style={{ fontSize: 13, fontWeight: 600, color: "#6B6459", marginBottom: 4 }}>
            Preparación
          </div>
          <ol style={{ margin: 0, paddingLeft: 18, fontSize: 14, lineHeight: 1.5 }}>
            {recipe.steps.map((step) => (
              <li key={step}>{step}</li>
            ))}
          </ol>
        </Card>
      ))}
    </div>
  );
}
