'use client'

import { cn } from '@/lib/utils'
import { ChevronRight } from 'lucide-react'
import { OBJECTIVES } from '@/lib/crypto/data'
import { useStore } from '../store'
import { SectionHeader, ActionButton, Card, Icon, CheckDot, StepArrow } from '../ui/primitives'

export function ObjectivesStep() {
  const { selections, toggleObjective, toggleSubOption, objectiveCount, requirementCount, goToStep } = useStore()

  return (
    <div className="space-y-10">
      <SectionHeader
        eyebrow="Step 01 — Security Objective"
        title="What are you securing?"
        description="Select one or more security objectives. Crypto will use your selections to build a context-aware automotive cryptography recommendation."
      />

      <div className="grid grid-cols-1 gap-5 sm:grid-cols-2 xl:grid-cols-4">
        {OBJECTIVES.map((obj) => {
          const selected = !!selections[obj.id]
          const chosen = selections[obj.id] ?? []
          return (
            <Card
              key={obj.id}
              selected={selected}
              className={cn('flex flex-col', selected ? 'xl:col-span-2' : '')}
            >
              <button
                type="button"
                onClick={() => toggleObjective(obj.id)}
                className="flex w-full items-start gap-4 p-6 text-left"
                aria-pressed={selected}
              >
                <span
                  className={cn(
                    'flex h-12 w-12 shrink-0 items-center justify-center rounded-lg border transition-colors',
                    selected ? 'border-primary/50 bg-primary/15 text-bright' : 'border-border bg-card-2 text-muted-foreground',
                  )}
                >
                  <Icon name={obj.icon} className="h-6 w-6" />
                </span>
                <span className="min-w-0 flex-1">
                  <span className="flex items-center justify-between gap-2">
                    <span className="text-base font-semibold">{obj.title}</span>
                    <CheckDot active={selected} />
                  </span>
                  <span className="mt-1 block text-sm leading-relaxed text-muted-foreground">{obj.description}</span>
                  <span className="mt-2 block font-mono text-[11px] uppercase tracking-wider text-muted-foreground/70">
                    {selected
                      ? `${chosen.length} requirement${chosen.length === 1 ? '' : 's'} selected`
                      : `${obj.subOptions.length} options`}
                  </span>
                </span>
              </button>

              {selected ? (
                <div className="border-t border-border/70 px-6 pb-6 pt-4">
                  <p className="mb-3 font-mono text-[11px] uppercase tracking-wider text-bright/80">
                    Configure {obj.title}
                  </p>
                  <div className="flex flex-wrap gap-2">
                    {obj.subOptions.map((sub) => {
                      const active = chosen.includes(sub.id)
                      return (
                        <button
                          key={sub.id}
                          type="button"
                          onClick={() => toggleSubOption(obj.id, sub.id)}
                          aria-pressed={active}
                          className={cn(
                            'inline-flex min-h-[40px] items-center gap-1.5 rounded-md border px-3 text-sm transition-all',
                            active
                              ? 'border-primary bg-primary/15 text-foreground'
                              : 'border-border bg-card/50 text-muted-foreground hover:border-border-strong hover:text-foreground',
                          )}
                        >
                          <span
                            className={cn(
                              'h-1.5 w-1.5 rounded-full',
                              active ? 'bg-bright' : 'bg-muted-foreground/40',
                            )}
                          />
                          {sub.label}
                        </button>
                      )
                    })}
                  </div>
                </div>
              ) : null}
            </Card>
          )
        })}
      </div>

      {/* Footer */}
      <div className="flex flex-col gap-4 border-t border-border pt-6 sm:flex-row sm:items-center sm:justify-between">
        <p className="text-sm text-muted-foreground">
          <span className="font-mono text-lg font-semibold text-foreground">{objectiveCount}</span> objective
          {objectiveCount === 1 ? '' : 's'} selected
          {requirementCount > 0 ? (
            <span className="text-muted-foreground/70"> · {requirementCount} requirements</span>
          ) : null}
        </p>
        <div className="flex flex-col gap-3 sm:flex-row">
          <ActionButton
            variant="primary"
            disabled={objectiveCount === 0}
            onClick={() => goToStep('context')}
            className="w-full sm:w-auto"
          >
            Continue to System Context
            <StepArrow />
          </ActionButton>
        </div>
      </div>

      {objectiveCount === 0 ? (
        <p className="flex items-center gap-2 text-xs text-muted-foreground/70">
          <ChevronRight className="h-3.5 w-3.5" />
          Select at least one objective to continue.
        </p>
      ) : null}
    </div>
  )
}
