import { getRecommendation, getMultipleRecommendations, getAvailableUseCases } from '../../../lib/ruleEngine.js';
import { parseNaturalQuery } from '../../../lib/nlpParser.js';

/**
 * POST /api/recommend
 *
 * Accepts three input formats (can be combined):
 *   1. Single structured query:  { useCaseKey, vehicleLifetimeYears, threatLevel, pqcRequired }
 *   2. Multiple queries:         { queries: [{ useCaseKey, ... }, ...] }
 *   3. Natural language:         { naturalQuery: "..." }
 */
export async function POST(request) {
  try {
    const body = await request.json();
    const { useCaseKey, vehicleLifetimeYears, threatLevel, pqcRequired, queries, naturalQuery } = body;

    const allQueries = [];

    // 1. Single structured query (backward compatible)
    if (useCaseKey) {
      allQueries.push({
        useCaseKey,
        vehicleLifetimeYears: Number(vehicleLifetimeYears) || 15,
        threatLevel: threatLevel || 'Medium',
        pqcRequired: Boolean(pqcRequired),
      });
    }

    // 2. Array of structured queries
    if (Array.isArray(queries)) {
      for (const q of queries) {
        allQueries.push({
          useCaseKey: q.useCaseKey || '',
          vehicleLifetimeYears: Number(q.vehicleLifetimeYears) || 15,
          threatLevel: q.threatLevel || 'Medium',
          pqcRequired: Boolean(q.pqcRequired),
        });
      }
    }

    // 3. Natural language query → parse into structured params and add
    let nlpExtraction = null;
    if (naturalQuery && naturalQuery.trim()) {
      nlpExtraction = parseNaturalQuery(naturalQuery);
      // Add each detected use case as a separate query (or the primary one)
      if (nlpExtraction.detectedUseCases.length > 1) {
        for (const uc of nlpExtraction.detectedUseCases) {
          allQueries.push({
            useCaseKey: uc,
            vehicleLifetimeYears: nlpExtraction.vehicleLifetime,
            threatLevel: nlpExtraction.threatLevel,
            pqcRequired: nlpExtraction.pqcRequired,
          });
        }
      } else {
        allQueries.push({
          useCaseKey: nlpExtraction.useCaseKey,
          vehicleLifetimeYears: nlpExtraction.vehicleLifetime,
          threatLevel: nlpExtraction.threatLevel,
          pqcRequired: nlpExtraction.pqcRequired,
        });
      }
    }

    if (allQueries.length === 0) {
      return Response.json({ error: 'No queries provided. Send useCaseKey, queries[], or naturalQuery.' }, { status: 400 });
    }

    // Single query → flat response; multiple → batch response
    if (allQueries.length === 1) {
      const q = allQueries[0];
      const result = getRecommendation(q.useCaseKey, q.vehicleLifetimeYears, q.threatLevel, q.pqcRequired);
      return Response.json({ ...result, nlpExtraction });
    }

    const result = getMultipleRecommendations(allQueries);
    return Response.json({ ...result, nlpExtraction });
  } catch (err) {
    return Response.json({ error: err.message }, { status: 500 });
  }
}

/**
 * GET /api/recommend
 * Returns the list of available use-case categories from the knowledge base.
 */
export async function GET() {
  try {
    const useCases = getAvailableUseCases();
    return Response.json({ useCases });
  } catch (err) {
    return Response.json({ error: err.message }, { status: 500 });
  }
}