import { useEffect, useState } from 'react';
import { ArrowLeft, BadgeDollarSign, Check, FileText, X } from 'lucide-react';
import { api, formatMoney } from '../api';
import { STAGES, type Claim, type Stage } from '../types';
import { formatDate, priorityColors, stageColors } from '../utils';
import { AiChatPanel } from '../components/AiChatPanel';

interface ClaimDetailPageProps {
  claimId: string;
  role: 'adjuster' | 'admin';
  onBack: () => void;
}

export function ClaimDetailPage({ claimId, role, onBack }: ClaimDetailPageProps) {
  const [claim, setClaim] = useState<Claim | null>(null);
  const [error, setError] = useState<string | null>(null);
  const [acting, setActing] = useState<string | null>(null);

  useEffect(() => {
    let cancelled = false;
    api
      .getClaim(claimId)
      .then((c) => {
        if (!cancelled) setClaim(c);
      })
      .catch((e) => {
        if (!cancelled) setError(e instanceof Error ? e.message : 'Failed to load claim.');
      });
    return () => {
      cancelled = true;
    };
  }, [claimId]);

  async function transition(next: Stage) {
    if (!claim) return;
    setActing(next);
    try {
      const updated = await api.advanceStage(claim.id, next);
      setClaim(updated);
    } catch (e) {
      setError(e instanceof Error ? e.message : 'Could not update the claim.');
    } finally {
      setActing(null);
    }
  }

  if (error && !claim) {
    return <div className="rounded-xl bg-red-50 p-6 text-sm text-red-700">{error}</div>;
  }

  if (!claim) {
    return <div className="h-96 animate-pulse rounded-xl bg-slate-200/70" />;
  }

  const stageIdx = STAGES.indexOf(claim.stage);
  const nextStage = stageIdx < STAGES.length - 1 ? STAGES[stageIdx + 1] : null;
  const isAdmin = role === 'admin';
  const canDecide = claim.stage === 'Under Review';
  const canPay = claim.stage === 'Approved/Rejected';

  return (
    <div className="space-y-6">
      <button
        onClick={onBack}
        className="flex items-center gap-1.5 text-sm font-medium text-slate-500 transition-colors hover:text-blue-700"
      >
        <ArrowLeft className="h-4 w-4" />
        Back to claims board
      </button>

      <div className="rounded-xl border border-slate-200 bg-white p-6 shadow-sm">
        <div className="flex flex-col gap-4 lg:flex-row lg:items-start lg:justify-between">
          <div>
            <div className="flex flex-wrap items-center gap-3">
              <h1 className="text-2xl font-bold tracking-tight text-slate-900">{claim.claimNumber}</h1>
              <span className={`rounded-full border px-3 py-1 text-xs font-semibold ${stageColors[claim.stage]}`}>{claim.stage}</span>
              <span className={`rounded-full px-2.5 py-1 text-xs font-medium capitalize ${priorityColors[claim.priority]}`}>
                {claim.priority} priority
              </span>
            </div>
            <p className="mt-2 text-sm text-slate-600">
              {claim.policyholder} · {claim.type} claim · Filed {formatDate(claim.filedDate)}
              {claim.closedDate && ` · Closed ${formatDate(claim.closedDate)}`}
            </p>
            <p className="mt-3 max-w-2xl text-sm leading-relaxed text-slate-500">{claim.description}</p>
          </div>
          <div className="flex shrink-0 flex-col items-start gap-3 lg:items-end">
            <div className="text-right">
              <p className="text-xs uppercase tracking-wide text-slate-400">Claim amount</p>
              <p className="text-2xl font-bold text-slate-900">{formatMoney(claim.amount)}</p>
            </div>
            {isAdmin && (
              <div className="flex flex-wrap gap-2">
                {canDecide && (
                  <>
                    <button
                      onClick={() => transition('Approved/Rejected')}
                      disabled={acting !== null}
                      className="flex items-center gap-1.5 rounded-lg bg-emerald-600 px-4 py-2 text-sm font-semibold text-white transition-colors hover:bg-emerald-700 disabled:opacity-60"
                    >
                      <Check className="h-4 w-4" />
                      Approve
                    </button>
                    <button
                      onClick={() => transition('Approved/Rejected')}
                      disabled={acting !== null}
                      className="flex items-center gap-1.5 rounded-lg bg-red-600 px-4 py-2 text-sm font-semibold text-white transition-colors hover:bg-red-700 disabled:opacity-60"
                    >
                      <X className="h-4 w-4" />
                      Reject
                    </button>
                  </>
                )}
                {canPay && (
                  <button
                    onClick={() => transition('Paid')}
                    disabled={acting !== null}
                    className="flex items-center gap-1.5 rounded-lg bg-blue-600 px-4 py-2 text-sm font-semibold text-white transition-colors hover:bg-blue-700 disabled:opacity-60"
                  >
                    <BadgeDollarSign className="h-4 w-4" />
                    {acting === 'Paid' ? 'Marking…' : 'Mark as Paid'}
                  </button>
                )}
                {!canDecide && !canPay && (
                  <p className="rounded-lg bg-slate-100 px-3 py-2 text-xs text-slate-500">
                    {claim.stage === 'Paid' ? 'Claim is closed and paid.' : 'Decision actions unlock at Under Review.'}
                  </p>
                )}
              </div>
            )}
          </div>
        </div>

        <div className="mt-8">
          <StageTimeline stage={claim.stage} />
        </div>
      </div>

      <div className="grid gap-6 lg:grid-cols-[1fr_400px]">
        <div className="rounded-xl border border-slate-200 bg-white p-5 shadow-sm">
          <h2 className="mb-4 text-sm font-semibold uppercase tracking-wide text-slate-500">Documents</h2>
          <ul className="divide-y divide-slate-100">
            {claim.documents.map((doc) => (
              <li key={doc.id} className="flex items-center gap-3 py-3 first:pt-0 last:pb-0">
                <div className="flex h-10 w-10 shrink-0 items-center justify-center rounded-lg bg-blue-50">
                  <FileText className="h-5 w-5 text-blue-700" />
                </div>
                <div className="min-w-0 flex-1">
                  <p className="truncate text-sm font-medium text-slate-900">{doc.name}</p>
                  <p className="text-xs text-slate-500">
                    {doc.type} · {doc.pages} pages · {doc.size} · Uploaded {formatDate(doc.uploadedAt)}
                  </p>
                </div>
                <span className="hidden shrink-0 rounded-full bg-slate-100 px-2.5 py-1 text-xs text-slate-600 sm:inline">p. 1–{doc.pages}</span>
              </li>
            ))}
          </ul>
        </div>

        <AiChatPanel claim={claim} onRecommendedStage={(s) => setError(null)} />
      </div>
    </div>
  );
}

function StageTimeline({ stage }: { stage: Stage }) {
  const current = STAGES.indexOf(stage);
  return (
    <ol className="flex flex-col gap-0 sm:flex-row sm:items-start">
      {STAGES.map((s, i) => {
        const done = i < current;
        const active = i === current;
        return (
          <li key={s} className="flex flex-1 gap-3 sm:flex-col sm:gap-0">
            <div className="flex flex-col items-center sm:flex-row sm:w-full">
              <div
                className={`flex h-7 w-7 shrink-0 items-center justify-center rounded-full border-2 text-xs font-semibold transition-colors ${
                  done
                    ? 'border-blue-600 bg-blue-600 text-white'
                    : active
                      ? 'border-blue-600 bg-white text-blue-700'
                      : 'border-slate-300 bg-white text-slate-400'
                }`}
              >
                {done ? <Check className="h-4 w-4" /> : i + 1}
              </div>
              {i < STAGES.length - 1 && (
                <div className={`my-1 w-0.5 flex-1 sm:my-0 sm:mx-1 sm:h-0.5 sm:w-full ${done ? 'bg-blue-600' : 'bg-slate-300'}`} />
              )}
            </div>
            <span
              className={`pb-4 text-xs font-medium sm:pb-0 sm:pt-2 sm:text-center sm:w-full ${
                active ? 'text-blue-700' : done ? 'text-slate-600' : 'text-slate-400'
              }`}
            >
              {s}
            </span>
          </li>
        );
      })}
    </ol>
  );
}
