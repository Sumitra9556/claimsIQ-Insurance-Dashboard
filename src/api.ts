import { claims } from './mockData';
import {
  CLAIM_TYPES,
  STAGES,
  type ChatMessage,
  type ChatSource,
  type Claim,
  type DashboardData,
  type Kpis,
  type MonthCount,
  type Role,
  type Stage,
  type StageCount,
  type TypeCount,
} from './types';

const MONTH_LABELS = ['Jun', 'Jul', 'Aug', 'Sep', 'Oct', 'Nov'];
const AI_LATENCY_MS = 700;

function countByStage(): StageCount[] {
  return STAGES.map((stage) => ({
    stage,
    count: claims.filter((c) => c.stage === stage).length,
  }));
}

function countByType(): TypeCount[] {
  return CLAIM_TYPES.map((type) => ({
    type,
    count: claims.filter((c) => c.type === type).length,
  }));
}

function countByMonth(): MonthCount[] {
  return MONTH_LABELS.map((month, i) => {
    const start = new Date('2026-11-19T00:00:00Z');
    start.setUTCMonth(start.getUTCMonth() - (5 - i));
    const y = start.getUTCFullYear();
    const m = start.getUTCMonth();
    const count = claims.filter((c) => {
      const d = new Date(c.filedDate + 'T00:00:00Z');
      return d.getUTCFullYear() === y && d.getUTCMonth() === m;
    }).length;
    return { month, count };
  });
}

export const api = {
  async login(email: string, password: string): Promise<{ role: Role; name: string }> {
    await delay(500);
    if (!email.trim() || !password) {
      throw new Error('Please enter your email and password.');
    }
    return { role: email.includes('admin') ? 'admin' : 'adjuster', name: 'Alex Morgan' };
  },

  async getDashboard(): Promise<DashboardData> {
    await delay(300);
    const kpis: Kpis = {
      totalClaims: claims.length,
      pendingReview: claims.filter((c) => c.stage !== 'Paid').length,
      approvedAmount: claims
        .filter((c) => c.stage === 'Approved/Rejected' || c.stage === 'Paid')
        .reduce((sum, c) => sum + c.amount, 0),
      avgDaysToClose: 24,
    };
    return { kpis, byStage: countByStage(), byType: countByType(), byMonth: countByMonth() };
  },

  async getClaims(): Promise<Claim[]> {
    await delay(300);
    return claims.map((c) => ({ ...c }));
  },

  async getClaim(id: string): Promise<Claim> {
    await delay(250);
    const claim = claims.find((c) => c.id === id);
    if (!claim) throw new Error(`Claim ${id} not found.`);
    return { ...claim, documents: claim.documents.map((d) => ({ ...d })) };
  },

  async advanceStage(id: string, next: Stage): Promise<Claim> {
    await delay(350);
    const claim = claims.find((c) => c.id === id);
    if (!claim) throw new Error(`Claim ${id} not found.`);
    claim.stage = next;
    if (next === 'Paid') claim.closedDate = new Date().toISOString().slice(0, 10);
    return { ...claim, documents: claim.documents.map((d) => ({ ...d })) };
  },

  async markPaid(id: string): Promise<Claim> {
    return this.advanceStage(id, 'Paid');
  },

  async getAiSummary(id: string): Promise<string> {
    await delay(AI_LATENCY_MS);
    const claim = claims.find((c) => c.id === id);
    if (!claim) throw new Error(`Claim ${id} not found.`);
    return claim.aiSummary;
  },

  async askAi(id: string, question: string, history: ChatMessage[]): Promise<ChatMessage> {
    await delay(AI_LATENCY_MS);
    const claim = claims.find((c) => c.id === id);
    if (!claim) throw new Error(`Claim ${id} not found.`);
    void history;
    const { answer, sources } = answerFor(claim, question);
    return { id: `msg-${Date.now()}`, role: 'assistant', content: answer, sources };
  },

  async recommendNextStage(id: string): Promise<{ answer: string; nextStage: Stage; sources: ChatSource[] }> {
    await delay(AI_LATENCY_MS);
    const claim = claims.find((c) => c.id === id);
    if (!claim) throw new Error(`Claim ${id} not found.`);
    const idx = STAGES.indexOf(claim.stage);
    const next = STAGES[Math.min(idx + 1, STAGES.length - 1)];
    return {
      answer: `Based on the documentation on file, claim ${claim.claimNumber} is ready to move from "${claim.stage}" to "${next}". ${
        claim.stage === 'Under Review'
          ? 'Coverage and estimates are consistent with the file; a decision can be recorded.'
          : 'All required checks at the current stage are complete.'
      }`,
      nextStage: next,
      sources: [
        {
          file: claim.documents[0]?.name ?? 'Claim File',
          page: 1,
          snippet: `${claim.type} claim filed ${formatDate(claim.filedDate)} for ${formatMoney(claim.amount)}.`,
        },
      ],
    };
  },
};

function delay(ms: number): Promise<void> {
  return new Promise((resolve) => setTimeout(resolve, ms));
}

function formatDate(iso: string): string {
  return new Date(iso + 'T00:00:00Z').toLocaleDateString('en-US', {
    month: 'short',
    day: 'numeric',
    year: 'numeric',
    timeZone: 'UTC',
  });
}

export function formatMoney(amount: number): string {
  return amount.toLocaleString('en-US', { style: 'currency', currency: 'USD', maximumFractionDigits: 0 });
}

function answerFor(claim: Claim, question: string): { answer: string; sources: ChatSource[] } {
  const q = question.toLowerCase();
  if (q.includes('amount') || q.includes('value') || q.includes('cost') || q.includes('how much')) {
    return {
      answer: `The claimed amount is ${formatMoney(claim.amount)}. ${
        claim.type === 'Home'
          ? 'The contractor bid is within 6% of the regional median, so no adjustment is expected.'
          : 'The estimate on file is consistent with similar claims in this category.'
      }`,
      sources: [sourceFor(claim, 'Contractor Bid', 2, 'Total repair cost estimate within policy limits.')],
    };
  }
  if (q.includes('cover') || q.includes('policy') || q.includes('peril')) {
    return {
      answer: `The reported event is a covered peril under the policy in force. Premiums are current and the loss date falls within the effective period for ${claim.claimNumber}.`,
      sources: [sourceFor(claim, 'Policy Contract', 4, 'Section 3.2 — covered perils; loss within effective period.')],
    };
  }
  if (q.includes('stage') || q.includes('next') || q.includes('status') || q.includes('progress')) {
    const idx = STAGES.indexOf(claim.stage);
    const next = STAGES[Math.min(idx + 1, STAGES.length - 1)];
    return {
      answer: `${claim.claimNumber} is currently at "${claim.stage}". Based on the documentation on file, the recommended next stage is "${next}".`,
      sources: [sourceFor(claim, 'Claim File', 1, `Current stage: ${claim.stage}. All stage prerequisites met.`)],
    };
  }
  return {
    answer: `I reviewed the file for ${claim.claimNumber} (${claim.policyholder}, ${claim.type}). ${claim.aiSummary}`,
    sources: claim.documents.slice(0, 2).map((d, i) => sourceFor(claim, d.name, i + 1, 'Key findings extracted from document analysis.')),
  };
}

function sourceFor(claim: Claim, file: string, page: number, snippet: string): ChatSource {
  return { file, page, snippet };
}
