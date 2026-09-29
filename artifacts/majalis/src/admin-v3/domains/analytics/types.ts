export type MetricCell = {
  status: "ok" | "no_data";
  value: number | null;
  label?: string | null;
  reason?: string | null;
  source?: string | null;
};

export type ChartSeries = {
  status: "ok" | "no_data";
  series: Array<Record<string, string | number>>;
  label?: string | null;
  reason?: string | null;
  source?: string | null;
};

export type AnalyticsSection = {
  status: "READY" | "PARTIAL" | "NO_DATA" | string;
  label?: string | null;
  reason?: string | null;
  metrics?: Record<string, MetricCell>;
  charts?: Record<string, ChartSeries>;
  [key: string]: unknown;
};

export type AnalyticsPlatformPayload = {
  ok: boolean;
  generatedAt?: string;
  days?: number;
  access?: { role?: string; unrestricted?: boolean };
  sections: Record<string, AnalyticsSection>;
  meta?: {
    platformStatus?: string;
    sources?: string[];
    noDataAreas?: string[];
    cache?: string;
    cacheTtlSec?: number;
    security?: Record<string, unknown>;
  };
};
