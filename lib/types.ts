export interface DeviceRecord {
  mac: string;
  hostname: string;
  remark: string;
  ip: string;
  conn_type: string;
  first_seen: string;
  last_seen: string;
  risk_score: number;
  is_known: boolean;
}

export interface AlertRecord {
  id: number;
  timestamp: string;
  severity: "info" | "warning" | "critical";
  alert_type: string;
  device_mac: string | null;
  description: string;
  metadata: Record<string, unknown>;
  resolved: boolean;
  resolved_at: string | null;
}

export interface NetworkStatsRow {
  timestamp: string;
  device_count: number;
  total_up: number;
  total_down: number;
  wifi_rate: number;
  wan_status: string;
}

export interface ModelInfo {
  id: number;
  version: number;
  trained_at: string;
  sample_count: number;
  n_features: number;
  contamination: number;
  threshold: number;
  metrics: Record<string, unknown>;
  active: boolean;
}

export interface DashboardSummary {
  device_count: number;
  total_up: number;
  total_down: number;
  wifi_rate: number;
  wan_status: string;
  wan_ip: string;
  alert_count: number;
  critical_count: number;
  active_model: ModelInfo | null;
  recent_traffic: NetworkStatsRow[];
  recent_alerts: AlertRecord[];
  buffered_samples: number;
}

export interface DeviceTraffic {
  mac: string;
  hostname: string;
  points: { timestamp: string; up_speed: number; down_speed: number }[];
}

export interface HealthResponse {
  status: string;
  uptime_seconds: number;
  model_ready: boolean;
  model_version: number;
  startup_complete: boolean;
  buffered_samples: number;
}

export interface LatencyPoint {
  timestamp: string;
  target: string;
  latency_ms: number;
  packet_loss: number;
  is_up: boolean;
}

export interface SignalPoint {
  timestamp: string;
  wifi_rate: number;
  device_count: number;
  total_down: number;
}

export interface HourlyForecast {
  hour: number;
  avg_download: number;
  std_download: number;
  avg_upload: number;
  avg_signal: number;
  congestion_risk: "low" | "medium" | "high" | "unknown";
}

export interface SlowPrediction {
  predicted_hour: number;
  expected_download: number;
  risk_level: string;
  message: string;
}

export interface BestDownloadWindow {
  recommended_hour: number;
  expected_download: number;
  message: string;
}

export interface PredictionsResponse {
  hourly_forecast: HourlyForecast[];
  slow_prediction: SlowPrediction | null;
  best_download_window: BestDownloadWindow | null;
  data_points: number;
}

export interface TrainingStatus {
  is_training: boolean;
  buffered_samples: number;
  last_train_duration: number;
  last_train_completed: string | null;
  samples_needed: number;
}

export interface ScoreHistogram {
  counts: number[];
  edges: number[];
  bin_count: number;
}

export interface FeatureImportance {
  [feature: string]: number;
}

export interface FeatureStats {
  [feature: string]: {
    mean: number;
    std: number;
    min: number;
    max: number;
  };
}

export interface Percentiles {
  p5: number;
  p25: number;
  p50: number;
  p75: number;
  p95: number;
}

export interface TrainingMetrics {
  version: number;
  trained_at: string;
  sample_count: number;
  feature_count: number;
  contamination: number;
  threshold: number;
  active: boolean;
  metrics: {
    d_anomaly_count: number;
    n_anomaly_count: number;
    d_anomaly_rate: number;
    n_anomaly_rate: number;
    d_score_mean: number;
    d_score_std: number;
    d_score_min: number;
    d_score_max: number;
    n_score_mean: number;
    n_score_std: number;
    n_score_min: number;
    n_score_max: number;
    d_percentiles: Percentiles;
    n_percentiles: Percentiles;
    d_feature_importance: FeatureImportance;
    n_feature_importance: FeatureImportance;
    d_feature_stats: FeatureStats;
    n_feature_stats: FeatureStats;
    d_score_histogram: ScoreHistogram;
    n_score_histogram: ScoreHistogram;
    training_duration_seconds: number;
    n_estimators: number;
  };
}

export type ActivityType = "idle" | "gaming" | "streaming" | "downloading" | "video_call" | "browsing";

export interface QoSStatus {
  trained: boolean;
  pending_samples: number;
  training_min: number;
  device_count: number;
  activity_summary: Record<string, number>;
  auto_apply: boolean;
}

export interface QoSDeviceState {
  mac: string;
  activity: ActivityType;
  confidence: number;
  priority: number;
  user_override: boolean;
  recommended_up: number;
  recommended_down: number;
}

export interface QoSDashboard {
  status: QoSStatus;
  devices: QoSDeviceState[];
  active_rules: Record<string, { priority?: number; activity_label?: string }>;
}

export interface ActivityLogEntry {
  timestamp: string;
  device_mac: string;
  activity: ActivityType;
  confidence: number;
  count: number;
}
