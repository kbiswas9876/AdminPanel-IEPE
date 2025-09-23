"use client"

import { usePathname } from "next/navigation"
import { MainLayout } from "./main-layout"
import { ProtectedRoute } from "@/components/auth/protected-route"
import { SimplePageTransition } from "./simple-page-transition"

interface ClientShellProps {
  children: React.ReactNode
}

export default function ClientShell({ children }: ClientShellProps) {
  const pathname = usePathname()

  // Bypass the admin chrome for public/auth pages
  const isPublic = pathname?.startsWith("/login")

  if (isPublic) {
    return <>{children}</>
  }

  // Persist MainLayout + ProtectedRoute across admin routes
  return (
    <ProtectedRoute>
      <MainLayout>
        <SimplePageTransition>{children}</SimplePageTransition>
      </MainLayout>
    </ProtectedRoute>
  )
}
