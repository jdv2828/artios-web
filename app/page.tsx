import { PublicHeader } from '@/components/public-header'
import { PublicFooter } from '@/components/public-footer'
import { BookingForm } from '@/components/booking-form'
import { Calendar, Clock, CheckCircle, Sparkles } from 'lucide-react'

export default function HomePage() {
  return (
    <div className="min-h-screen flex flex-col">
      <PublicHeader />
      
      <main className="flex-1">
        {/* Hero Section */}
        <section className="relative py-16 md:py-24 overflow-hidden">
          <div className="absolute inset-0 bg-gradient-to-br from-primary/5 via-transparent to-accent/5" />
          <div className="container mx-auto px-4 relative">
            <div className="grid gap-12 lg:grid-cols-2 lg:gap-8 items-center">
              <div className="space-y-6">
                <h1 className="text-4xl font-bold tracking-tight sm:text-5xl lg:text-6xl text-balance">
                  Tu belleza,{' '}
                  <span className="text-primary">nuestro arte</span>
                </h1>
                <p className="text-lg text-muted-foreground max-w-lg text-pretty">
                  En Artios te brindamos una experiencia simple para reservar tus turnos online. 
                  Reservá tu turno online de manera simple y rápida.
                </p>
                
                {/* Features */}
                <div className="grid gap-4 sm:grid-cols-2 pt-4">
                  <div className="flex items-start gap-3">
                    <div className="flex h-10 w-10 shrink-0 items-center justify-center rounded-lg bg-primary/10">
                      <Calendar className="h-5 w-5 text-primary" />
                    </div>
                    <div>
                      <h3 className="font-medium">Reserva 24/7</h3>
                      <p className="text-sm text-muted-foreground">
                        Agendá cuando quieras, sin restricciones
                      </p>
                    </div>
                  </div>
                  
                  <div className="flex items-start gap-3">
                    <div className="flex h-10 w-10 shrink-0 items-center justify-center rounded-lg bg-primary/10">
                      <Clock className="h-5 w-5 text-primary" />
                    </div>
                    <div>
                      <h3 className="font-medium">Horarios flexibles</h3>
                      <p className="text-sm text-muted-foreground">
                        Elegí el día y hora que más te convenga
                      </p>
                    </div>
                  </div>
                  
                  <div className="flex items-start gap-3">
                    <div className="flex h-10 w-10 shrink-0 items-center justify-center rounded-lg bg-accent/10">
                      <CheckCircle className="h-5 w-5 text-accent" />
                    </div>
                    <div>
                      <h3 className="font-medium">Confirmación inmediata</h3>
                      <p className="text-sm text-muted-foreground">
                        Recibí la confirmación de tu turno al instante
                      </p>
                    </div>
                  </div>
                  
                  <div className="flex items-start gap-3">
                    <div className="flex h-10 w-10 shrink-0 items-center justify-center rounded-lg bg-accent/10">
                      <Sparkles className="h-5 w-5 text-accent" />
                    </div>
                    <div>
                      <h3 className="font-medium">Profesionales expertos</h3>
                      <p className="text-sm text-muted-foreground">
                        Equipo capacitado en las últimas técnicas
                      </p>
                    </div>
                  </div>
                </div>
              </div>
              
              <div className="lg:pl-8">
                <BookingForm />
              </div>
            </div>
          </div>
        </section>
        
        {/* Services preview */}
        <section className="py-16 bg-card border-y border-border">
          <div className="container mx-auto px-4">
            <div className="text-center mb-12">
              <h2 className="text-3xl font-bold tracking-tight mb-4">
                Nuestros servicios
              </h2>
              <p className="text-muted-foreground max-w-2xl mx-auto">
                Ofrecemos una amplia variedad de tratamientos de belleza y estética
              </p>
            </div>
            
            <div className="grid gap-6 md:grid-cols-2 lg:grid-cols-4 max-w-5xl mx-auto">
              <div className="rounded-xl border border-border bg-background p-6 text-center hover:border-primary/50 transition-colors">
                <div className="flex h-12 w-12 mx-auto items-center justify-center rounded-full bg-primary/10 mb-4">
                  <Sparkles className="h-6 w-6 text-primary" />
                </div>
                <h3 className="font-semibold mb-2">Tratamientos Faciales</h3>
                <p className="text-sm text-muted-foreground">
                  Limpieza profunda, hidratación y rejuvenecimiento
                </p>
              </div>
              
              <div className="rounded-xl border border-border bg-background p-6 text-center hover:border-primary/50 transition-colors">
                <div className="flex h-12 w-12 mx-auto items-center justify-center rounded-full bg-accent/10 mb-4">
                  <Sparkles className="h-6 w-6 text-accent" />
                </div>
                <h3 className="font-semibold mb-2">Depilación</h3>
                <p className="text-sm text-muted-foreground">
                  Cera, láser y técnicas especializadas
                </p>
              </div>
              
              <div className="rounded-xl border border-border bg-background p-6 text-center hover:border-primary/50 transition-colors">
                <div className="flex h-12 w-12 mx-auto items-center justify-center rounded-full bg-primary/10 mb-4">
                  <Sparkles className="h-6 w-6 text-primary" />
                </div>
                <h3 className="font-semibold mb-2">Manicura y Pedicura</h3>
                <p className="text-sm text-muted-foreground">
                  Uñas semipermanentes, gel y diseños
                </p>
              </div>
              
              <div className="rounded-xl border border-border bg-background p-6 text-center hover:border-primary/50 transition-colors">
                <div className="flex h-12 w-12 mx-auto items-center justify-center rounded-full bg-accent/10 mb-4">
                  <Sparkles className="h-6 w-6 text-accent" />
                </div>
                <h3 className="font-semibold mb-2">Masajes</h3>
                <p className="text-sm text-muted-foreground">
                  Relajantes, descontracturantes y reductores
                </p>
              </div>
            </div>
          </div>
        </section>
        
        {/* How it works */}
        <section className="py-16">
          <div className="container mx-auto px-4">
            <div className="text-center mb-12">
              <h2 className="text-3xl font-bold tracking-tight mb-4">
                Reservá en 3 simples pasos
              </h2>
              <p className="text-muted-foreground max-w-2xl mx-auto">
                Sin llamadas, sin esperas. Tu turno confirmado en minutos.
              </p>
            </div>
            
            <div className="grid gap-8 md:grid-cols-3 max-w-4xl mx-auto">
              <div className="text-center">
                <div className="flex h-14 w-14 mx-auto items-center justify-center rounded-full bg-primary text-primary-foreground text-xl font-bold mb-4">
                  1
                </div>
                <h3 className="font-semibold mb-2">Elegí el servicio</h3>
                <p className="text-sm text-muted-foreground">
                  Seleccioná el tratamiento que necesitás
                </p>
              </div>
              
              <div className="text-center">
                <div className="flex h-14 w-14 mx-auto items-center justify-center rounded-full bg-primary text-primary-foreground text-xl font-bold mb-4">
                  2
                </div>
                <h3 className="font-semibold mb-2">Seleccioná fecha y hora</h3>
                <p className="text-sm text-muted-foreground">
                  Mirá la disponibilidad en tiempo real
                </p>
              </div>
              
              <div className="text-center">
                <div className="flex h-14 w-14 mx-auto items-center justify-center rounded-full bg-primary text-primary-foreground text-xl font-bold mb-4">
                  3
                </div>
                <h3 className="font-semibold mb-2">Confirmá tus datos</h3>
                <p className="text-sm text-muted-foreground">
                  Ingresá tu información y listo, turno reservado
                </p>
              </div>
            </div>
          </div>
        </section>
      </main>
      
      <PublicFooter />
    </div>
  )
}
