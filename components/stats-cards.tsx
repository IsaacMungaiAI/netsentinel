"use client"

import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import {
  Monitor,
  ArrowDown,
  ArrowUp,
  Wifi,
  ShieldAlert,
} from "lucide-react"
import type { DashboardSummary } from "@/lib/types"

function formatSpeed(kbps: number): string {
  if (kbps >= 1024) return `${(kbps / 1024).toFixed(1)} MB/s`
  return `${kbps.toFixed(0)} KB/s`
}

const cards = [
  {
    title: "Connected Devices",
    key: "device_count" as const,
    icon: Monitor,
    format: (v: number) => String(v),
    color: "text-blue-400",
    bg: "bg-blue-500/10",
    glow: "shadow-blue-500/5",
  },
  {
    title: "Download",
    key: "total_down" as const,
    icon: ArrowDown,
    format: formatSpeed,
    color: "text-emerald-400",
    bg: "bg-emerald-500/10",
    glow: "shadow-emerald-500/5",
  },
  {
    title: "Upload",
    key: "total_up" as const,
    icon: ArrowUp,
    format: formatSpeed,
    color: "text-amber-400",
    bg: "bg-amber-500/10",
    glow: "shadow-amber-500/5",
  },
  {
    title: "WiFi Rate",
    key: "wifi_rate" as const,
    icon: Wifi,
    format: (v: number) => `${v} Mbps`,
    color: "text-violet-400",
    bg: "bg-violet-500/10",
    glow: "shadow-violet-500/5",
  },
]

export function StatsCards({ data }: { data: DashboardSummary }) {
  return (
    <div className="grid gap-4 grid-cols-2 lg:grid-cols-5">
      {cards.map((c) => (
        <Card key={c.key} className={`shadow-lg ${c.glow} hover:scale-[1.02] transition-transform duration-200`}>
          <CardHeader className="flex flex-row items-center justify-between pb-2">
            <CardTitle className="text-xs font-medium text-muted-foreground uppercase tracking-wider">
              {c.title}
            </CardTitle>
            <div className={`flex h-7 w-7 items-center justify-center rounded-lg ${c.bg}`}>
              <c.icon className={`h-3.5 w-3.5 ${c.color}`} />
            </div>
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold tracking-tight">{c.format(data[c.key] as number)}</div>
          </CardContent>
        </Card>
      ))}
      <Card className="shadow-lg shadow-red-500/5 hover:scale-[1.02] transition-transform duration-200">
        <CardHeader className="flex flex-row items-center justify-between pb-2">
          <CardTitle className="text-xs font-medium text-muted-foreground uppercase tracking-wider">
            Active Alerts
          </CardTitle>
          <div className="flex h-7 w-7 items-center justify-center rounded-lg bg-red-500/10">
            <ShieldAlert className="h-3.5 w-3.5 text-red-400" />
          </div>
        </CardHeader>
        <CardContent>
          <div className="flex items-center gap-2">
            <span className="text-2xl font-bold tracking-tight">{data.alert_count}</span>
            {data.critical_count > 0 && (
              <span className="text-[10px] bg-red-500/15 text-red-400 px-2 py-0.5 rounded-full font-medium border border-red-500/20">
                {data.critical_count} critical
              </span>
            )}
          </div>
        </CardContent>
      </Card>
    </div>
  )
}
