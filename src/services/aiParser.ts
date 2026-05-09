import Constants from 'expo-constants';
import { useSettingsStore } from '../stores/settingsStore';
import type { ParsedTranscriptResult } from '../types';

const CLAUDE_ENDPOINT = 'https://api.anthropic.com/v1/messages';
const MODEL = 'claude-sonnet-4-20250514';

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
  const apiKey =
    process.env.EXPO_PUBLIC_ANTHROPIC_API_KEY ||
    useSettingsStore.getState().anthropicApiKey;

  if (!apiKey || apiKey.length < 10) {
    throw new Error(
      'Anthropic API key is not configured. Add EXPO_PUBLIC_ANTHROPIC_API_KEY to your .env file or set it in Settings.'
    );
  }

  const now = new Date();
  const userMessage = `Today is ${now.toISOString()}. Parse this transcript:\n\n"${transcript}"`;

  const response = await fetch(CLAUDE_ENDPOINT, {
    method: 'POST',
    headers: {
      'Content-Type': 'application/json',
      'x-api-key': apiKey,
      'anthropic-version': '2023-06-01',
    },
    body: JSON.stringify({
      model: MODEL,
      max_tokens: 512,
      system: SYSTEM_PROMPT,
      messages: [{ role: 'user', content: userMessage }],
    }),
  });

  if (!response.ok) {
    const body = await response.text();
    console.error('[aiParser] Claude API error:', response.status, body);
    throw new Error(`Claude API error: HTTP ${response.status}`);
  }

  const data = await response.json() as {
    content: Array<{ type: string; text: string }>;
  };

  const rawText = data.content.find((b) => b.type === 'text')?.text;
  if (!rawText) throw new Error('No text content in Claude response');

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
