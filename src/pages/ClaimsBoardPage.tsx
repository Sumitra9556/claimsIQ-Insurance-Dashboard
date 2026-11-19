import { useEffect, useMemo, useState } from 'react';
import { ChevronRight, Search } from 'lucide-react';
import { api, formatMoney } from '../api';
import { STAGES, type Claim, type Stage } from '../types';
import { priorityColors, stageColors } from '../utils';

interface ClaimsBoardPageProps {
  onSelectClaim: (id: string) => void;
}

export function ClaimsBoardPage({ onSelectClaim }: ClaimsBoardPageProps) {
  const [claims, setClaims] = useState<Claim[]>([]);
  const [error, setError] = useState<string | null>(null);
  const [search, setSearch] = useState('');
  const [stageFilter, setStageFilter] = useState<'all' | Stage>('all');

  useEffect(() => {
    let cancelled = false;
    api
      .getClaims()
      .then((c) => {
        if (!cancelled) setClaims(c);
      })
      .catch((e) => {
        if (!cancelled) setError(e instanceof Error ? e.message : 'Failed to load claims.');
      });
    return () => {
      cancelled = true;
    };
  }, []);

  const filtered = useMemo(() => {
    const q = search.trim().toLowerCase();
    return claims.filter((c) => {
      if (stageFilter !== 'all' && c.stage !== stageFilter) return false;
      if (!q) return true;
      return (
        c.claimNumber.toLowerCase().includes(q) ||
        c.policyholder.toLowerCase().includes(q) ||
        c.type.toLowerCase().includes(q)
      );
    });
  }, [claims, search, stageFilter]);

  if (error) return <div className="rounded-xl bg-red-50 p-6 text-sm text-red-700">{error}</div>;

  return (
    <div className="space-y-4">
      <div className="flex flex-col gap-3 sm:flex-row sm:items-center">
        <div className="relative flex-1 sm:max-w-xs">
          <Search className="pointer-events-none absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-slate-400" />
          <input
            type="text"
            value={search}
            onChange={(e) => setSearch(e.target.value)}
            placeholder="Search claims, policyholders, types…"
            className="w-full rounded-lg border border-slate-300 bg-white py-2 pl-9 pr-3 text-sm outline-none transition-colors placeholder:text-slate-400 focus:border-blue-600 focus:ring-2 focus:ring-blue-600/20"
          />
        </div>
        <select
          value={stageFilter}
          onChange={(e) => setStageFilter(e.target.value as 'all' | Stage)}
          className="rounded-lg border border-slate-300 bg-white px-3 py-2 text-sm text-slate-700 outline-none transition-colors focus:border-blue-600 focus:ring-2 focus:ring-blue-600/20"
        >
          <option value="all">All stages</option>
          {STAGES.map((s) => (
            <option key={s} value={s}>
              {s}
            </option>
          ))}
        </select>
        <span className="text-sm text-slate-500 sm:ml-auto">
          {filtered.length} of {claims.length} claims
        </span>
      </div>

      {claims.length === 0 ? (
        <div className="grid gap-4 lg:grid-cols-3 xl:grid-cols-6">
          {[0, 1, 2, 3, 4, 5].map((i) => (
            <div key={i} className="h-64 animate-pulse rounded-xl bg-slate-200/70" />
          ))}
        </div>
      ) : (
        <div className="overflow-x-auto pb-2">
          <div className="grid min-w-[1100px] grid-cols-6 gap-4 lg:min-w-0">
            {STAGES.map((stage) => {
              const items = filtered.filter((c) => c.stage === stage);
              return (
                <div key={stage} className="flex min-h-0 flex-col rounded-xl bg-slate-100 p-2">
                  <div className="flex items-center justify-between px-2 py-2">
                    <h3 className="truncate text-xs font-semibold uppercase tracking-wide text-slate-600">{stage}</h3>
                    <span className="rounded-full bg-white px-2 py-0.5 text-xs font-semibold text-slate-600">{items.length}</span>
                  </div>
                  <div className="flex-1 space-y-2 overflow-y-auto">
                    {items.map((claim) => (
                      <button
                        key={claim.id}
                        onClick={() => onSelectClaim(claim.id)}
                        className="group w-full rounded-lg border border-slate-200 bg-white p-3 text-left shadow-sm transition-all hover:-translate-y-0.5 hover:border-blue-300 hover:shadow-md"
                      >
                        <div className="flex items-center justify-between gap-2">
                          <span className="text-xs font-semibold text-blue-700">{claim.claimNumber}</span>
                          <ChevronRight className="h-4 w-4 text-slate-300 transition-colors group-hover:text-blue-600" />
                        </div>
                        <p className="mt-1 truncate text-sm font-medium text-slate-900">{claim.policyholder}</p>
                        <p className="mt-0.5 text-sm font-semibold text-slate-700">{formatMoney(claim.amount)}</p>
                        <div className="mt-2 flex items-center gap-1.5">
                          <span className={`rounded-full px-2 py-0.5 text-[11px] font-medium capitalize ${priorityColors[claim.priority]}`}>
                            {claim.priority}
                          </span>
                          <span className="rounded-full bg-slate-100 px-2 py-0.5 text-[11px] text-slate-600">{claim.type}</span>
                        </div>
                      </button>
                    ))}
                    {items.length === 0 && (
                      <div className="rounded-lg border border-dashed border-slate-300 p-4 text-center text-xs text-slate-400">No claims</div>
                    )}
                  </div>
                </div>
              );
            })}
          </div>
        </div>
      )}
    </div>
  );
}
