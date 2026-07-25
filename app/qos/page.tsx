"use client"

import { useEffect, useState, useRef, useMemo } from "react"
import { api } from "@/lib/api"
import type { QoSDashboard, ActivityType, DeviceRecord } from "@/lib/types"
import {
  Card,
  CardContent,
  CardHeader,
  CardTitle,
} from "@/components/ui/card"
import { Skeleton } from "@/components/ui/skeleton"
import { Badge } from "@/components/ui/badge"
import {
  Wifi,
  Gamepad2,
  Video,
  Download,
  Phone,
  Globe,
  Moon,
  Shield,
  BrainCircuit,
  Loader2,
  ChevronDown,
  Zap,
  Settings,
} from "lucide-react"

const ACTIVITY_CONFIG: Record<ActivityType, { icon: React.ReactNode; label: string; color: string; bg: string }> = {
  gaming: { icon: <Gamepad2 className="h-3.5 w-3.5" />, label: "Gaming", color: "text-rose-400", bg: "bg-rose-500/10" },
  streaming: { icon: <Video className="h-3.5 w-3.5" />, label: "Streaming", color: "text-amber-400", bg: "bg-amber-500/10" },
  downloading: { icon: <Download className="h-3.5 w-3.5" />, label: "Downloading", color: "text-sky-400", bg: "bg-sky-500/10" },
  video_call: { icon: <Phone className="h-3.5 w-3.5" />, label: "Video Call", color: "text-emerald-400", bg: "bg-emerald-500/10" },
  browsing: { icon: <Globe className="h-3.5 w-3.5" />, label: "Browsing", color: "text-violet-400", bg: "bg-violet-500/10" },
  idle: { icon: <Moon className="h-3.5 w-3.5" />, label: "Idle", color: "text-muted-foreground", bg: "bg-white/5" },
}

const PRIORITY_LABELS: Record<number, { label: string; color: string }> = {
  1: { label: "Critical", color: "text-rose-400" },
  2: { label: "High", color: "text-amber-400" },
  3: { label: "Normal", color: "text-emerald-400" },
  4: { label: "Low", color: "text-sky-400" },
  5: { label: "Background", color: "text-muted-foreground" },
}

export default function QoSPage() {
  const [data, setData] = useState<QoSDashboard | null>(null)
  const [devices, setDevices] = useState<DeviceRecord[]>([])
  const [loading, setLoading] = useState(true)
  const [expandedMac, setExpandedMac] = useState<string | null>(null)
  const [training, setTraining] = useState(false)
  const activeRef = useRef(true)

  useEffect(() => {
    activeRef.current = true
    async function load() {
      try {
        const [dash, devs] = await Promise.all([api.qosDashboard(), api.devices()])
        if (!activeRef.current) return
        setData(dash)
        setDevices(devs)
      } catch {
        // backend may not be reachable
      }
      setLoading(false)
    }
    load()
    const interval = setInterval(load, 5000)
    return () => { activeRef.current = false; clearInterval(interval) }
  }, [])

  async function refresh() {
    try {
      const [dash, devs] = await Promise.all([api.qosDashboard(), api.devices()])
      setData(dash)
      setDevices(devs)
    } catch {}
  }

  async function handleTrain() {
    setTraining(true)
    try {
      await api.trainQoS()
      await refresh()
    } catch {}
    setTraining(false)
  }

  async function handleSetPriority(mac: string, priority: number) {
    await api.setDevicePriority(mac, priority)
    await refresh()
  }

  async function handleClearRule(mac: string) {
    await api.clearDeviceRule(mac)
    await refresh()
  }

  async function handleToggleAutoApply(enabled: boolean) {
    await api.setAutoApply(enabled)
    await refresh()
  }

  const activityCounts = useMemo(() => {
    const counts: Record<string, number> = {}
    data?.devices.forEach((d) => {
      counts[d.activity] = (counts[d.activity] || 0) + 1
    })
    return counts
  }, [data?.devices])

  const deviceMap = useMemo(() => new Map(devices.map((d) => [d.mac, d])), [devices])

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-2xl font-bold tracking-tight">
            <span className="bg-gradient-to-r from-emerald-400 to-teal-300 bg-clip-text text-transparent">
              AI Quality of Service
            </span>
          </h1>
          <p className="text-sm text-muted-foreground mt-0.5">
            Intelligent traffic classification and bandwidth prioritization
          </p>
        </div>
        <div className="flex items-center gap-2">
          <button
            onClick={handleTrain}
            disabled={training || !data || (data.status.pending_samples ?? 0) < (data.status.training_min ?? 50)}
            className="flex items-center gap-2 rounded-lg bg-violet-500/10 px-3 py-1.5 text-xs font-medium text-violet-400 hover:bg-violet-500/20 transition-colors disabled:opacity-50"
          >
            {training ? <Loader2 className="h-3.5 w-3.5 animate-spin" /> : <BrainCircuit className="h-3.5 w-3.5" />}
            {training ? "Training..." : "Train Classifier"}
          </button>
        </div>
      </div>

      {loading ? (
        <div className="space-y-4">
          {Array.from({ length: 3 }).map((_, i) => (
            <Skeleton key={i} className="h-24 rounded-xl bg-white/5" />
          ))}
        </div>
      ) : !data ? (
        <Card>
          <CardContent className="flex flex-col items-center justify-center py-16 text-muted-foreground">
            <Shield className="h-10 w-10 mb-3 opacity-30" />
            <p className="text-sm font-medium">Could not connect to backend</p>
            <p className="text-xs mt-1">Make sure the backend is running</p>
          </CardContent>
        </Card>
      ) : (
        <>
          <div className="grid grid-cols-2 sm:grid-cols-4 gap-3">
            <StatusCard
              label="Trained"
              value={data.status.trained ? "Yes" : "No"}
              icon={<BrainCircuit className="h-3.5 w-3.5 text-violet-400" />}
            />
            <StatusCard
              label="Devices Tracked"
              value={data.status.device_count}
              icon={<Wifi className="h-3.5 w-3.5 text-emerald-400" />}
            />
            <StatusCard
              label="Training Samples"
              value={`${data.status.pending_samples}/${data.status.training_min}`}
              icon={<Settings className="h-3.5 w-3.5 text-amber-400" />}
            />
            <StatusCard
              label="Auto Apply"
              value={data.status.auto_apply ? "On" : "Off"}
              icon={<Zap className="h-3.5 w-3.5 text-sky-400" />}
              action={
                <button
                  onClick={() => handleToggleAutoApply(!data.status.auto_apply)}
                  className={`ml-auto rounded-md px-2 py-0.5 text-[10px] font-medium transition-colors ${
                    data.status.auto_apply
                      ? "bg-emerald-500/10 text-emerald-400 hover:bg-emerald-500/20"
                      : "bg-white/5 text-muted-foreground hover:bg-white/10"
                  }`}
                >
                  {data.status.auto_apply ? "Disable" : "Enable"}
                </button>
              }
            />
          </div>

          <Card className="shadow-lg">
            <CardHeader className="pb-3">
              <CardTitle className="text-sm font-semibold flex items-center gap-2">
                <div className="flex h-6 w-6 items-center justify-center rounded-lg bg-emerald-500/10">
                  <Activity className="h-3 w-3 text-emerald-400" />
                </div>
                Activity Distribution
              </CardTitle>
            </CardHeader>
            <CardContent>
              <div className="flex gap-3 flex-wrap">
                {(Object.keys(ACTIVITY_CONFIG) as ActivityType[]).map((act) => {
                  const cfg = ACTIVITY_CONFIG[act]
                  const count = activityCounts[act] || 0
                  const total = data.devices.length || 1
                  return (
                    <div
                      key={act}
                      className={`flex items-center gap-2 rounded-lg px-3 py-2 border border-white/5 ${cfg.bg}`}
                    >
                      <span className={cfg.color}>{cfg.icon}</span>
                      <div>
                        <p className="text-xs font-medium">{cfg.label}</p>
                        <p className="text-[10px] text-muted-foreground font-mono">
                          {count} device{count !== 1 ? "s" : ""} ({((count / total) * 100).toFixed(0)}%)
                        </p>
                      </div>
                    </div>
                  )
                })}
              </div>
            </CardContent>
          </Card>

          <div className="space-y-3">
            <h2 className="text-sm font-semibold text-muted-foreground uppercase tracking-wider">
              Device Activity & Priority
            </h2>
            {data.devices.length === 0 ? (
              <Card>
                <CardContent className="flex flex-col items-center justify-center py-12 text-muted-foreground">
                  <Wifi className="h-8 w-8 mb-3 opacity-30" />
                  <p className="text-sm font-medium">No devices tracked yet</p>
                  <p className="text-xs mt-1">QoS data will appear after a few collection cycles</p>
                </CardContent>
              </Card>
            ) : (
              [...data.devices]
                .sort((a, b) => a.priority - b.priority)
                .map((dev) => {
                  const actCfg = ACTIVITY_CONFIG[dev.activity]
                  const priLabel = PRIORITY_LABELS[dev.priority]
                  const deviceInfo = deviceMap.get(dev.mac)
                  const isExpanded = expandedMac === dev.mac

                  return (
                    <Card key={dev.mac} className="shadow-lg">
                      <div
                        className="flex items-center justify-between px-4 py-3 cursor-pointer hover:bg-white/[0.02] transition-colors"
                        onClick={() => setExpandedMac(isExpanded ? null : dev.mac)}
                      >
                        <div className="flex items-center gap-3">
                          <div className={`flex h-8 w-8 items-center justify-center rounded-lg ${actCfg.bg}`}>
                            <span className={actCfg.color}>{actCfg.icon}</span>
                          </div>
                          <div>
                            <p className="text-sm font-medium">
                              {deviceInfo?.hostname || deviceInfo?.remark || dev.mac}
                            </p>
                            <p className="text-[10px] text-muted-foreground font-mono">{dev.mac}</p>
                          </div>
                          <Badge className={`${actCfg.bg} ${actCfg.color} border-white/10 text-[10px]`}>
                            {actCfg.label}
                          </Badge>
                          {dev.user_override && (
                            <Badge className="bg-amber-500/10 text-amber-400 border-amber-500/20 text-[10px]">
                              Custom
                            </Badge>
                          )}
                        </div>
                        <div className="flex items-center gap-4">
                          <div className="text-right hidden sm:block">
                            <p className="text-[10px] text-muted-foreground">Confidence</p>
                            <p className="text-xs font-mono font-bold">
                              {(dev.confidence * 100).toFixed(0)}%
                            </p>
                          </div>
                          <div className="text-right hidden sm:block">
                            <p className="text-[10px] text-muted-foreground">Priority</p>
                            <p className={`text-xs font-mono font-bold ${priLabel.color}`}>
                              P{dev.priority} {priLabel.label}
                            </p>
                          </div>
                          <div className="text-right hidden sm:block">
                            <p className="text-[10px] text-muted-foreground">Recommended</p>
                            <p className="text-xs font-mono font-bold">
                              {dev.recommended_down.toFixed(0)} KB/s
                            </p>
                          </div>
                          <ChevronDown
                            className={`h-4 w-4 text-muted-foreground transition-transform ${isExpanded ? "rotate-180" : ""}`}
                          />
                        </div>
                      </div>

                      {isExpanded && (
                        <div className="px-4 pb-4 space-y-4 border-t border-white/5 pt-3">
                          <div className="grid grid-cols-2 sm:grid-cols-4 gap-3">
                            <div className="rounded-lg bg-white/3 p-2.5 border border-white/5">
                              <p className="text-[10px] uppercase tracking-wider text-muted-foreground mb-0.5">IP</p>
                              <p className="text-xs font-mono font-bold">{deviceInfo?.ip || "—"}</p>
                            </div>
                            <div className="rounded-lg bg-white/3 p-2.5 border border-white/5">
                              <p className="text-[10px] uppercase tracking-wider text-muted-foreground mb-0.5">Type</p>
                              <p className="text-xs font-mono font-bold">{deviceInfo?.conn_type || "—"}</p>
                            </div>
                            <div className="rounded-lg bg-white/3 p-2.5 border border-white/5">
                              <p className="text-[10px] uppercase tracking-wider text-muted-foreground mb-0.5">Rec. Upload</p>
                              <p className="text-xs font-mono font-bold">{dev.recommended_up.toFixed(1)} KB/s</p>
                            </div>
                            <div className="rounded-lg bg-white/3 p-2.5 border border-white/5">
                              <p className="text-[10px] uppercase tracking-wider text-muted-foreground mb-0.5">Rec. Download</p>
                              <p className="text-xs font-mono font-bold">{dev.recommended_down.toFixed(1)} KB/s</p>
                            </div>
                          </div>

                          <div>
                            <p className="text-[10px] uppercase tracking-wider text-muted-foreground mb-2">
                              Set Priority
                            </p>
                            <div className="flex gap-2 flex-wrap">
                              {Object.entries(PRIORITY_LABELS).map(([p, cfg]) => (
                                <button
                                  key={p}
                                  onClick={() => handleSetPriority(dev.mac, Number(p))}
                                  className={`rounded-lg px-3 py-1.5 text-[10px] font-medium border transition-colors ${
                                    dev.priority === Number(p)
                                      ? "border-emerald-500/30 bg-emerald-500/10 text-emerald-400"
                                      : "border-white/5 bg-white/3 text-muted-foreground hover:bg-white/5"
                                  }`}
                                >
                                  P{p} {cfg.label}
                                </button>
                              ))}
                              {dev.user_override && (
                                <button
                                  onClick={() => handleClearRule(dev.mac)}
                                  className="rounded-lg px-3 py-1.5 text-[10px] font-medium border border-white/5 bg-white/3 text-muted-foreground hover:bg-rose-500/10 hover:text-rose-400 transition-colors"
                                >
                                  Clear Rule
                                </button>
                              )}
                            </div>
                          </div>
                        </div>
                      )}
                    </Card>
                  )
                })
            )}
          </div>
        </>
      )}
    </div>
  )
}

function StatusCard({
  label,
  value,
  icon,
  action,
}: {
  label: string
  value: string | number
  icon: React.ReactNode
  action?: React.ReactNode
}) {
  return (
    <div className="rounded-lg bg-white/3 p-3 border border-white/5">
      <div className="flex items-center gap-2 mb-1">
        {icon}
        <p className="text-[10px] uppercase tracking-wider text-muted-foreground">{label}</p>
        {action}
      </div>
      <p className="font-bold text-sm">{value}</p>
    </div>
  )
}

function Activity({ className }: { className?: string }) {
  return (
    <svg
      xmlns="http://www.w3.org/2000/svg"
      viewBox="0 0 24 24"
      fill="none"
      stroke="currentColor"
      strokeWidth={2}
      strokeLinecap="round"
      strokeLinejoin="round"
      className={className}
    >
      <path d="M22 12h-2.48a2 2 0 0 0-1.93 1.46l-2.35 8.36a.25.25 0 0 1-.48 0L9.24 2.18a.25.25 0 0 0-.48 0l-2.35 8.36A2 2 0 0 1 4.49 12H2" />
    </svg>
  )
}
