interface LinePoint {
  label: string;
  value: number;
}

export function LineChart({ data }: { data: LinePoint[] }) {
  const width = 560;
  const height = 220;
  const padX = 40;
  const padY = 20;
  const max = Math.max(...data.map((d) => d.value), 1);

  const points = data.map((d, i) => ({
    x: padX + (i / (data.length - 1)) * (width - padX * 2),
    y: height - padY - (d.value / max) * (height - padY * 2),
    ...d,
  }));

  const path = points.map((p, i) => `${i === 0 ? 'M' : 'L'}${p.x},${p.y}`).join(' ');
  const area = `${path} L${points[points.length - 1].x},${height - padY} L${points[0].x},${height - padY} Z`;

  return (
    <div className="h-56">
      <svg viewBox={`0 0 ${width} ${height}`} className="h-full w-full">
        <defs>
          <linearGradient id="lineFill" x1="0" y1="0" x2="0" y2="1">
            <stop offset="0%" stopColor="#2563eb" stopOpacity="0.18" />
            <stop offset="100%" stopColor="#2563eb" stopOpacity="0" />
          </linearGradient>
        </defs>
        {[0, 0.5, 1].map((f) => (
          <line
            key={f}
            x1={padX}
            x2={width - padX}
            y1={padY + f * (height - padY * 2)}
            y2={padY + f * (height - padY * 2)}
            stroke="#e2e8f0"
            strokeDasharray="4 4"
          />
        ))}
        <path d={area} fill="url(#lineFill)" />
        <path d={path} fill="none" stroke="#2563eb" strokeWidth="2.5" strokeLinejoin="round" />
        {points.map((p) => (
          <g key={p.label}>
            <circle cx={p.x} cy={p.y} r="4.5" fill="#fff" stroke="#2563eb" strokeWidth="2.5" />
            <text x={p.x} y={p.y - 10} textAnchor="middle" fontSize="11" fontWeight="600" fill="#334155">
              {p.value}
            </text>
            <text x={p.x} y={height - 4} textAnchor="middle" fontSize="11" fill="#64748b">
              {p.label}
            </text>
          </g>
        ))}
      </svg>
    </div>
  );
}
