'use client'

import { useMemo, useState } from 'react'
import { cn } from '@/lib/utils'
import { Search, ChevronDown } from 'lucide-react'
import { KNOWLEDGE_BASE } from '@/lib/crypto/data'
import { SectionHeader, StatusBadge } from '../ui/primitives'

const FILTERS = ['All', 'RECOMMENDED', 'PQC STANDARD', 'MIGRATION PLANNED']

export function KnowledgeBase() {
  const [query, setQuery] = useState('')
  const [filter, setFilter] = useState('All')
  const [openId, setOpenId] = useState(null)

  const results = useMemo(() => {
    const q = query.trim().toLowerCase()
    return KNOWLEDGE_BASE.filter((e) => {
      const matchesFilter = filter === 'All' || e.securityStatus === filter
      const matchesQuery =
        !q ||
        e.algorithm.toLowerCase().includes(q) ||
        e.primaryUse.toLowerCase().includes(q) ||
        e.automotiveRelevance.toLowerCase().includes(q)
      return matchesFilter && matchesQuery
    })
  }, [query, filter])

  return (
    <div className="space-y-8">
      <SectionHeader
        eyebrow="Reference Library"
        title="Cryptographic knowledge base"
        description="A reference of automotive-relevant cryptographic algorithms, their post-quantum status, and standards references."
      />

      <div className="flex flex-col gap-4 sm:flex-row sm:items-center sm:justify-between">
        <div className="relative flex-1 sm:max-w-md">
          <Search
            className="pointer-events-none absolute left-4 top-1/2 h-4 w-4 -translate-y-1/2 text-muted-foreground"
            strokeWidth={1.8}
            aria-hidden="true"
          />
          <input
            type="search"
            value={query}
            onChange={(e) => setQuery(e.target.value)}
            placeholder="Search algorithms, uses, standards…"
            aria-label="Search knowledge base"
            className="h-12 w-full rounded-md border border-border bg-card/50 pl-11 pr-4 text-sm text-foreground placeholder:text-muted-foreground focus:border-border-strong focus:outline-none focus-visible:ring-2 focus-visible:ring-bright"
          />
        </div>
        <div className="flex flex-wrap gap-2">
          {FILTERS.map((f) => (
            <button
              key={f}
              type="button"
              onClick={() => setFilter(f)}
              aria-pressed={filter === f}
              className={cn(
                'rounded-md border px-3 py-2 text-xs font-medium uppercase tracking-wide transition-colors',
                filter === f
                  ? 'border-primary bg-primary/15 text-foreground'
                  : 'border-border bg-card/40 text-muted-foreground hover:border-border-strong hover:text-foreground',
              )}
            >
              {f}
            </button>
          ))}
        </div>
      </div>

      <div className="space-y-3">
        {results.length === 0 ? (
          <p className="rounded-lg border border-dashed border-border bg-card/30 p-8 text-center text-sm text-muted-foreground">
            No algorithms match your search.
          </p>
        ) : (
          results.map((e) => {
            const open = openId === e.id
            return (
              <div
                key={e.id}
                className={cn(
                  'rounded-xl border bg-card/50 transition-colors',
                  open ? 'border-border-strong' : 'border-border hover:border-border-strong',
                )}
              >
                <button
                  type="button"
                  onClick={() => setOpenId(open ? null : e.id)}
                  aria-expanded={open}
                  className="flex w-full items-center gap-4 p-5 text-left"
                >
                  <span className="min-w-0 flex-1">
                    <span className="flex flex-wrap items-center gap-3">
                      <span className="text-base font-semibold text-foreground">{e.algorithm}</span>
                      <StatusBadge status={e.securityStatus} />
                    </span>
                    <span className="mt-1 block text-sm text-muted-foreground">{e.primaryUse}</span>
                  </span>
                  <ChevronDown
                    className={cn('h-4 w-4 shrink-0 text-bright transition-transform', open && 'rotate-180')}
                    strokeWidth={1.8}
                  />
                </button>
                {open ? (
                  <div className="animate-fade-up border-t border-border/70 p-5">
                    <p className="text-sm leading-relaxed text-foreground">{e.details}</p>
                    <dl className="mt-5 grid gap-x-6 gap-y-4 sm:grid-cols-2 lg:grid-cols-4">
                      {[
                        ['PQC Status', e.pqcStatus],
                        ['Strength', e.strength],
                        ['Automotive Relevance', e.automotiveRelevance],
                        ['Reference', e.reference],
                      ].map(([label, value]) => (
                        <div key={label}>
                          <dt className="text-xs uppercase tracking-wider text-muted-foreground">{label}</dt>
                          <dd className="mt-1 text-sm text-foreground">{value}</dd>
                        </div>
                      ))}
                    </dl>
                  </div>
                ) : null}
              </div>
            )
          })
        )}
      </div>
    </div>
  )
}
