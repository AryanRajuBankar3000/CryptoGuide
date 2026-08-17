'use client'

import {
  createContext,
  useCallback,
  useContext,
  useEffect,
  useMemo,
  useState,
} from 'react'
import type {
  ContextState,
  Recommendation,
  Selections,
  Settings,
} from '@/lib/crypto/types'
import { generateRecommendation } from '@/lib/crypto/engine'

export type Tab = 'workspace' | 'knowledge' | 'assistant' | 'settings'
export type Step = 'objectives' | 'context' | 'review' | 'analysis' | 'recommendation'

export const STEP_ORDER: Step[] = ['objectives', 'context', 'review', 'recommendation']

const emptyContext: ContextState = {
  projectType: null,
  lifetime: null,
  threat: null,
  hardware: null,
  hsm: null,
  hwAccel: [],
  pqc: null,
  migration: null,
  regulatory: [],
  performance: [],
  notes: '',
}

const defaultSettings: Settings = {
  backgroundEffects: true,
  cursorEffects: false,
  reduceMotion: false,
  spacing: 'comfortable',
  reduceAnimation: false,
  highContrast: false,
}

type StoreValue = {
  tab: Tab
  setTab: (t: Tab) => void
  step: Step
  goToStep: (s: Step) => void
  selections: Selections
  toggleObjective: (id: string) => void
  toggleSubOption: (objId: string, subId: string) => void
  context: ContextState
  setContext: (patch: Partial<ContextState>) => void
  toggleContextArray: (key: 'hwAccel' | 'regulatory' | 'performance', value: string) => void
  recommendation: Recommendation | null
  runAnalysis: () => void
  compareSelection: string[]
  toggleCompare: (id: string) => void
  settings: Settings
  setSettings: (patch: Partial<Settings>) => void
  resetAll: () => void
  objectiveCount: number
  requirementCount: number
}

const StoreContext = createContext<StoreValue | null>(null)

export function StoreProvider({ children }: { children: React.ReactNode }) {
  const [tab, setTab] = useState<Tab>('workspace')
  const [step, setStep] = useState<Step>('objectives')
  const [selections, setSelections] = useState<Selections>({})
  const [context, setContextState] = useState<ContextState>(emptyContext)
  const [recommendation, setRecommendation] = useState<Recommendation | null>(null)
  const [compareSelection, setCompareSelection] = useState<string[]>(['ecdsa-p256', 'ml-dsa'])
  const [settings, setSettingsState] = useState<Settings>(defaultSettings)

  const goToStep = useCallback((s: Step) => {
    setStep(s)
    setTab('workspace')
    if (typeof window !== 'undefined') window.scrollTo({ top: 0, behavior: 'smooth' })
  }, [])

  const toggleObjective = useCallback((id: string) => {
    setSelections((prev) => {
      const next = { ...prev }
      if (next[id]) {
        delete next[id]
      } else {
        next[id] = []
      }
      return next
    })
  }, [])

  const toggleSubOption = useCallback((objId: string, subId: string) => {
    setSelections((prev) => {
      const current = prev[objId] ?? []
      const exists = current.includes(subId)
      return {
        ...prev,
        [objId]: exists ? current.filter((s) => s !== subId) : [...current, subId],
      }
    })
  }, [])

  const setContext = useCallback((patch: Partial<ContextState>) => {
    setContextState((prev) => ({ ...prev, ...patch }))
  }, [])

  const toggleContextArray = useCallback(
    (key: 'hwAccel' | 'regulatory' | 'performance', value: string) => {
      setContextState((prev) => {
        const arr = prev[key]
        return {
          ...prev,
          [key]: arr.includes(value) ? arr.filter((v) => v !== value) : [...arr, value],
        }
      })
    },
    [],
  )

  const runAnalysis = useCallback(() => {
    setStep('analysis')
    setTab('workspace')
    if (typeof window !== 'undefined') window.scrollTo({ top: 0, behavior: 'smooth' })
    const rec = generateRecommendation(selections, context)
    window.setTimeout(() => {
      setRecommendation(rec)
      setStep('recommendation')
    }, 2200)
  }, [selections, context])

  const toggleCompare = useCallback((id: string) => {
    setCompareSelection((prev) => {
      if (prev.includes(id)) return prev.filter((p) => p !== id)
      if (prev.length >= 3) return [...prev.slice(1), id]
      return [...prev, id]
    })
  }, [])

  const setSettings = useCallback((patch: Partial<Settings>) => {
    setSettingsState((prev) => ({ ...prev, ...patch }))
  }, [])

  const resetAll = useCallback(() => {
    setSelections({})
    setContextState(emptyContext)
    setRecommendation(null)
    setStep('objectives')
    setTab('workspace')
    if (typeof window !== 'undefined') window.scrollTo({ top: 0, behavior: 'smooth' })
  }, [])

  // Apply visual settings to the document
  useEffect(() => {
    const root = document.documentElement
    root.classList.toggle('reduce-motion', settings.reduceMotion || settings.reduceAnimation)
    root.classList.toggle('high-contrast', settings.highContrast)
    root.classList.toggle('cursor-spotlight', settings.cursorEffects)
  }, [settings])

  useEffect(() => {
    if (!settings.cursorEffects) return
    const handler = (e: MouseEvent) => {
      const root = document.documentElement
      root.style.setProperty('--cursor-x', `${e.clientX}px`)
      root.style.setProperty('--cursor-y', `${e.clientY}px`)
    }
    window.addEventListener('mousemove', handler)
    return () => window.removeEventListener('mousemove', handler)
  }, [settings.cursorEffects])

  const objectiveCount = Object.keys(selections).length
  const requirementCount = Object.values(selections).reduce((acc, arr) => acc + arr.length, 0)

  const value = useMemo<StoreValue>(
    () => ({
      tab,
      setTab,
      step,
      goToStep,
      selections,
      toggleObjective,
      toggleSubOption,
      context,
      setContext,
      toggleContextArray,
      recommendation,
      runAnalysis,
      compareSelection,
      toggleCompare,
      settings,
      setSettings,
      resetAll,
      objectiveCount,
      requirementCount,
    }),
    [
      tab,
      step,
      goToStep,
      selections,
      toggleObjective,
      toggleSubOption,
      context,
      setContext,
      toggleContextArray,
      recommendation,
      runAnalysis,
      compareSelection,
      toggleCompare,
      settings,
      setSettings,
      resetAll,
      objectiveCount,
      requirementCount,
    ],
  )

  return <StoreContext.Provider value={value}>{children}</StoreContext.Provider>
}

export function useStore() {
  const ctx = useContext(StoreContext)
  if (!ctx) throw new Error('useStore must be used within StoreProvider')
  return ctx
}
