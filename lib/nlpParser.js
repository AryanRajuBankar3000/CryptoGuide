/**
 * CryptoGuide — NLP / Natural Language Preprocessor (JavaScript port)
 *
 * Converts a free-form engineer query (e.g. "OTA updates for a truck lasting
 * 15 years, high threat, must be quantum-safe") into a structured dict that
 * the rule engine can consume.
 *
 * This is a deterministic keyword/regex classifier — no ML model, no LLM call.
 */

// ─── Use-Case Keywords ──────────────────────────────────────────────────────

const USE_CASE_KEYWORDS = {
  SecureBoot: [
    'secure boot', 'bootloader', 'boot integrity', 'boot process', 'boot chain',
  ],
  Signatures: [
    'ota', 'over-the-air', 'over the air', 'firmware update', 'software update',
    'remote update', 'firmware upgrade', 'code signing', 'sign firmware',
    'signature verification', 'signing', 'digital signature',
  ],
  Communication: [
    'v2x', 'vehicle-to-vehicle', 'vehicle to vehicle', 'v2v',
    'vehicle-to-infrastructure', 'v2i', 'car-to-car', 'c-v2x',
  ],
  MAC_SecOC: [
    'secoc', 'can bus', 'can-fd', 'can fd', 'in-vehicle network',
    'message authentication', 'intra-vehicle', 'ecu to ecu', 'ecu-to-ecu',
    'inter-ecu',
  ],
  KeyExchange: [
    'key exchange', 'key agreement', 'session key', 'handshake', 'key establishment',
  ],
  DataEncryption: [
    'data at rest', 'storage encryption', 'encrypt data', 'confidentiality',
    'encrypted storage',
  ],
  Integrity: [
    'integrity check', 'hash verification', 'checksum', 'data integrity',
  ],
  RNG: [
    'random number', 'rng', 'entropy source', 'seed generation', 'true random',
  ],
  KeyManagement: [
    'key management', 'key storage', 'key rotation', 'key lifecycle', 'key wrapping',
  ],
  HSMProvisioning: [
    'hsm provisioning', 'secure element provisioning', 'key injection',
    'factory provisioning',
  ],
};

// ─── Threat-Level Keywords (checked in severity order) ───────────────────────

const THREAT_LEVEL_KEYWORDS = [
  ['Critical', ['critical threat', 'critical risk', 'nation-state', 'safety-critical attack', 'threat level is critical', 'threat: critical']],
  ['High', ['high threat', 'high risk', 'high security', 'adversarial', 'remote attacker', 'threat level is high', 'threat: high', 'highly targeted']],
  ['Medium', ['medium threat', 'moderate threat', 'moderate risk', 'threat level is medium', 'threat: medium']],
  ['Low', ['low threat', 'low risk', 'minimal threat', 'threat level is low', 'threat: low']],
];

const THREAT_PROXIMITY_RE = /\b(critical|high|medium|moderate|low)\b[^.]{0,25}\b(threat|risk)\b|\b(threat|risk)\b[^.]{0,25}\b(critical|high|medium|moderate|low)\b/i;

// ─── PQC Keywords ────────────────────────────────────────────────────────────

const PQC_KEYWORDS = [
  'post-quantum', 'post quantum', 'quantum-safe', 'quantum safe',
  'quantum-resistant', 'quantum resistant', 'quantum threat',
  'pqc', 'quantum computer', 'harvest now decrypt later', 'hndl',
];

// ─── Hardware Keywords ───────────────────────────────────────────────────────

const CONSTRAINED_HW = [
  'limited ram', 'constrained', 'low memory', 'no accelerator',
  'resource-constrained', 'resource constrained', '8-bit', 'low-power',
  'low power', 'microcontroller', 'no hardware crypto', 'small flash',
];
const ACCELERATED_HW = [
  'hardware accelerator', 'hsm', 'hardware security module', 'secure element',
  'crypto accelerator', 'powerful', 'high-performance ecu',
];

// ─── Regulatory Keywords ─────────────────────────────────────────────────────

const REGULATORY_KEYWORDS = {
  'ISO/SAE 21434': ['iso 21434', 'iso/sae 21434', '21434'],
  'UNECE WP.29 R155': ['r155', 'wp.29 r155', 'unece r155'],
  'UNECE WP.29 R156': ['r156', 'wp.29 r156', 'unece r156'],
  'NIST FIPS 140-2': ['fips 140', 'fips140'],
  'ENISA': ['enisa'],
};

// ─── Defaults ────────────────────────────────────────────────────────────────

const DEFAULT_VEHICLE_LIFETIME = 15;
const DEFAULT_THREAT_LEVEL = 'Medium';
const DEFAULT_USE_CASE = 'Unspecified';

// ─── Extraction Functions ────────────────────────────────────────────────────

function extractUseCases(textLower) {
  const scores = {};
  for (const [useCase, keywords] of Object.entries(USE_CASE_KEYWORDS)) {
    const hits = keywords.filter((kw) => textLower.includes(kw)).length;
    if (hits > 0) scores[useCase] = hits;
  }
  if (Object.keys(scores).length === 0) return { primary: DEFAULT_USE_CASE, all: [] };
  const sorted = Object.entries(scores).sort((a, b) => b[1] - a[1]);
  return { primary: sorted[0][0], all: sorted.map(([k]) => k) };
}

function extractVehicleLifetime(textLower) {
  const match = textLower.match(/(\d{1,2})\s*[-\s]?\s*(?:year|yr)s?/);
  if (match) return { value: parseInt(match[1], 10), found: true };
  return { value: DEFAULT_VEHICLE_LIFETIME, found: false };
}

function extractThreatLevel(textLower) {
  // Pass 1: exact phrase
  for (const [level, keywords] of THREAT_LEVEL_KEYWORDS) {
    if (keywords.some((kw) => textLower.includes(kw))) return { value: level, found: true };
  }
  // Pass 2: proximity pattern
  const match = THREAT_PROXIMITY_RE.exec(textLower);
  if (match) {
    const word = [match[1], match[4]].find((g) => g && !['threat', 'risk'].includes(g));
    if (word) {
      const level = word.toLowerCase() === 'moderate' ? 'Medium' : word.charAt(0).toUpperCase() + word.slice(1).toLowerCase();
      if (['Critical', 'High', 'Medium', 'Low'].includes(level)) return { value: level, found: true };
    }
  }
  return { value: DEFAULT_THREAT_LEVEL, found: false };
}

function extractPqcRequired(textLower) {
  return PQC_KEYWORDS.some((kw) => textLower.includes(kw));
}

function extractHardwareConstraint(textLower) {
  if (CONSTRAINED_HW.some((kw) => textLower.includes(kw))) return 'Constrained';
  if (ACCELERATED_HW.some((kw) => textLower.includes(kw))) return 'Accelerated';
  return 'Unspecified';
}

function extractRegulatoryScope(textLower) {
  const found = [];
  for (const [standard, keywords] of Object.entries(REGULATORY_KEYWORDS)) {
    if (keywords.some((kw) => textLower.includes(kw))) found.push(standard);
  }
  return found;
}

// ─── Main Entry Point ────────────────────────────────────────────────────────

/**
 * Parse a natural-language query into structured recommendation parameters.
 * Always returns a fully-populated object — never throws on bad input.
 */
export function parseNaturalQuery(userText) {
  if (!userText || !userText.trim()) {
    return {
      useCaseKey: DEFAULT_USE_CASE,
      vehicleLifetime: DEFAULT_VEHICLE_LIFETIME,
      threatLevel: DEFAULT_THREAT_LEVEL,
      pqcRequired: false,
      hardwareConstraint: 'Unspecified',
      regulatoryScope: [],
      detectedUseCases: [],
      extractionNotes: ['Empty query — all fields defaulted.'],
    };
  }

  const textLower = userText.toLowerCase();
  const notes = [];

  const { primary, all } = extractUseCases(textLower);
  if (primary === DEFAULT_USE_CASE) {
    notes.push('No specific use case detected — defaulted to general guidance.');
  } else if (all.length > 1) {
    notes.push(`Multiple use cases detected: ${all.join(', ')}. Primary: ${primary}.`);
  }

  const lifetime = extractVehicleLifetime(textLower);
  if (!lifetime.found) notes.push(`Vehicle lifetime not specified — defaulted to ${DEFAULT_VEHICLE_LIFETIME} years.`);

  const threat = extractThreatLevel(textLower);
  if (!threat.found) notes.push(`Threat level not specified — defaulted to ${DEFAULT_THREAT_LEVEL}.`);

  const pqcRequired = extractPqcRequired(textLower);
  const hardwareConstraint = extractHardwareConstraint(textLower);
  const regulatoryScope = extractRegulatoryScope(textLower);

  return {
    useCaseKey: primary,
    vehicleLifetime: lifetime.value,
    threatLevel: threat.value,
    pqcRequired,
    hardwareConstraint,
    regulatoryScope,
    detectedUseCases: all,
    extractionNotes: notes,
  };
}
