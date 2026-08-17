import { GoogleGenAI } from "@google/genai";
import { label, objectiveTitle, subOptionLabels } from '@/lib/crypto/labels';

const client = new GoogleGenAI({ apiKey: process.env.GEMINI_API_KEY });

const SYSTEM_PROMPT = `You are CryptoGuide, an expert automotive cryptographic architect.
The user has provided their system constraints and security objectives.
Your job is to provide a brief, professional, and insightful analysis of their architecture, specifically addressing any "Additional Notes" or custom context they provided.

Output your analysis as a single JSON object with a single field:
- "analysis": A 2-3 paragraph Markdown formatted text containing your insights.

Focus on:
1. Identifying potential bottlenecks, risks, or edge cases based on their exact hardware, lifetime, threat model, and notes.
2. Explaining how their chosen PQC migration strategy (or lack thereof) impacts their long-term security given their lifetime.
3. Don't be overly generic; be highly specific to the provided constraints.

If they provided "Additional Notes", you MUST address them directly in your analysis.`;

export async function POST(request) {
  try {
    const { selections, context } = await request.json();

    // Format the objectives
    const objectivesList = Object.entries(selections || {})
      .map(([objId, subs]) => {
        const title = objectiveTitle(objId);
        const subLabels = subOptionLabels(objId, subs);
        return `- ${title}${subLabels.length > 0 ? ` (${subLabels.join(', ')})` : ''}`;
      })
      .join('\n');

    // Format context
    const contextLines = [
      `Project Type: ${label.projectType(context.projectType) || 'Not specified'}`,
      `Vehicle Lifetime: ${label.lifetime(context.lifetime) || 'Not specified'}`,
      `Threat Model: ${label.threat(context.threat) || 'Not specified'}`,
      `Hardware Capabilities: ${label.hardware(context.hardware) || 'Not specified'}`,
      `HSM Availability: ${label.hsm(context.hsm) || 'Not specified'}`,
      `Hardware Acceleration: ${label.performance(context.hwAccel || []).join(', ') || 'None'}`,
      `PQC Readiness: ${label.pqc(context.pqc) || 'Not specified'}`,
      `PQC Migration Approach: ${label.migration(context.migration) || 'Not specified'}`,
      `Regulatory Compliance: ${label.regulatory(context.regulatory || []).join(', ') || 'None'}`,
      `Performance Priorities: ${label.performance(context.performance || []).join(', ') || 'None'}`,
      `Additional Notes: ${context.notes || 'None provided'}`,
    ].join('\n');

    const prompt = `
SECURITY OBJECTIVES:
${objectivesList || 'None selected'}

SYSTEM CONTEXT:
${contextLines}
    `.trim();

    const schema = {
      type: "object",
      properties: {
        analysis: { type: "string", description: "2-3 paragraphs of markdown formatting the analysis." }
      },
      required: ["analysis"]
    };

    const interaction = await client.interactions.create({
      model: "gemini-3.6-flash",
      system_instruction: SYSTEM_PROMPT,
      input: prompt,
      response_format: {
        type: "text",
        mime_type: "application/json",
        schema: schema
      },
    });

    const text = interaction.output_text;
    const data = JSON.parse(text);

    return Response.json(data);
  } catch (err) {
    console.error("Gemini API Error in analyze-workspace:", err);
    return Response.json({
      analysis: "Unable to generate AI insights at this time. Please check your API key configuration or try again later."
    }, { status: 500 });
  }
}
