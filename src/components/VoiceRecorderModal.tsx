import { Ionicons } from '@expo/vector-icons';
import React, { useCallback, useEffect, useState } from 'react';
import {
  ActivityIndicator,
  Alert,
  Modal,
  Pressable,
  Text,
  TouchableOpacity,
  View,
} from 'react-native';
import Animated, { FadeIn, FadeInDown } from 'react-native-reanimated';
import { useRecorder } from '../hooks/useRecorder';
import { transcribeAudio } from '../services/transcription';
import { RecorderWheel } from './RecorderWheel';

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
    <Modal transparent animationType="none" visible={visible} onRequestClose={onClose}>
      <Animated.View 
        entering={FadeIn.duration(150)}
        className="flex-1 bg-black/70 items-center justify-end pb-20 px-8"
      >
        <Pressable className="absolute inset-0" onPress={() => { }} />
        <Animated.View 
          entering={FadeInDown.duration(200).springify().damping(20).mass(0.5)}
          className="bg-white dark:bg-neutral-900 rounded-3xl px-6 pb-6 pt-4 w-full max-w-sm border border-white/10 items-center"
        >
          {/* Header */}
          <View className="flex-row items-center justify-between w-full mb-6">
            <Text className="text-xl font-medium text-gray-900 dark:text-white/50">
              {uiState === 'ready'
                ? 'Voice Note'
                : uiState === 'transcribing'
                  ? 'Transcribing...'
                  : uiState === 'error'
                    ? 'Error'
                    : 'Recording'}
            </Text>
            <TouchableOpacity onPress={onClose} className='bg-white/10 p-1 rounded-full border border-white/10'>
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
            <View className="w-full items-center py-4">
              <Ionicons name="warning-outline" size={48} color="#ef4444" />
              <Text className="text-base text-red-500 text-center mt-4">{errorMsg}</Text>
              <TouchableOpacity
                className="mt-6 bg-primary rounded-xl px-8 py-2.5"
                onPress={() => setUiState('ready')}
              >
                <Text className="text-white font-medium">Try Again</Text>
              </TouchableOpacity>
            </View>
          ) : (
            <RecorderWheel isRecording={isRecordingActive} meteringLevel={meteringLevel} />
          )}

          {/* Duration */}
          {showControls && (
            <Text className="text-3xl font-mono text-gray-900 dark:text-white mt-6">
              {formatDuration(durationMs)}
            </Text>
          )}

          {/* Status text */}
          {uiState === 'ready' && (
            <Text className="text-base text-gray-500 dark:text-gray-400 mt-4 text-center">
              Tap below to start recording
            </Text>
          )}
          {isPaused && (
            <Text className="text-sm text-gray-500 dark:text-gray-400 mt-2">Paused — tap resume to continue</Text>
          )}

          {/* Action Buttons */}
          <View className="flex-row gap-3 mt-8 w-full">
            {uiState === 'ready' && (
              <TouchableOpacity
                onPress={handleStartRecording}
                className="flex-1 bg-primary rounded-2xl py-3 items-center flex-row justify-center gap-2"
              >
                <Ionicons name="mic" size={20} color="#fff" />
                <Text className="text-white font-medium text-lg">Start</Text>
              </TouchableOpacity>
            )}

            {showControls && (
              <>
                <TouchableOpacity
                  onPress={handleDiscard}
                  className="bg-gray-100 dark:bg-neutral-800 rounded-2xl p-3 items-center justify-center"
                >
                  <Ionicons name="trash-outline" size={22} color="#ef4444" />
                </TouchableOpacity>

                <TouchableOpacity
                  onPress={handlePause}
                  className="flex-1 bg-gray-100 dark:bg-neutral-800 rounded-2xl py-3 items-center flex-row justify-center gap-2"
                >
                  <Ionicons
                    name={isRecordingActive ? 'pause' : 'play'}
                    size={20}
                    color="#5e6ad2"
                  />
                  <Text className="text-primary font-medium text-lg">
                    {isRecordingActive ? 'Pause' : 'Resume'}
                  </Text>
                </TouchableOpacity>

                <TouchableOpacity
                  onPress={handleConvert}
                  className="flex-1 bg-primary rounded-2xl py-3 items-center flex-row justify-center gap-2"
                >
                  <Ionicons name="sparkles" size={20} color="#fff" />
                  <Text className="text-white font-medium text-lg">Done</Text>
                </TouchableOpacity>
              </>
            )}
          </View>
        </Animated.View>
      </Animated.View>
    </Modal>
  );
}
