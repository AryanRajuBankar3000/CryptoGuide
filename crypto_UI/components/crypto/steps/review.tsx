'use client'

import { ArrowLeft, Pencil, Sparkles } from 'lucide-react'
import { useStore } from '../store'
import { SectionHeader, ActionButton } from '../ui/primitives'
import { label, objectiveTitle, subOptionLabels } from '@/lib/crypto/labels'

function SummaryCard({
  title,
  children,
}: {
  title: string
  children: React.ReactNode
}) {
  return (
    <div className="rounded-xl border border-border bg-card/50 p-6">
      <h3 className="mb-3 font-mono text-[11px] uppercase tracking-[0.2em] text-bright/70">{title}</h3>
      {children}
    </div>
  )
}

function ValueList({ items }: { items: (string | null)[] }) {
  const clean = items.filter(Boolean) as string[]
  if (clean.length === 0) return <p className="text-sm text-muted-foreground/60">Not specified</p>
  return (
    <div className="flex flex-wrap gap-2">
      {clean.map((v) => (
        <span key={v} className="rounded-md border border-border bg-card-2 px-3 py-1.5 text-sm text-foreground">
          {v}
        </span>
      ))}
    </div>
  )
}

export function ReviewStep() {
  const { selections, context, goToStep, runAnalysis } = useStore()

  return (
    <div className="space-y-8">
      <SectionHeader
        eyebrow="Step 03 — Review"
        title="Review your security context"
        description="Confirm the objectives and system details below. Crypto will use this exact context to generate your recommendation."
      />

      <div className="grid gap-5 lg:grid-cols-2">
        <SummaryCard title="Security Objectives">
          <div className="space-y-4">
            {Object.entries(selections).map(([objId, subs]) => (
              <div key={objId}>
                <p className="text-sm font-semibold text-foreground">{objectiveTitle(objId)}</p>
                {subs.length > 0 ? (
                  <div className="mt-2 flex flex-wrap gap-2">
                    {subOptionLabels(objId, subs).map((s) => (
                      <span
                        key={s}
                        className="rounded-md border border-primary/30 bg-primary/10 px-2.5 py-1 text-xs text-bright"
                      >
                        {s}
                      </span>
                    ))}
                  </div>
                ) : (
                  <p className="mt-1 text-xs text-muted-foreground/60">No specific requirements selected</p>
                )}
              </div>
            ))}
          </div>
          <button
            onClick={() => goToStep('objectives')}
            className="mt-5 inline-flex items-center gap-1.5 text-sm font-medium text-bright hover:text-foreground"
          >
            <Pencil className="h-3.5 w-3.5" strokeWidth={1.8} />
            Edit Security Objectives
          </button>
        </SummaryCard>

        <div className="grid gap-5 sm:grid-cols-2 lg:grid-cols-1 xl:grid-cols-2">
          <SummaryCard title="System">
            <ValueList items={[label.projectType(context.projectType)]} />
          </SummaryCard>
          <SummaryCard title="Lifecycle">
            <ValueList items={[label.lifetime(context.lifetime)]} />
          </SummaryCard>
          <SummaryCard title="Threat">
            <ValueList items={[label.threat(context.threat)]} />
          </SummaryCard>
          <SummaryCard title="Hardware">
            <ValueList items={[label.hardware(context.hardware), context.hsm ? `HSM: ${label.hsm(context.hsm)}` : null]} />
          </SummaryCard>
          <SummaryCard title="PQC">
            <ValueList items={[label.pqc(context.pqc), context.migration ? label.migration(context.migration) : null]} />
          </SummaryCard>
          <SummaryCard title="Regulatory">
            <ValueList items={label.regulatory(context.regulatory)} />
          </SummaryCard>
        </div>
      </div>

      {context.performance.length > 0 || context.notes ? (
        <div className="grid gap-5 lg:grid-cols-2">
          {context.performance.length > 0 ? (
            <SummaryCard title="Performance Priorities">
              <ValueList items={label.performance(context.performance)} />
            </SummaryCard>
          ) : null}
          {context.notes ? (
            <SummaryCard title="Additional Context">
              <p className="text-sm leading-relaxed text-muted-foreground">{context.notes}</p>
            </SummaryCard>
          ) : null}
        </div>
      ) : null}

      <div className="flex flex-col gap-3 border-t border-border pt-6 sm:flex-row sm:items-center sm:justify-between">
        <div className="flex flex-col gap-3 sm:flex-row">
          <ActionButton variant="secondary" onClick={() => goToStep('objectives')}>
            <ArrowLeft className="h-4 w-4" strokeWidth={1.8} />
            Back
          </ActionButton>
          <ActionButton variant="secondary" onClick={() => goToStep('context')}>
            <Pencil className="h-4 w-4" strokeWidth={1.8} />
            Edit System Context
          </ActionButton>
        </div>
        <ActionButton variant="primary" onClick={runAnalysis} className="w-full sm:w-auto">
          <Sparkles className="h-4 w-4" strokeWidth={1.8} />
          Generate Recommendation
        </ActionButton>
      </div>
    </div>
  )
}
