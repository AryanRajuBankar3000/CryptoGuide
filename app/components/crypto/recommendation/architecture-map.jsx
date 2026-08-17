'use client'

import { ChevronDown } from 'lucide-react'
import { ARCHITECTURE_MAP } from '@/lib/crypto/data'

export function ArchitectureMap() {
  return (
    <div className="rounded-xl border border-border bg-card/50 p-6 sm:p-8">
      <p className="font-mono text-[11px] uppercase tracking-[0.2em] text-bright/70">Security Architecture Map</p>
      <h3 className="mt-1 text-lg font-semibold">How cryptography fits into the vehicle</h3>

      <ol className="mt-6 flex flex-col items-stretch gap-0">
        {ARCHITECTURE_MAP.map((node, i) => (
          <li key={node.id} className="flex flex-col items-center">
            <div className="flex w-full max-w-xl items-center gap-4 rounded-lg border border-border bg-card-2 px-5 py-4">
              <span className="flex h-9 w-9 shrink-0 items-center justify-center rounded-full border border-border-strong bg-card font-mono text-xs text-bright">
                {String(i + 1).padStart(2, '0')}
              </span>
              <span className="min-w-0 flex-1">
                <span className="block text-sm font-semibold text-foreground">{node.label}</span>
                <span className="block text-xs text-muted-foreground">{node.detail}</span>
              </span>
            </div>
            {i < ARCHITECTURE_MAP.length - 1 ? (
              <span className="flex h-6 items-center justify-center text-primary/50" aria-hidden="true">
                <ChevronDown className="h-4 w-4" strokeWidth={2} />
              </span>
            ) : null}
          </li>
        ))}
      </ol>
    </div>
  )
}
