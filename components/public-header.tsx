'use client'

import Link from 'next/link'
import { Search } from 'lucide-react'
import { Button } from '@/components/ui/button'
import { ThemeToggle } from '@/components/theme-toggle'
import { ArtiosLogo } from '@/components/artios-logo'

export function PublicHeader() {
  return (
    <header className="sticky top-0 z-50 w-full border-b border-border bg-background/95 backdrop-blur supports-[backdrop-filter]:bg-background/60">
      <div className="container mx-auto flex h-16 items-center justify-between px-4">
        <Link href="/" className="flex items-center gap-3">
          <div className="flex items-center justify-center rounded-lg bg-primary p-1.5">
            <ArtiosLogo size={28} color="white" />
          </div>
          <div className="hidden sm:block">
            <span className="text-xl font-semibold tracking-tight">Artios</span>
            <span className="block text-xs text-muted-foreground -mt-1">Agenda online</span>
          </div>
        </Link>

        <nav className="flex items-center gap-2">
          <Button variant="ghost" asChild>
            <Link href="/consultar" className="flex items-center gap-2">
              <Search className="h-4 w-4" />
              <span className="hidden sm:inline">Consultar turno</span>
            </Link>
          </Button>
          <Button asChild>
            <Link href="/">Reservar turno</Link>
          </Button>
          <ThemeToggle />
        </nav>
      </div>
    </header>
  )
}
