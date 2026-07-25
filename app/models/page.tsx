"use client"

import { useEffect, useState } from "react"
import { api } from "@/lib/api"
import type { ModelInfo, TrainingMetrics, TrainingStatus } from "@/lib/types"
import {
  Card,
  CardContent,
  CardHeader,
  CardTitle,
} from "@/components/ui/card"
import { Skeleton } from "@/components/ui/skeleton"
import { Badge } from "@/components/ui/badge"
import { BrainCircuit, RefreshCw, CheckCircle2, ChevronDown, ChevronUp, Loader2, Activity } from "lucide-react"
import { TrainingMetricsDashboard } from "@/components/training-metrics"

export default function ModelsPage() {
  const [models, setModels] = useState<ModelInfo[]>([])
  const [loading, setLoading] = useState(true)
  const [retraining, setRetraining] = useState(false)
  const [retrainResult, setRetrainResult] = useState<string | null>(null)
  const [trainingStatus, setTrainingStatus] = useState<TrainingStatus | null>(null)
  const [expandedVersion, setExpandedVersion] = useState<number | null>(null)
  const [metricsData, setMetricsData] = useState<Record<number, TrainingMetrics>>({})
  const [metricsLoading, setMetricsLoading] = useState<number | null>(null)

  useEffect(() => {
    api.models().then(setModels).finally(() => setLoading(false))
    api.trainingStatus().then(setTrainingStatus).catch(() => {})
  }, [])

  useEffect(() => {
    if (!trainingStatus?.is_training) return
    const interval = setInterval(() => {
      api.trainingStatus().then(setTrainingStatus).catch(() => {})
    }, 2000)
    return () => clearInterval(interval)
  }, [trainingStatus?.is_training])

  async function handleRetrain() {
    setRetraining(true)
    setRetrainResult(null)
    try {
      const res = await api.retrain()
      if (res.ok) {
        setRetrainResult(`Trained v${res.version} with ${res.samples} samples`)
        const updated = await api.models()
        setModels(updated)
        api.trainingStatus().then(setTrainingStatus).catch(() => {})
      } else {
        setRetrainResult(res.message || "Retrain failed")
      }
    } catch {
      setRetrainResult("Error: could not reach backend")
    }
    setRetraining(false)
  }

  async function toggleMetrics(version: number) {
    if (expandedVersion === version) {
      setExpandedVersion(null)
      return
    }
    setExpandedVersion(version)
    if (!metricsData[version]) {
      setMetricsLoading(version)
      try {
        const data = await api.modelMetrics(version)
        setMetricsData((prev) => ({ ...prev, [version]: data }))
      } catch {
        // metrics not available
      }
      setMetricsLoading(null)
    }
  }

  const progress = trainingStatus
    ? Math.min((trainingStatus.buffered_samples / trainingStatus.samples_needed) * 100, 100)
    : 0

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-2xl font-bold tracking-tight">
            <span className="bg-gradient-to-r from-violet-400 to-purple-300 bg-clip-text text-transparent">
              ML Models
            </span>
          </h1>
          <p className="text-sm text-muted-foreground mt-0.5">
            IsolationForest model versions and training metrics
          </p>
        </div>
        <button
          onClick={handleRetrain}
          disabled={retraining || (trainingStatus?.buffered_samples ?? 0) < 30}
          className="flex items-center gap-2 rounded-lg bg-violet-500/10 px-3 py-1.5 text-xs font-medium text-violet-400 hover:bg-violet-500/20 transition-colors disabled:opacity-50"
        >
          {retraining ? (
            <Loader2 className="h-3.5 w-3.5 animate-spin" />
          ) : (
            <RefreshCw className="h-3.5 w-3.5" />
          )}
          {retraining ? "Training..." : "Retrain Now"}
        </button>
      </div>

      {trainingStatus && (
        <Card className="shadow-lg">
          <CardContent className="py-4">
            <div className="flex items-center justify-between mb-2">
              <div className="flex items-center gap-2">
                {trainingStatus.is_training ? (
                  <Loader2 className="h-4 w-4 text-violet-400 animate-spin" />
                ) : (
                  <Activity className="h-4 w-4 text-muted-foreground" />
                )}
                <span className="text-sm font-medium">
                  {trainingStatus.is_training
                    ? "Training in progress..."
                    : "Training idle"}
                </span>
              </div>
              <div className="flex items-center gap-3 text-xs text-muted-foreground">
                <span className="font-mono">
                  {trainingStatus.buffered_samples}/{trainingStatus.samples_needed} samples
                </span>
                {trainingStatus.last_train_duration > 0 && (
                  <span className="font-mono">
                    Last: {trainingStatus.last_train_duration.toFixed(2)}s
                  </span>
                )}
              </div>
            </div>
            <div className="h-2 w-full rounded-full bg-white/5 overflow-hidden">
              <div
                className={`h-full rounded-full transition-all duration-500 ${
                  trainingStatus.is_training
                    ? "bg-gradient-to-r from-violet-500 to-purple-400 animate-pulse"
                    : "bg-gradient-to-r from-emerald-500 to-teal-400"
                }`}
                style={{ width: `${progress}%` }}
              />
            </div>
            {trainingStatus.last_train_completed && (
              <p className="text-[10px] text-muted-foreground mt-2">
                Last trained: {new Date(trainingStatus.last_train_completed).toLocaleString()}
              </p>
            )}
          </CardContent>
        </Card>
      )}

      {retrainResult && (
        <div className="rounded-lg border border-emerald-500/20 bg-emerald-500/5 px-4 py-2 text-sm text-emerald-400">
          {retrainResult}
        </div>
      )}

      {loading ? (
        <div className="space-y-4">
          {Array.from({ length: 3 }).map((_, i) => (
            <Skeleton key={i} className="h-24 rounded-xl bg-white/5" />
          ))}
        </div>
      ) : models.length === 0 ? (
        <Card>
          <CardContent className="flex flex-col items-center justify-center py-16 text-muted-foreground">
            <BrainCircuit className="h-10 w-10 mb-3 opacity-30" />
            <p className="text-sm font-medium">No models trained yet</p>
            <p className="text-xs mt-1">Data is being collected. The first model trains after 30 samples.</p>
          </CardContent>
        </Card>
      ) : (
        <div className="space-y-4">
          {models.map((m) => (
            <div key={m.id}>
              <Card className="shadow-lg">
                <CardHeader className="flex flex-row items-center justify-between pb-3">
                  <CardTitle className="text-sm font-semibold flex items-center gap-2">
                    <span className="font-mono">v{m.version}</span>
                    {m.active ? (
                      <Badge className="bg-emerald-500/10 text-emerald-400 border-emerald-500/20 text-[10px]">
                        <CheckCircle2 className="h-2.5 w-2.5 mr-1" />
                        Active
                      </Badge>
                    ) : (
                      <Badge variant="outline" className="text-[10px] text-muted-foreground">
                        Retired
                      </Badge>
                    )}
                  </CardTitle>
                  <div className="flex items-center gap-3">
                    <span className="text-[10px] text-muted-foreground">
                      {new Date(m.trained_at).toLocaleString()}
                    </span>
                    <button
                      onClick={() => toggleMetrics(m.version)}
                      className="flex items-center gap-1 text-[10px] uppercase tracking-wider text-muted-foreground hover:text-violet-400 transition-colors"
                    >
                      {expandedVersion === m.version ? (
                        <>
                          <ChevronUp className="h-3 w-3" />
                          Hide Metrics
                        </>
                      ) : (
                        <>
                          <ChevronDown className="h-3 w-3" />
                          View Metrics
                        </>
                      )}
                    </button>
                  </div>
                </CardHeader>
                <CardContent>
                  <div className="grid grid-cols-2 sm:grid-cols-5 gap-3">
                    <Stat label="Samples" value={m.sample_count} />
                    <Stat label="Features" value={m.n_features} />
                    <Stat label="Threshold" value={m.threshold.toFixed(4)} mono />
                    <Stat label="Contamination" value={`${(m.contamination * 100).toFixed(1)}%`} />
                    {m.metrics && Object.keys(m.metrics).length > 0 && (
                      <div className="col-span-2 sm:col-span-5">
                        <p className="text-[10px] uppercase tracking-wider text-muted-foreground mb-1.5">Training Metrics</p>
                        <div className="flex flex-wrap gap-3">
                          {Object.entries(m.metrics)
                            .filter(([k]) => !k.includes("histogram") && !k.includes("importance") && !k.includes("stats") && !k.includes("percentiles"))
                            .slice(0, 8)
                            .map(([k, v]) => (
                            <span key={k} className="text-xs font-mono text-muted-foreground">
                              <span className="text-foreground">{k}:</span>{" "}
                              {typeof v === "number" ? v.toFixed(4) : String(v)}
                            </span>
                          ))}
                        </div>
                      </div>
                    )}
                  </div>
                </CardContent>
              </Card>

              {expandedVersion === m.version && (
                <div className="mt-2">
                  {metricsLoading === m.version ? (
                    <Card>
                      <CardContent className="flex items-center justify-center py-12">
                        <Loader2 className="h-6 w-6 text-violet-400 animate-spin" />
                      </CardContent>
                    </Card>
                  ) : metricsData[m.version] ? (
                    <TrainingMetricsDashboard data={metricsData[m.version]} />
                  ) : (
                    <Card>
                      <CardContent className="flex items-center justify-center py-8 text-muted-foreground text-sm">
                        No detailed metrics available for this version
                      </CardContent>
                    </Card>
                  )}
                </div>
              )}
            </div>
          ))}
        </div>
      )}
    </div>
  )
}

function Stat({ label, value, mono }: { label: string; value: string | number; mono?: boolean }) {
  return (
    <div className="rounded-lg bg-white/3 p-2.5 border border-white/5">
      <p className="text-[10px] uppercase tracking-wider text-muted-foreground mb-0.5">{label}</p>
      <p className={`font-bold text-sm ${mono ? "font-mono" : ""}`}>{value}</p>
    </div>
  )
}
