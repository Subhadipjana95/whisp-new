import React, { useCallback, useState, useEffect } from 'react';
import {
  Modal,
  View,
  Text,
  TouchableOpacity,
  ActivityIndicator,
  Alert,
  Pressable,
} from 'react-native';
import { BlurView } from 'expo-blur';
import { Ionicons } from '@expo/vector-icons';
import { useRecorder } from '../hooks/useRecorder';
import { RecorderWheel } from './RecorderWheel';
import { transcribeAudio } from '../services/transcription';

interface VoiceRecorderModalProps {
  visible: boolean;
  onClose: () => void;
  onTranscript: (transcript: string) => void;
}

type UIState = 'ready' | 'recording' | 'paused' | 'transcribing' | 'error';

function formatDuration(ms: number): string {
  const totalSeconds = Math.floor(ms / 1000);
  const minutes = Math.floor(totalSeconds / 60).toString().padStart(2, '0');
  const seconds = (totalSeconds % 60).toString().padStart(2, '0');
  return `${minutes}:${seconds}`;
}

export function VoiceRecorderModal({ visible, onClose, onTranscript }: VoiceRecorderModalProps) {
  const { state, durationMs, meteringLevel, start, pause, resume, stop, discard } = useRecorder();
  const [uiState, setUiState] = useState<UIState>('ready');
  const [errorMsg, setErrorMsg] = useState('');

  useEffect(() => {
    if (visible) {
      setUiState('ready');
    }
  }, [visible]);

  const handleStartRecording = useCallback(async () => {
    try {
      await start();
      setUiState('recording');
    } catch {
      setErrorMsg('Microphone access denied or unavailable.');
      setUiState('error');
    }
  }, [start]);

  const handlePause = useCallback(async () => {
    if (state === 'recording') {
      await pause();
      setUiState('paused');
    } else if (state === 'paused') {
      await resume();
      setUiState('recording');
    }
  }, [state, pause, resume]);

  const handleDiscard = useCallback(async () => {
    Alert.alert('Discard Recording', 'Are you sure you want to discard this recording?', [
      { text: 'Cancel', style: 'cancel' },
      {
        text: 'Discard',
        style: 'destructive',
        onPress: async () => {
          await discard();
          onClose();
        },
      },
    ]);
  }, [discard, onClose]);

  const handleConvert = useCallback(async () => {
    setUiState('transcribing');
    try {
      const uri = await stop();
      if (!uri) throw new Error('Recording URI is null after stop');

      const transcript = await transcribeAudio(uri);
      if (!transcript || transcript.trim().length === 0) {
        throw new Error('Transcription returned empty text. Please speak clearly and try again.');
      }

      onTranscript(transcript);
      onClose();
    } catch (error) {
      const msg = error instanceof Error ? error.message : 'Transcription failed.';
      setErrorMsg(msg);
      setUiState('error');
      console.error('[VoiceRecorderModal.handleConvert]', error);
    }
  }, [stop, onTranscript, onClose]);

  const isRecordingActive = uiState === 'recording';
  const isPaused = uiState === 'paused';
  const isTranscribing = uiState === 'transcribing';
  const showControls = isRecordingActive || isPaused;

  return (
    <Modal transparent animationType="slide" visible={visible} onRequestClose={onClose}>
      <Pressable className="flex-1 justify-end" onPress={() => {}}>
        <View className="absolute inset-0 bg-black/80" />
        <View className="bg-surface-1 rounded-t-xl p-8 pb-12 items-center border-t border-hairline">
          {/* Header */}
          <View className="flex-row items-center justify-between w-full mb-8">
            <Text className="text-2xl font-bold text-ink">
              {uiState === 'ready'
                ? 'Voice Note'
                : uiState === 'transcribing'
                ? 'Transcribing...'
                : uiState === 'error'
                ? 'Error'
                : 'Recording'}
            </Text>
            <TouchableOpacity onPress={onClose}>
              <Ionicons name="close" size={24} color="#8a8f98" />
            </TouchableOpacity>
          </View>

          {/* Recorder Wheel */}
          {isTranscribing ? (
            <View className="w-40 h-40 items-center justify-center">
              <ActivityIndicator size="large" color="#5e6ad2" />
              <Text className="text-sm text-ink-subtle mt-4">Converting to text...</Text>
            </View>
          ) : uiState === 'error' ? (
            <View className="w-full items-center py-8">
              <Ionicons name="warning-outline" size={48} color="#ef4444" />
              <Text className="text-base text-red-500 text-center mt-4">{errorMsg}</Text>
              <TouchableOpacity
                className="mt-6 bg-primary rounded-md px-6 py-3"
                onPress={() => setUiState('ready')}
              >
                <Text className="text-ink font-medium">Try Again</Text>
              </TouchableOpacity>
            </View>
          ) : (
            <RecorderWheel isRecording={isRecordingActive} meteringLevel={meteringLevel} />
          )}

          {/* Duration */}
          {showControls && (
            <Text className="text-4xl font-mono text-ink mt-6">
              {formatDuration(durationMs)}
            </Text>
          )}

          {/* Status text */}
          {uiState === 'ready' && (
            <Text className="text-base text-ink-subtle mt-4 text-center">
              Tap the button below to start recording
            </Text>
          )}
          {isPaused && (
            <Text className="text-sm text-ink-subtle mt-2">Paused — tap resume to continue</Text>
          )}

          {/* Action Buttons */}
          <View className="flex-row gap-4 mt-8 w-full">
            {uiState === 'ready' && (
              <TouchableOpacity
                onPress={handleStartRecording}
                className="flex-1 bg-primary rounded-md py-3 items-center flex-row justify-center gap-2"
              >
                <Ionicons name="mic" size={20} color="#f7f8f8" />
                <Text className="text-ink font-medium">Start Recording</Text>
              </TouchableOpacity>
            )}

            {showControls && (
              <>
                <TouchableOpacity
                  onPress={handleDiscard}
                  className="flex-1 bg-surface-2 border border-hairline rounded-md py-3 items-center flex-row justify-center gap-2"
                >
                  <Ionicons name="trash-outline" size={20} color="#ef4444" />
                  <Text className="text-red-500 font-medium">Discard</Text>
                </TouchableOpacity>

                <TouchableOpacity
                  onPress={handlePause}
                  className="flex-1 bg-surface-2 border border-hairline rounded-md py-3 items-center flex-row justify-center gap-2"
                >
                  <Ionicons
                    name={isRecordingActive ? 'pause' : 'play'}
                    size={20}
                    color="#5e6ad2"
                  />
                  <Text className="text-primary font-medium">
                    {isRecordingActive ? 'Pause' : 'Resume'}
                  </Text>
                </TouchableOpacity>

                <TouchableOpacity
                  onPress={handleConvert}
                  className="flex-1 bg-primary rounded-md py-3 items-center flex-row justify-center gap-2"
                >
                  <Ionicons name="sparkles" size={20} color="#f7f8f8" />
                  <Text className="text-ink font-medium">Convert</Text>
                </TouchableOpacity>
              </>
            )}
          </View>
        </View>
      </Pressable>
    </Modal>
  );
}
