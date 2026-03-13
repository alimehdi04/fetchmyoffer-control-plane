'use client'

import Link from 'next/link'
import { signOut } from 'next-auth/react'
import { Button } from '@/components/ui/button'
import { Bot } from 'lucide-react'

export default function Header({ session }: { session: any }) {
  return (
    <header className="sticky top-0 z-50 w-full border-b border-zinc-200 dark:border-zinc-800 bg-white/80 dark:bg-zinc-950/80 backdrop-blur-md">
      <div className="container mx-auto max-w-5xl flex h-16 items-center justify-between px-4">
        
        {/* Brand Logo - Always goes to Landing Page */}
        <Link href="/" className="flex items-center gap-2 font-bold text-xl tracking-tight text-zinc-900 dark:text-white">
          <Bot className="w-6 h-6 text-blue-600" />
          <span>FetchMyOffer</span>
        </Link>

        {/* Dynamic Navigation */}
        <nav className="flex items-center gap-4 text-sm font-medium">
          {session ? (
            <>
              <Link href="/dashboard" className="text-zinc-500 hover:text-zinc-900 dark:text-zinc-400 dark:hover:text-white transition-colors hidden sm:block">
                Dashboard
              </Link>
              <Link href="/onboarding" className="text-zinc-500 hover:text-zinc-900 dark:text-zinc-400 dark:hover:text-white transition-colors hidden sm:block">
                Infrastructure
              </Link>
              <Button variant="ghost" onClick={() => signOut({ callbackUrl: '/' })}>
                Sign Out
              </Button>
            </>
          ) : (
            <Link href="/login">
              <Button>Sign In</Button>
            </Link>
          )}
        </nav>

      </div>
    </header>
  )
}