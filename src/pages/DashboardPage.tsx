import { useEffect, useState } from 'react';
import { CalendarClock, CheckCircle2, DollarSign, FolderOpen } from 'lucide-react';
import { api, formatMoney } from '../api';
import { typeColors } from '../utils';
import type { DashboardData } from '../types';
import { BarChart } from '../components/BarChart';
import { DonutChart } from '../components/DonutChart';
import { LineChart } from '../components/LineChart';

export function DashboardPage() {
  const [data, setData] = useState<DashboardData | null>(null);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    let cancelled = false;
    api
      .getDashboard()
      .then((d) => {
        if (!cancelled) setData(d);
      })
      .catch((e) => {
        if (!cancelled) setError(e instanceof Error ? e.message : 'Failed to load dashboard.');
      });
    return () => {
      cancelled = true;
    };
  }, []);

  if (error) {
    return <div className="rounded-xl bg-red-50 p-6 text-sm text-red-700">{error}</div>;
  }

  if (!data) {
    return (
      <div className="grid gap-4 sm:grid-cols-2 xl:grid-cols-4">
        {[0, 1, 2, 3].map((i) => (
          <div key={i} className="h-28 animate-pulse rounded-xl bg-slate-200/70" />
        ))}
      </div>
    );
  }

  const { kpis, byStage, byType, byMonth } = data;

  return (
    <div className="space-y-6">
      <div className="grid gap-4 sm:grid-cols-2 xl:grid-cols-4">
        <KpiCard icon={<FolderOpen className="h-5 w-5" />} label="Total Claims" value={String(kpis.totalClaims)} tint="bg-blue-600" />
        <KpiCard icon={<CalendarClock className="h-5 w-5" />} label="Pending Review" value={String(kpis.pendingReview)} tint="bg-amber-500" />
        <KpiCard icon={<DollarSign className="h-5 w-5" />} label="Approved Amount" value={formatMoney(kpis.approvedAmount)} tint="bg-teal-600" />
        <KpiCard icon={<CheckCircle2 className="h-5 w-5" />} label="Avg Days to Close" value={String(kpis.avgDaysToClose)} tint="bg-[#0b1f3a]" />
      </div>

      <div className="grid gap-6 lg:grid-cols-2">
        <Panel title="Claims per Stage">
          <BarChart data={byStage.map((s) => ({ label: shortStage(s.stage), value: s.count }))} />
        </Panel>
        <Panel title="Claims by Type">
          <DonutChart data={byType.map((t) => ({ label: t.type, value: t.count, color: typeColors[t.type] }))} />
        </Panel>
      </div>

      <Panel title="Claims per Month">
        <LineChart data={byMonth.map((m) => ({ label: m.month, value: m.count }))} />
      </Panel>
    </div>
  );
}

function shortStage(stage: string): string {
  if (stage === 'Approved/Rejected') return 'Approved';
  if (stage === 'Under Review') return 'Review';
  return stage;
}

function KpiCard({ icon, label, value, tint }: { icon: React.ReactNode; label: string; value: string; tint: string }) {
  return (
    <div className="flex items-center gap-4 rounded-xl border border-slate-200 bg-white p-5 shadow-sm transition-shadow hover:shadow-md">
      <div className={`flex h-11 w-11 shrink-0 items-center justify-center rounded-lg text-white ${tint}`}>{icon}</div>
      <div className="min-w-0">
        <p className="truncate text-sm text-slate-500">{label}</p>
        <p className="truncate text-xl font-bold text-slate-900">{value}</p>
      </div>
    </div>
  );
}

function Panel({ title, children }: { title: string; children: React.ReactNode }) {
  return (
    <div className="rounded-xl border border-slate-200 bg-white p-5 shadow-sm">
      <h2 className="mb-4 text-sm font-semibold uppercase tracking-wide text-slate-500">{title}</h2>
      {children}
    </div>
  );
}
