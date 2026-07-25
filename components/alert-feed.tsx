"use client"

import {
  Card,
  CardContent,
  CardHeader,
  CardTitle,
} from "@/components/ui/card"
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table"
import { Badge } from "@/components/ui/badge"
import type { AlertRecord } from "@/lib/types"
import { api } from "@/lib/api"
import { useRouter } from "next/navigation"

function severityColor(s: string) {
  switch (s) {
    case "critical":
      return "destructive"
    case "warning":
      return "default"
    default:
      return "secondary"
  }
}

function timeAgo(ts: string) {
  const diff = Date.now() - new Date(ts).getTime()
  const mins = Math.floor(diff / 60000)
  if (mins < 1) return "just now"
  if (mins < 60) return `${mins}m ago`
  const hours = Math.floor(mins / 60)
  if (hours < 24) return `${hours}h ago`
  return `${Math.floor(hours / 24)}d ago`
}

export function AlertFeed({ alerts }: { alerts: AlertRecord[] }) {
  const router = useRouter()

  async function handleResolve(id: number) {
    await api.resolveAlert(id)
    router.refresh()
  }

  return (
    <Card className="shadow-lg">
      <CardHeader>
        <CardTitle className="text-sm font-semibold tracking-wide uppercase text-muted-foreground">
          Recent Alerts
        </CardTitle>
      </CardHeader>
      <CardContent>
        {alerts.length === 0 ? (
          <p className="text-sm text-muted-foreground py-12 text-center">
            No alerts detected
          </p>
        ) : (
          <Table>
            <TableHeader>
              <TableRow className="border-white/5 hover:bg-transparent">
                <TableHead className="text-[10px] uppercase tracking-widest text-muted-foreground/60">Severity</TableHead>
                <TableHead className="text-[10px] uppercase tracking-widest text-muted-foreground/60">Type</TableHead>
                <TableHead className="text-[10px] uppercase tracking-widest text-muted-foreground/60">Description</TableHead>
                <TableHead className="text-[10px] uppercase tracking-widest text-muted-foreground/60 text-right">Time</TableHead>
                <TableHead className="text-[10px] uppercase tracking-widest text-muted-foreground/60 text-right">Action</TableHead>
              </TableRow>
            </TableHeader>
            <TableBody>
              {alerts.map((a) => (
                <TableRow key={a.id} className="border-white/5 hover:bg-white/3 transition-colors">
                  <TableCell>
                    <Badge variant={severityColor(a.severity) as "destructive" | "default" | "secondary"}>
                      {a.severity}
                    </Badge>
                  </TableCell>
                  <TableCell className="font-mono text-xs text-muted-foreground">{a.alert_type}</TableCell>
                  <TableCell className="text-sm max-w-[400px] truncate text-muted-foreground">
                    {a.description}
                  </TableCell>
                  <TableCell className="text-right text-xs text-muted-foreground whitespace-nowrap">
                    {timeAgo(a.timestamp)}
                  </TableCell>
                  <TableCell className="text-right">
                    {!a.resolved && (
                      <button
                        onClick={() => handleResolve(a.id)}
                        className="text-[10px] uppercase tracking-wider text-muted-foreground hover:text-emerald-400 transition-colors"
                      >
                        Resolve
                      </button>
                    )}
                  </TableCell>
                </TableRow>
              ))}
            </TableBody>
          </Table>
        )}
      </CardContent>
    </Card>
  )
}
