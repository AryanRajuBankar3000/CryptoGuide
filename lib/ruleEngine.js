import fs from 'fs';
import path from 'path';

// Loads the knowledge base JSON from /data
function loadKnowledgeBase() {
  const filePath = path.join(process.cwd(), 'data', 'knowledge-base.json');
  const raw = fs.readFileSync(filePath, 'utf-8');
  return JSON.parse(raw);
}

// Main recommendation function
// useCaseKey must match a key in knowledge-base.json (e.g. "SecureBoot")
export function getRecommendation(useCaseKey, vehicleLifetimeYears, threatLevel) {
  const kb = loadKnowledgeBase();
  const entry = kb[useCaseKey];

  if (!entry) {
    return {
      error: `Unknown use case: ${useCaseKey}`
    };
  }

  // Clone so we don't mutate the original knowledge base object
  const result = { ...entry };

  // Rule: if vehicle lifetime is long, escalate PQC urgency
  if (vehicleLifetimeYears >= 15) {
    result.pqcUrgency = 'High — plan PQC migration now';
  } else if (vehicleLifetimeYears >= 10) {
    result.pqcUrgency = 'Medium — monitor PQC transition timeline';
  } else {
    result.pqcUrgency = 'Low — current algorithm adequate for this lifetime';
  }

  // Rule: if threat level is high, add an extra risk flag
  if (threatLevel === 'High' && result.riskFlags.length === 0) {
    result.riskFlags = [...result.riskFlags, 'High threat environment — review implementation hardening'];
  }

  return result;
}

// For multi-use-case sessions
export function getMultipleRecommendations(useCaseKeys, vehicleLifetimeYears, threatLevel) {
  const results = useCaseKeys.map((key) =>
    getRecommendation(key, vehicleLifetimeYears, threatLevel)
  );

  // Combined summary: find the most critical (has any riskFlags, prioritize those with PQC urgency High)
  const mostCritical = results
    .filter((r) => !r.error)
    .sort((a, b) => {
      const score = (r) => (r.pqcUrgency?.startsWith('High') ? 2 : r.riskFlags.length > 0 ? 1 : 0);
      return score(b) - score(a);
    })[0];

  return {
    individual: results,
    combinedSummary: {
      mostCriticalUseCase: mostCritical?.useCase || null,
      prioritizedActionList: results
        .filter((r) => !r.error && r.riskFlags.length > 0)
        .map((r) => `${r.useCase}: ${r.riskFlags[0]}`)
    }
  };
}