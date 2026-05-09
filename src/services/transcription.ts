
const GROQ_AUDIO_ENDPOINT = 'https://api.groq.com/openai/v1/audio/transcriptions';

export async function transcribeAudio(audioUri: string): Promise<string> {
  const apiKey = process.env.EXPO_PUBLIC_GROQ_API_KEY;

  if (!apiKey || apiKey.length < 10) {
    throw new Error(
      'Groq API key is not configured. Add EXPO_PUBLIC_GROQ_API_KEY to your .env file.'
    );
  }

  // Create form data for multipart upload
  const formData = new FormData();
  
  // In React Native with fetch, we can use an object with uri, name, and type for files
  formData.append('file', {
    uri: audioUri,
    name: 'recording.m4a',
    type: 'audio/m4a',
  } as any);
  
  formData.append('model', 'whisper-large-v3-turbo');
  formData.append('response_format', 'json');
  formData.append('temperature', '0');

  const response = await fetch(GROQ_AUDIO_ENDPOINT, {
    method: 'POST',
    headers: {
      'Authorization': `Bearer ${apiKey}`,
      'Accept': 'application/json',
    },
    body: formData,
  });

  if (!response.ok) {
    const errorBody = await response.text();
    console.error('[Transcription] Groq API error:', errorBody);
    throw new Error(`Transcription failed: HTTP ${response.status}`);
  }

  const data = (await response.json()) as { text: string };
  return data.text.trim();
}
