export default function Card({ children, style }) {
  return (
    <div
      style={{
        background: "#FFFFFF",
        borderRadius: 18,
        padding: "18px 18px",
        boxShadow: "0 1px 2px rgba(28,27,25,0.04), 0 8px 24px -12px rgba(28,27,25,0.10)",
        border: "1px solid #ECE8DF",
        ...style,
      }}
    >
      {children}
    </div>
  );
}
