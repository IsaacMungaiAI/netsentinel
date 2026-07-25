import type {
  DashboardSummary,
  DeviceRecord,
  DeviceTraffic,
  AlertRecord,
  HealthResponse,
  ModelInfo,
  LatencyPoint,
  SignalPoint,
  PredictionsResponse,
} from "./types";

const API_BASE = process.env.NEXT_PUBLIC_API_URL || "http://localhost:8000";

async function apiFetch<T>(path: string, init?: RequestInit): Promise<T> {
  const res = await fetch(`${API_BASE}${path}`, {
    ...init,
    headers: { "Content-Type": "application/json", ...init?.headers },
  });
  if (!res.ok) throw new Error(`API ${res.status}: ${res.statusText}`);
  return res.json();
}

export const api = {
  health: () => apiFetch<HealthResponse>("/api/health"),
  dashboard: () => apiFetch<DashboardSummary>("/api/dashboard"),
  devices: () => apiFetch<DeviceRecord[]>("/api/devices"),
  deviceTraffic: (mac: string, hours = 1) =>
    apiFetch<DeviceTraffic>(`/api/devices/${encodeURIComponent(mac)}/traffic?hours=${hours}`),
  blockDevice: (mac: string) =>
    apiFetch<{ ok: boolean; message: string }>(`/api/devices/${encodeURIComponent(mac)}/block`, { method: "POST" }),
  unblockDevice: (mac: string) =>
    apiFetch<{ ok: boolean; message: string }>(`/api/devices/${encodeURIComponent(mac)}/unblock`, { method: "POST" }),
  setBandwidth: (mac: string, up_limit: number, down_limit: number) =>
    apiFetch<{ ok: boolean; message: string }>(`/api/devices/${encodeURIComponent(mac)}/bandwidth`, {
      method: "POST",
      body: JSON.stringify({ up_limit, down_limit }),
    }),
  alerts: (params?: { severity?: string; resolved?: boolean; limit?: number }) => {
    const q = new URLSearchParams();
    if (params?.severity) q.set("severity", params.severity);
    if (params?.resolved !== undefined) q.set("resolved", String(params.resolved));
    if (params?.limit) q.set("limit", String(params.limit));
    const qs = q.toString();
    return apiFetch<AlertRecord[]>(`/api/alerts${qs ? `?${qs}` : ""}`);
  },
  resolveAlert: (id: number) =>
    apiFetch<{ ok: boolean }>(`/api/alerts/${id}/resolve`, { method: "POST" }),
  traffic: (hours = 1) =>
    apiFetch<{ timestamp: string; device_count: number; total_up: number; total_down: number; wifi_rate: number }[]>(
      `/api/traffic?hours=${hours}`
    ),
  latency: (hours = 1) =>
    apiFetch<LatencyPoint[]>(`/api/latency?hours=${hours}`),
  signal: (hours = 1) =>
    apiFetch<SignalPoint[]>(`/api/signal?hours=${hours}`),
  predictions: () =>
    apiFetch<PredictionsResponse>("/api/predictions"),
  models: () => apiFetch<ModelInfo[]>("/api/models"),
  retrain: () => apiFetch<{ ok: boolean; version?: number; samples?: number; message?: string }>("/api/models/retrain", { method: "POST" }),
};
