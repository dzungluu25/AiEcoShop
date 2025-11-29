import { randomUUID } from "crypto";

export type TransactionType = "purchase" | "refund" | "transfer";
export type TransactionStatus = "completed" | "pending" | "failed";

export interface Transaction {
  id: string;
  reference: string;
  ts: string;
  type: TransactionType;
  amount: number;
  currency: string;
  status: TransactionStatus;
}

const types: TransactionType[] = ["purchase", "refund", "transfer"];
const statuses: TransactionStatus[] = ["completed", "pending", "failed"];
const currencies = ["USD", "EUR", "VND"];

function generateSample(count: number): Transaction[] {
  const out: Transaction[] = [];
  const now = Date.now();
  for (let i = 0; i < count; i++) {
    const ts = new Date(now - Math.floor(Math.random() * 180) * 24 * 3600 * 1000 - Math.floor(Math.random() * 86400000));
    const type = types[i % types.length];
    const status = statuses[i % statuses.length];
    const currency = currencies[i % currencies.length];
    const amountBase = type === "refund" ? -(20 + (i % 50) * 3) : 20 + (i % 200) * 2.5;
    const jitter = (Math.random() - 0.5) * 10;
    const amount = Math.round((amountBase + jitter) * 100) / 100;
    out.push({
      id: `tx_${i + 1}`,
      reference: randomUUID(),
      ts: ts.toISOString(),
      type,
      amount,
      currency,
      status,
    });
  }
  return out.sort((a, b) => new Date(b.ts).getTime() - new Date(a.ts).getTime());
}

const store: Transaction[] = generateSample(600);

export interface QueryParams {
  page?: number;
  limit?: number;
  from?: string;
  to?: string;
  q?: string;
}

export function queryTransactions(params: QueryParams) {
  const page = Math.max(1, params.page || 1);
  const limit = Math.max(1, params.limit || 25);
  const fromTs = params.from ? new Date(params.from).getTime() : undefined;
  const toTs = params.to ? new Date(params.to).getTime() : undefined;
  const q = (params.q || "").trim().toLowerCase();

  const filtered = store.filter((t) => {
    const ts = new Date(t.ts).getTime();
    if (fromTs !== undefined && ts < fromTs) return false;
    if (toTs !== undefined && ts > toTs) return false;
    if (q) {
      const matchId = t.id.toLowerCase().includes(q) || t.reference.toLowerCase().includes(q);
      const matchAmt = String(t.amount).includes(q);
      if (!matchId && !matchAmt) return false;
    }
    return true;
  });

  const total = filtered.length;
  const pageCount = Math.max(1, Math.ceil(total / limit));
  const start = (page - 1) * limit;
  const items = filtered.slice(start, start + limit);
  return { items, page, total, pageCount };
}

export function toCSV(items: Transaction[]): string {
  const header = ["id", "reference", "datetime", "type", "amount", "currency", "status"].join(",");
  const lines = items.map((t) => {
    const dt = new Date(t.ts);
    const yyyy = dt.getFullYear();
    const mm = String(dt.getMonth() + 1).padStart(2, "0");
    const dd = String(dt.getDate()).padStart(2, "0");
    const hh = String(dt.getHours()).padStart(2, "0");
    const min = String(dt.getMinutes()).padStart(2, "0");
    const fmt = `${yyyy}-${mm}-${dd} ${hh}:${min}`;
    return [t.id, t.reference, fmt, t.type, t.amount.toFixed(2), t.currency, t.status].join(",");
  });
  return [header, ...lines].join("\n");
}
