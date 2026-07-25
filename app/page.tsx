"use client"

import { useEffect, useState } from "react"
import { api } from "@/lib/api"
import type { DashboardSummary } from "@/lib/types"
import { StatsCards } from "@/components/stats-cards"
import { TrafficChart } from "@/components/traffic-chart"
import { AlertFeed } from "@/components/alert-feed"
import { ModelStatus } from "@/components/model-status"
import { LatencyChart } from "@/components/latency-chart"
import { SignalChart } from "@/components/signal-chart"
import { PredictionsPanel } from "@/components/predictions-panel"
import { Skeleton } from "@/components/ui/skeleton"
import { Shield } from "lucide-react"

export default function DashboardPage() {
  const [data, setData] = useState<DashboardSummary | null>(null)
  const [error, setError] = useState<string | null>(null)

  useEffect(() => {
    let active = true
    async function load() {
      try {
        const res = await api.dashboard()
        if (active) {
          setData(res)
          setError(null)
        }
      } catch {
        if (active) setError("Cannot reach backend. Make sure the Python server is running on :8000")
      }
    }
    load()
    const interval = setInterval(load, 5000)
    return () => { active = false; clearInterval(interval) }
  }, [])

  if (error) {
    return (
      <div className="flex flex-col items-center justify-center py-20 gap-4">
        <div className="glass rounded-2xl p-8 flex flex-col items-center gap-4">
          <Shield className="h-16 w-16 text-muted-foreground opacity-30" />
          <h2 className="text-xl font-semibold">Connection Error</h2>
          <p className="text-sm text-muted-foreground max-w-md text-center">{error}</p>
        </div>
      </div>
    )
  }

  if (!data) {
    return (
      <div className="space-y-6">
        <Skeleton className="h-8 w-48 bg-white/5" />
        <div className="grid gap-4 grid-cols-2 lg:grid-cols-5">
          {Array.from({ length: 5 }).map((_, i) => (
            <Skeleton key={i} className="h-[100px] rounded-xl bg-white/5" />
          ))}
        </div>
        <Skeleton className="h-[350px] rounded-xl bg-white/5" />
      </div>
    )
  }

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-2xl font-bold tracking-tight">
            <span className="bg-gradient-to-r from-emerald-400 to-teal-300 bg-clip-text text-transparent">
              Dashboard
            </span>
          </h1>
          <p className="text-sm text-muted-foreground mt-0.5">
            Real-time network monitoring
          </p>
        </div>
      </div>

      <StatsCards data={data} />

      <div className="grid gap-6 lg:grid-cols-3">
        <div className="lg:col-span-2">
          <TrafficChart data={data.recent_traffic} />
        </div>
        <div>
          <ModelStatus model={data.active_model} bufferedSamples={data.buffered_samples} />
        </div>
      </div>

      <div className="grid gap-6 lg:grid-cols-2">
        <LatencyChart />
        <SignalChart />
      </div>

      <div className="grid gap-6 lg:grid-cols-3">
        <div className="lg:col-span-2">
          <PredictionsPanel />
        </div>
        <div>
          <AlertFeed alerts={data.recent_alerts} />
        </div>
      </div>
    </div>
  )
}
