'use client'

import { useState } from 'react'
import { cn } from '@/lib/utils'
import { Lock, Plus, Menu, X } from 'lucide-react'
import { useStore, type Tab } from './store'
import { Stepper } from './ui/stepper'
import { ActionButton } from './ui/primitives'
import { ObjectivesStep } from './steps/objectives'
import { ContextStep } from './steps/context'
import { ReviewStep } from './steps/review'
import { AnalysisStep } from './steps/analysis'
import { RecommendationStep } from './steps/recommendation'
import { KnowledgeBase } from './sections/knowledge-base'
import { Assistant } from './sections/assistant'
import { SettingsPanel } from './sections/settings'

const TABS: { id: Tab; label: string }[] = [
  { id: 'workspace', label: 'Workspace' },
  { id: 'knowledge', label: 'Knowledge' },
  { id: 'assistant', label: 'Assistant' },
  { id: 'settings', label: 'Settings' },
]

export function Platform() {
  const { tab, setTab, step, settings, resetAll } = useStore()
  const [menuOpen, setMenuOpen] = useState(false)
  const [confirmNew, setConfirmNew] = useState(false)

  const spacing = settings.spacing === 'compact' ? 'py-8 sm:py-10' : 'py-10 sm:py-16'
  const pad = 'px-5 sm:px-10 lg:px-16'

  return (
    <div className="relative min-h-screen bg-background">
      {settings.backgroundEffects ? (
        <div className="pointer-events-none fixed inset-0 z-0">
          <div className="bg-grid absolute inset-0 opacity-40" />
          <div className="absolute -top-40 left-1/2 h-96 w-[46rem] -translate-x-1/2 rounded-full bg-primary/10 blur-[120px]" />
        </div>
      ) : null}

      {/* Top navigation */}
      <header className={cn('sticky top-0 z-30 border-b border-border bg-background/80 backdrop-blur-xl', pad)}>
        <div className="mx-auto flex max-w-7xl items-center justify-between py-4">
          <button
            onClick={() => setTab('workspace')}
            className="flex items-center gap-3 text-left focus-visible:outline-none"
          >
            <span className="flex h-10 w-10 items-center justify-center rounded-lg border border-border-strong bg-card">
              <Lock className="h-5 w-5 text-bright" strokeWidth={1.8} aria-hidden="true" />
            </span>
            <span>
              <span className="block text-sm font-semibold leading-tight tracking-wide">CRYPTO</span>
              <span className="block text-[11px] leading-tight text-muted-foreground">
                Automotive Cybersecurity Platform
              </span>
            </span>
          </button>

          {/* Desktop nav */}
          <nav className="hidden items-center gap-1 md:flex">
            {TABS.map((t) => (
              <button
                key={t.id}
                onClick={() => setTab(t.id)}
                className={cn(
                  'rounded-md px-4 py-2 text-sm font-medium transition-colors',
                  tab === t.id ? 'bg-card-2 text-foreground' : 'text-muted-foreground hover:text-foreground',
                )}
                aria-current={tab === t.id ? 'page' : undefined}
              >
                {t.label}
              </button>
            ))}
            <ActionButton
              variant="secondary"
              className="ml-3 min-h-[42px] px-4 text-xs"
              onClick={() => setConfirmNew(true)}
            >
              <Plus className="h-4 w-4" strokeWidth={2} aria-hidden="true" />
              New Recommendation
            </ActionButton>
          </nav>

          {/* Mobile menu button */}
          <button
            className="flex h-10 w-10 items-center justify-center rounded-md border border-border md:hidden"
            onClick={() => setMenuOpen((v) => !v)}
            aria-label={menuOpen ? 'Close menu' : 'Open menu'}
            aria-expanded={menuOpen}
          >
            {menuOpen ? <X className="h-5 w-5" /> : <Menu className="h-5 w-5" />}
          </button>
        </div>

        {/* Mobile nav */}
        {menuOpen ? (
          <div className="border-t border-border py-3 md:hidden">
            <nav className="mx-auto flex max-w-7xl flex-col gap-1">
              {TABS.map((t) => (
                <button
                  key={t.id}
                  onClick={() => {
                    setTab(t.id)
                    setMenuOpen(false)
                  }}
                  className={cn(
                    'rounded-md px-4 py-3 text-left text-sm font-medium transition-colors',
                    tab === t.id ? 'bg-card-2 text-foreground' : 'text-muted-foreground',
                  )}
                >
                  {t.label}
                </button>
              ))}
              <ActionButton
                variant="secondary"
                className="mt-2"
                onClick={() => {
                  setConfirmNew(true)
                  setMenuOpen(false)
                }}
              >
                <Plus className="h-4 w-4" strokeWidth={2} aria-hidden="true" />
                New Recommendation
              </ActionButton>
            </nav>
          </div>
        ) : null}

        {/* Stepper (workspace only) */}
        {tab === 'workspace' ? (
          <div className="border-t border-border py-3">
            <div className="mx-auto max-w-7xl">
              <Stepper />
            </div>
          </div>
        ) : null}
      </header>

      {/* Main content */}
      <main className={cn('relative z-10 mx-auto max-w-7xl', pad, spacing)}>
        {tab === 'workspace' ? (
          <div key={step} className="animate-fade-up">
            {step === 'objectives' ? <ObjectivesStep /> : null}
            {step === 'context' ? <ContextStep /> : null}
            {step === 'review' ? <ReviewStep /> : null}
            {step === 'analysis' ? <AnalysisStep /> : null}
            {step === 'recommendation' ? <RecommendationStep /> : null}
          </div>
        ) : null}
        {tab === 'knowledge' ? <KnowledgeBase /> : null}
        {tab === 'assistant' ? <Assistant /> : null}
        {tab === 'settings' ? <SettingsPanel /> : null}
      </main>

      {/* New recommendation confirm */}
      {confirmNew ? (
        <div
          className="fixed inset-0 z-50 flex items-center justify-center bg-background/70 p-6 backdrop-blur-sm"
          role="dialog"
          aria-modal="true"
          aria-labelledby="confirm-new-title"
        >
          <div className="w-full max-w-md rounded-xl border border-border-strong bg-card-2 p-6 shadow-2xl">
            <h2 id="confirm-new-title" className="text-lg font-semibold">
              Start a new security assessment?
            </h2>
            <p className="mt-2 text-sm leading-relaxed text-muted-foreground">
              This will clear your current objectives, system context, and generated recommendation.
            </p>
            <div className="mt-6 flex flex-col-reverse gap-3 sm:flex-row sm:justify-end">
              <ActionButton variant="secondary" onClick={() => setConfirmNew(false)}>
                Cancel
              </ActionButton>
              <ActionButton
                variant="primary"
                onClick={() => {
                  resetAll()
                  setConfirmNew(false)
                }}
              >
                Start New
              </ActionButton>
            </div>
          </div>
        </div>
      ) : null}
    </div>
  )
}
