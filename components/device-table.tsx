"use client"

import { useState, useCallback, useRef, useEffect } from "react"
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table"
import { Badge } from "@/components/ui/badge"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu"
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogDescription,
  DialogFooter,
} from "@/components/ui/dialog"
import { Wifi, WifiOff, Shield, MoreVertical, Ban, Gauge, Loader2 } from "lucide-react"
import type { DeviceRecord } from "@/lib/types"
import { api } from "@/lib/api"

function timeSince(ts: string) {
  const diff = Date.now() - new Date(ts).getTime()
  const mins = Math.floor(diff / 60000)
  if (mins < 1) return "just now"
  if (mins < 60) return `${mins}m ago`
  const hours = Math.floor(mins / 60)
  if (hours < 24) return `${hours}h ago`
  return `${Math.floor(hours / 24)}d ago`
}

function riskBadge(score: number) {
  if (score > 0.7) return <Badge variant="destructive">High</Badge>
  if (score > 0.3) return <Badge variant="default">Medium</Badge>
  return <Badge variant="secondary">Low</Badge>
}

export function DeviceTable({ devices }: { devices: DeviceRecord[] }) {
  const [actionMac, setActionMac] = useState<string | null>(null)
  const [actionLoading, setActionLoading] = useState(false)
  const [bandwidthDialog, setBandwidthDialog] = useState<string | null>(null)
  const [upLimit, setUpLimit] = useState("")
  const [downLimit, setDownLimit] = useState("")
  const [toast, setToast] = useState<{ message: string; type: "success" | "error" } | null>(null)
  const toastTimer = useRef<ReturnType<typeof setTimeout>>(undefined)

  useEffect(() => () => clearTimeout(toastTimer.current), [])

  const showToast = useCallback((message: string, type: "success" | "error") => {
    clearTimeout(toastTimer.current)
    setToast({ message, type })
    toastTimer.current = setTimeout(() => setToast(null), 3000)
  }, [])

  const handleBlock = async (mac: string) => {
    setActionMac(mac)
    setActionLoading(true)
    try {
      const res = await api.blockDevice(mac)
      showToast(res.ok ? "Device blocked" : res.message, res.ok ? "success" : "error")
    } catch {
      showToast("Failed to block device", "error")
    }
    if (mac) {
      setActionLoading(false)
      setActionMac(null)
    }
  }

  const handleUnblock = async (mac: string) => {
    setActionMac(mac)
    setActionLoading(true)
    try {
      const res = await api.unblockDevice(mac)
      showToast(res.ok ? "Device unblocked" : res.message, res.ok ? "success" : "error")
    } catch {
      showToast("Failed to unblock device", "error")
    }
    if (mac) {
      setActionLoading(false)
      setActionMac(null)
    }
  }

  const handleBandwidth = async () => {
    if (!bandwidthDialog) return
    setActionLoading(true)
    try {
      const res = await api.setBandwidth(bandwidthDialog, Number(upLimit) || 0, Number(downLimit) || 0)
      showToast(res.ok ? "Bandwidth updated" : res.message, res.ok ? "success" : "error")
    } catch {
      showToast("Failed to update bandwidth", "error")
    }
    setActionLoading(false)
    setBandwidthDialog(null)
    setUpLimit("")
    setDownLimit("")
  }

  return (
    <>
      <Card className="shadow-lg">
        <CardHeader>
          <CardTitle className="text-sm font-semibold tracking-wide uppercase text-muted-foreground">
            All Devices ({devices.length})
          </CardTitle>
        </CardHeader>
        <CardContent>
          <Table>
            <TableHeader>
              <TableRow className="border-white/5 hover:bg-transparent">
                <TableHead className="text-[10px] uppercase tracking-widest text-muted-foreground/60">Device</TableHead>
                <TableHead className="text-[10px] uppercase tracking-widest text-muted-foreground/60">IP</TableHead>
                <TableHead className="text-[10px] uppercase tracking-widest text-muted-foreground/60">MAC</TableHead>
                <TableHead className="text-[10px] uppercase tracking-widest text-muted-foreground/60">Type</TableHead>
                <TableHead className="text-[10px] uppercase tracking-widest text-muted-foreground/60">Risk</TableHead>
                <TableHead className="text-[10px] uppercase tracking-widest text-muted-foreground/60 text-right">Last Seen</TableHead>
                <TableHead className="text-[10px] uppercase tracking-widest text-muted-foreground/60 w-10" />
              </TableRow>
            </TableHeader>
            <TableBody>
              {devices.length === 0 ? (
                <TableRow>
                  <TableCell colSpan={7} className="text-center text-muted-foreground py-8">
                    No devices found
                  </TableCell>
                </TableRow>
              ) : (
                devices.map((d) => (
                  <TableRow key={d.mac} className="border-white/5 hover:bg-white/3 transition-colors">
                    <TableCell>
                      <div className="flex items-center gap-2">
                        {d.conn_type === "wifi" ? (
                          <div className="flex h-6 w-6 items-center justify-center rounded-md bg-emerald-500/10">
                            <Wifi className="h-3 w-3 text-emerald-400" />
                          </div>
                        ) : (
                          <div className="flex h-6 w-6 items-center justify-center rounded-md bg-white/5">
                            <WifiOff className="h-3 w-3 text-muted-foreground" />
                          </div>
                        )}
                        <div>
                          <span className="font-medium text-sm">
                            {d.remark || d.hostname || "Unknown"}
                          </span>
                          {d.remark && d.hostname && d.remark !== d.hostname && (
                            <span className="text-[10px] text-muted-foreground ml-1">
                              ({d.hostname})
                            </span>
                          )}
                        </div>
                      </div>
                    </TableCell>
                    <TableCell className="font-mono text-xs text-muted-foreground">{d.ip}</TableCell>
                    <TableCell className="font-mono text-[10px] text-muted-foreground/60">{d.mac}</TableCell>
                    <TableCell>
                      <Badge variant="outline" className="text-[10px] border-white/10 bg-white/3">
                        {d.conn_type}
                      </Badge>
                    </TableCell>
                    <TableCell>{riskBadge(d.risk_score)}</TableCell>
                    <TableCell className="text-right text-xs text-muted-foreground">
                      {timeSince(d.last_seen)}
                    </TableCell>
                    <TableCell>
                      <DropdownMenu>
                        <DropdownMenuTrigger className="inline-flex h-7 w-7 items-center justify-center rounded-md hover:bg-white/10 transition-colors">
                          <MoreVertical className="h-3.5 w-3.5 text-muted-foreground" />
                        </DropdownMenuTrigger>
                        <DropdownMenuContent align="end" className="bg-black/80 backdrop-blur-xl border-white/10">
                          <DropdownMenuItem
                            onClick={() => handleBlock(d.mac)}
                            disabled={actionLoading && actionMac === d.mac}
                            className="gap-2 text-red-400 focus:text-red-300"
                          >
                            {actionLoading && actionMac === d.mac ? (
                              <Loader2 className="h-3.5 w-3.5 animate-spin" />
                            ) : (
                              <Ban className="h-3.5 w-3.5" />
                            )}
                            Block Device
                          </DropdownMenuItem>
                          <DropdownMenuItem
                            onClick={() => handleUnblock(d.mac)}
                            disabled={actionLoading && actionMac === d.mac}
                            className="gap-2 text-emerald-400 focus:text-emerald-300"
                          >
                            {actionLoading && actionMac === d.mac ? (
                              <Loader2 className="h-3.5 w-3.5 animate-spin" />
                            ) : (
                              <Shield className="h-3.5 w-3.5" />
                            )}
                            Unblock Device
                          </DropdownMenuItem>
                          <DropdownMenuItem
                            onClick={() => setBandwidthDialog(d.mac)}
                            className="gap-2"
                          >
                            <Gauge className="h-3.5 w-3.5" />
                            Set Bandwidth Limit
                          </DropdownMenuItem>
                        </DropdownMenuContent>
                      </DropdownMenu>
                    </TableCell>
                  </TableRow>
                ))
              )}
            </TableBody>
          </Table>
        </CardContent>
      </Card>

      <Dialog open={!!bandwidthDialog} onOpenChange={(open) => { if (!open) { setBandwidthDialog(null); setUpLimit(""); setDownLimit("") } }}>
        <DialogContent className="bg-black/80 backdrop-blur-xl border-white/10">
          <DialogHeader>
            <DialogTitle>Set Bandwidth Limit</DialogTitle>
            <DialogDescription className="text-muted-foreground">
              Limit upload/download speed for this device (in KB/s). Set 0 for no limit.
            </DialogDescription>
          </DialogHeader>
          <div className="space-y-4 py-4">
            <div className="space-y-2">
              <label className="text-xs text-muted-foreground">Upload Limit (KB/s)</label>
              <Input
                type="number"
                value={upLimit}
                onChange={(e) => setUpLimit(e.target.value)}
                placeholder="0 = no limit"
                className="bg-white/5 border-white/10"
              />
            </div>
            <div className="space-y-2">
              <label className="text-xs text-muted-foreground">Download Limit (KB/s)</label>
              <Input
                type="number"
                value={downLimit}
                onChange={(e) => setDownLimit(e.target.value)}
                placeholder="0 = no limit"
                className="bg-white/5 border-white/10"
              />
            </div>
          </div>
          <DialogFooter>
            <Button
              variant="ghost"
              onClick={() => { setBandwidthDialog(null); setUpLimit(""); setDownLimit("") }}
              className="text-muted-foreground"
            >
              Cancel
            </Button>
            <Button
              onClick={handleBandwidth}
              disabled={actionLoading}
              className="bg-emerald-500 hover:bg-emerald-600 text-white"
            >
              {actionLoading && <Loader2 className="h-4 w-4 animate-spin mr-2" />}
              Apply
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>

      {toast && (
        <div className={`fixed bottom-6 right-6 z-50 px-4 py-2 rounded-lg text-sm font-medium backdrop-blur-xl border ${
          toast.type === "success"
            ? "bg-emerald-500/20 border-emerald-500/30 text-emerald-300"
            : "bg-red-500/20 border-red-500/30 text-red-300"
        }`}>
          {toast.message}
        </div>
      )}
    </>
  )
}
