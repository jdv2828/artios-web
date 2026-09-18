'use client'

import { Calendar, CalendarRange, Clock, List } from 'lucide-react'
import { ToggleGroup, ToggleGroupItem } from '@/components/ui/toggle-group'
import { useIsMobile } from '@/components/ui/use-mobile'

export type ViewMode = 'month' | 'week' | 'day' | 'agenda'

const VIEW_OPTIONS = [
  { value: 'month' as const, label: 'Mes', icon: Calendar },
  { value: 'week' as const, label: 'Semana', icon: CalendarRange },
  { value: 'day' as const, label: 'Día', icon: Clock },
  { value: 'agenda' as const, label: 'Agenda', icon: List },
]

interface ViewToggleProps {
  value: ViewMode
  onChange: (mode: ViewMode) => void
}

export function ViewToggle({ value, onChange }: ViewToggleProps) {
  const isMobile = useIsMobile()

  return (
    <ToggleGroup
      type="single"
      value={value}
      onValueChange={(v) => { if (v) onChange(v as ViewMode) }}
      variant="outline"
      size="sm"
    >
      {VIEW_OPTIONS.map(({ value: v, label, icon: Icon }) => (
        <ToggleGroupItem key={v} value={v} aria-label={label}>
          <Icon className="h-4 w-4" />
          {!isMobile && <span>{label}</span>}
        </ToggleGroupItem>
      ))}
    </ToggleGroup>
  )
}
