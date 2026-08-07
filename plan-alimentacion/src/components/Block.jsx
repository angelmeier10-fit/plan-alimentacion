export default function Block({ label, text, accent, last }) {
  return (
    <div style={{ marginBottom: last ? 0 : 8 }}>
      <span style={{ fontSize: 11, fontWeight: 700, color: accent, textTransform: "uppercase", letterSpacing: "0.04em" }}>
        {label}
      </span>
      <p style={{ margin: "2px 0 0", fontSize: 13.5, lineHeight: 1.5 }}>{text}</p>
    </div>
  );
}
