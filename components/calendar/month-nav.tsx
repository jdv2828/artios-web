'use client'

import { ChevronLeft, ChevronRight } from 'lucide-react'
import { format } from 'date-fns'
import { es } from 'date-fns/locale'
import { Button } from '@/components/ui/button'

interface MonthNavProps {
  currentMonth: Date
  onPrev: () => void
  onNext: () => void
  onToday: () => void
}

export function MonthNav({ currentMonth, onPrev, onNext, onToday }: MonthNavProps) {
  return (
    <div className="flex items-center justify-between">
      <div className="flex items-center gap-2">
        <Button variant="outline" size="icon" onClick={onPrev}>
          <ChevronLeft className="h-4 w-4" />
        </Button>
        <h2 className="text-lg font-semibold capitalize">
          {format(currentMonth, 'MMMM yyyy', { locale: es })}
        </h2>
        <Button variant="outline" size="icon" onClick={onNext}>
          <ChevronRight className="h-4 w-4" />
        </Button>
      </div>
      <Button variant="outline" size="sm" onClick={onToday}>
        Hoy
      </Button>
    </div>
  )
}
