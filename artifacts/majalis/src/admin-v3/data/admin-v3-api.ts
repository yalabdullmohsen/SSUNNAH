/**
 * Unified Admin v3 data access — JWT via adminFetch; typed envelopes.
 */
import { adminFetch } from "@/lib/admin-api";

export type AdminV3ListResponse<T> = {
  ok: boolean;
  data: T[];
  page?: number;
  pageSize?: number;
  total?: number;
  incomplete?: boolean;
  error?: string;
  userMessageAr?: string;
  correlationId?: string;
};

export type AdminV3MutationResponse = {
  ok: boolean;
  data?: { id?: string; updated_at?: string } | null;
  message?: string;
  error?: string;
  userMessageAr?: string;
  currentStatus?: string;
};

async function parseJson<T>(res: Response): Promise<T & { correlationId?: string }> {
  const correlationId =
    res.headers.get("x-correlation-id") || res.headers.get("x-request-id") || undefined;
  let body: T;
  try {
    body = (await res.json()) as T;
  } catch {
    throw Object.assign(new Error("invalid_json"), {
      status: res.status,
      userMessageAr: "استجابة غير صالحة من الخادم.",
      correlationId,
    });
  }
  if (!res.ok) {
    const err = body as { error?: string; userMessageAr?: string };
    throw Object.assign(new Error(err.error || `http_${res.status}`), {
      status: res.status,
      userMessageAr: err.userMessageAr || "تعذّر إكمال العملية.",
      correlationId,
      body,
    });
  }
  return { ...body, correlationId };
}

function qs(params: Record<string, string | number | undefined | null>): string {
  const sp = new URLSearchParams();
  for (const [k, v] of Object.entries(params)) {
    if (v == null || v === "") continue;
    sp.set(k, String(v));
  }
  const s = sp.toString();
  return s ? `?${s}` : "";
}

export async function v3List<T>(
  entity: string,
  params: Record<string, string | number | undefined | null> = {},
  signal?: AbortSignal,
): Promise<AdminV3ListResponse<T>> {
  const res = await adminFetch(`/api/admin/v3/${entity}${qs(params)}`, { method: "GET", signal });
  return parseJson(res);
}

export async function v3Get<T>(
  entity: string,
  params: Record<string, string | number | undefined | null> = {},
  signal?: AbortSignal,
): Promise<{ ok: boolean; data: T; incomplete?: boolean; correlationId?: string }> {
  const res = await adminFetch(`/api/admin/v3/${entity}${qs(params)}`, { method: "GET", signal });
  return parseJson(res);
}

export async function v3Mutate(
  entity: string,
  method: "POST" | "PUT" | "PATCH" | "DELETE",
  body?: Record<string, unknown>,
  query?: Record<string, string | number | undefined | null>,
): Promise<AdminV3MutationResponse> {
  const res = await adminFetch(`/api/admin/v3/${entity}${qs(query || {})}`, {
    method,
    body: body ? JSON.stringify(body) : undefined,
  });
  return parseJson(res);
}

export async function listSubmissions(
  params: Record<string, string | number | undefined | null> = {},
  signal?: AbortSignal,
): Promise<AdminV3ListResponse<Record<string, unknown>>> {
  const res = await adminFetch(`/api/admin/submissions${qs(params)}`, { method: "GET", signal });
  return parseJson(res);
}

export async function decideSubmission(input: {
  id: string;
  action: "approve" | "reject";
  reason?: string;
  expectedUpdatedAt?: string | null;
}): Promise<AdminV3MutationResponse> {
  const res = await adminFetch("/api/admin/submissions", {
    method: "POST",
    body: JSON.stringify(input),
  });
  return parseJson(res);
}

export const adminV3QueryKeys = {
  lessons: (p: object) => ["admin-v3", "lessons", p] as const,
  sheikhs: (p: object) => ["admin-v3", "sheikhs", p] as const,
  fawaid: (p: object) => ["admin-v3", "fawaid", p] as const,
  categories: () => ["admin-v3", "categories"] as const,
  users: (p: object) => ["admin-v3", "users", p] as const,
  submissions: (p: object) => ["admin-v3", "submissions", p] as const,
  audit: () => ["admin-v3", "audit"] as const,
  status: () => ["admin-v3", "status"] as const,
};
