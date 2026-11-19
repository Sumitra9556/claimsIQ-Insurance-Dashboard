interface DonutData {
  label: string;
  value: number;
  color: string;
}

export function DonutChart({ data }: { data: DonutData[] }) {
  const total = data.reduce((s, d) => s + d.value, 0) || 1;
  const radius = 60;
  const circumference = 2 * Math.PI * radius;

  let offset = 0;
  const arcs = data.map((d) => {
    const fraction = d.value / total;
    const arc = {
      ...d,
      dash: fraction * circumference,
      offset,
    };
    offset += fraction * circumference;
    return arc;
  });

  return (
    <div className="flex h-56 items-center justify-center gap-8">
      <svg viewBox="0 0 160 160" className="h-44 w-44 -rotate-90">
        <circle cx="80" cy="80" r={radius} fill="none" stroke="#e2e8f0" strokeWidth="22" />
        {arcs.map((a) =>
          a.value === 0 ? null : (
            <circle
              key={a.label}
              cx="80"
              cy="80"
              r={radius}
              fill="none"
              stroke={a.color}
              strokeWidth="22"
              strokeDasharray={`${a.dash} ${circumference - a.dash}`}
              strokeDashoffset={-a.offset}
              className="transition-all duration-500"
            />
          ),
        )}
      </svg>
      <ul className="space-y-2">
        {data.map((d) => (
          <li key={d.label} className="flex items-center gap-2 text-sm">
            <span className="h-2.5 w-2.5 rounded-full" style={{ background: d.color }} />
            <span className="text-slate-600">{d.label}</span>
            <span className="ml-auto font-semibold text-slate-800">{d.value}</span>
          </li>
        ))}
      </ul>
    </div>
  );
}
