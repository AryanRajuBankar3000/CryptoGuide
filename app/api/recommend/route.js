import fs from 'fs';
import path from 'path';
import { GoogleGenAI } from "@google/genai";

const client = new GoogleGenAI({ apiKey: process.env.GEMINI_API_KEY });

let cachedKB = null;
function loadKnowledgeBase() {
  if (!cachedKB) {
    const filePath = path.join(process.cwd(), 'data', 'knowledge-base.json');
    cachedKB = fs.readFileSync(filePath, 'utf-8');
  }
  return cachedKB;
}

// Build a concise reference table instead of dumping the entire JSON
function buildKBReference() {
  const kb = JSON.parse(loadKnowledgeBase());
  const rows = Object.entries(kb).map(([key, v]) =>
    `- ${key}: algo="${v.recommendedAlgorithm}", key="${v.keyLength}", mode="${v.mode}", standards=[${v.standardsRefs.join(', ')}], pqc="${v.pqcMigrationPath}", risks=[${v.riskFlags.join('; ')}], lifespan="${v.securityLifespan}"`
  );
  return rows.join('\n');
}

const SYSTEM_PROMPT = `You are CryptoGuide, an automotive cryptographic recommendation assistant.

STEP 1 — CLASSIFY the user message:
• If the user is chatting (greetings, "what are you", general questions NOT about a specific cryptographic scenario), respond with type="chat".
• If the user asks about a cryptographic use case or scenario, respond with type="recommendation".

STEP 2 — RESPOND:

For type="chat": Write a helpful, natural response in the "message" field. Keep it conversational. Do NOT fill algorithm/key/mode fields.

For type="recommendation": You MUST fill ALL of these fields with specific, concrete values from the knowledge base:
  • useCase — the matched category name
  • algorithm — the specific algorithm name (e.g. "AES-256-GCM", "ECDSA P-256")
  • keyLength — the key size (e.g. "256-bit", "3072-bit")
  • mode — the crypto mode (e.g. "Authenticated Encryption", "Digital Signature")
  • riskLevel — "Low", "Medium", or "High"
  • rationale — 2-3 sentences explaining WHY this algorithm for this scenario
  • pqcMigrationPath — post-quantum migration advice or null
  • standardsRefs — array of standards
  • riskFlags — array of risk concerns

KNOWLEDGE BASE REFERENCE:
{KB_REF}

RULES:
• Vehicle lifetime >15y + asymmetric algo → riskLevel "Medium" or "High"
• PQC required + quantum-vulnerable algo → riskLevel "High"
• rationale must be concise (2-3 sentences max). Do NOT repeat yourself.
• algorithm field must contain a specific algorithm name, NEVER leave it empty.`;

export async function POST(request) {
  try {
    const { query } = await request.json();

    if (!query || !query.trim()) {
      return Response.json({ error: "Empty query provided." }, { status: 400 });
    }

    const kbRef = buildKBReference();
    const systemInstruction = SYSTEM_PROMPT.replace("{KB_REF}", kbRef);

    const chatSchema = {
      type: "object",
      properties: {
        type: { type: "string", enum: ["chat", "recommendation"], description: "Whether this is a conversational reply or a cryptographic recommendation." },
        message: { type: "string", description: "Conversational reply text. Required when type=chat." },
        useCase: { type: "string", description: "Matched use case name. Required when type=recommendation." },
        algorithm: { type: "string", description: "Specific algorithm name e.g. AES-256-GCM. Required when type=recommendation." },
        keyLength: { type: "string", description: "Key size e.g. 256-bit. Required when type=recommendation." },
        mode: { type: "string", description: "Crypto mode e.g. Authenticated Encryption. Required when type=recommendation." },
        riskLevel: { type: "string", enum: ["Low", "Medium", "High"] },
        rationale: { type: "string", description: "2-3 sentence explanation. Required when type=recommendation." },
        pqcMigrationPath: { type: ["string", "null"] },
        standardsRefs: { type: "array", items: { type: "string" } },
        riskFlags: { type: "array", items: { type: "string" } }
      },
      required: ["type"]
    };

    const interaction = await client.interactions.create({
      model: "gemini-3.6-flash",
      system_instruction: systemInstruction,
      input: query,
      response_format: {
        type: "text",
        mime_type: "application/json",
        schema: chatSchema
      },
    });

    const text = interaction.output_text;

    // Guard: detect repetition loops (same 20+ char phrase repeated 3+ times)
    const repeatMatch = text && text.match(/(.{20,}?)\1{2,}/);
    if (repeatMatch) {
      console.error("Detected repetition loop in LLM output");
      return Response.json({
        type: "chat",
        message: "I encountered an issue processing that request. Could you try rephrasing your question?"
      });
    }

    let data = JSON.parse(text);

    // Guard: if type=recommendation but algorithm is empty, try to fill from KB
    if (data.type === "recommendation" && (!data.algorithm || data.algorithm.trim() === "")) {
      const kb = JSON.parse(loadKnowledgeBase());
      // Try to match useCase to KB
      const matchKey = Object.keys(kb).find(k =>
        k.toLowerCase() === (data.useCase || "").replace(/[^a-zA-Z]/g, '').toLowerCase() ||
        (kb[k].useCase || "").toLowerCase().includes((data.useCase || "").toLowerCase())
      );
      if (matchKey) {
        const entry = kb[matchKey];
        data.algorithm = data.algorithm || entry.recommendedAlgorithm;
        data.keyLength = data.keyLength || entry.keyLength;
        data.mode = data.mode || entry.mode;
        data.standardsRefs = data.standardsRefs?.length ? data.standardsRefs : entry.standardsRefs;
        data.pqcMigrationPath = data.pqcMigrationPath || entry.pqcMigrationPath;
        data.riskFlags = data.riskFlags?.length ? data.riskFlags : entry.riskFlags;
      }
    }

    // Normalize for frontend: map type to isGeneralConversation
    data.isGeneralConversation = data.type === "chat";

    return Response.json(data);
  } catch (err) {
    console.error("Gemini API Error:", err);
    return Response.json({
      type: "chat",
      isGeneralConversation: true,
      message: "Sorry, something went wrong with the recommendation engine. Please try again.",
      error: err.message || "Failed to generate recommendation."
    }, { status: 500 });
  }
}

export async function GET() {
  try {
    const kbPath = path.join(process.cwd(), 'data', 'knowledge-base.json');
    const kb = JSON.parse(fs.readFileSync(kbPath, 'utf-8'));
    const useCases = Object.entries(kb).map(([key, value]) => ({
      key,
      label: value.useCase,
      mode: value.mode,
      algorithm: value.recommendedAlgorithm,
      lifespan: value.securityLifespan,
    }));
    return Response.json({ useCases });
  } catch (err) {
    return Response.json({ error: err.message }, { status: 500 });
  }
}