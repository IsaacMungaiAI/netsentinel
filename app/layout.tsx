import { SidebarLayout } from "@/components/app-sidebar"
import type { Metadata } from "next"
import { TooltipProvider } from "@/components/ui/tooltip"
import { Geist, Geist_Mono } from "next/font/google"
import "./globals.css"

const geistSans = Geist({
  variable: "--font-geist-sans",
  subsets: ["latin"],
})

const geistMono = Geist_Mono({
  variable: "--font-geist-mono",
  subsets: ["latin"],
})

export const metadata: Metadata = {
  title: "NetSentinel - Network Anomaly Detection",
  description: "Real-time network monitoring and intrusion detection system",
}

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode
}>) {
  return (
    <html
      lang="en"
      className={`${geistSans.variable} ${geistMono.variable} h-full antialiased dark`}
    >
      <body className="min-h-full flex flex-col">
        <TooltipProvider>
          <SidebarLayout>{children}</SidebarLayout>
        </TooltipProvider>
      </body>
    </html>
  )
}
