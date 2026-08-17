'use client'

import { cn } from '@/lib/utils'
import { Check } from 'lucide-react'
import { COMPARE_ALGORITHMS } from '@/lib/crypto/engine'
import { useStore } from '../store'

const ROWS = [
  { key: 'security', label: 'Security' },
  { key: 'performance', label: 'Performance' },
  { key: 'memory', label: 'Memory' },
  { key: 'hardwareSupport', label: 'Hardware Support' },
  { key: 'pqc', label: 'PQC' },
  { key: 'automotiveReadiness', label: 'Automotive Readiness' },
  { key: 'migrationComplexity', label: 'Migration Complexity' },
]

export function Compare() {
  const { compareSelection, toggleCompare } = useStore()
  const selected = COMPARE_ALGORITHMS.filter((a) => compareSelection.includes(a.id))

  return (
    <div className="space-y-6">
      <div>
        <p className="text-sm text-muted-foreground">
          Select 2–3 algorithms to compare side by side.{' '}
          <span className="text-muted-foreground/60">({compareSelection.length} selected)</span>
        </p>
        <div className="mt-4 grid grid-cols-2 gap-3 sm:grid-cols-4">
          {COMPARE_ALGORITHMS.map((algo) => {
            const active = compareSelection.includes(algo.id)
            return (
              <button
                key={algo.id}
                type="button"
                onClick={() => toggleCompare(algo.id)}
                aria-pressed={active}
                className={cn(
                  'flex items-center justify-between gap-2 rounded-lg border p-4 text-left text-sm font-medium transition-all',
                  active ? 'border-primary bg-primary/12 text-foreground' : 'border-border bg-card/40 text-muted-foreground hover:border-border-strong',
                )}
              >
                {algo.name}
                {active ? <Check className="h-4 w-4 shrink-0 text-bright" strokeWidth={2.5} /> : null}
              </button>
            )
          })}
        </div>
      </div>

      {selected.length >= 2 ? (
        <div className="overflow-x-auto rounded-xl border border-border">
          <table className="w-full border-collapse text-sm">
            <thead>
              <tr className="border-b border-border bg-card-2">
                <th className="p-4 text-left font-mono text-[11px] uppercase tracking-wider text-muted-foreground">
                  Property
                </th>
                {selected.map((a) => (
                  <th key={a.id} className="p-4 text-left text-sm font-semibold text-foreground">
                    {a.name}
                  </th>
                ))}
              </tr>
            </thead>
            <tbody>
              {ROWS.map((row, i) => (
                <tr key={row.key} className={cn('border-b border-border/60', i % 2 === 1 && 'bg-card/30')}>
                  <td className="p-4 font-medium text-muted-foreground">{row.label}</td>
                  {selected.map((a) => (
                    <td key={a.id} className="p-4 text-foreground">
                      {a[row.key]}
                    </td>
                  ))}
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      ) : (
        <p className="rounded-lg border border-dashed border-border bg-card/30 p-6 text-center text-sm text-muted-foreground">
          Select at least two algorithms to see the comparison table.
        </p>
      )}
    </div>
  )
}
