export { formatMoney } from './api';

export function formatDate(iso: string): string {
  return new Date(iso + 'T00:00:00Z').toLocaleDateString('en-US', {
    month: 'short',
    day: 'numeric',
    year: 'numeric',
    timeZone: 'UTC',
  });
}

export const stageColors: Record<string, string> = {
  Submitted: 'bg-slate-100 text-slate-700 border-slate-200',
  Validated: 'bg-sky-50 text-sky-700 border-sky-200',
  Extracted: 'bg-blue-50 text-blue-700 border-blue-200',
  'Under Review': 'bg-amber-50 text-amber-700 border-amber-200',
  'Approved/Rejected': 'bg-teal-50 text-teal-700 border-teal-200',
  Paid: 'bg-emerald-50 text-emerald-700 border-emerald-200',
};

export const stageDotColors: Record<string, string> = {
  Submitted: 'bg-slate-400',
  Validated: 'bg-sky-400',
  Extracted: 'bg-blue-500',
  'Under Review': 'bg-amber-400',
  'Approved/Rejected': 'bg-teal-500',
  Paid: 'bg-emerald-500',
};

export const typeColors: Record<string, string> = {
  Auto: '#1d4ed8',
  Home: '#0ea5e9',
  Health: '#14b8a6',
  Life: '#0f766e',
  Commercial: '#1e3a5f',
};

export const priorityColors: Record<string, string> = {
  low: 'bg-slate-100 text-slate-600',
  medium: 'bg-amber-100 text-amber-700',
  high: 'bg-red-100 text-red-700',
};
