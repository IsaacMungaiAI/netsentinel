"use client"

import {
  Card,
  CardContent,
  CardHeader,
  CardTitle,
} from "@/components/ui/card"
import { BrainCircuit, Activity, RefreshCw } from "lucide-react"
import type { ModelInfo } from "@/lib/types"
import { api } from "@/lib/api"
import { useRouter } from "next/navigation"
import { useState } from "react"

export function ModelStatus({
  model,
  bufferedSamples = 0,
}: {
  model: ModelInfo | null
  bufferedSamples?: number
}) {
  const router = useRouter()
  const [loading, setLoading] = useState(false)

  async function handleRetrain() {
    setLoading(true)
    await api.retrain()
    setLoading(false)
    router.refresh()
  }

  const samplesNeeded = 30
  const progress = Math.min((bufferedSamples / samplesNeeded) * 100, 100)

  return (
    <Card className="shadow-lg">
      <CardHeader className="flex flex-row items-center justify-between">
        <CardTitle className="text-sm font-semibold tracking-wide uppercase text-muted-foreground flex items-center gap-2">
          <div className="flex h-7 w-7 items-center justify-center rounded-lg bg-violet-500/10">
            <BrainCircuit className="h-3.5 w-3.5 text-violet-400" />
          </div>
          ML Model Status
        </CardTitle>
        <button
          onClick={handleRetrain}
          disabled={loading || bufferedSamples < samplesNeeded}
          className="text-[10px] uppercase tracking-wider text-muted-foreground hover:text-emerald-400 flex items-center gap-1 disabled:opacity-50 transition-colors"
        >
          <RefreshCw className={`h-3 w-3 ${loading ? "animate-spin" : ""}`} />
          Retrain
        </button>
      </CardHeader>
      <CardContent>
        {model ? (
          <div className="grid grid-cols-2 gap-4">
            <div className="rounded-lg bg-white/3 p-3 border border-white/5">
              <p className="text-[10px] uppercase tracking-wider text-muted-foreground mb-1">Version</p>
              <p className="font-mono font-bold text-lg">v{model.version}</p>
            </div>
            <div className="rounded-lg bg-white/3 p-3 border border-white/5">
              <p className="text-[10px] uppercase tracking-wider text-muted-foreground mb-1">Samples</p>
              <p className="font-mono font-bold text-lg">{model.sample_count}</p>
            </div>
            <div className="rounded-lg bg-white/3 p-3 border border-white/5">
              <p className="text-[10px] uppercase tracking-wider text-muted-foreground mb-1">Threshold</p>
              <p className="font-mono font-bold text-lg">{model.threshold.toFixed(4)}</p>
            </div>
            <div className="rounded-lg bg-white/3 p-3 border border-white/5">
              <p className="text-[10px] uppercase tracking-wider text-muted-foreground mb-1">Contamination</p>
              <p className="font-mono font-bold text-lg">{(model.contamination * 100).toFixed(1)}%</p>
            </div>
            <div className="col-span-2 rounded-lg bg-white/3 p-3 border border-white/5">
              <p className="text-[10px] uppercase tracking-wider text-muted-foreground mb-1">Last Trained</p>
              <p className="text-sm">{new Date(model.trained_at).toLocaleString()}</p>
            </div>
          </div>
        ) : (
          <div className="flex flex-col items-center justify-center py-6 text-muted-foreground">
            <Activity className="h-8 w-8 mb-3 opacity-30" />
            <p className="text-sm font-medium">Model not yet trained</p>
            <p className="text-xs mt-1 mb-4">
              Collecting data for initial training...
            </p>
            <div className="w-full max-w-xs">
              <div className="flex justify-between text-[10px] mb-1.5">
                <span className="text-muted-foreground">Samples collected</span>
                <span className="font-mono text-emerald-400">
                  {bufferedSamples}/{samplesNeeded}
                </span>
              </div>
              <div className="h-2 w-full rounded-full bg-white/5 overflow-hidden">
                <div
                  className="h-full rounded-full bg-gradient-to-r from-emerald-500 to-teal-400 transition-all duration-500"
                  style={{ width: `${progress}%` }}
                />
              </div>
              {bufferedSamples >= samplesNeeded && (
                <p className="text-[10px] text-emerald-400 mt-2 text-center">
                  Ready to train — click Retrain or wait for auto-train
                </p>
              )}
            </div>
          </div>
        )}
      </CardContent>
    </Card>
  )
}
