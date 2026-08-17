import { OBJECTIVES } from './data'

const CRYPTO_LIB = {
  'ecdsa-p256': {
    category: 'Signing',
    algorithm: 'ECDSA P-256',
    why: 'Suitable for current automotive signing deployments with a mature ecosystem.',
    strength: 'High (classical)',
    pqc: 'Not quantum-resistant',
    migration: 'Plan hybrid transition',
    reference: 'NIST FIPS 186-5',
  },
  'sha-256': {
    category: 'Hashing',
    algorithm: 'SHA-256',
    why: 'Strong general-purpose integrity hash with a wide margin.',
    strength: 'High',
    pqc: 'Strong margin',
    migration: 'No migration required',
    reference: 'NIST FIPS 180-4',
  },
  'sha-384': {
    category: 'Hashing',
    algorithm: 'SHA-384',
    why: 'Extra digest margin appropriate for high-assurance systems.',
    strength: 'High',
    pqc: 'Strong margin',
    migration: 'No migration required',
    reference: 'NIST FIPS 180-4',
  },
  'ecdh-p256': {
    category: 'Key Exchange',
    algorithm: 'ECDH P-256',
    why: 'Efficient classical key agreement for session establishment.',
    strength: 'High (classical)',
    pqc: 'Not quantum-resistant',
    migration: 'Move to hybrid ECDH + ML-KEM',
    reference: 'NIST SP 800-56A',
  },
  'aes-256-gcm': {
    category: 'Encryption',
    algorithm: 'AES-256-GCM',
    why: 'Authenticated encryption with a strong symmetric quantum margin.',
    strength: 'High',
    pqc: 'Strong symmetric margin',
    migration: 'No migration required',
    reference: 'NIST FIPS 197 / SP 800-38D',
  },
  'aes-cmac': {
    category: 'Message Auth',
    algorithm: 'AES-CMAC-128',
    why: 'Efficient MAC for in-vehicle network authentication.',
    strength: 'High',
    pqc: 'Strong symmetric margin',
    migration: 'No migration required',
    reference: 'NIST SP 800-38B',
  },
  hsm: {
    category: 'Key Protection',
    algorithm: 'HSM recommended',
    why: 'Protects private keys and provides secure storage and acceleration.',
    strength: 'High',
    pqc: 'Depends on HSM firmware',
    migration: 'Verify PQC support in roadmap',
    reference: 'EVITA / AUTOSAR CSM',
  },
  'ml-kem': {
    category: 'PQC Key Exchange',
    algorithm: 'ML-KEM-768',
    why: 'NIST-standardized lattice KEM for quantum-resistant key exchange.',
    strength: 'High (PQC)',
    pqc: 'Quantum-resistant',
    migration: 'Deploy in hybrid mode first',
    reference: 'NIST FIPS 203',
  },
  'ml-dsa': {
    category: 'PQC Signing',
    algorithm: 'ML-DSA-65',
    why: 'NIST-standardized lattice signature for future firmware signing.',
    strength: 'High (PQC)',
    pqc: 'Quantum-resistant',
    migration: 'Evaluate flash / verify cost',
    reference: 'NIST FIPS 204',
  },
  drbg: {
    category: 'Randomness',
    algorithm: 'CTR_DRBG + TRNG',
    why: 'Validated deterministic RNG seeded by a hardware entropy source.',
    strength: 'High',
    pqc: 'N/A',
    migration: 'No migration required',
    reference: 'NIST SP 800-90A/B',
  },
  hmac: {
    category: 'Message Auth',
    algorithm: 'HMAC-SHA-256',
    why: 'Keyed integrity with a strong quantum margin.',
    strength: 'High',
    pqc: 'Strong margin',
    migration: 'No migration required',
    reference: 'NIST FIPS 198-1',
  },
}

function pick(...ids) {
  return ids.map((id) => CRYPTO_LIB[id])
}

const BASE = {
  'secure-boot': {
    primaryAlgorithm: 'ECDSA P-256 + SHA-256',
    summary: 'Signed firmware verified at boot using an asymmetric signature and a strong integrity hash.',
    crypto: pick('ecdsa-p256', 'sha-256', 'hsm'),
    priorityWeight: 9,
    quantumVulnerable: true,
  },
  ota: {
    primaryAlgorithm: 'ECDSA P-256 + SHA-256',
    summary: 'OTA packages are signed and integrity-checked before installation, with optional encryption in transit.',
    crypto: pick('ecdsa-p256', 'sha-256', 'aes-256-gcm', 'hsm'),
    priorityWeight: 10,
    quantumVulnerable: true,
  },
  v2x: {
    primaryAlgorithm: 'ECDSA P-256 + SHA-256',
    summary: 'V2X messages are authenticated with short-lived certificates and protected against replay.',
    crypto: pick('ecdsa-p256', 'sha-256', 'ecdh-p256'),
    priorityWeight: 8,
    quantumVulnerable: true,
  },
  secoc: {
    primaryAlgorithm: 'AES-CMAC-128',
    summary: 'In-vehicle messages are authenticated with a MAC and a freshness counter per AUTOSAR SecOC.',
    crypto: pick('aes-cmac', 'sha-256', 'hsm'),
    priorityWeight: 7,
    quantumVulnerable: false,
  },
  'data-encryption': {
    primaryAlgorithm: 'AES-256-GCM',
    summary: 'Data at rest and in transit is protected with authenticated encryption.',
    crypto: pick('aes-256-gcm', 'sha-256', 'drbg'),
    priorityWeight: 6,
    quantumVulnerable: false,
  },
  'key-exchange': {
    primaryAlgorithm: 'ECDH P-256',
    summary: 'Shared secrets are established with elliptic-curve Diffie-Hellman and derived session keys.',
    crypto: pick('ecdh-p256', 'sha-256', 'drbg'),
    priorityWeight: 8,
    quantumVulnerable: true,
  },
  integrity: {
    primaryAlgorithm: 'SHA-256 / HMAC',
    summary: 'Integrity of data and firmware is verified with a strong hash and keyed MAC.',
    crypto: pick('sha-256', 'hmac'),
    priorityWeight: 5,
    quantumVulnerable: false,
  },
  rng: {
    primaryAlgorithm: 'CTR_DRBG + TRNG',
    summary: 'Cryptographic randomness is produced by a validated DRBG seeded from a hardware entropy source.',
    crypto: pick('drbg'),
    priorityWeight: 4,
    quantumVulnerable: false,
  },
}

function longLifetime(ctx) {
  return ctx.lifetime === '11-15' || ctx.lifetime === '16-20' || ctx.lifetime === '20+'
}

function wantsPqc(ctx) {
  return ctx.pqc === 'plan' || ctx.pqc === 'ready'
}

function buildUseCase(objId, ctx) {
  const objective = OBJECTIVES.find((o) => o.id === objId)
  const base = BASE[objId]
  const crypto = [...base.crypto]

  let primaryAlgorithm = base.primaryAlgorithm
  const why = []
  const risks = []

  if (ctx.hardware === 'constrained') {
    why.push({ kind: 'good', text: 'Lightweight primitives suit a constrained ECU with limited resources.' })
  } else {
    why.push({ kind: 'good', text: 'Well-supported by standard automotive ECU toolchains and libraries.' })
  }

  why.push({ kind: 'good', text: 'Mature automotive ecosystem with proven interoperability.' })

  if (base.crypto.some((c) => c.algorithm === 'HSM recommended')) {
    if (ctx.hsm === 'yes' || ctx.hardware === 'hsm') {
      why.push({ kind: 'good', text: 'An available HSM provides secure key storage and acceleration.' })
    } else if (ctx.hsm === 'no') {
      risks.push({
        kind: 'warning',
        title: 'No HSM available',
        detail: 'Private keys rely on software protection. Consider secure key storage or an HSM for higher assurance.',
      })
    } else {
      why.push({ kind: 'arrow', text: 'Confirm HSM availability to finalize the key-protection approach.' })
    }
  }

  const hybridApplied = base.quantumVulnerable && wantsPqc(ctx)
  if (base.quantumVulnerable) {
    why.push({ kind: 'warn', text: 'Not post-quantum resistant on its own.' })
    risks.push({
      kind: 'danger',
      title: 'Quantum vulnerability',
      detail: `${base.primaryAlgorithm.split(' + ')[0]} is not post-quantum resistant.`,
    })

    if (objId === 'key-exchange' || objId === 'v2x') {
      crypto.push(CRYPTO_LIB['ml-kem'])
    } else {
      crypto.push(CRYPTO_LIB['ml-dsa'])
    }

    if (hybridApplied) {
      const pqcName = objId === 'key-exchange' || objId === 'v2x' ? 'ML-KEM-768' : 'ML-DSA-65'
      primaryAlgorithm = `${base.primaryAlgorithm} → Hybrid + ${pqcName}`
      why.push({ kind: 'arrow', text: `Hybrid migration path added (${pqcName}) per your PQC plan.` })
    } else {
      why.push({ kind: 'arrow', text: 'Migration path recommended for long-term deployments.' })
    }
  } else {
    why.push({ kind: 'good', text: 'Symmetric primitive retains a strong margin against quantum attacks.' })
  }

  if (longLifetime(ctx) && base.quantumVulnerable) {
    risks.push({
      kind: 'warning',
      title: 'Long vehicle lifetime',
      detail: 'A long-lifecycle vehicle should have a documented post-quantum migration strategy.',
    })
  }

  risks.push({
    kind: 'success',
    title: 'Current deployment suitability',
    detail: 'Suitable for current classical automotive security requirements.',
  })

  let confidence = 'HIGH'
  if (ctx.threat === 'critical' && base.quantumVulnerable && !wantsPqc(ctx)) confidence = 'MEDIUM'
  if (!ctx.hardware || !ctx.threat) confidence = 'MEDIUM'

  const priority = base.priorityWeight >= 8 ? 'HIGH' : base.priorityWeight >= 6 ? 'MEDIUM' : 'LOW'

  const heavy = base.quantumVulnerable && hybridApplied
  const hardware = [
    { label: 'Flash / Storage', value: heavy ? 'Moderate → High' : 'Low → Moderate', level: heavy ? 3 : 2 },
    { label: 'Runtime Cost', value: heavy ? 'Moderate' : 'Low', level: heavy ? 2 : 1 },
    { label: 'RAM', value: heavy ? 'Moderate' : 'Low', level: heavy ? 2 : 1 },
    {
      label: 'HSM Requirement',
      value: ctx.hsm === 'yes' || ctx.hardware === 'hsm' ? 'Available' : 'Recommended',
      level: 2,
    },
  ]

  const strong = ['Authentication', 'Integrity']
  const attention = []
  if (base.quantumVulnerable && !wantsPqc(ctx)) attention.push('PQC readiness')
  if (ctx.hsm !== 'yes' && ctx.hardware !== 'hsm') attention.push('Key lifecycle')
  if (!base.quantumVulnerable) strong.push('Quantum margin')

  let score = 82
  if (base.quantumVulnerable && !wantsPqc(ctx)) score -= 8
  if (longLifetime(ctx) && base.quantumVulnerable && !wantsPqc(ctx)) score -= 6
  if (ctx.hsm === 'yes' || ctx.hardware === 'hsm') score += 6
  if (ctx.threat === 'critical') score -= 4
  if (hybridApplied) score += 6
  score = Math.max(48, Math.min(96, score))

  const lifecycle = [
    { title: 'Now', detail: 'Deploy current cryptography for this objective.' },
    { title: 'Platform Review', detail: 'Reassess cryptographic requirements at the next platform milestone.' },
    { title: 'Hybrid Migration', detail: 'Introduce a PQC-compatible hybrid architecture.' },
    { title: 'PQC Target', detail: 'Quantum-resistant deployment for long-lived vehicles.' },
  ]

  return {
    objectiveId: objId,
    objectiveTitle: objective.title,
    primaryAlgorithm,
    confidence,
    priority,
    summary: base.summary,
    why,
    crypto,
    risks,
    hardware,
    posture: { score, strong, attention },
    lifecycle,
  }
}

export function generateRecommendation(selections, ctx) {
  const ids = Object.keys(selections).filter((id) => BASE[id])
  const useCases = ids
    .map((id) => buildUseCase(id, ctx))
    .sort((a, b) => BASE[b.objectiveId].priorityWeight - BASE[a.objectiveId].priorityWeight)
  return { useCases }
}

export const COMPARE_ALGORITHMS = [
  {
    id: 'ecdsa-p256',
    name: 'ECDSA P-256',
    security: 'High (classical)',
    performance: 'Fast',
    memory: 'Low',
    hardwareSupport: 'Wide (ECC accel)',
    pqc: 'Not resistant',
    automotiveReadiness: 'Production',
    migrationComplexity: 'Low',
  },
  {
    id: 'ml-dsa',
    name: 'ML-DSA-65',
    security: 'High (PQC)',
    performance: 'Moderate',
    memory: 'High',
    hardwareSupport: 'Emerging',
    pqc: 'Quantum-resistant',
    automotiveReadiness: 'Early',
    migrationComplexity: 'High',
  },
  {
    id: 'hybrid',
    name: 'Hybrid ECDSA + ML-DSA',
    security: 'High (both)',
    performance: 'Moderate',
    memory: 'High',
    hardwareSupport: 'Partial',
    pqc: 'Quantum-resistant',
    automotiveReadiness: 'Transitional',
    migrationComplexity: 'Medium',
  },
  {
    id: 'ed25519',
    name: 'Ed25519',
    security: 'High (classical)',
    performance: 'Very fast',
    memory: 'Low',
    hardwareSupport: 'Growing',
    pqc: 'Not resistant',
    automotiveReadiness: 'Production',
    migrationComplexity: 'Low',
  },
]
