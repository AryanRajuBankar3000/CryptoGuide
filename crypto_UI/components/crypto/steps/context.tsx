'use client'

import { cn } from '@/lib/utils'
import { ArrowLeft } from 'lucide-react'
import {
  PROJECT_TYPES,
  LIFETIMES,
  THREATS,
  HARDWARE,
  HSM_OPTIONS,
  HW_ACCEL,
  PQC_READINESS,
  MIGRATION_STRATEGY,
  REGULATORY,
  PERFORMANCE,
} from '@/lib/crypto/data'
import { useStore } from '../store'
import { SectionHeader, ActionButton, Icon, Pill, StepArrow } from '../ui/primitives'

function Field({
  index,
  label,
  hint,
  children,
}: {
  index: string
  label: string
  hint?: string
  children: React.ReactNode
}) {
  return (
    <section className="rounded-xl border border-border bg-card/50 p-6 sm:p-7">
      <div className="mb-5">
        <span className="font-mono text-[11px] uppercase tracking-[0.2em] text-bright/70">Section {index}</span>
        <h2 className="mt-1 text-lg font-semibold">{label}</h2>
        {hint ? <p className="mt-1 text-sm text-muted-foreground">{hint}</p> : null}
      </div>
      {children}
    </section>
  )
}

export function ContextStep() {
  const { context, setContext, toggleContextArray, goToStep } = useStore()

  const selectedLifetime = LIFETIMES.find((l) => l.id === context.lifetime)
  const selectedThreat = THREATS.find((t) => t.id === context.threat)

  return (
    <div className="space-y-8">
      <SectionHeader
        eyebrow="Step 02 — System Context"
        title="Tell us about the system"
        description="These details help Crypto determine which cryptographic approach best fits your vehicle, ECU, hardware, and lifecycle requirements."
      />

      {/* 1 — Project type */}
      <Field index="01" label="What are you protecting?" hint="Choose the target system. Select one.">
        <div className="grid grid-cols-2 gap-3 sm:grid-cols-3 lg:grid-cols-4">
          {PROJECT_TYPES.map((p) => {
            const active = context.projectType === p.id
            return (
              <button
                key={p.id}
                type="button"
                onClick={() => setContext({ projectType: p.id })}
                aria-pressed={active}
                className={cn(
                  'flex min-h-[96px] flex-col items-start justify-between gap-3 rounded-lg border p-4 text-left transition-all',
                  active
                    ? 'border-primary bg-primary/12 shadow-[0_0_0_1px_rgba(59,130,246,0.35)]'
                    : 'border-border bg-card/40 hover:border-border-strong hover:bg-card-2',
                )}
              >
                <Icon name={p.icon} className={cn('h-6 w-6', active ? 'text-bright' : 'text-muted-foreground')} />
                <span className="text-sm font-medium">{p.label}</span>
              </button>
            )
          })}
        </div>
      </Field>

      {/* 2 — Lifetime */}
      <Field index="02" label="How long will the vehicle remain in service?">
        <div className="flex flex-wrap gap-3">
          {LIFETIMES.map((l) => (
            <Pill key={l.id} active={context.lifetime === l.id} onClick={() => setContext({ lifetime: l.id })}>
              {l.label}
            </Pill>
          ))}
        </div>
        {selectedLifetime ? (
          <p className="mt-4 rounded-md border border-border bg-card-2 p-4 text-sm leading-relaxed text-muted-foreground">
            <span className="font-medium text-foreground">{selectedLifetime.label}</span> — {selectedLifetime.note}
          </p>
        ) : null}
      </Field>

      {/* 3 — Threat */}
      <Field index="03" label="Threat level">
        <div className="grid gap-3 sm:grid-cols-3">
          {THREATS.map((t) => {
            const active = context.threat === t.id
            return (
              <button
                key={t.id}
                type="button"
                onClick={() => setContext({ threat: t.id })}
                aria-pressed={active}
                className={cn(
                  'rounded-lg border p-4 text-left transition-all',
                  active ? 'border-primary bg-primary/12' : 'border-border bg-card/40 hover:border-border-strong',
                )}
              >
                <span className="block text-sm font-semibold">{t.label}</span>
                <span className="mt-1 block text-xs leading-relaxed text-muted-foreground">{t.note}</span>
              </button>
            )
          })}
        </div>
      </Field>

      {/* 4 — Hardware */}
      <Field index="04" label="Target hardware">
        <div className="flex flex-wrap gap-3">
          {HARDWARE.map((h) => (
            <Pill key={h.id} active={context.hardware === h.id} onClick={() => setContext({ hardware: h.id })}>
              {h.label}
            </Pill>
          ))}
        </div>
        <div className="mt-5 grid gap-5 sm:grid-cols-2">
          <div>
            <p className="mb-2 text-sm font-medium text-muted-foreground">HSM available?</p>
            <div className="flex flex-wrap gap-2">
              {HSM_OPTIONS.map((o) => (
                <Pill key={o.id} active={context.hsm === o.id} onClick={() => setContext({ hsm: o.id })}>
                  {o.label}
                </Pill>
              ))}
            </div>
          </div>
          <div>
            <p className="mb-2 text-sm font-medium text-muted-foreground">Hardware acceleration</p>
            <div className="flex flex-wrap gap-2">
              {HW_ACCEL.map((o) => (
                <Pill
                  key={o.id}
                  active={context.hwAccel.includes(o.id)}
                  onClick={() => toggleContextArray('hwAccel', o.id)}
                >
                  {o.label}
                </Pill>
              ))}
            </div>
          </div>
        </div>
      </Field>

      {/* 5 — PQC */}
      <Field index="05" label="Post-quantum readiness">
        <div className="flex flex-wrap gap-3">
          {PQC_READINESS.map((p) => (
            <Pill key={p.id} active={context.pqc === p.id} onClick={() => setContext({ pqc: p.id })}>
              {p.label}
            </Pill>
          ))}
        </div>
        {context.pqc === 'plan' ? (
          <div className="mt-5 animate-fade-up">
            <p className="mb-2 text-sm font-medium text-muted-foreground">Migration strategy</p>
            <div className="flex flex-wrap gap-2">
              {MIGRATION_STRATEGY.map((m) => (
                <Pill key={m.id} active={context.migration === m.id} onClick={() => setContext({ migration: m.id })}>
                  {m.label}
                </Pill>
              ))}
            </div>
          </div>
        ) : null}
      </Field>

      {/* 6 — Regulatory */}
      <Field index="06" label="Regulatory / security framework" hint="Select all that apply.">
        <div className="flex flex-wrap gap-3">
          {REGULATORY.map((r) => (
            <Pill
              key={r.id}
              active={context.regulatory.includes(r.id)}
              onClick={() => toggleContextArray('regulatory', r.id)}
            >
              {r.label}
            </Pill>
          ))}
        </div>
      </Field>

      {/* 7 — Performance */}
      <Field index="07" label="Performance priorities" hint="What matters most? Select all that apply.">
        <div className="grid grid-cols-2 gap-3 sm:grid-cols-3 lg:grid-cols-4">
          {PERFORMANCE.map((p) => {
            const active = context.performance.includes(p.id)
            return (
              <button
                key={p.id}
                type="button"
                onClick={() => toggleContextArray('performance', p.id)}
                aria-pressed={active}
                className={cn(
                  'flex min-h-[64px] items-center gap-3 rounded-lg border p-4 text-left transition-all',
                  active ? 'border-primary bg-primary/12' : 'border-border bg-card/40 hover:border-border-strong',
                )}
              >
                <Icon name={p.icon} className={cn('h-5 w-5 shrink-0', active ? 'text-bright' : 'text-muted-foreground')} />
                <span className="text-sm font-medium">{p.label}</span>
              </button>
            )
          })}
        </div>
      </Field>

      {/* 8 — Notes */}
      <Field index="08" label="Additional context" hint="Describe any additional system constraints, protocols, hardware limitations, or deployment details.">
        <textarea
          value={context.notes}
          onChange={(e) => setContext({ notes: e.target.value })}
          rows={4}
          placeholder="Example: OTA package is verified by a constrained body-control ECU with limited flash and an HSM is not available."
          className="w-full resize-y rounded-lg border border-border bg-card-2 p-4 text-sm leading-relaxed text-foreground placeholder:text-muted-foreground/60 focus-visible:border-primary focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-primary/30"
        />
      </Field>

      {/* Footer */}
      <div className="flex flex-col gap-3 border-t border-border pt-6 sm:flex-row sm:items-center sm:justify-between">
        <ActionButton variant="secondary" onClick={() => goToStep('objectives')} className="w-full sm:w-auto">
          <ArrowLeft className="h-4 w-4" strokeWidth={1.8} />
          Back to Security Objectives
        </ActionButton>
        <ActionButton
          variant="primary"
          onClick={() => goToStep('review')}
          disabled={!context.projectType}
          className="w-full sm:w-auto"
        >
          Review Security Context
          <StepArrow />
        </ActionButton>
      </div>
    </div>
  )
}
