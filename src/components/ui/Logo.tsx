interface LogoProps {
  size?: number
  showText?: boolean
  variant?: 'full' | 'icon'
}

export default function Logo({ size = 40, showText = true, variant = 'full' }: LogoProps) {
  return (
    <div className="flex items-center gap-3">
      {/* Icon */}
      <svg width={size} height={size} viewBox="0 0 80 80" fill="none" xmlns="http://www.w3.org/2000/svg">
        {/* Outer circle */}
        <circle cx="40" cy="40" r="38" fill="#1B4F9B" />
        {/* Heart shape */}
        <path
          d="M40 58 C40 58 18 44 18 29 C18 22 24 16 31 16 C35 16 38.5 18 40 21 C41.5 18 45 16 49 16 C56 16 62 22 62 29 C62 44 40 58 40 58Z"
          fill="white" opacity="0.15"
        />
        {/* Cross / plus */}
        <rect x="34" y="24" width="12" height="32" rx="3" fill="white" />
        <rect x="24" y="34" width="32" height="12" rx="3" fill="white" />
        {/* Red accent dot */}
        <circle cx="58" cy="20" r="8" fill="#E53935" />
        <circle cx="58" cy="20" r="4" fill="white" />
        {/* People silhouettes at top */}
        <circle cx="33" cy="10" r="4" fill="#4FC3F7" />
        <circle cx="47" cy="10" r="4" fill="#4FC3F7" />
      </svg>

      {showText && variant === 'full' && (
        <div className="leading-tight">
          <div className="font-heading text-brand-navy text-lg leading-none">FamilyCare</div>
          <div className="text-[10px] font-semibold text-brand-navy/60 tracking-widest uppercase">
            Medical Laboratory
          </div>
        </div>
      )}
    </div>
  )
}
