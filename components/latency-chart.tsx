"use client"

import { useEffect, useState, useMemo } from "react"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { Badge } from "@/components/ui/badge"
import { Skeleton } from "@/components/ui/skeleton"
import { Activity, AlertTriangle } from "lucide-react"
import { api } from "@/lib/api"
import type { LatencyPoint } from "@/lib/types"

export function LatencyChart() {
  const [data, setData] = useState<LatencyPoint[]>([])
  const [loading, setLoading] = useState(true)

  useEffect(() => {
    let active = true
    const controller = new AbortController()
    async function load() {
      try {
        const res = await api.latency(2, controller.signal)
        if (active) { setData(res); setLoading(false) }
      } catch {
        if (active && !controller.signal.aborted) setLoading(false)
      }
    }
    load()
    const interval = setInterval(load, 10000)
    return () => { active = false; clearInterval(interval); controller.abort() }
  }, [])

  const stats = useMemo(() => {
    if (data.length === 0) return { maxLatency: 1, avgLatency: 0, avgLoss: 0 }
    let maxLatency = 0
    let sumLatency = 0
    let sumLoss = 0
    for (const d of data) {
      if (d.latency_ms > maxLatency) maxLatency = d.latency_ms
      sumLatency += d.latency_ms
      sumLoss += d.packet_loss
    }
    return {
      maxLatency: Math.max(maxLatency, 1),
      avgLatency: sumLatency / data.length,
      avgLoss: sumLoss / data.length,
    }
  }, [data])

  if (loading) {
    return <Card className="shadow-lg"><CardContent className="p-6"><Skeleton className="h-[200px] rounded-xl bg-white/5" /></CardContent></Card>
  }

  return (
    <Card className="shadow-lg">
      <CardHeader className="pb-2">
        <div className="flex items-center justify-between">
          <CardTitle className="text-sm font-semibold tracking-wide uppercase text-muted-foreground flex items-center gap-2">
            <Activity className="h-4 w-4 text-emerald-400" />
            Ping / Latency
          </CardTitle>
          <div className="flex gap-2">
            <Badge variant="outline" className="text-[10px] border-white/10 bg-white/5">
              {stats.avgLatency.toFixed(1)}ms avg
            </Badge>
            {stats.avgLoss > 0 && (
              <Badge variant="destructive" className="text-[10px] flex items-center gap-1">
                <AlertTriangle className="h-3 w-3" />
                {stats.avgLoss.toFixed(1)}% loss
              </Badge>
            )}
          </div>
        </div>
      </CardHeader>
      <CardContent>
        <div className="h-[200px] flex items-end gap-[2px] relative">
          <div className="absolute left-0 top-0 bottom-0 flex flex-col justify-between text-[9px] text-muted-foreground/40 pr-2 w-10">
            <span>{stats.maxLatency.toFixed(0)}ms</span>
            <span>{(stats.maxLatency / 2).toFixed(0)}ms</span>
            <span>0ms</span>
          </div>
          <div className="flex-1 ml-12 flex items-end gap-[2px] h-full">
            {data.slice(-200).map((d, i) => {
              const h = Math.max(2, (d.latency_ms / stats.maxLatency) * 100)
              return (
                <div
                  key={i}
                  className="flex-1 rounded-t-sm transition-all"
                  style={{
                    height: `${h}%`,
                    backgroundColor: d.latency_ms > 100 ? "rgba(239,68,68,0.7)" : d.latency_ms > 50 ? "rgba(234,179,8,0.6)" : "rgba(16,185,129,0.5)",
                  }}
                  title={`${d.target}: ${d.latency_ms}ms (${d.packet_loss}% loss)`}
                />
              )
            })}
          </div>
        </div>
        <div className="mt-2 flex justify-between text-[9px] text-muted-foreground/40 ml-12">
          <span>2h ago</span>
          <span>Now</span>
        </div>
      </CardContent>
    </Card>
  )
}
