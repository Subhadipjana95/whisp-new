import type { ParsedTranscriptResult } from '../types';

const GROQ_ENDPOINT = 'https://api.groq.com/openai/v1/chat/completions';
const GROQ_API_KEY = process.env.EXPO_PUBLIC_GROQ_API_KEY;
const MODEL = 'llama-3.3-70b-versatile';

const SYSTEM_PROMPT = `You are a voice note parser. Your job is to analyze a voice-recorded transcript and extract structured data.

CLASSIFICATION RULES:
- If the transcript contains ANY of the following: a time reference (tomorrow, at 3pm, in an hour, next Monday, etc.), a task/action verb directed at the user (remind me, don't forget, call, book, submit, etc.), or a deadline — classify as "reminder".
- If the transcript is a thought, idea, observation, or general note without time/action intent — classify as "note".

OUTPUT FORMAT: Respond ONLY with valid, minified JSON. No markdown, no preamble, no explanation. Example output:
{"type":"reminder","title":"Call Dr. Smith","body":"Schedule annual checkup appointment","dueAt":"2025-06-15T14:00:00.000Z"}
{"type":"note","title":"Book Idea","body":"A story about a lighthouse keeper who discovers a message in a bottle from the future","dueAt":null}

RULES:
- "title": max 60 characters, concise, action-oriented for reminders
- "body": full elaborated content, cleaned up from filler words
- "dueAt": ISO 8601 UTC string if a time is implied, otherwise null. If only a relative time is given (e.g. "tomorrow at 3pm"), compute relative to today's date which will be provided in the user message.
- Never fabricate information not present in the transcript
- Remove filler words (um, uh, like, you know) from the body`;

export async function parseTranscript(transcript: string): Promise<ParsedTranscriptResult> {
  const now = new Date();
  const userMessage = `Today is ${now.toISOString()}. Parse this transcript:\n\n"${transcript}"`;

  const response = await fetch(GROQ_ENDPOINT, {
    method: 'POST',
    headers: {
      'Content-Type': 'application/json',
      'Authorization': `Bearer ${GROQ_API_KEY}`,
    },
    body: JSON.stringify({
      model: MODEL,
      messages: [
        { role: 'system', content: SYSTEM_PROMPT },
        { role: 'user', content: userMessage }
      ],
      response_format: { type: 'json_object' },
      temperature: 0.1,
    }),
  });

  if (!response.ok) {
    const body = await response.text();
    console.error('[aiParser] Groq API error:', response.status, body);
    throw new Error(`Groq API error: HTTP ${response.status}`);
  }

  const data = await response.json() as {
    choices: Array<{ message: { content: string } }>;
  };

  const rawText = data.choices[0]?.message?.content;
  if (!rawText) throw new Error('No content in Groq response');

  try {
    const parsed = JSON.parse(rawText.trim()) as ParsedTranscriptResult;
    // Validate required fields
    if (!parsed.type || !parsed.title) {
      throw new Error('Invalid structure in Claude response');
    }
    return parsed;
  } catch {
    console.error('[aiParser] Failed to parse JSON response:', rawText);
    // Graceful degradation: create a note with the raw transcript
    return {
      type: 'note',
      title: transcript.slice(0, 60),
      body: transcript,
      dueAt: null,
    };
  }
}
