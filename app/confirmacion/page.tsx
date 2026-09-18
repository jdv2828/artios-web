import { Suspense } from 'react'

import { PublicHeader } from '@/components/public-header'
import { PublicFooter } from '@/components/public-footer'
import { Card, CardContent } from '@/components/ui/card'

function ConfirmationFallback() {
  return (
    <Card>
      <CardContent className="text-center py-16">
        Cargando confirmación...
      </CardContent>
    </Card>
  )
}

async function ConfirmationContent() {
  const { ConfirmationClient } = await import('./confirmation-client')

  return <ConfirmationClient />
}

export default function ConfirmationPage() {
  return (
    <div className="min-h-screen flex flex-col">
      <PublicHeader />
      <main className="flex-1 py-12">
        <div className="container mx-auto px-4 max-w-lg">
          <Suspense fallback={<ConfirmationFallback />}>
            <ConfirmationContent />
          </Suspense>
        </div>
      </main>
      <PublicFooter />
    </div>
  )
}
