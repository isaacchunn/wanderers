import { Inter } from "next/font/google"
import { SiteHeader } from "@/components/site-header"
import "./globals.css"
import type React from "react"
import { SiteFooter } from "@/components/site-footer"

const inter = Inter({ subsets: ["latin"] })

export const metadata = {
  title: "Wanderers - Plan Your Travel Together",
  description: "Collaborate with friends and family to create the perfect travel itinerary.",
}

export default function RootLayout({
  children,
}: {
  children: React.ReactNode
}) {
  return (
    <html lang="en">
      <body className={`${inter.className} wanderers-body`}>
        <div className="relative flex min-h-screen flex-col">
          <SiteHeader />
          <main className="flex-1">{children}</main>
          <SiteFooter />
        </div>
      </body>
    </html>
  )
}