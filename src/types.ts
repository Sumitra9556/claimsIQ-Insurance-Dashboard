export type Role = 'adjuster' | 'admin';

export const STAGES = [
  'Submitted',
  'Validated',
  'Extracted',
  'Under Review',
  'Approved/Rejected',
  'Paid',
] as const;

export type Stage = (typeof STAGES)[number];

export const CLAIM_TYPES = ['Auto', 'Home', 'Health', 'Life', 'Commercial'] as const;
export type ClaimType = (typeof CLAIM_TYPES)[number];

export interface Document_ {
  id: string;
  name: string;
  type: string;
  size: string;
  pages: number;
  uploadedAt: string;
}

export interface ChatMessage {
  id: string;
  role: 'assistant' | 'user';
  content: string;
  sources?: ChatSource[];
}

export interface ChatSource {
  file: string;
  page: number;
  snippet: string;
}

export interface Claim {
  id: string;
  claimNumber: string;
  policyholder: string;
  type: ClaimType;
  stage: Stage;
  amount: number;
  priority: 'low' | 'medium' | 'high';
  filedDate: string;
  closedDate: string | null;
  description: string;
  adjuster: string;
  documents: Document_[];
  aiSummary: string;
}

export interface Kpis {
  totalClaims: number;
  pendingReview: number;
  approvedAmount: number;
  avgDaysToClose: number;
}

export interface StageCount {
  stage: Stage;
  count: number;
}

export interface TypeCount {
  type: ClaimType;
  count: number;
}

export interface MonthCount {
  month: string;
  count: number;
}

export interface DashboardData {
  kpis: Kpis;
  byStage: StageCount[];
  byType: TypeCount[];
  byMonth: MonthCount[];
}
