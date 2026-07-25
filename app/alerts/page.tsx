"use client"

import { useEffect, useState, useRef } from "react"
import { api } from "@/lib/api"
import type { AlertRecord } from "@/lib/types"
import { AlertFeed } from "@/components/alert-feed"
import { Skeleton } from "@/components/ui/skeleton"
import { Tabs, TabsList, TabsTrigger } from "@/components/ui/tabs"

export default function AlertsPage() {
  const [alerts, setAlerts] = useState<AlertRecord[] | null>(null)
  const [filter, setFilter] = useState("all")
  const dataHash = useRef("")

  useEffect(() => {
    let active = true
    async function load() {
      try {
        const params: { resolved?: boolean; severity?: string; limit?: number } = { limit: 100 }
        if (filter === "unresolved") params.resolved = false
        if (filter === "critical") params.severity = "critical"
        if (filter === "warning") params.severity = "warning"
        const res = await api.alerts(params)
        if (!active) return
        const hash = JSON.stringify(res)
        if (hash !== dataHash.current) {
          dataHash.current = hash
          setAlerts(res)
        }
      } catch {
        // silent
      }
    }
    load()
    const interval = setInterval(load, 5000)
    return () => { active = false; clearInterval(interval) }
  }, [filter])

  return (
    <div className="space-y-6">
      <div>
        <h1 className="text-2xl font-bold tracking-tight">
          <span className="bg-gradient-to-r from-red-400 to-amber-400 bg-clip-text text-transparent">
            Alerts
          </span>
        </h1>
        <p className="text-sm text-muted-foreground mt-0.5">
          Anomaly detection alerts and security events
        </p>
      </div>

      <Tabs value={filter} onValueChange={setFilter}>
        <TabsList className="glass">
          <TabsTrigger value="all">All</TabsTrigger>
          <TabsTrigger value="unresolved">Unresolved</TabsTrigger>
          <TabsTrigger value="critical">Critical</TabsTrigger>
          <TabsTrigger value="warning">Warning</TabsTrigger>
        </TabsList>
      </Tabs>

      {alerts === null ? (
        <Skeleton className="h-[400px] rounded-xl bg-white/5" />
      ) : (
        <AlertFeed alerts={alerts} />
      )}
    </div>
  )
}
