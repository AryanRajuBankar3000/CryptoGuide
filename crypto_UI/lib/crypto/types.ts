export type SubOption = {
  id: string
  label: string
}

export type Objective = {
  id: string
  title: string
  short: string
  description: string
  icon: string
  subOptions: SubOption[]
}

export type ContextState = {
  projectType: string | null
  lifetime: string | null
  threat: string | null
  hardware: string | null
  hsm: string | null
  hwAccel: string[]
  pqc: string | null
  migration: string | null
  regulatory: string[]
  performance: string[]
  notes: string
}

export type Selections = Record<string, string[]>

export type Settings = {
  backgroundEffects: boolean
  cursorEffects: boolean
  reduceMotion: boolean
  spacing: 'comfortable' | 'compact'
  reduceAnimation: boolean
  highContrast: boolean
}

export type Confidence = 'HIGH' | 'MEDIUM' | 'LOW'
export type Priority = 'HIGH' | 'MEDIUM' | 'LOW'

export type CryptoDetail = {
  category: string
  algorithm: string
  why: string
  strength: string
  pqc: string
  migration: string
  reference: string
}

export type RiskFlag = {
  kind: 'danger' | 'warning' | 'success'
  title: string
  detail: string
}

export type HardwareImpact = {
  label: string
  value: string
  level: 1 | 2 | 3
}

export type WhyPoint = {
  kind: 'good' | 'warn' | 'arrow'
  text: string
}

export type UseCaseRecommendation = {
  objectiveId: string
  objectiveTitle: string
  primaryAlgorithm: string
  confidence: Confidence
  priority: Priority
  summary: string
  why: WhyPoint[]
  crypto: CryptoDetail[]
  risks: RiskFlag[]
  hardware: HardwareImpact[]
  posture: {
    score: number
    strong: string[]
    attention: string[]
  }
  lifecycle: { title: string; detail: string }[]
}

export type Recommendation = {
  useCases: UseCaseRecommendation[]
}

export type KnowledgeEntry = {
  id: string
  algorithm: string
  primaryUse: string
  securityStatus: 'RECOMMENDED' | 'PQC STANDARD' | 'MIGRATION PLANNED' | 'AVOID'
  pqcStatus: string
  automotiveRelevance: string
  reference: string
  strength: string
  details: string
}
