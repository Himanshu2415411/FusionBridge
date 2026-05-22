"use client"

import { AuthProvider } from "@/contexts/AuthContext"
import { Toaster } from "@/components/ui/toaster"
import { QueryProvider } from "@/lib/react-query"
import { ThemeProvider } from "@/components/theme-provider"

export default function Providers({ children }) {
  return (
    <QueryProvider>
      <ThemeProvider attribute="class" defaultTheme="light" enableSystem>
        <AuthProvider>
          {children}
          <Toaster />
        </AuthProvider>
      </ThemeProvider>
    </QueryProvider>
  )
}
