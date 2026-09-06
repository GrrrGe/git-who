import { buildParams } from './state';

export interface TableAuthor {
  name: string; email: string; commits: number; files: number;
  lines_added: number; lines_removed: number; first_edit: string; last_edit: string;
}
export interface TableResp { mode: string; authors: TableAuthor[]; }

export interface TreeNode {
  name: string; path: string; is_dir: boolean; in_work_tree: boolean;
  author: { name: string; email: string };
  metrics: { commits: number; files: number; lines_added: number; lines_removed: number; first_edit: string; last_edit: string };
  value: number; children?: TreeNode[];
}
export interface TreeResp { mode: string; root: TreeNode | null; }

export interface HistBucket {
  period: string; start: string;
  author: { name: string; email: string };
  metrics: { commits: number; files: number; lines_added: number; lines_removed: number };
  value: number; total: number;
}
export interface HistResp { mode: string; buckets: HistBucket[]; }

export interface ResolveResp { repo: string; remote: boolean; name: string; }

async function get<T>(endpoint: string, params: URLSearchParams): Promise<T> {
  const res = await fetch(`/api/${endpoint}?${params}`);
  const data = await res.json();
  if (!res.ok) throw new Error((data as { error?: string }).error || `HTTP ${res.status}`);
  return data as T;
}

export function fetchTable() { return get<TableResp>('table', buildParams()); }
export function fetchTree() { return get<TreeResp>('tree', buildParams()); }
export function fetchHist() { return get<HistResp>('hist', buildParams()); }

export function resolveRepo(input: string): Promise<ResolveResp> {
  const p = new URLSearchParams();
  p.set('repo', input);
  return get<ResolveResp>('resolve', p);
}
