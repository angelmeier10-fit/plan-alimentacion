export default function Pill({ children, accent }) {
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
