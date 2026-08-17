import { getRecommendation } from '../../../lib/ruleEngine.js';

export async function POST(request) {
  const body = await request.json();
  const { useCaseKey, vehicleLifetimeYears, threatLevel } = body;

  if (!useCaseKey) {
    return Response.json(
      { error: 'useCaseKey is required' },
      { status: 400 }
    );
  }

  const result = getRecommendation(
    useCaseKey,
    Number(vehicleLifetimeYears) || 0,
    threatLevel || 'Medium'
  );

  return Response.json(result);
}