export default function AnimatedBackground() {
  // Generate deterministic circuit lines
  const hLines = [12, 28, 45, 62, 78, 88];
  const vLines = [8, 22, 38, 55, 70, 85, 95];
  const dots = [
    { top: 12, left: 22 }, { top: 28, left: 55 }, { top: 45, left: 85 },
    { top: 62, left: 38 }, { top: 78, left: 70 }, { top: 88, left: 8 },
    { top: 35, left: 95 }, { top: 55, left: 22 }, { top: 72, left: 50 },
  ];

  return (
    <div className="circuit-bg" aria-hidden="true">
      {hLines.map((top, i) => (
        <div
          key={`h-${i}`}
          className="circuit-line"
          style={{
            top: `${top}%`,
            left: 0,
            width: "100%",
            animationDelay: `${i * 0.7}s`,
          }}
        />
      ))}
      {vLines.map((left, i) => (
        <div
          key={`v-${i}`}
          className="circuit-line-v"
          style={{
            left: `${left}%`,
            top: 0,
            height: "100%",
            animationDelay: `${i * 0.9}s`,
          }}
        />
      ))}
      {dots.map((pos, i) => (
        <div
          key={`d-${i}`}
          className="circuit-dot"
          style={{
            top: `${pos.top}%`,
            left: `${pos.left}%`,
            animationDelay: `${i * 0.5}s`,
          }}
        />
      ))}
    </div>
  );
}
