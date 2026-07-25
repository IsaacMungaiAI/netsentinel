"use client"

import { useEffect, useState } from "react"
import { api } from "@/lib/api"
import type { DeviceRecord } from "@/lib/types"
import { DeviceTable } from "@/components/device-table"
import { Skeleton } from "@/components/ui/skeleton"

export default function DevicesPage() {
  const [devices, setDevices] = useState<DeviceRecord[] | null>(null)
  const [error, setError] = useState<string | null>(null)

  useEffect(() => {
    let active = true
    async function load() {
      try {
        const res = await api.devices()
        if (active) {
          setDevices(res)
          setError(null)
        }
      } catch {
        if (active) setError("Cannot reach backend")
      }
    }
    load()
    const interval = setInterval(load, 5000)
    return () => { active = false; clearInterval(interval) }
  }, [])

  if (error) {
    return (
      <div className="flex items-center justify-center py-20">
        <div className="glass rounded-2xl p-8 text-center">
          <p className="text-sm text-muted-foreground">{error}</p>
        </div>
      </div>
    )
  }

  return (
    <div className="space-y-6">
      <div>
        <h1 className="text-2xl font-bold tracking-tight">
          <span className="bg-gradient-to-r from-blue-400 to-violet-400 bg-clip-text text-transparent">
            Devices
          </span>
        </h1>
        <p className="text-sm text-muted-foreground mt-0.5">
          All devices connected to your network
        </p>
      </div>
      {devices === null ? (
        <Skeleton className="h-[400px] rounded-xl bg-white/5" />
      ) : (
        <DeviceTable devices={devices} />
      )}
    </div>
  )
}
