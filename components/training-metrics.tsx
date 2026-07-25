"use client"

import {
  Card,
  CardContent,
  CardHeader,
  CardTitle,
} from "@/components/ui/card"
import { Badge } from "@/components/ui/badge"
import {
  BarChart3,
  BrainCircuit,
  TrendingUp,
} from "lucide-react"
import type { TrainingMetrics } from "@/lib/types"

export function TrainingMetricsDashboard({ data }: { data: TrainingMetrics }) {
  const m = data.metrics

  return (
    <div className="space-y-6">
      <div className="flex items-center gap-3">
        <h2 className="text-lg font-bold tracking-tight">
          <span className="bg-gradient-to-r from-violet-400 to-purple-300 bg-clip-text text-transparent">
            Model v{data.version} Training Metrics
          </span>
        </h2>
        {data.active && (
          <Badge className="bg-emerald-500/10 text-emerald-400 border-emerald-500/20 text-[10px]">
            Active
          </Badge>
        )}
      </div>

      <div className="grid grid-cols-2 sm:grid-cols-4 gap-3">
        <MetricCard label="Samples" value={data.sample_count} />
        <MetricCard label="Features" value={data.feature_count} />
        <MetricCard label="Threshold" value={m.d_score_mean.toFixed(4)} mono />
        <MetricCard label="Training Time" value={`${m.training_duration_seconds.toFixed(2)}s`} mono />
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        <ScoreSection
          title="Device Anomaly Scores"
          prefix="d"
          mean={m.d_score_mean}
          std={m.d_score_std}
          min={m.d_score_min}
          max={m.d_score_max}
          percentiles={m.d_percentiles}
          histogram={m.d_score_histogram}
          anomalyCount={m.d_anomaly_count}
          anomalyRate={m.d_anomaly_rate}
        />
        <ScoreSection
          title="Network Anomaly Scores"
          prefix="n"
          mean={m.n_score_mean}
          std={m.n_score_std}
          min={m.n_score_min}
          max={m.n_score_max}
          percentiles={m.n_percentiles}
          histogram={m.n_score_histogram}
          anomalyCount={m.n_anomaly_count}
          anomalyRate={m.n_anomaly_rate}
        />
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        <FeatureImportanceCard
          title="Device Feature Importance"
          importance={m.d_feature_importance}
          stats={m.d_feature_stats}
          color="emerald"
        />
        <FeatureImportanceCard
          title="Network Feature Importance"
          importance={m.n_feature_importance}
          stats={m.n_feature_stats}
          color="violet"
        />
      </div>
    </div>
  )
}

function MetricCard({
  label,
  value,
  mono,
}: {
  label: string
  value: string | number
  mono?: boolean
}) {
  return (
    <div className="rounded-lg bg-white/3 p-3 border border-white/5">
      <p className="text-[10px] uppercase tracking-wider text-muted-foreground mb-0.5">
        {label}
      </p>
      <p className={`font-bold text-sm ${mono ? "font-mono" : ""}`}>{value}</p>
    </div>
  )
}

function ScoreSection({
  title,
  prefix,
  mean,
  std,
  min,
  max,
  percentiles,
  histogram,
  anomalyCount,
  anomalyRate,
}: {
  title: string
  prefix: string
  mean: number
  std: number
  min: number
  max: number
  percentiles: { p5: number; p25: number; p50: number; p75: number; p95: number }
  histogram: { counts: number[]; edges: number[]; bin_count: number }
  anomalyCount: number
  anomalyRate: number
}) {
  const maxCount = Math.max(...histogram.counts, 1)

  return (
    <Card className="shadow-lg">
      <CardHeader className="pb-3">
        <CardTitle className="text-sm font-semibold flex items-center gap-2">
          <div className={prefix === "d" ? "flex h-6 w-6 items-center justify-center rounded-lg bg-emerald-500/10" : "flex h-6 w-6 items-center justify-center rounded-lg bg-violet-500/10"}>
            <BarChart3 className={prefix === "d" ? "h-3 w-3 text-emerald-400" : "h-3 w-3 text-violet-400"} />
          </div>
          {title}
        </CardTitle>
      </CardHeader>
      <CardContent className="space-y-4">
        <div className="grid grid-cols-3 gap-2">
          <MiniStat label="Mean" value={mean.toFixed(4)} />
          <MiniStat label="Std Dev" value={std.toFixed(4)} />
          <MiniStat label="Anomalies" value={`${anomalyCount} (${(anomalyRate * 100).toFixed(1)}%)`} />
        </div>

        <div>
          <p className="text-[10px] uppercase tracking-wider text-muted-foreground mb-2">
            Score Distribution
          </p>
          <div className="flex items-end gap-px h-24">
            {histogram.counts.map((count, i) => (
              <div
                key={i}
                className="flex-1 rounded-t-sm transition-all duration-300"
                style={{
                  height: `${(count / maxCount) * 100}%`,
                  backgroundColor:
                    histogram.edges[i] > percentiles.p75
                      ? "oklch(0.65 0.22 25 / 70%)"
                      : histogram.edges[i] > percentiles.p50
                        ? "oklch(0.7 0.15 80 / 60%)"
                        : "oklch(0.72 0.19 160 / 50%)",
                }}
                title={`${histogram.edges[i].toFixed(3)} - ${histogram.edges[i + 1]?.toFixed(3)}: ${count}`}
              />
            ))}
          </div>
          <div className="flex justify-between text-[9px] text-muted-foreground mt-1 font-mono">
            <span>{min.toFixed(2)}</span>
            <span>{percentiles.p50.toFixed(2)}</span>
            <span>{max.toFixed(2)}</span>
          </div>
        </div>

        <div>
          <p className="text-[10px] uppercase tracking-wider text-muted-foreground mb-1.5">
            Percentiles
          </p>
          <div className="flex gap-2">
            {(["p5", "p25", "p50", "p75", "p95"] as const).map((p) => (
              <div key={p} className="flex-1 text-center rounded-md bg-white/3 py-1.5 border border-white/5">
                <p className="text-[9px] text-muted-foreground uppercase">{p}</p>
                <p className="text-[11px] font-mono font-bold">{percentiles[p].toFixed(3)}</p>
              </div>
            ))}
          </div>
        </div>
      </CardContent>
    </Card>
  )
}

function FeatureImportanceCard({
  title,
  importance,
  stats,
  color,
}: {
  title: string
  importance: Record<string, number>
  stats: Record<string, { mean: number; std: number; min: number; max: number }>
  color: "emerald" | "violet"
}) {
  const sorted = Object.entries(importance)
    .sort(([, a], [, b]) => b - a)
    .slice(0, 10)
  const maxImp = sorted[0]?.[1] || 1

  const icons: Record<string, React.ReactNode> = {
    emerald: <TrendingUp className="h-3 w-3 text-emerald-400" />,
    violet: <BrainCircuit className="h-3 w-3 text-violet-400" />,
  }

  return (
    <Card className="shadow-lg">
      <CardHeader className="pb-3">
        <CardTitle className="text-sm font-semibold flex items-center gap-2">
          <div className={color === "emerald" ? "flex h-6 w-6 items-center justify-center rounded-lg bg-emerald-500/10" : "flex h-6 w-6 items-center justify-center rounded-lg bg-violet-500/10"}>
            {icons[color]}
          </div>
          {title}
        </CardTitle>
      </CardHeader>
      <CardContent>
        <div className="space-y-2">
          {sorted.map(([name, imp]) => {
            const s = stats[name]
            return (
              <div key={name} className="group">
                <div className="flex items-center justify-between mb-0.5">
                  <span className="text-xs font-mono text-muted-foreground truncate max-w-[60%]">
                    {name}
                  </span>
                  <span className="text-[10px] font-mono text-foreground">
                    {(imp * 100).toFixed(1)}%
                  </span>
                </div>
                <div className="h-1.5 w-full rounded-full bg-white/5 overflow-hidden">
                  <div
                    className={color === "emerald"
                      ? "h-full rounded-full bg-gradient-to-r from-emerald-500 to-emerald-400 transition-all duration-500"
                      : "h-full rounded-full bg-gradient-to-r from-violet-500 to-violet-400 transition-all duration-500"
                    }
                    style={{ width: `${(imp / maxImp) * 100}%` }}
                  />
                </div>
                {s && (
                  <div className="flex gap-3 text-[9px] text-muted-foreground mt-0.5 opacity-0 group-hover:opacity-100 transition-opacity">
                    <span>mean: {s.mean.toFixed(2)}</span>
                    <span>std: {s.std.toFixed(2)}</span>
                    <span>range: [{s.min.toFixed(2)}, {s.max.toFixed(2)}]</span>
                  </div>
                )}
              </div>
            )
          })}
        </div>
      </CardContent>
    </Card>
  )
}

function MiniStat({ label, value }: { label: string; value: string }) {
  return (
    <div className="rounded-lg bg-white/3 p-2 border border-white/5">
      <p className="text-[9px] uppercase tracking-wider text-muted-foreground mb-0.5">{label}</p>
      <p className="text-xs font-mono font-bold">{value}</p>
    </div>
  )
}
