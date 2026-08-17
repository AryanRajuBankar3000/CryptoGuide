import {
  OBJECTIVES,
  PROJECT_TYPES,
  LIFETIMES,
  THREATS,
  HARDWARE,
  HSM_OPTIONS,
  HW_ACCEL,
  PQC_READINESS,
  MIGRATION_STRATEGY,
  REGULATORY,
  PERFORMANCE,
} from './data'

function lookup(list: { id: string; label: string }[], id: string | null): string | null {
  if (!id) return null
  return list.find((x) => x.id === id)?.label ?? id
}

function lookupMany(list: { id: string; label: string }[], ids: string[]): string[] {
  return ids.map((id) => list.find((x) => x.id === id)?.label ?? id)
}

export const label = {
  projectType: (id: string | null) => lookup(PROJECT_TYPES, id),
  lifetime: (id: string | null) => lookup(LIFETIMES, id),
  threat: (id: string | null) => lookup(THREATS, id),
  hardware: (id: string | null) => lookup(HARDWARE, id),
  hsm: (id: string | null) => lookup(HSM_OPTIONS, id),
  hwAccel: (ids: string[]) => lookupMany(HW_ACCEL, ids),
  pqc: (id: string | null) => lookup(PQC_READINESS, id),
  migration: (id: string | null) => lookup(MIGRATION_STRATEGY, id),
  regulatory: (ids: string[]) => lookupMany(REGULATORY, ids),
  performance: (ids: string[]) => lookupMany(PERFORMANCE, ids),
}

export function objectiveTitle(id: string): string {
  return OBJECTIVES.find((o) => o.id === id)?.title ?? id
}

export function subOptionLabels(objId: string, subIds: string[]): string[] {
  const obj = OBJECTIVES.find((o) => o.id === objId)
  if (!obj) return subIds
  return subIds.map((sid) => obj.subOptions.find((s) => s.id === sid)?.label ?? sid)
}
