'use client'

import { cn } from '@/lib/utils'
import { Sparkles, MousePointer2, Contrast, Gauge, RotateCcw } from 'lucide-react'
import { useStore } from '../store'
import { SectionHeader, ActionButton } from '../ui/primitives'
function Toggle({ 
  checked,
  onChange,
  label,
 }) {
  return (
    <button
      type="button"
      role="switch"
      aria-checked={checked}
      aria-label={label}
      onClick={() => onChange(!checked)}
      className={cn(
        'relative inline-flex h-6 w-11 shrink-0 cursor-pointer items-center rounded-full border-2 border-transparent transition-colors focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-primary focus-visible:ring-offset-2 focus-visible:ring-offset-background',
        checked ? 'bg-primary' : 'bg-card-2 border-border-strong'
      )}
    >
      <span
        className={cn(
          'pointer-events-none block h-5 w-5 rounded-full bg-foreground shadow-sm ring-0 transition-transform',
          checked ? 'translate-x-5' : 'translate-x-0'
        )}
      />
    </button>
  )
}




const TOGGLES = [
  {
    key: 'backgroundEffects',
    title: 'Background effects',
    desc: 'Grid pattern and ambient glow behind the interface.',
    icon: Sparkles,
  },
  {
    key: 'cursorEffects',
    title: 'Cursor spotlight',
    desc: 'A subtle light that follows the pointer.',
    icon: MousePointer2,
  },
  {
    key: 'reduceAnimation',
    title: 'Reduce animation',
    desc: 'Minimize motion and transitions across the app.',
    icon: Gauge,
  },
  {
    key: 'highContrast',
    title: 'High contrast',
    desc: 'Increase contrast of text and borders for readability.',
    icon: Contrast,
  },
]

export function SettingsPanel() {
  const { settings, setSettings, resetAll } = useStore()

  return (
    <div className="mx-auto max-w-3xl space-y-8">
      <SectionHeader
        eyebrow="Preferences"
        title="Display & interface settings"
        description="Adjust visual effects, motion, and layout density. These preferences apply immediately."
      />

      <section className="space-y-3">
        {TOGGLES.map((t) => {
          const TIcon = t.icon
          const checked = settings[t.key]
          return (
            <div
              key={t.key}
              className="flex items-center gap-4 rounded-xl border border-border bg-card/50 p-5"
            >
              <span className="flex h-10 w-10 shrink-0 items-center justify-center rounded-lg border border-border-strong bg-card">
                <TIcon className="h-5 w-5 text-bright" strokeWidth={1.6} aria-hidden="true" />
              </span>
              <div className="min-w-0 flex-1">
                <p className="text-sm font-semibold text-foreground">{t.title}</p>
                <p className="mt-0.5 text-sm text-muted-foreground">{t.desc}</p>
              </div>
              <Toggle
                checked={checked}
                label={t.title}
                onChange={(v) => setSettings({ [t.key]: v })}
              />
            </div>
          )
        })}
      </section>

      <section className="rounded-xl border border-border bg-card/50 p-5">
        <p className="text-sm font-semibold text-foreground">Layout density</p>
        <p className="mt-0.5 text-sm text-muted-foreground">Control vertical spacing throughout the app.</p>
        <div className="mt-4 flex gap-3">
          {(['comfortable', 'compact']).map((s) => (
            <button
              key={s}
              type="button"
              onClick={() => setSettings({ spacing: s })}
              aria-pressed={settings.spacing === s}
              className={cn(
                'flex-1 rounded-lg border px-4 py-3 text-sm font-medium capitalize transition-all',
                settings.spacing === s
                  ? 'border-primary bg-primary/15 text-foreground'
                  : 'border-border bg-card/40 text-muted-foreground hover:border-border-strong hover:text-foreground',
              )}
            >
              {s}
            </button>
          ))}
        </div>
      </section>

      <section className="rounded-xl border border-danger/30 bg-danger/5 p-5">
        <p className="text-sm font-semibold text-foreground">Reset assessment</p>
        <p className="mt-0.5 text-sm text-muted-foreground">
          Clear all objectives, system context, and the generated recommendation.
        </p>
        <ActionButton variant="danger" className="mt-4" onClick={resetAll}>
          <RotateCcw className="h-4 w-4" strokeWidth={1.8} aria-hidden="true" />
          Reset everything
        </ActionButton>
      </section>
    </div>
  )
}
