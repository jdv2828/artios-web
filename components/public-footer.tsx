import Link from 'next/link'
import { ArtiosLogo } from '@/components/artios-logo'

export function PublicFooter() {
  return (
    <footer className="border-t border-border bg-card">
      <div className="container mx-auto px-4 py-8">
        <div className="flex flex-col items-center justify-between gap-4 sm:flex-row">
          <div className="flex items-center gap-3">
            <div className="flex items-center justify-center rounded-lg bg-primary p-1">
              <ArtiosLogo size={24} color="white" />
            </div>
            <div>
              <span className="font-medium">Artios</span>
              <span className="block text-xs text-muted-foreground">Agenda online</span>
            </div>
          </div>
          
          <nav className="flex gap-6 text-sm text-muted-foreground">
            <Link href="/" className="hover:text-foreground transition-colors">
              Reservar
            </Link>
            <Link href="/consultar" className="hover:text-foreground transition-colors">
              Consultar
            </Link>
            <Link href="/empleados/login" className="hover:text-foreground transition-colors">
              Empleados
            </Link>
          </nav>
          
          <p className="text-sm text-muted-foreground">
            {new Date().getFullYear()} Artios
          </p>
        </div>
      </div>
    </footer>
  )
}
