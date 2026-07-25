"use client"

import {
  Sidebar,
  SidebarContent,
  SidebarGroup,
  SidebarGroupContent,
  SidebarGroupLabel,
  SidebarHeader,
  SidebarMenu,
  SidebarMenuButton,
  SidebarMenuItem,
  SidebarProvider,
  SidebarTrigger,
} from "@/components/ui/sidebar"
import { Separator } from "@/components/ui/separator"
import {
  LayoutDashboard,
  Monitor,
  ShieldAlert,
  Activity,
  BrainCircuit,
} from "lucide-react"
import Link from "next/link"
import { usePathname } from "next/navigation"
import { cn } from "@/lib/utils"

const items = [
  { title: "Dashboard", url: "/", icon: LayoutDashboard },
  { title: "Devices", url: "/devices", icon: Monitor },
  { title: "Alerts", url: "/alerts", icon: ShieldAlert },
  { title: "ML Models", url: "/models", icon: BrainCircuit },
]

export function AppSidebar() {
  const pathname = usePathname()

  return (
    <Sidebar className="glass-strong">
      <SidebarHeader className="border-b border-white/5 px-4 py-4">
        <div className="flex items-center gap-2">
          <div className="flex h-8 w-8 items-center justify-center rounded-lg bg-emerald-500/10">
            <Activity className="h-4 w-4 text-emerald-400" />
          </div>
          <div>
            <span className="text-base font-bold tracking-tight bg-gradient-to-r from-emerald-400 to-teal-300 bg-clip-text text-transparent">
              NetSentinel
            </span>
            <p className="text-[10px] text-muted-foreground leading-tight">Anomaly Detection</p>
          </div>
        </div>
      </SidebarHeader>
      <SidebarContent>
        <SidebarGroup>
          <SidebarGroupLabel className="text-[10px] uppercase tracking-widest text-muted-foreground/60">
            Navigation
          </SidebarGroupLabel>
          <SidebarGroupContent>
            <SidebarMenu>
              {items.map((item) => (
                <SidebarMenuItem key={item.title}>
                  <SidebarMenuButton
                    isActive={pathname === item.url}
                    tooltip={item.title}
                    render={<Link href={item.url} />}
                    className={cn(
                      "transition-all duration-200",
                      pathname === item.url
                        ? "bg-emerald-500/10 text-emerald-400 font-medium shadow-sm shadow-emerald-500/5"
                        : "hover:bg-white/5"
                    )}
                  >
                    <item.icon className="h-4 w-4" />
                    <span>{item.title}</span>
                  </SidebarMenuButton>
                </SidebarMenuItem>
              ))}
            </SidebarMenu>
          </SidebarGroupContent>
        </SidebarGroup>
      </SidebarContent>
    </Sidebar>
  )
}

export function SidebarLayout({ children }: { children: React.ReactNode }) {
  return (
    <SidebarProvider>
      <AppSidebar />
      <main className="flex-1 overflow-auto">
        <header className="flex h-14 items-center gap-2 border-b border-white/5 px-4 glass-subtle">
          <SidebarTrigger className="hover:bg-white/5" />
          <Separator className="h-6 bg-white/10" orientation="vertical" />
          <span className="text-xs font-medium text-muted-foreground tracking-wide uppercase">
            Network Monitor
          </span>
        </header>
        <div className="p-6">{children}</div>
      </main>
    </SidebarProvider>
  )
}
