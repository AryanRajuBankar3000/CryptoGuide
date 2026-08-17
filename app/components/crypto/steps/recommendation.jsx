'use client'

import { useState } from 'react'
import { cn } from '@/lib/utils'
import {
  Download,
  RotateCcw,
  ShieldCheck,
  Layers,
  GitBranch,
  ListChecks,
  Route,
  Sparkles,
  Loader2,
} from 'lucide-react'
import { useStore } from '../store'
import { ActionButton, SectionHeader, StatusBadge, Eyebrow } from '../ui/primitives'
import { PostureIndicator } from '../recommendation/posture'
import { ArchitectureMap } from '../recommendation/architecture-map'
import { Compare } from '../recommendation/compare'
import { UseCaseSummaryCard } from '../recommendation/use-case-summary'
import { CryptoDetailCard } from '../recommendation/crypto-detail-card'




const VIEWS = [
  { id: 'summary', label: 'Summary', icon: ListChecks },
  { id: 'detail', label: 'Cryptography', icon: ShieldCheck },
  { id: 'architecture', label: 'Architecture', icon: Layers },
  { id: 'roadmap', label: 'Roadmap', icon: Route },
  { id: 'compare', label: 'Compare', icon: GitBranch },
]

export function RecommendationStep() {
  const { recommendation, aiAnalysis, resetAll, goToStep } = useStore()
  const [view, setView] = useState('summary')

  if (!recommendation || recommendation.useCases.length === 0) {
    return (
      <div className="mx-auto max-w-xl rounded-xl border border-border bg-card/50 p-10 text-center">
        <h1 className="text-2xl font-semibold">No recommendation yet</h1>
        <p className="mt-3 text-sm text-muted-foreground">
          Select your security objectives and run the analysis to generate a recommendation.
        </p>
        <ActionButton className="mt-6" onClick={() => goToStep('objectives')}>
          Start assessment
        </ActionButton>
      </div>
    )
  }

  const { useCases } = recommendation
  const overallScore = Math.round(
    useCases.reduce((acc, u) => acc + u.posture.score, 0) / useCases.length,
  )
  const strong = Array.from(new Set(useCases.flatMap((u) => u.posture.strong)))
  const attention = Array.from(new Set(useCases.flatMap((u) => u.posture.attention)))

  return (
    <div className="space-y-10">
      <div className="flex flex-col gap-6 lg:flex-row lg:items-end lg:justify-between">
        <SectionHeader
          eyebrow="Step 04 — Recommendation"
          title="Your cryptographic security recommendation"
          description="A tailored set of algorithms and controls based on your objectives and system context. Review each area, explore the reasoning, and export the report."
        />
        <div className="flex shrink-0 flex-wrap gap-3">
          <ActionButton variant="secondary" onClick={() => window.print()}>
            <Download className="h-4 w-4" strokeWidth={1.8} aria-hidden="true" />
            Export report
          </ActionButton>
          <ActionButton variant="secondary" onClick={resetAll}>
            <RotateCcw className="h-4 w-4" strokeWidth={1.8} aria-hidden="true" />
            New assessment
          </ActionButton>
        </div>
      </div>

      <PostureIndicator score={overallScore} strong={strong} attention={attention} />

      {/* View switcher */}
      <div className="flex flex-wrap gap-2 border-b border-border pb-4">
        {VIEWS.map((v) => {
          const active = view === v.id
          const VIcon = v.icon
          return (
            <button
              key={v.id}
              type="button"
              onClick={() => setView(v.id)}
              aria-pressed={active}
              className={cn(
                'inline-flex min-h-[44px] items-center gap-2 rounded-md px-4 text-sm font-medium transition-all',
                active
                  ? 'bg-primary text-primary-foreground'
                  : 'border border-border bg-card/40 text-muted-foreground hover:border-border-strong hover:text-foreground',
              )}
            >
              <VIcon className="h-4 w-4" strokeWidth={1.8} aria-hidden="true" />
              {v.label}
            </button>
          )
        })}
      </div>

      {/* Views */}
      {view === 'summary' ? (
        <div className="space-y-4 animate-fade-up">
          {/* AI Insights Block */}
          <div className="relative overflow-hidden rounded-xl border border-primary/30 bg-primary/5 p-6 sm:p-8">
            <div className="absolute -right-10 -top-10 h-32 w-32 rounded-full bg-primary/20 blur-3xl" />
            <div className="relative">
              <div className="flex items-center gap-2 mb-4">
                <Sparkles className="h-5 w-5 text-bright" />
                <h3 className="text-lg font-semibold text-foreground">AI Architectural Analysis</h3>
              </div>
              {aiAnalysis ? (
                <div className="space-y-3 text-sm leading-relaxed text-foreground/90">
                  {aiAnalysis.split('\n\n').map((paragraph, i) => (
                    <p
                      key={i}
                      dangerouslySetInnerHTML={{
                        __html: paragraph
                          .replace(/\*\*(.*?)\*\*/g, '<strong class="text-bright">$1</strong>')
                          .replace(/\n/g, '<br/>'),
                      }}
                    />
                  ))}
                </div>
              ) : (
                <div className="flex items-center gap-3 text-sm text-muted-foreground py-4">
                  <Loader2 className="h-4 w-4 animate-spin text-primary" />
                  Analyzing your system constraints and additional notes...
                </div>
              )}
            </div>
          </div>

          {useCases.map((u, i) => (
            <UseCaseSummaryCard key={u.objectiveId} useCase={u} rank={i} />
          ))}
        </div>
      ) : null}

      {view === 'detail' ? (
        <div className="space-y-10 animate-fade-up">
          {useCases.map((u) => (
            <section key={u.objectiveId}>
              <div className="flex flex-wrap items-center gap-3">
                <h2 className="text-xl font-semibold">{u.objectiveTitle}</h2>
                <StatusBadge status={u.confidence} />
              </div>
              <p className="mt-1 font-mono text-sm text-bright">{u.primaryAlgorithm}</p>
              <div className="mt-4 grid gap-3 sm:grid-cols-2">
                {u.crypto.map((c) => (
                  <CryptoDetailCard key={`${u.objectiveId}-${c.algorithm}`} detail={c} />
                ))}
              </div>
              {u.risks.length ? (
                <div className="mt-4 grid gap-3 sm:grid-cols-2 lg:grid-cols-3">
                  {u.risks.map((r, ri) => (
                    <div
                      key={ri}
                      className={cn(
                        'rounded-lg border p-4 text-sm',
                        r.kind === 'danger' && 'border-danger/40 bg-danger/8',
                        r.kind === 'warning' && 'border-warning/40 bg-warning/8',
                        r.kind === 'success' && 'border-success/40 bg-success/8',
                      )}
                    >
                      <p
                        className={cn(
                          'font-medium',
                          r.kind === 'danger' && 'text-danger',
                          r.kind === 'warning' && 'text-warning',
                          r.kind === 'success' && 'text-success',
                        )}
                      >
                        {r.title}
                      </p>
                      <p className="mt-1 leading-relaxed text-muted-foreground">{r.detail}</p>
                    </div>
                  ))}
                </div>
              ) : null}
            </section>
          ))}
        </div>
      ) : null}

      {view === 'architecture' ? (
        <div className="animate-fade-up">
          <ArchitectureMap />
        </div>
      ) : null}

      {view === 'roadmap' ? (
        <div className="animate-fade-up space-y-8">
          {useCases.map((u) => (
            <section key={u.objectiveId} className="rounded-xl border border-border bg-card/50 p-6 sm:p-8">
              <Eyebrow>{u.objectiveTitle}</Eyebrow>
              <ol className="mt-5 grid gap-4 sm:grid-cols-2 lg:grid-cols-4">
                {u.lifecycle.map((phase, pi) => (
                  <li key={phase.title} className="relative rounded-lg border border-border bg-card-2 p-4">
                    <span className="font-mono text-[11px] uppercase tracking-wider text-bright/70">
                      Phase {pi + 1}
                    </span>
                    <p className="mt-1 text-sm font-semibold text-foreground">{phase.title}</p>
                    <p className="mt-1 text-xs leading-relaxed text-muted-foreground">{phase.detail}</p>
                  </li>
                ))}
              </ol>
            </section>
          ))}
        </div>
      ) : null}

      {view === 'compare' ? (
        <div className="animate-fade-up">
          <Compare />
        </div>
      ) : null}

      <div className="rounded-xl border border-border bg-card/40 p-5 text-xs leading-relaxed text-muted-foreground/80">
        This recommendation is an engineering decision-support aid based on the inputs you provided. It is not a
        certification, security guarantee, or substitute for a formal risk assessment and independent cryptographic
        review.
      </div>
    </div>
  )
}
