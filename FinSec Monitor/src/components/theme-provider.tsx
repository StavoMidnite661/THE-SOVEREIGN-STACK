"use client"

import * as React from "react"
import { useState, useEffect } from "react"
import { ThemeProvider as NextThemesProvider } from "next-themes"
import { type ThemeProviderProps } from "next-themes"

export function ThemeProvider({ children, ...props }: ThemeProviderProps) {
  const [mounted, setMounted] = useState(false)

  useEffect(() => {
    setMounted(true)
  }, [])

  // Render children with theme context only after mounting
  // This prevents SSR from accessing localStorage
  if (!mounted) {
    return (
      <div style={{ visibility: 'hidden' }}>
        {children}
      </div>
    )
  }

  return <NextThemesProvider {...props}>{children}</NextThemesProvider>
}