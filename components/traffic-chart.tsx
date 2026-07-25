"use client"

import {
  Card,
  CardContent,
  CardHeader,
  CardTitle,
} from "@/components/ui/card"
import {
  LineChart,
  Line,
  XAxis,
  YAxis,
  CartesianGrid,
  Tooltip,
  ResponsiveContainer,
  Legend,
} from "recharts"
import type { NetworkStatsRow } from "@/lib/types"

function formatTime(ts: string) {
  const d = new Date(ts)
  return d.toLocaleTimeString([], { hour: "2-digit", minute: "2-digit", second: "2-digit" })
}

export function TrafficChart({ data }: { data: NetworkStatsRow[] }) {
  const chartData = data.map((d) => ({
    time: formatTime(d.timestamp),
    "Download": d.total_down,
    "Upload": d.total_up,
    devices: d.device_count,
  }))

  return (
    <Card className="shadow-lg">
      <CardHeader>
        <CardTitle className="text-sm font-semibold tracking-wide uppercase text-muted-foreground">
          Network Traffic
        </CardTitle>
      </CardHeader>
      <CardContent>
        {chartData.length === 0 ? (
          <div className="flex h-[300px] items-center justify-center text-muted-foreground">
            Waiting for data...
          </div>
        ) : (
          <ResponsiveContainer width="100%" height={350}>
            <LineChart data={chartData}>
              <CartesianGrid strokeDasharray="3 3" stroke="oklch(1 0 0 / 5%)" />
              <XAxis
                dataKey="time"
                tick={{ fontSize: 10, fill: "oklch(0.6 0 0)" }}
                axisLine={{ stroke: "oklch(1 0 0 / 8%)" }}
                tickLine={false}
              />
              <YAxis
                tick={{ fontSize: 10, fill: "oklch(0.6 0 0)" }}
                axisLine={{ stroke: "oklch(1 0 0 / 8%)" }}
                tickLine={false}
              />
              <Tooltip
                contentStyle={{
                  backgroundColor: "oklch(0.18 0.01 260 / 90%)",
                  border: "1px solid oklch(1 0 0 / 10%)",
                  borderRadius: "12px",
                  fontSize: "12px",
                  backdropFilter: "blur(12px)",
                  boxShadow: "0 8px 32px oklch(0 0 0 / 30%)",
                }}
                labelStyle={{ color: "oklch(0.7 0 0)" }}
                itemStyle={{ color: "oklch(0.9 0 0)" }}
              />
              <Legend
                wrapperStyle={{ fontSize: "11px", paddingTop: "8px" }}
              />
              <Line
                type="monotone"
                dataKey="Download"
                stroke="oklch(0.72 0.19 160)"
                strokeWidth={2}
                dot={false}
                activeDot={{ r: 4, fill: "oklch(0.72 0.19 160)", stroke: "oklch(0.72 0.19 160 / 30%)", strokeWidth: 6 }}
              />
              <Line
                type="monotone"
                dataKey="Upload"
                stroke="oklch(0.75 0.15 80)"
                strokeWidth={2}
                dot={false}
                activeDot={{ r: 4, fill: "oklch(0.75 0.15 80)", stroke: "oklch(0.75 0.15 80 / 30%)", strokeWidth: 6 }}
              />
            </LineChart>
          </ResponsiveContainer>
        )}
      </CardContent>
    </Card>
  )
}
