import { apiClient } from './api';

export interface TransactionItem {
  id: string;
  reference: string;
  ts: string;
  type: 'purchase' | 'refund' | 'transfer';
  amount: number;
  currency: string;
  status: 'completed' | 'pending' | 'failed';
}

export interface TransactionQuery {
  page?: number;
  limit?: number;
  from?: string;
  to?: string;
  q?: string;
}

export interface TransactionListResponse {
  items: TransactionItem[];
  page: number;
  total: number;
  pageCount: number;
}

function formatDisplayDate(ts: string): string {
  const d = new Date(ts);
  const yyyy = d.getFullYear();
  const mm = String(d.getMonth() + 1).padStart(2, '0');
  const dd = String(d.getDate()).padStart(2, '0');
  const hh = String(d.getHours()).padStart(2, '0');
  const min = String(d.getMinutes()).padStart(2, '0');
  return `${yyyy}-${mm}-${dd} ${hh}:${min}`;
}

function formatCurrency(amount: number, currency: string): string {
  try {
    return new Intl.NumberFormat(undefined, { style: 'currency', currency }).format(amount);
  } catch {
    const symbol = currency === 'USD' ? '$' : currency === 'EUR' ? '€' : currency === 'VND' ? '₫' : '';
    return `${symbol}${amount.toFixed(2)}`;
  }
}

export const transactionsService = {
  async list(params: TransactionQuery): Promise<TransactionListResponse> {
    const qp = new URLSearchParams();
    if (params.page) qp.append('page', String(params.page));
    if (params.limit) qp.append('limit', String(params.limit));
    if (params.from) qp.append('from', params.from);
    if (params.to) qp.append('to', params.to);
    if (params.q) qp.append('q', params.q);
    const endpoint = `/transactions${qp.toString() ? `?${qp.toString()}` : ''}`;
    return apiClient.get<TransactionListResponse>(endpoint);
  },
  async exportCSV(params: TransactionQuery): Promise<string> {
    const qp = new URLSearchParams();
    if (params.page) qp.append('page', String(params.page));
    if (params.limit) qp.append('limit', String(params.limit));
    if (params.from) qp.append('from', params.from);
    if (params.to) qp.append('to', params.to);
    if (params.q) qp.append('q', params.q);
    const endpoint = `/transactions/export${qp.toString() ? `?${qp.toString()}` : ''}`;
    const url = `${import.meta.env.VITE_API_BASE_URL || '/api'}${endpoint}`;
    const resp = await fetch(url);
    if (!resp.ok) throw new Error('Export failed');
    return await resp.text();
  },
  formatDisplayDate,
  formatCurrency,
};

