import { useState, useRef, useCallback } from 'react';
import { Audio } from 'expo-av';
import type { RecordingStatus } from 'expo-av/build/Audio';
import { MAX_RECORDING_DURATION_MS } from '../constants';

export type RecorderState = 'idle' | 'recording' | 'paused' | 'stopped';

interface UseRecorderReturn {
  state: RecorderState;
  durationMs: number;
  meteringLevel: number;   // 0–1 normalized amplitude
  recordingUri: string | null;
  start: () => Promise<void>;
  pause: () => Promise<void>;
  resume: () => Promise<void>;
  stop: () => Promise<string | null>;
  discard: () => Promise<void>;
}

const RECORDING_OPTIONS: Audio.RecordingOptions = {
  android: {
    extension: '.m4a',
    outputFormat: Audio.AndroidOutputFormat.MPEG_4,
    audioEncoder: Audio.AndroidAudioEncoder.AAC,
    sampleRate: 44100,
    numberOfChannels: 2,
    bitRate: 128000,
  },
  ios: {
    extension: '.m4a',
    outputFormat: Audio.IOSOutputFormat.MPEG4AAC,
    audioQuality: Audio.IOSAudioQuality.HIGH,
    sampleRate: 44100,
    numberOfChannels: 2,
    bitRate: 128000,
    linearPCMBitDepth: 16,
    linearPCMIsBigEndian: false,
    linearPCMIsFloat: false,
  },
  web: {},
  isMeteringEnabled: true,
};

export function useRecorder(): UseRecorderReturn {
  const [state, setState] = useState<RecorderState>('idle');
  const [durationMs, setDurationMs] = useState(0);
  const [meteringLevel, setMeteringLevel] = useState(0);
  const [recordingUri, setRecordingUri] = useState<string | null>(null);
  const recordingRef = useRef<Audio.Recording | null>(null);

  const handleStatusUpdate = useCallback((status: RecordingStatus) => {
    if (status.isRecording) {
      setDurationMs(status.durationMillis);
      // Auto-stop if exceeding max duration
      if (status.durationMillis >= MAX_RECORDING_DURATION_MS && recordingRef.current) {
        recordingRef.current.stopAndUnloadAsync().catch(console.error);
        setState('stopped');
      }
      if (status.metering != null) {
        // metering: -160 (silence) to 0 (full). Normalize to 0–1.
        const normalized = Math.max(0, Math.min(1, (status.metering + 80) / 80));
        setMeteringLevel(normalized);
      }
    }
  }, []);

  const start = useCallback(async () => {
    try {
      const { status: existingStatus } = await Audio.getPermissionsAsync();
      let finalStatus = existingStatus;
      if (existingStatus !== 'granted') {
        const { status } = await Audio.requestPermissionsAsync();
        finalStatus = status;
      }

      if (finalStatus !== 'granted') {
        const message = finalStatus === 'denied' 
          ? 'Microphone access was denied. Please enable it in your device settings to record voice notes.' 
          : 'Missing audio recording permissions.';
        
        // We use a console error here as well for logging
        console.error('[useRecorder.start]', message);
        throw new Error(message);
      }

      await Audio.setAudioModeAsync({
        allowsRecordingIOS: true,
        playsInSilentModeIOS: true,
        staysActiveInBackground: false,
      });

      const { recording } = await Audio.Recording.createAsync(
        RECORDING_OPTIONS,
        handleStatusUpdate,
        100 // status update interval ms
      );

      recordingRef.current = recording;
      setState('recording');
      setDurationMs(0);
      setMeteringLevel(0);
      setRecordingUri(null);
    } catch (error) {
      console.error('[useRecorder.start]', error);
      throw error;
    }
  }, [handleStatusUpdate]);

  const pause = useCallback(async () => {
    if (recordingRef.current && state === 'recording') {
      await recordingRef.current.pauseAsync();
      setState('paused');
    }
  }, [state]);

  const resume = useCallback(async () => {
    if (recordingRef.current && state === 'paused') {
      await recordingRef.current.startAsync();
      setState('recording');
    }
  }, [state]);

  const stop = useCallback(async (): Promise<string | null> => {
    if (!recordingRef.current) return null;
    try {
      await recordingRef.current.stopAndUnloadAsync();
      const uri = recordingRef.current.getURI() ?? null;
      recordingRef.current = null;
      setState('stopped');
      setRecordingUri(uri);
      await Audio.setAudioModeAsync({ allowsRecordingIOS: false });
      return uri;
    } catch (error) {
      console.error('[useRecorder.stop]', error);
      return null;
    }
  }, []);

  const discard = useCallback(async () => {
    if (recordingRef.current) {
      try {
        await recordingRef.current.stopAndUnloadAsync();
      } catch {
        // Ignore — may already be stopped
      }
      recordingRef.current = null;
    }
    setState('idle');
    setDurationMs(0);
    setMeteringLevel(0);
    setRecordingUri(null);
    await Audio.setAudioModeAsync({ allowsRecordingIOS: false });
  }, []);

  return { state, durationMs, meteringLevel, recordingUri, start, pause, resume, stop, discard };
}
