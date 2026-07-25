"use client"

import { useEffect, useState, useMemo } from "react"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { Badge } from "@/components/ui/badge"
import { Skeleton } from "@/components/ui/skeleton"
import { Radio, Wifi } from "lucide-react"
import { api } from "@/lib/api"
import type { SignalPoint } from "@/lib/types"

export function SignalChart() {
  const [data, setData] = useState<SignalPoint[]>([])
  const [loading, setLoading] = useState(true)

  useEffect(() => {
    let active = true
    const controller = new AbortController()
    async function load() {
      try {
        const res = await api.signal(2, controller.signal)
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
    if (data.length === 0) return { maxRate: 1, currentRate: 0, currentDevices: 0 }
    let maxRate = 0
    for (const d of data) {
      if (d.wifi_rate > maxRate) maxRate = d.wifi_rate
    }
    const last = data[data.length - 1]
    return {
      maxRate: Math.max(maxRate, 1),
      currentRate: last.wifi_rate,
      currentDevices: last.device_count,
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
            <Radio className="h-4 w-4 text-teal-400" />
            Signal Strength
          </CardTitle>
          <div className="flex gap-2">
            <Badge variant="outline" className="text-[10px] border-white/10 bg-white/5 flex items-center gap-1">
              <Wifi className="h-3 w-3" />
              {stats.currentRate} Mbps
            </Badge>
            <Badge variant="outline" className="text-[10px] border-white/10 bg-white/5">
              {stats.currentDevices} devices
            </Badge>
          </div>
        </div>
      </CardHeader>
      <CardContent>
        <div className="h-[200px] flex items-end gap-[2px] relative">
          <div className="absolute left-0 top-0 bottom-0 flex flex-col justify-between text-[9px] text-muted-foreground/40 pr-2 w-10">
            <span>{stats.maxRate}</span>
            <span>{(stats.maxRate / 2).toFixed(0)}</span>
            <span>0</span>
          </div>
          <div className="flex-1 ml-12 flex items-end gap-[2px] h-full">
            {data.slice(-200).map((d, i) => {
              const h = Math.max(2, (d.wifi_rate / stats.maxRate) * 100)
              return (
                <div
                  key={i}
                  className="flex-1 rounded-t-sm bg-gradient-to-t from-teal-500/40 to-teal-400/60 transition-all"
                  style={{ height: `${h}%` }}
                  title={`${d.wifi_rate} Mbps | ${d.device_count} devices | ${(d.total_down / 1024).toFixed(1)} MB down`}
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
