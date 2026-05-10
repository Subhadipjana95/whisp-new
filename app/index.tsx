import { EmptyState } from '@/components/EmptyState';
import { FloatingActionBar } from '@/components/FloatingActionBar';
import { SkeletonLoader } from '@/components/SkeletonLoader';
import { VoiceRecorderModal } from '@/components/VoiceRecorderModal';
import { CreateOptionsDialog } from '@/components/CreateOptionsDialog';
import { HomeHeader } from '@/components/HomeHeader';
import { HomeTabToggle } from '@/components/HomeTabToggle';
import { NotesSection } from '@/components/NotesSection';
import { RemindersSection } from '@/components/RemindersSection';

import { parseTranscript } from '@/services/aiParser';
import { scheduleReminder } from '@/services/notifications';
import { requestAllPermissions } from '@/services/permissions';
import { useNotesStore } from '@/stores/notesStore';
import { useRemindersStore } from '@/stores/remindersStore';
import { router } from 'expo-router';
import React, { useCallback, useEffect, useState, useMemo } from 'react';
import { Alert, View, Dimensions } from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import Animated, { useSharedValue, useAnimatedStyle, withTiming } from 'react-native-reanimated';
import * as Haptics from 'expo-haptics';

const { width: SCREEN_WIDTH } = Dimensions.get('window');

export default function MainScreen() {
  const { notes, fetchAll: fetchNotes, isLoading: notesLoading } = useNotesStore();
  const {
    reminders, fetchAll: fetchReminders, markDone, isLoading: remindersLoading,
    create: createReminder, update: updateReminder,
  } = useRemindersStore();
  const { create: createNote } = useNotesStore();

  const [isVoiceModalOpen, setIsVoiceModalOpen] = useState(false);
  const [isCreateModalOpen, setIsCreateModalOpen] = useState(false);
  const [activeTab, setActiveTab] = useState<'notes' | 'reminders'>('notes');
  const slideAnim = useSharedValue(0);
  
  const isLoading = notesLoading || remindersLoading;
  const hasContent = notes.length > 0 || reminders.length > 0;

  const handleTabChange = useCallback((tab: 'notes' | 'reminders') => {
    Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Light);
    setActiveTab(tab);
    slideAnim.value = withTiming(tab === 'notes' ? 0 : -SCREEN_WIDTH, {
      duration: 300,
    });
  }, [slideAnim]);

  const animatedStyle = useAnimatedStyle(() => ({
    transform: [{ translateX: slideAnim.value }],
  }));

  const loadAll = useCallback(async () => {
    await Promise.all([fetchNotes(), fetchReminders()]);
  }, [fetchNotes, fetchReminders]);

  useEffect(() => { loadAll(); }, [loadAll]);

  useEffect(() => {
    requestAllPermissions();
  }, []);

  const activeReminders = useMemo(() => 
    reminders.filter((r) => !r.isDone).sort((a, b) => a.dueAt - b.dueAt),
    [reminders]
  );

  const completedReminders = useMemo(() => 
    reminders.filter((r) => r.isDone).sort((a, b) => b.updatedAt - a.updatedAt),
    [reminders]
  );

  const handleCreateSelect = useCallback((type: 'note' | 'reminder') => {
    if (type === 'note') router.push('/note/new' as any);
    else router.push('/reminder/new' as any);
  }, []);

  const handleTranscript = useCallback(async (transcript: string) => {
    try {
      const parsed = await parseTranscript(transcript);
      if (parsed.type === 'reminder' && parsed.dueAt) {
        const dueAt = new Date(parsed.dueAt).getTime();
        if (dueAt > Date.now()) {
          const reminder = await createReminder({ title: parsed.title, body: parsed.body, dueAt });
          try {
            const notifId = await scheduleReminder({ ...reminder, dueAt });
            await updateReminder(reminder.id, { notificationId: notifId });
          } catch { /* best-effort */ }
          router.push(`/reminder/${reminder.id}` as any);
          return;
        }
      }
      const note = await createNote({ title: parsed.title, body: parsed.body });
      router.push(`/note/${note.id}` as any);
    } catch (error) {
      Alert.alert('Conversion Failed', error instanceof Error ? error.message : 'Failed to process voice note.');
    }
  }, [createNote, createReminder, updateReminder]);

  return (
    <SafeAreaView className="flex-1 bg-canvas" edges={['top']}>
      <HomeHeader 
        onSearchPress={() => router.push('/search')} 
        onSettingsPress={() => router.push('/settings')} 
      />

      <HomeTabToggle activeTab={activeTab} onTabChange={handleTabChange} />

      {isLoading && !hasContent ? (
        <SkeletonLoader count={4} />
      ) : !hasContent ? (
        <EmptyState icon="document-text-outline" title="No content yet" subtitle="Tap Voice or New to get started" />
      ) : (
        <Animated.View style={[{ flex: 1, flexDirection: 'row', width: SCREEN_WIDTH * 2 }, animatedStyle]}>
          <NotesSection 
            notes={notes} 
            isLoading={isLoading} 
            onRefresh={loadAll} 
            screenWidth={SCREEN_WIDTH} 
          />
          <RemindersSection 
            activeReminders={activeReminders} 
            completedReminders={completedReminders} 
            isLoading={isLoading} 
            onRefresh={loadAll} 
            onMarkDone={markDone} 
            screenWidth={SCREEN_WIDTH} 
          />
        </Animated.View>
      )}

      <FloatingActionBar 
        onVoicePress={() => setIsVoiceModalOpen(true)} 
        onAddPress={() => setIsCreateModalOpen(true)} 
      />
      
      <VoiceRecorderModal
        visible={isVoiceModalOpen}
        onClose={() => setIsVoiceModalOpen(false)}
        onTranscript={handleTranscript}
      />
      
      <CreateOptionsDialog
        visible={isCreateModalOpen}
        onClose={() => setIsCreateModalOpen(false)}
        onSelect={handleCreateSelect}
      />
    </SafeAreaView>
  );
}
