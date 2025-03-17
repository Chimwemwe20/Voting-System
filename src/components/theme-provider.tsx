"use client"

import { ThemeProvider as NextThemesProvider } from "next-themes"
import type { ComponentPropsWithoutRef, ReactNode } from "react"

type NextThemesProviderProps = ComponentPropsWithoutRef<typeof NextThemesProvider>;

interface ThemeProviderProps extends NextThemesProviderProps {
  children: ReactNode;
}

export function ThemeProvider({ children, ...props }: ThemeProviderProps) {
  return <NextThemesProvider {...props}>{children}</NextThemesProvider>
}
