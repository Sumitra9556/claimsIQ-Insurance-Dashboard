interface BarData {
  label: string;
  value: number;
}

export function BarChart({ data }: { data: BarData[] }) {
  const max = Math.max(...data.map((d) => d.value), 1);
  return (
    <div className="flex h-56 items-end gap-3">
      {data.map((d) => (
        <div key={d.label} className="flex flex-1 flex-col items-center gap-2">
          <span className="text-xs font-semibold text-slate-600">{d.value}</span>
          <div
            className="w-full max-w-12 rounded-t-md bg-blue-600 transition-all duration-300 hover:bg-blue-500"
            style={{ height: `${Math.max((d.value / max) * 100, 4)}%` }}
          />
          <span className="text-[11px] text-slate-500">{d.label}</span>
        </div>
      ))}
    </div>
  );
}
