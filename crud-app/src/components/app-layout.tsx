'use client'

import { ThemeProvider } from './theme-provider'
import { Toaster } from './ui/sonner'
import { AppHeader } from '@/components/app-header'
import React from 'react'
import { AppFooter } from '@/components/app-footer'
import { ClusterUiChecker } from '@/features/cluster/ui/cluster-ui-checker'
import { AccountUiChecker } from '@/features/account/ui/account-ui-checker'

export function AppLayout({
  children,
  links,
}: {
  children: React.ReactNode
  links: { label: string; path: string }[]
}) {
  return (
    <ThemeProvider attribute="class" defaultTheme="system" enableSystem disableTransitionOnChange>
      <div className="flex flex-col min-h-screen bg-background">
        <AppHeader links={links} />
        <main className="flex-grow container mx-auto px-4 py-8">
          <div className="max-w-4xl mx-auto">
            <div className="mb-8">
              <ClusterUiChecker>
                <AccountUiChecker />
              </ClusterUiChecker>
            </div>
            <div className="bg-card rounded-lg border border-border shadow-sm p-6">
              {children}
            </div>
          </div>
        </main>
        <AppFooter />
      </div>
      <Toaster closeButton position="top-center" />
    </ThemeProvider>
  )
}
