export default function SectionTitle({ children, sub }) {
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
