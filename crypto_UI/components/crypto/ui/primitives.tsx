'use client'

import { cn } from '@/lib/utils'
import {
  ShieldCheck,
  CloudUpload,
  Radio,
  Network,
  Lock,
  KeyRound,
  Hash,
  Shuffle,
  Cpu,
  Radar,
  Monitor,
  SatelliteDish,
  Server,
  Settings2,
  Zap,
  MemoryStick,
  HardDrive,
  Shield,
  CalendarClock,
  Atom,
  Check,
  ArrowRight,
  type LucideIcon,
} from 'lucide-react'

const ICONS: Record<string, LucideIcon> = {
  'shield-check': ShieldCheck,
  'cloud-upload': CloudUpload,
  radio: Radio,
  network: Network,
  lock: Lock,
  'key-round': KeyRound,
  hash: Hash,
  shuffle: Shuffle,
  cpu: Cpu,
  radar: Radar,
  monitor: Monitor,
  'satellite-dish': SatelliteDish,
  server: Server,
  'settings-2': Settings2,
  zap: Zap,
  'memory-stick': MemoryStick,
  'hard-drive': HardDrive,
  shield: Shield,
  'calendar-clock': CalendarClock,
  atom: Atom,
}

export function Icon({ name, className }: { name: string; className?: string }) {
  const Cmp = ICONS[name] ?? Shield
  return <Cmp className={className} strokeWidth={1.6} aria-hidden="true" />
}

export function Eyebrow({ children }: { children: React.ReactNode }) {
  return (
    <span className="inline-block text-xs font-mono font-medium uppercase tracking-[0.22em] text-bright/80">
      {children}
    </span>
  )
}

export function SectionHeader({
  eyebrow,
  title,
  description,
}: {
  eyebrow: string
  title: string
  description?: string
}) {
  return (
    <header className="max-w-2xl animate-fade-up">
      <Eyebrow>{eyebrow}</Eyebrow>
      <h1 className="mt-3 text-3xl font-semibold tracking-tight text-balance sm:text-4xl">{title}</h1>
      {description ? (
        <p className="mt-4 text-base leading-relaxed text-muted-foreground text-pretty">{description}</p>
      ) : null}
    </header>
  )
}

type ButtonVariant = 'primary' | 'secondary' | 'tertiary' | 'danger'

export function ActionButton({
  variant = 'primary',
  className,
  children,
  ...props
}: {
  variant?: ButtonVariant
} & React.ButtonHTMLAttributes<HTMLButtonElement>) {
  return (
    <button
      className={cn(
        'inline-flex min-h-[48px] items-center justify-center gap-2 rounded-md px-6 text-sm font-medium transition-all duration-200 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-bright focus-visible:ring-offset-2 focus-visible:ring-offset-background disabled:cursor-not-allowed disabled:opacity-40',
        variant === 'primary' &&
          'bg-primary text-primary-foreground shadow-[0_8px_30px_-12px_rgba(59,130,246,0.6)] hover:bg-bright hover:-translate-y-0.5',
        variant === 'secondary' &&
          'border border-border-strong bg-card/40 text-foreground hover:bg-card-2 hover:-translate-y-0.5',
        variant === 'tertiary' &&
          'min-h-[40px] px-3 text-bright hover:text-foreground',
        variant === 'danger' &&
          'border border-danger/40 bg-danger/10 text-danger hover:bg-danger/20',
        className,
      )}
      {...props}
    >
      {children}
    </button>
  )
}

export function Card({
  selected,
  interactive,
  className,
  children,
  ...props
}: {
  selected?: boolean
  interactive?: boolean
} & React.HTMLAttributes<HTMLDivElement>) {
  return (
    <div
      className={cn(
        'rounded-lg border bg-card transition-all duration-200',
        interactive && 'cursor-pointer hover:border-border-strong hover:bg-card-2',
        selected
          ? 'border-primary bg-primary/10 shadow-[0_0_0_1px_rgba(59,130,246,0.4),0_10px_40px_-16px_rgba(59,130,246,0.55)]'
          : 'border-border',
        className,
      )}
      {...props}
    >
      {children}
    </div>
  )
}

export function CheckDot({ active }: { active: boolean }) {
  return (
    <span
      className={cn(
        'flex h-6 w-6 shrink-0 items-center justify-center rounded-full border transition-all',
        active ? 'border-primary bg-primary text-primary-foreground' : 'border-border-strong text-transparent',
      )}
      aria-hidden="true"
    >
      <Check className="h-3.5 w-3.5" strokeWidth={2.5} />
    </span>
  )
}

export function Pill({
  active,
  className,
  children,
  ...props
}: {
  active?: boolean
} & React.ButtonHTMLAttributes<HTMLButtonElement>) {
  return (
    <button
      className={cn(
        'inline-flex min-h-[44px] items-center justify-center gap-2 rounded-md border px-4 text-sm font-medium transition-all duration-200 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-bright',
        active
          ? 'border-primary bg-primary/15 text-foreground shadow-[0_0_0_1px_rgba(59,130,246,0.35)]'
          : 'border-border bg-card/40 text-muted-foreground hover:border-border-strong hover:text-foreground',
        className,
      )}
      aria-pressed={active}
      {...props}
    >
      {children}
    </button>
  )
}

const STATUS_STYLES: Record<string, string> = {
  RECOMMENDED: 'border-success/40 bg-success/10 text-success',
  'PQC STANDARD': 'border-bright/40 bg-bright/10 text-bright',
  'MIGRATION PLANNED': 'border-warning/40 bg-warning/10 text-warning',
  AVOID: 'border-danger/40 bg-danger/10 text-danger',
  HIGH: 'border-success/40 bg-success/10 text-success',
  MEDIUM: 'border-warning/40 bg-warning/10 text-warning',
  LOW: 'border-muted-foreground/40 bg-card-2 text-muted-foreground',
}

export function StatusBadge({ status, className }: { status: string; className?: string }) {
  return (
    <span
      className={cn(
        'inline-flex items-center gap-1.5 rounded-full border px-2.5 py-1 text-[11px] font-mono font-medium uppercase tracking-wider',
        STATUS_STYLES[status] ?? 'border-border bg-card-2 text-muted-foreground',
        className,
      )}
    >
      {status}
    </span>
  )
}

export function StepArrow() {
  return <ArrowRight className="h-4 w-4" strokeWidth={1.8} aria-hidden="true" />
}
