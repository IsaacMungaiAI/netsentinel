"use client"

import { useEffect, useState } from "react"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { Badge } from "@/components/ui/badge"
import { Skeleton } from "@/components/ui/skeleton"
import { TrendingDown, Clock, AlertTriangle, Zap } from "lucide-react"
import { api } from "@/lib/api"
import type { PredictionsResponse } from "@/lib/types"

export function PredictionsPanel() {
  const [data, setData] = useState<PredictionsResponse | null>(null)
  const [loading, setLoading] = useState(true)

  useEffect(() => {
    let active = true
    async function load() {
      try {
        const res = await api.predictions()
        if (active) { setData(res); setLoading(false) }
      } catch { if (active) setLoading(false) }
    }
    load()
    const interval = setInterval(load, 60000)
    return () => { active = false; clearInterval(interval) }
  }, [])

  if (loading) {
    return <Card className="shadow-lg"><CardContent className="p-6"><Skeleton className="h-[250px] rounded-xl bg-white/5" /></CardContent></Card>
  }

  if (!data || data.data_points < 10) {
    const pts = data?.data_points ?? 0
    return (
      <Card className="shadow-lg">
        <CardHeader className="pb-2">
          <CardTitle className="text-sm font-semibold tracking-wide uppercase text-muted-foreground flex items-center gap-2">
            <Zap className="h-4 w-4 text-amber-400" />
            Predictions
          </CardTitle>
        </CardHeader>
        <CardContent>
          <div className="h-[210px] flex flex-col items-center justify-center gap-3 text-center">
            <div className="h-12 w-12 rounded-full bg-amber-500/10 flex items-center justify-center">
              <AlertTriangle className="h-6 w-6 text-amber-400" />
            </div>
            <p className="text-sm text-muted-foreground">
              Not enough data yet ({pts} data points).<br />
              Predictions improve after ~7 days of collection.
            </p>
          </div>
        </CardContent>
      </Card>
    )
  }

  return (
    <Card className="shadow-lg">
      <CardHeader className="pb-2">
        <CardTitle className="text-sm font-semibold tracking-wide uppercase text-muted-foreground flex items-center gap-2">
          <Zap className="h-4 w-4 text-amber-400" />
          Predictions
        </CardTitle>
      </CardHeader>
      <CardContent className="space-y-4">
        {data.slow_prediction && (
          <div className="rounded-xl bg-red-500/5 border border-red-500/15 p-4 space-y-2">
            <div className="flex items-center gap-2">
              <TrendingDown className="h-4 w-4 text-red-400" />
              <span className="text-xs font-semibold text-red-400 uppercase tracking-wide">Slow Internet Forecast</span>
            </div>
            <p className="text-sm text-muted-foreground">{data.slow_prediction.message}</p>
            <Badge variant="destructive" className="text-[10px]">
              Risk: {data.slow_prediction.risk_level}
            </Badge>
          </div>
        )}

        {data.best_download_window && (
          <div className="rounded-xl bg-emerald-500/5 border border-emerald-500/15 p-4 space-y-2">
            <div className="flex items-center gap-2">
              <Clock className="h-4 w-4 text-emerald-400" />
              <span className="text-xs font-semibold text-emerald-400 uppercase tracking-wide">Best Download Time</span>
            </div>
            <p className="text-sm text-muted-foreground">{data.best_download_window.message}</p>
          </div>
        )}

        <div className="space-y-1.5">
          <p className="text-[10px] text-muted-foreground/60 uppercase tracking-widest">24h Congestion Forecast</p>
          <div className="flex gap-[2px] h-10 items-end">
            {data.hourly_forecast.map((h) => {
              const maxDl = Math.max(...data.hourly_forecast.map(f => f.avg_download), 1)
              const barH = Math.max(4, (h.avg_download / maxDl) * 100)
              const now = new Date().getHours()
              return (
                <div
                  key={h.hour}
                  className="flex-1 rounded-t-sm transition-all"
                  style={{
                    height: `${barH}%`,
                    backgroundColor: h.congestion_risk === "high" ? "rgba(239,68,68,0.7)" : h.congestion_risk === "medium" ? "rgba(234,179,8,0.6)" : h.congestion_risk === "low" ? "rgba(16,185,129,0.5)" : "rgba(255,255,255,0.05)",
                    outline: h.hour === now ? "1px solid rgba(255,255,255,0.4)" : "none",
                  }}
                  title={`${h.hour}:00 — ${h.avg_download.toFixed(0)} KB/s (${h.congestion_risk})`}
                />
              )
            })}
          </div>
          <div className="flex justify-between text-[8px] text-muted-foreground/40">
            <span>00:00</span>
            <span>12:00</span>
            <span>23:00</span>
          </div>
        </div>
      </CardContent>
    </Card>
  )
}
