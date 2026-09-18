'use client'

interface ArtiosLogoProps {
  className?: string
  size?: number
  color?: string
}

export function ArtiosLogo({ className = '', size = 32, color = 'currentColor' }: ArtiosLogoProps) {
  return (
    <svg
      width={size}
      height={size}
      viewBox="0 0 100 100"
      fill="none"
      xmlns="http://www.w3.org/2000/svg"
      className={className}
    >
      {/* Head */}
      <circle cx="62" cy="12" r="10" fill={color} />
      
      {/* Body - curved flowing shape */}
      <path
        d="M55 22
           C50 28, 45 35, 42 45
           C38 58, 40 72, 45 85
           C46 88, 48 92, 50 95
           L55 95
           C52 90, 50 85, 49 80
           C46 70, 45 58, 50 48
           C54 40, 58 32, 62 26
           Z"
        fill={color}
      />
      
      {/* Left arm - raised up and curved outward */}
      <path
        d="M42 45
           C35 38, 25 30, 15 25
           C12 23, 8 22, 5 22
           L5 28
           C10 28, 15 30, 20 33
           C28 38, 36 45, 42 52
           Z"
        fill={color}
      />
      
      {/* Right arm - raised up gracefully */}
      <path
        d="M62 26
           C68 20, 75 14, 82 10
           C86 8, 90 6, 95 5
           L95 11
           C90 12, 85 14, 80 17
           C72 22, 65 30, 58 38
           Z"
        fill={color}
      />
    </svg>
  )
}

export function ArtiosLogoFull({ className = '', size = 40 }: { className?: string; size?: number }) {
  return (
    <div className={`flex items-center gap-2 ${className}`}>
      <div 
        className="flex items-center justify-center rounded-lg bg-primary p-1"
        style={{ width: size + 8, height: size + 8 }}
      >
        <ArtiosLogo size={size} color="white" />
      </div>
      <div className="flex flex-col">
        <span className="text-lg font-semibold leading-tight">Artios</span>
        <span className="text-[10px] text-muted-foreground leading-tight">Agenda online</span>
      </div>
    </div>
  )
}
