import Anthropic from "@anthropic-ai/sdk";
import { CLAUDE_MODEL } from "@/lib/constants";

const anthropic = new Anthropic({
  apiKey: process.env.ANTHROPIC_API_KEY,
});

interface GenerateOptions {
  systemPrompt: string;
  userPrompt: string;
  maxTokens?: number;
  temperature?: number;
}

interface GenerateResult<T> {
  data: T;
  tokensUsed: number;
}

// Extract the outermost JSON object/array from a raw model response.
// Handles: markdown fences (```json ... ```), leading/trailing prose,
// and responses with braces inside string values.
function extractJson(raw: string): string {
  const text = raw.trim();

  const fenced = text.match(/```(?:json)?\s*([\s\S]*?)\s*```/);
  const candidate = fenced ? fenced[1] : text;

  const startObj = candidate.indexOf("{");
  const startArr = candidate.indexOf("[");
  const starts = [startObj, startArr].filter((i) => i >= 0);
  if (starts.length === 0) return candidate.trim();
  const start = Math.min(...starts);
  const openChar = candidate[start];
  const closeChar = openChar === "{" ? "}" : "]";

  let depth = 0;
  let inString = false;
  let escape = false;
  for (let i = start; i < candidate.length; i++) {
    const ch = candidate[i];
    if (escape) {
      escape = false;
      continue;
    }
    if (ch === "\\" && inString) {
      escape = true;
      continue;
    }
    if (ch === '"') {
      inString = !inString;
      continue;
    }
    if (inString) continue;
    if (ch === openChar) depth++;
    else if (ch === closeChar) {
      depth--;
      if (depth === 0) return candidate.slice(start, i + 1).trim();
    }
  }
  return candidate.slice(start).trim();
}

// Repair common malformations Claude sometimes emits, such as writing
// `"a" or "b"` as a value instead of choosing one string.
function repairJson(input: string): string {
  let out = input;

  // "value1" or "value2"  →  "value1"
  out = out.replace(/"((?:[^"\\]|\\.)*)"\s+or\s+"((?:[^"\\]|\\.)*)"/g, '"$1"');

  // Trailing commas before } or ]
  out = out.replace(/,(\s*[}\]])/g, "$1");

  // Smart quotes that sometimes sneak in
  out = out.replace(/[“”]/g, '"').replace(/[‘’]/g, "'");

  return out;
}

function tryParse<T>(jsonStr: string): T | null {
  try {
    return JSON.parse(jsonStr) as T;
  } catch {
    return null;
  }
}

export async function generateWithClaude<T>(
  options: GenerateOptions
): Promise<GenerateResult<T>> {
  const {
    systemPrompt,
    userPrompt,
    maxTokens = 4096,
    temperature = 0.7,
  } = options;

  const response = await anthropic.messages.create({
    model: CLAUDE_MODEL,
    max_tokens: maxTokens,
    temperature,
    system: systemPrompt,
    messages: [{ role: "user", content: userPrompt }],
  });

  const textBlock = response.content.find((c) => c.type === "text");
  if (!textBlock || textBlock.type !== "text") {
    throw new Error("No text response from Claude");
  }

  const extracted = extractJson(textBlock.text);
  const data =
    tryParse<T>(extracted) ?? tryParse<T>(repairJson(extracted));

  if (data === null) {
    console.error("Failed to parse Claude response:", textBlock.text);
    throw new Error("Invalid JSON response from Claude");
  }

  return {
    data,
    tokensUsed: response.usage.input_tokens + response.usage.output_tokens,
  };
}
