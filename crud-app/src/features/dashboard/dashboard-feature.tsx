"use client";

import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card'
import { ArrowRight, BookOpen, CookingPot, Droplets, LucideWallet, MessageCircleQuestion } from 'lucide-react'
import { useState } from 'react'
import { AppHero } from '@/components/app-hero'
import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import { useSolana } from '@/components/solana/use-solana'
import { PublicKey } from '@solana/web3.js'
import { toast } from 'sonner'
import { getProgramFromWalletUi, SystemProgram } from '@/lib/anchor'

const primary: {
  label: string
  href: string
  description: string
  icon: React.ReactNode
}[] = [
    {
      label: 'Solana Docs',
      href: 'https://solana.com/docs',
      description: 'The official documentation. Your first stop for understanding the Solana ecosystem.',
      icon: <BookOpen className="w-8 h-8 text-purple-400" />,
    },
    {
      label: 'Solana Cookbook',
      href: 'https://solana.com/developers/cookbook/',
      description: 'Practical examples and code snippets for common tasks when building on Solana.',
      icon: <CookingPot className="w-8 h-8 text-green-400" />,
    },
  ]

const secondary: {
  label: string
  href: string
  icon: React.ReactNode
}[] = [
    {
      label: 'Solana Faucet',
      href: 'https://faucet.solana.com/',
      icon: <Droplets className="w-5 h-5 text-green-400" />,
    },
    {
      label: 'Solana Stack Overflow',
      href: 'https://solana.stackexchange.com/',
      icon: <MessageCircleQuestion className="w-5 h-5 text-orange-400" />,
    },
    {
      label: 'Wallet UI Docs',
      href: 'https://wallet-ui.dev',
      icon: <LucideWallet className="w-5 h-5 text-blue-400" />,
    },
  ]

export default function DashboardFeature() {
  const sol = useSolana()
  const account = sol.account
  const [title, setTitle] = useState('')
  const [category, setCategory] = useState('General')
  const [content, setContent] = useState('')

  async function onInitProfile() {
    if (!account?.address) return
    try {
      const program = await getProgramFromWalletUi(sol)
      const ownerPk = new PublicKey(account.address)
      const [userProfile] = PublicKey.findProgramAddressSync(
        [Buffer.from('profile'), ownerPk.toBuffer()],
        program.programId,
      )
      await program.methods
        .initializeUserProfile()
        .accounts({ owner: ownerPk, userProfile, systemProgram: SystemProgram.programId })
        .rpc()
      toast.success('Profile initialized')
    } catch (e: any) {
      toast.error(e?.message ?? 'Failed to initialize profile')
    }
  }

  async function onCreate() {
    if (!account?.address) return
    try {
      const program = await getProgramFromWalletUi(sol)
      const ownerPk = new PublicKey(account.address)
      const [journalEntry] = PublicKey.findProgramAddressSync(
        [Buffer.from(title), ownerPk.toBuffer()],
        program.programId,
      )
      const [userProfile] = PublicKey.findProgramAddressSync(
        [Buffer.from('profile'), ownerPk.toBuffer()],
        program.programId,
      )
      await program.methods
        .createJournalEntry(title, content, category)
        .accounts({ owner: ownerPk, journalEntry, userProfile, systemProgram: SystemProgram.programId })
        .rpc()
      toast.success('Entry created')
    } catch (e: any) {
      toast.error(e?.message ?? 'Failed to create entry')
    }
  }
  return (
    <div>
      <AppHero title="gm" subtitle="Say hi to your new Solana app." />
      <div className="max-w-5xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="mb-8 grid gap-2 max-w-md">
          <Button onClick={onInitProfile} disabled={!account?.address}>Initialize Profile</Button>
          <Input placeholder="Title" value={title} onChange={(e) => setTitle(e.target.value)} />
          <Input placeholder="Category" value={category} onChange={(e) => setCategory(e.target.value)} />
          <Input placeholder="Content" value={content} onChange={(e) => setContent(e.target.value)} />
          <Button onClick={onCreate} disabled={!account?.address}>Create Entry</Button>
        </div>
        <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
          {primary.map((link) => (
            <a key={link.label} href={link.href} target="_blank" rel="noopener noreferrer" className="block group">
              <Card className="h-full flex flex-col transition-all duration-200 ease-in-out group-hover:border-primary group-hover:shadow-lg group-hover:-translate-y-1">
                <CardHeader className="flex-row items-center gap-4">
                  {link.icon}
                  <div>
                    <CardTitle className="group-hover:text-primary transition-colors">{link.label}</CardTitle>
                  </div>
                </CardHeader>
                <CardContent className="flex-grow">
                  <p className="text-muted-foreground">{link.description}</p>
                </CardContent>
              </Card>
            </a>
          ))}
        </div>
        <div className="mt-8">
          <Card>
            <CardHeader>
              <CardTitle>More Resources</CardTitle>
              <CardDescription>Expand your knowledge with these community and support links.</CardDescription>
            </CardHeader>
            <CardContent>
              <ul className="space-y-4">
                {secondary.map((link) => (
                  <li key={link.label}>
                    <a
                      href={link.href}
                      className="flex items-center gap-4 group rounded-md p-2 -m-2 hover:bg-muted transition-colors"
                      target="_blank"
                      rel="noopener noreferrer"
                    >
                      {link.icon}
                      <span className="flex-grow text-muted-foreground group-hover:text-foreground transition-colors">
                        {link.label}
                      </span>
                      <ArrowRight className="w-4 h-4 text-muted-foreground opacity-0 group-hover:opacity-100 transition-opacity" />
                    </a>
                  </li>
                ))}
              </ul>
            </CardContent>
          </Card>
        </div>
      </div>
    </div>
  )
}
