'use client'

import {
  createContext,
  useCallback,
  useContext,
  useEffect,
  useMemo,
  useState,
} from 'react'
import { generateRecommendation } from '@/lib/crypto/engine'

export const STEP_ORDER = ['objectives', 'context', 'review', 'recommendation']

const emptyContext = {
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

const defaultSettings = {
  backgroundEffects: true,
  cursorEffects: false,
  reduceMotion: false,
  spacing: 'comfortable',
  reduceAnimation: false,
  highContrast: false,
}

const StoreContext = createContext(null)

export function StoreProvider({ children }) {
  const [tab, setTab] = useState('workspace')
  const [step, setStep] = useState('objectives')
  const [selections, setSelections] = useState({})
  const [context, setContextState] = useState(emptyContext)
  const [recommendation, setRecommendation] = useState(null)
  const [aiAnalysis, setAiAnalysis] = useState(null)
  const [compareSelection, setCompareSelection] = useState(['ecdsa-p256', 'ml-dsa'])
  const [settings, setSettingsState] = useState(defaultSettings)

  const goToStep = useCallback((s) => {
    setStep(s)
    setTab('workspace')
    if (typeof window !== 'undefined') window.scrollTo({ top: 0, behavior: 'smooth' })
  }, [])

  const toggleObjective = useCallback((id) => {
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

  const toggleSubOption = useCallback((objId, subId) => {
    setSelections((prev) => {
      const current = prev[objId] ?? []
      const exists = current.includes(subId)
      return {
        ...prev,
        [objId]: exists ? current.filter((s) => s !== subId) : [...current, subId],
      }
    })
  }, [])

  const setContext = useCallback((patch) => {
    setContextState((prev) => ({ ...prev, ...patch }))
  }, [])

  const toggleContextArray = useCallback(
    (key, value) => {
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
    setAiAnalysis(null)
    if (typeof window !== 'undefined') window.scrollTo({ top: 0, behavior: 'smooth' })
    const rec = generateRecommendation(selections, context)
    
    // Fetch AI Analysis in parallel
    fetch('/api/analyze-workspace', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ selections, context }),
    })
      .then((res) => res.json())
      .then((data) => {
        if (data.analysis) setAiAnalysis(data.analysis)
      })
      .catch((err) => console.error('AI Analysis failed:', err))

    window.setTimeout(() => {
      setRecommendation(rec)
      setStep('recommendation')
    }, 2200)
  }, [selections, context])

  const toggleCompare = useCallback((id) => {
    setCompareSelection((prev) => {
      if (prev.includes(id)) return prev.filter((p) => p !== id)
      if (prev.length >= 3) return [...prev.slice(1), id]
      return [...prev, id]
    })
  }, [])

  const setSettings = useCallback((patch) => {
    setSettingsState((prev) => ({ ...prev, ...patch }))
  }, [])

  const resetAll = useCallback(() => {
    setSelections({})
    setContextState(emptyContext)
    setRecommendation(null)
    setAiAnalysis(null)
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
    const handler = (e) => {
      const root = document.documentElement
      root.style.setProperty('--cursor-x', `${e.clientX}px`)
      root.style.setProperty('--cursor-y', `${e.clientY}px`)
    }
    window.addEventListener('mousemove', handler)
    return () => window.removeEventListener('mousemove', handler)
  }, [settings.cursorEffects])

  const objectiveCount = Object.keys(selections).length
  const requirementCount = Object.values(selections).reduce((acc, arr) => acc + arr.length, 0)

  const value = useMemo(
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
      aiAnalysis,
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
      aiAnalysis,
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
