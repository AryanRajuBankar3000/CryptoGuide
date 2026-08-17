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

function buildKBSummary() {
  const kb = JSON.parse(loadKnowledgeBase());
  const rows = Object.entries(kb).map(([key, v]) =>
    `- ${key}: algo="${v.recommendedAlgorithm}", key="${v.keyLength}", mode="${v.mode}", standards=[${(v.standardsRefs || []).join(', ')}], pqc="${v.pqcMigrationPath}", risks=[${(v.riskFlags || []).join('; ')}], lifespan="${v.securityLifespan}"`
  );
  return rows.join('\n');
}

const SYSTEM_PROMPT = `You are CryptoGuide Assistant — an expert on automotive cybersecurity and cryptography.

You help engineers choose the right cryptographic algorithms for vehicle security use cases.

KNOWLEDGE BASE:
{KB_REF}

GUIDELINES:
• Answer questions about automotive cryptography, secure boot, OTA updates, V2X, SecOC, CAN bus authentication, key management, HSMs, post-quantum cryptography, and related standards (ISO/SAE 21434, UNECE R155, AUTOSAR).
• Ground your answers in the knowledge base above when applicable.
• Be specific — mention algorithm names, key sizes, standards, and PQC migration paths.
• Keep answers concise (3-6 sentences).
• If a question is unrelated to automotive cybersecurity or cryptography, politely redirect the user.
• When referencing specific algorithms or standards, include them in the "refs" array for display.

Respond in this JSON format:
{
  "text": "Your answer here",
  "refs": [
    { "label": "Category label", "value": "Detail value" }
  ]
}

The "refs" array is optional — include it only when you reference specific algorithms, standards, or technical values.
If the question is conversational (greeting, thanks, etc.), just provide "text" with no "refs".`;

export async function POST(request) {
  try {
    const { question, history } = await request.json();

    if (!question || !question.trim()) {
      return Response.json({ error: "Empty question." }, { status: 400 });
    }

    const kbRef = buildKBSummary();
    const systemInstruction = SYSTEM_PROMPT.replace("{KB_REF}", kbRef);

    // Build conversation messages from history for multi-turn context
    const messages = [];
    if (history && Array.isArray(history)) {
      for (const msg of history.slice(-10)) { // last 10 messages for context
        messages.push({
          role: msg.role === 'user' ? 'user' : 'model',
          parts: [{ text: msg.text || msg.reply?.text || '' }],
        });
      }
    }
    messages.push({
      role: 'user',
      parts: [{ text: question }],
    });

    const response = await client.models.generateContent({
      model: "gemini-3.6-flash",
      contents: messages,
      config: {
        systemInstruction: systemInstruction,
        responseMimeType: "application/json",
      },
    });

    const raw = response.text;

    // Guard: detect repetition loops
    const repeatMatch = raw && raw.match(/(.{20,}?)\1{2,}/);
    if (repeatMatch) {
      console.error("Detected repetition loop in assistant output");
      return Response.json({
        text: "I encountered an issue processing that. Could you rephrase your question?",
      });
    }

    const data = JSON.parse(raw);
    return Response.json(data);
  } catch (err) {
    console.error("Assistant API Error:", err);
    return Response.json({
      text: "Sorry, I couldn't process your question right now. Please try again.",
    }, { status: 500 });
  }
}
