import { File } from 'expo-file-system';
import Constants from 'expo-constants';
import { useSettingsStore } from '../stores/settingsStore';

const WHISPER_ENDPOINT = 'https://api.openai.com/v1/audio/transcriptions';

export async function transcribeAudio(audioUri: string): Promise<string> {
  const apiKey =
    process.env.EXPO_PUBLIC_OPENAI_API_KEY ||
    useSettingsStore.getState().openAiApiKey;

  if (!apiKey || apiKey.length < 10) {
    throw new Error(
      'OpenAI API key is not configured. Add EXPO_PUBLIC_OPENAI_API_KEY to your .env file or set it in Settings.'
    );
  }

  const file = new File(audioUri);
  if (!file.exists) {
    throw new Error(`Audio file not found at: ${audioUri}`);
  }

  // Read file as blob for fetch upload
  const fileBlob = file as unknown as Blob;

  const formData = new FormData();
  formData.append('file', fileBlob, 'recording.m4a');
  formData.append('model', 'whisper-1');
  formData.append('language', 'en');
  formData.append('response_format', 'json');

  const response = await fetch(WHISPER_ENDPOINT, {
    method: 'POST',
    headers: {
      Authorization: `Bearer ${apiKey}`,
    },
    body: formData,
  });

  if (!response.ok) {
    const errorBody = await response.text();
    console.error('[Transcription] Whisper API error:', errorBody);
    throw new Error(`Transcription failed: HTTP ${response.status}`);
  }

  const data = (await response.json()) as { text: string };
  return data.text.trim();
}
