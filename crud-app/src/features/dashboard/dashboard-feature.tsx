"use client"

import { useState } from "react"
import { Button } from "@/components/ui/button"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { Alert, AlertDescription } from "@/components/ui/alert"
import { RefreshCw, Sun, Moon, AlertCircle, Book, ChefHat, Droplets, MessageSquare, Wallet } from "lucide-react"
import { useTheme } from "next-themes"
import { useWallet } from '@solana/wallet-adapter-react'
import { WalletMultiButton } from '@solana/wallet-adapter-react-ui'

export default function DashboardFeature() {
  const { theme, setTheme } = useTheme()
  const { connected } = useWallet()
  const [isDark, setIsDark] = useState(true)

  const toggleTheme = () => {
    setIsDark(!isDark)
    setTheme(isDark ? 'light' : 'dark')
  }

  return (
    <div className={`min-h-screen bg-background text-foreground ${isDark ? "dark" : ""}`}>
      {/* Navigation Header */}
      <header className="border-b border-border bg-background">
        <div className="flex items-center justify-between px-6 py-4">
          <div className="flex items-center gap-8">
            <h1 className="text-xl font-semibold">Crudapp</h1>
            <nav className="flex items-center gap-6">
              <a href="/" className="text-foreground hover:text-muted-foreground transition-colors">
                Home
              </a>
              <a href="/account" className="text-foreground hover:text-muted-foreground transition-colors">
                Account
              </a>
            </nav>
          </div>

          <div className="flex items-center gap-3">
            <Button variant="outline" size="sm">
              Select Wallet
            </Button>
            <Button variant="outline" size="sm">
              Select Cluster
            </Button>
            <Button variant="ghost" size="sm" onClick={toggleTheme} className="p-2">
              {isDark ? <Sun className="h-4 w-4" /> : <Moon className="h-4 w-4" />}
            </Button>
          </div>
        </div>
      </header>

      {/* Error Banner */}
      <div className="px-6 py-4">
        <Alert className="border-yellow-600 bg-yellow-950/20">
          <AlertCircle className="h-4 w-4 text-yellow-500" />
          <AlertDescription className="flex items-center justify-between text-yellow-200">
            <span>Error connecting to cluster Unknown Cluster.</span>
            <Button variant="ghost" size="sm" className="text-yellow-400 hover:text-yellow-300">
              <RefreshCw className="h-4 w-4 mr-2" />
              Refresh
            </Button>
          </AlertDescription>
        </Alert>
      </div>

      {/* Main Content */}
      <main className="px-6 py-8">
        {!connected ? (
          <div className="text-center">
            <p className="text-lg text-muted-foreground">Please connect your wallet to use the CRUD App.</p>
          </div>
        ) : (
          <div className="max-w-4xl mx-auto">
            {/* Hero Section */}
            <div className="text-center mb-12">
              <h1 className="text-6xl font-bold mb-4">gm</h1>
              <p className="text-xl text-muted-foreground">Say hi to your new Solana app.</p>
            </div>

            {/* Resource Cards */}
            <div className="grid md:grid-cols-2 gap-6 mb-8">
              <Card className="bg-card border-border hover:bg-accent/50 transition-colors cursor-pointer">
                <CardHeader>
                  <div className="flex items-center gap-3">
                    <div className="p-2 rounded-lg bg-purple-500/20">
                      <Book className="h-6 w-6 text-purple-400" />
                    </div>
                    <CardTitle className="text-xl">Solana Docs</CardTitle>
                  </div>
                </CardHeader>
                <CardContent>
                  <CardDescription className="text-base leading-relaxed">
                    The official documentation. Your first stop for understanding the Solana ecosystem.
                  </CardDescription>
                </CardContent>
              </Card>

              <Card className="bg-card border-border hover:bg-accent/50 transition-colors cursor-pointer">
                <CardHeader>
                  <div className="flex items-center gap-3">
                    <div className="p-2 rounded-lg bg-green-500/20">
                      <ChefHat className="h-6 w-6 text-green-400" />
                    </div>
                    <CardTitle className="text-xl">Solana Cookbook</CardTitle>
                  </div>
                </CardHeader>
                <CardContent>
                  <CardDescription className="text-base leading-relaxed">
                    Practical examples and code snippets for common tasks when building on Solana.
                  </CardDescription>
                </CardContent>
              </Card>
            </div>

            {/* More Resources Section */}
            <Card className="bg-card border-border">
              <CardHeader>
                <CardTitle className="text-xl">More Resources</CardTitle>
                <CardDescription>Expand your knowledge with these community and support links.</CardDescription>
              </CardHeader>
              <CardContent className="space-y-4">
                <div className="flex items-center gap-3 p-3 rounded-lg hover:bg-accent/50 transition-colors cursor-pointer">
                  <div className="p-2 rounded-lg bg-green-500/20">
                    <Droplets className="h-5 w-5 text-green-400" />
                  </div>
                  <span className="text-foreground">Solana Faucet</span>
                </div>

                <div className="flex items-center gap-3 p-3 rounded-lg hover:bg-accent/50 transition-colors cursor-pointer">
                  <div className="p-2 rounded-lg bg-orange-500/20">
                    <MessageSquare className="h-5 w-5 text-orange-400" />
                  </div>
                  <span className="text-foreground">Solana Stack Overflow</span>
                </div>

                <div className="flex items-center gap-3 p-3 rounded-lg hover:bg-accent/50 transition-colors cursor-pointer">
                  <div className="p-2 rounded-lg bg-blue-500/20">
                    <Wallet className="h-5 w-5 text-blue-400" />
                  </div>
                  <span className="text-foreground">Wallet UI Docs</span>
                </div>
              </CardContent>
            </Card>
          </div>
        )}
      </main>
    </div>
  )
}
