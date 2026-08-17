import fs from 'fs';
import path from 'path';

// ─── Constants ───────────────────────────────────────────────────────────────
const CURRENT_YEAR = 2026;
const DEFAULT_BUFFER_YEARS = 4;

const THREAT_BUFFER_MODIFIER = {
  Low: -1,
  Medium: 0,
  High: 1,
  Critical: 2,
};

const RISK_GREEN = '🟢';
const RISK_YELLOW = '🟡';
const RISK_RED = '🔴';
const RISK_RANK = { [RISK_GREEN]: 0, [RISK_YELLOW]: 1, [RISK_RED]: 2 };

// Synonym mapping for fuzzy use-case resolution
const SYNONYMS = {
  otaupdates: 'Signatures',
  ota: 'Signatures',
  otaupdate: 'Signatures',
  firmwaresigning: 'Signatures',
  firmware: 'Signatures',
  codesigning: 'Signatures',
  v2x: 'Communication',
  v2xcommunication: 'Communication',
  vehicletovehicle: 'Communication',
  v2v: 'Communication',
  v2i: 'Communication',
  can: 'MAC_SecOC',
  canbus: 'MAC_SecOC',
  canfd: 'MAC_SecOC',
  secoc: 'MAC_SecOC',
  messageauthentication: 'MAC_SecOC',
  invehicle: 'MAC_SecOC',
  storage: 'DataEncryption',
  encryption: 'DataEncryption',
  dataatrest: 'DataEncryption',
  confidentiality: 'DataEncryption',
  boot: 'SecureBoot',
  bootloader: 'SecureBoot',
  bootchain: 'SecureBoot',
  lifecycle: 'KeyManagement',
  keyrotation: 'KeyManagement',
  keystorage: 'KeyManagement',
  provisioning: 'HSMProvisioning',
  keyinjection: 'HSMProvisioning',
  factory: 'HSMProvisioning',
  hash: 'Integrity',
  checksum: 'Integrity',
  sha: 'Integrity',
  random: 'RNG',
  entropy: 'RNG',
  seed: 'RNG',
  digitalsignatures: 'Signatures',
  digitalsignature: 'Signatures',
  signatures: 'Signatures',
  keyexchange: 'KeyExchange',
  keyagreement: 'KeyExchange',
  sessionkey: 'KeyExchange',
  handshake: 'KeyExchange',
  rng: 'RNG',
  randomnumber: 'RNG',
  integrity: 'Integrity',
  secureboot: 'SecureBoot',
  dataencryption: 'DataEncryption',
  macsecoc: 'MAC_SecOC',
  keymanagement: 'KeyManagement',
  hsmprovisioning: 'HSMProvisioning',
};

// ─── Helpers ─────────────────────────────────────────────────────────────────

function loadKnowledgeBase() {
  const filePath = path.join(process.cwd(), 'data', 'knowledge-base.json');
  const raw = fs.readFileSync(filePath, 'utf-8');
  return JSON.parse(raw);
}

/** Extract the first four-digit year (20xx) from a lifespan description. */
function extractDeprecationYear(securityLifespan) {
  if (!securityLifespan) return null;
  const matches = securityLifespan.match(/\b(20\d\d)\b/g);
  return matches ? parseInt(matches[0], 10) : null;
}

/** Heuristic: is the recommended algorithm post-quantum safe? */
function isQuantumSafe(entry) {
  const text = `${entry.pqcMigrationPath || ''} ${entry.rationale || ''} ${entry.recommendedAlgorithm || ''}`.toLowerCase();
  if (text.includes('no migration needed') || text.includes('not quantum-vulnerable') || text.includes('not applicable')) return true;
  if (text.includes('quantum-resistant') || text.includes('quantum resistant')) return true;
  if ((entry.recommendedAlgorithm || '').toLowerCase().includes('crystals')) return true;
  return false;
}

/** Strip non-alphanumeric and lowercase for fuzzy matching. */
function normalizeKey(key) {
  return String(key).replace(/[^a-zA-Z0-9]/g, '').toLowerCase();
}

/** Resolve a user-supplied use-case string to a knowledge-base entry. */
function resolveUseCaseEntry(useCase, kb) {
  if (!useCase) return null;
  const normTarget = normalizeKey(useCase);

  // Direct key match
  for (const [k, v] of Object.entries(kb)) {
    if (normalizeKey(k) === normTarget || normalizeKey(v.useCase || '') === normTarget) {
      return { entry: v, resolvedKey: k };
    }
  }

  // Synonym match
  const mappedKey = SYNONYMS[normTarget];
  if (mappedKey && kb[mappedKey]) return { entry: kb[mappedKey], resolvedKey: mappedKey };

  return null;
}

// ─── Risk Scoring ────────────────────────────────────────────────────────────

function scoreEntry(entry, vehicleLifetimeYears, threatLevel, pqcRequired) {
  const algoName = entry.recommendedAlgorithm || 'Unknown';
  const lifespanStr = entry.securityLifespan || '';
  const depYear = extractDeprecationYear(lifespanStr);
  const safeUntilYear = CURRENT_YEAR + vehicleLifetimeYears;
  const bufferYears = DEFAULT_BUFFER_YEARS + (THREAT_BUFFER_MODIFIER[threatLevel] || 0);
  const quantumSafe = isQuantumSafe(entry);

  let risk, reason;

  if (pqcRequired && !quantumSafe) {
    risk = RISK_RED;
    reason = `PQC required but ${algoName} is quantum-vulnerable. ${entry.pqcMigrationPath || 'Migrate to a PQC algorithm.'}`;
  } else if (quantumSafe) {
    risk = RISK_GREEN;
    reason = `${algoName} is quantum-resistant or symmetric — ${lifespanStr}.`;
  } else if (depYear === null) {
    risk = RISK_YELLOW;
    reason = `${algoName} has no explicit deprecation year. Note: ${lifespanStr}.`;
  } else if (safeUntilYear < depYear - bufferYears) {
    risk = RISK_GREEN;
    reason = `${algoName} remains secure through vehicle retirement (${safeUntilYear}), well within estimated horizon (~${depYear}).`;
  } else if (safeUntilYear <= depYear) {
    risk = RISK_YELLOW;
    reason = `${algoName} lifetime cuts close — vehicle retires ${safeUntilYear}, horizon ~${depYear}. Plan migration.`;
  } else {
    risk = RISK_RED;
    reason = `${algoName} horizon (~${depYear}) expires while vehicle is still active (until ${safeUntilYear}). ${entry.pqcMigrationPath || 'Immediate action required.'}`;
  }

  return {
    algorithm: algoName,
    mode: entry.mode,
    keyLength: entry.keyLength,
    risk,
    reason,
    deprecationYear: depYear,
    standards: entry.standardsRefs || [],
    migrationPath: entry.pqcMigrationPath || '',
    riskFlags: entry.riskFlags || [],
    rationale: entry.rationale || '',
    securityLifespan: lifespanStr,
  };
}

// ─── Public API ──────────────────────────────────────────────────────────────

/**
 * Get a recommendation for a single use case.
 */
export function getRecommendation(useCaseKey, vehicleLifetimeYears = 15, threatLevel = 'Medium', pqcRequired = false) {
  const kb = loadKnowledgeBase();
  const resolved = resolveUseCaseEntry(useCaseKey, kb);

  if (!resolved) {
    return {
      error: `Unknown use case: "${useCaseKey}"`,
      useCase: useCaseKey,
      recommended: [],
    };
  }

  const { entry } = resolved;
  const scored = scoreEntry(entry, vehicleLifetimeYears, threatLevel, pqcRequired);

  // PQC urgency label
  let pqcUrgency;
  if (vehicleLifetimeYears >= 15) pqcUrgency = 'High — plan PQC migration now';
  else if (vehicleLifetimeYears >= 10) pqcUrgency = 'Medium — monitor PQC transition timeline';
  else pqcUrgency = 'Low — current algorithm adequate for this lifetime';

  return {
    useCase: entry.useCase,
    ...scored,
    pqcUrgency,
  };
}

/**
 * Get recommendations for multiple use cases with a combined summary.
 */
export function getMultipleRecommendations(queries) {
  const results = queries.map((q) =>
    getRecommendation(
      q.useCaseKey || q.use_case || '',
      Number(q.vehicleLifetimeYears || q.vehicle_lifetime) || 15,
      q.threatLevel || q.threat_level || 'Medium',
      Boolean(q.pqcRequired || q.pqc_required),
    ),
  );

  const valid = results.filter((r) => !r.error);

  // Risk counts
  const counts = { green: 0, yellow: 0, red: 0 };
  for (const r of valid) {
    if (r.risk === RISK_GREEN) counts.green++;
    else if (r.risk === RISK_YELLOW) counts.yellow++;
    else if (r.risk === RISK_RED) counts.red++;
  }

  // Highest risk
  let highestRisk = RISK_GREEN;
  if (counts.red > 0) highestRisk = RISK_RED;
  else if (counts.yellow > 0) highestRisk = RISK_YELLOW;

  // Priority actions
  const actionable = valid
    .filter((r) => r.risk === RISK_RED || r.risk === RISK_YELLOW)
    .sort((a, b) => (RISK_RANK[b.risk] || 0) - (RISK_RANK[a.risk] || 0));

  const priorityActions = actionable.map((r) => {
    const prefix = r.risk === RISK_RED ? 'URGENT' : 'MONITOR';
    const dep = r.deprecationYear ? ` (~${r.deprecationYear})` : '';
    return `${prefix}: [${r.useCase}] ${r.algorithm}${dep} — ${r.reason}`;
  });

  // Most critical
  const sorted = [...valid].sort((a, b) => (RISK_RANK[b.risk] || 0) - (RISK_RANK[a.risk] || 0));
  const mostCritical = sorted[0];

  return {
    individual: results,
    combinedSummary: {
      highestRisk,
      riskCounts: counts,
      priorityActions,
      mostCriticalUseCase: mostCritical?.useCase || null,
    },
  };
}

/**
 * Return list of all available use cases from the knowledge base.
 */
export function getAvailableUseCases() {
  const kb = loadKnowledgeBase();
  return Object.entries(kb).map(([key, value]) => ({
    key,
    label: value.useCase,
    mode: value.mode,
  }));
}