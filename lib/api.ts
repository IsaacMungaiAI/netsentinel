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
  TrainingStatus,
  TrainingMetrics,
  QoSDashboard,
  QoSStatus,
  QoSDeviceState,
  ActivityLogEntry,
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
  trainingStatus: () => apiFetch<TrainingStatus>("/api/training/status"),
  modelMetrics: (version: number) => apiFetch<TrainingMetrics>(`/api/models/${version}/metrics`),
  qosDashboard: () => apiFetch<QoSDashboard>("/api/qos/dashboard"),
  qosStatus: () => apiFetch<QoSStatus>("/api/qos/status"),
  qosDevices: () => apiFetch<QoSDeviceState[]>("/api/qos/devices"),
  qosActivity: (hours = 1) =>
    apiFetch<ActivityLogEntry[]>(`/api/qos/activity?hours=${hours}`),
  setDevicePriority: (mac: string, priority: number) =>
    apiFetch<{ ok: boolean }>(`/api/qos/devices/${encodeURIComponent(mac)}/priority`, {
      method: "POST",
      body: JSON.stringify({ priority }),
    }),
  setDeviceActivity: (mac: string, activity: string) =>
    apiFetch<{ ok: boolean }>(`/api/qos/devices/${encodeURIComponent(mac)}/activity`, {
      method: "POST",
      body: JSON.stringify({ activity }),
    }),
  clearDeviceRule: (mac: string) =>
    apiFetch<{ ok: boolean }>(`/api/qos/devices/${encodeURIComponent(mac)}/rule`, { method: "DELETE" }),
  setAutoApply: (enabled: boolean) =>
    apiFetch<{ ok: boolean; auto_apply: boolean }>(`/api/qos/auto-apply?enabled=${enabled}`, { method: "POST" }),
  trainQoS: () =>
    apiFetch<{ ok: boolean; pending_samples: number }>("/api/qos/train", { method: "POST" }),
};
