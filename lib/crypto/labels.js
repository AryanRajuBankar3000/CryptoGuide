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

function lookup(list, id) {
  if (!id) return null
  return list.find((x) => x.id === id)?.label ?? id
}

function lookupMany(list, ids) {
  return ids.map((id) => list.find((x) => x.id === id)?.label ?? id)
}

export const label = {
  projectType: (id) => lookup(PROJECT_TYPES, id),
  lifetime: (id) => lookup(LIFETIMES, id),
  threat: (id) => lookup(THREATS, id),
  hardware: (id) => lookup(HARDWARE, id),
  hsm: (id) => lookup(HSM_OPTIONS, id),
  hwAccel: (ids) => lookupMany(HW_ACCEL, ids),
  pqc: (id) => lookup(PQC_READINESS, id),
  migration: (id) => lookup(MIGRATION_STRATEGY, id),
  regulatory: (ids) => lookupMany(REGULATORY, ids),
  performance: (ids) => lookupMany(PERFORMANCE, ids),
}

export function objectiveTitle(id) {
  return OBJECTIVES.find((o) => o.id === id)?.title ?? id
}

export function subOptionLabels(objId, subIds) {
  const obj = OBJECTIVES.find((o) => o.id === objId)
  if (!obj) return subIds
  return subIds.map((sid) => obj.subOptions.find((s) => s.id === sid)?.label ?? sid)
}
