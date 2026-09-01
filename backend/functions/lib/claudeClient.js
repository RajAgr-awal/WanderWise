/**
 * Shared Claude API wrapper (spec §8 /lib/claudeClient.js).
 *
 * Responsibilities:
 *  - single place the ANTHROPIC_API_KEY secret is read
 *  - JSON-mode helper with schema validation + one stricter retry (spec §4.4 step 4)
 *  - plain-text helper for the Local Guide chat
 *  - graceful degradation: if the key is absent (local emulator / CI), callers can
 *    fall back to deterministic logic rather than crashing.
 */

const Anthropic = require('@anthropic-ai/sdk');

const MODEL = process.env.CLAUDE_MODEL || 'claude-sonnet-4-20250514';

let client = null;

function getClient() {
  if (client) return client;
  const apiKey = process.env.ANTHROPIC_API_KEY;
  if (!apiKey) return null;
  client = new Anthropic({ apiKey });
  return client;
}

function isConfigured() {
  return Boolean(process.env.ANTHROPIC_API_KEY);
}

/** Pull the first JSON object/array out of a model response. */
function extractJson(text) {
  const fenced = text.match(/```(?:json)?\s*([\s\S]*?)```/);
  const candidate = fenced ? fenced[1] : text;
  const start = candidate.search(/[[{]/);
  if (start === -1) throw new Error('No JSON found in model response');
  const opener = candidate[start];
  const closer = opener === '{' ? '}' : ']';
  let depth = 0;
  let inString = false;
  let escaped = false;
  for (let i = start; i < candidate.length; i++) {
    const ch = candidate[i];
    if (escaped) { escaped = false; continue; }
    if (ch === '\\') { escaped = true; continue; }
    if (ch === '"') { inString = !inString; continue; }
    if (inString) continue;
    if (ch === opener) depth++;
    else if (ch === closer) {
      depth--;
      if (depth === 0) return JSON.parse(candidate.slice(start, i + 1));
    }
  }
  throw new Error('Unterminated JSON in model response');
}

/**
 * Ask Claude for structured JSON and validate it.
 * @param {object} opts
 * @param {string} opts.system            system prompt
 * @param {string} opts.prompt            user prompt
 * @param {(data:any)=>string|null} opts.validate  returns an error string, or null when valid
 * @param {number} [opts.maxTokens]
 */
async function requestJson({ system, prompt, validate, maxTokens = 4096 }) {
  const anthropic = getClient();
  if (!anthropic) throw new Error('ANTHROPIC_API_KEY not configured');

  const attempt = async (extraInstruction) => {
    const res = await anthropic.messages.create({
      model: MODEL,
      max_tokens: maxTokens,
      system,
      messages: [
        { role: 'user', content: extraInstruction ? `${prompt}\n\n${extraInstruction}` : prompt },
        // Prefill forces the response to start as raw JSON.
        { role: 'assistant', content: '{' },
      ],
    });
    const text = '{' + res.content.map((b) => (b.type === 'text' ? b.text : '')).join('');
    return extractJson(text);
  };

  let data;
  let error;
  try {
    data = await attempt();
    error = validate ? validate(data) : null;
  } catch (e) {
    error = e.message;
  }

  if (!error) return data;

  // Spec §4.4 step 4: retry once with a stricter format instruction.
  const stricter =
    'Your previous response was rejected: ' + error +
    '\nReturn ONLY a single valid JSON object. No prose, no markdown fences, no trailing commas. ' +
    'Every field described in the schema is mandatory.';
  data = await attempt(stricter);
  const retryError = validate ? validate(data) : null;
  if (retryError) throw new Error(`Claude returned invalid JSON after retry: ${retryError}`);
  return data;
}

/** Plain-text completion, used by the Local Guide chat. */
async function requestText({ system, messages, maxTokens = 1024 }) {
  const anthropic = getClient();
  if (!anthropic) throw new Error('ANTHROPIC_API_KEY not configured');
  const res = await anthropic.messages.create({
    model: MODEL,
    max_tokens: maxTokens,
    system,
    messages,
  });
  return res.content.map((b) => (b.type === 'text' ? b.text : '')).join('').trim();
}

module.exports = { getClient, isConfigured, requestJson, requestText, extractJson, MODEL };
