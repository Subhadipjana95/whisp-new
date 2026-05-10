import React, { useState, useCallback, useLayoutEffect } from 'react';
import { View, TextInput, ScrollView, TouchableOpacity, Text, KeyboardAvoidingView, Platform } from 'react-native';
import { useLocalSearchParams, router, useNavigation } from 'expo-router';
import { SafeAreaView } from 'react-native-safe-area-context';
import { Ionicons } from '@expo/vector-icons';
import * as Haptics from 'expo-haptics';
import { useRemindersStore } from '@/stores/remindersStore';
import { ConfirmDialog } from '@/components/ConfirmDialog';
import { DateTimePicker } from '@/components/DateTimePicker';
import { AttachmentPicker } from '@/components/AttachmentPicker';
import { AttachmentPreview } from '@/components/AttachmentPreview';
import { scheduleReminder, cancelNotification } from '@/services/notifications';

const sanitize = (text: string) => text.replace(/^\n+/, '').replace(/\n{3,}/g, '\n\n');

export default function ReminderScreen() {
  const { id } = useLocalSearchParams<{ id: string }>();
  const navigation = useNavigation();
  const { reminders, create, update, delete: deleteReminder, markDone } = useRemindersStore();
  const existingReminder = reminders.find((r) => r.id === id);
  const isNew = id === 'new';

  const [title, setTitle] = useState(existingReminder?.title ?? '');
  const [body, setBody] = useState(existingReminder?.body ?? '');
  const [dueAt, setDueAt] = useState(
    existingReminder ? new Date(existingReminder.dueAt) : new Date(Date.now() + 3600000)
  );
  const [isSaving, setIsSaving] = useState(false);
  const [showDeleteDialog, setShowDeleteDialog] = useState(false);
  const [isDirty, setIsDirty] = useState(false);

  const handleSave = useCallback(async () => {
    if (!isDirty && !isNew) return;
    setIsSaving(true);
    try {
      if (isNew) {
        const reminder = await create({ title: sanitize(title.trim()) || 'Untitled Reminder', body: sanitize(body), dueAt: dueAt.getTime() });
        try {
          const notifId = await scheduleReminder({ ...reminder, dueAt: dueAt.getTime() });
          await update(reminder.id, { notificationId: notifId });
        } catch { /* best effort */ }
        router.replace(`/reminder/${reminder.id}` as any);
      } else if (existingReminder) {
        if (existingReminder.notificationId) {
          await cancelNotification(existingReminder.notificationId);
        }
        let notifId: string | null = null;
        try {
          notifId = await scheduleReminder({
            ...existingReminder, title: sanitize(title.trim()) || 'Untitled Reminder', dueAt: dueAt.getTime(),
          });
        } catch { /* best effort */ }
        await update(existingReminder.id, {
          title: sanitize(title.trim()) || 'Untitled Reminder', body: sanitize(body),
          dueAt: dueAt.getTime(), ...(notifId ? { notificationId: notifId } : {}),
        });
      }
      setIsDirty(false);
    } catch (error) {
      console.error('[ReminderScreen.handleSave]', error);
    } finally {
      setIsSaving(false);
    }
  }, [isDirty, isNew, title, body, dueAt, create, update, existingReminder]);

  const handleDelete = useCallback(async () => {
    if (!existingReminder) return;
    if (existingReminder.notificationId) await cancelNotification(existingReminder.notificationId);
    await deleteReminder(existingReminder.id);
    router.back();
  }, [existingReminder, deleteReminder]);

  useLayoutEffect(() => {
    navigation.setOptions({
      headerTitle: '',
      headerRight: () => (
        <View style={{ flexDirection: 'row', alignItems: 'center', gap: 10, marginRight: 16 }}>
          {!isNew && existingReminder && (
            <AttachmentPicker parentId={existingReminder.id} parentType="reminder" mode="minimal" />
          )}
          {isDirty && (
            <TouchableOpacity onPress={handleSave} disabled={isSaving} className='bg-neutral-400 dark:bg-neutral-800 p-2 rounded-lg border border-white/5'>
              <Text style={{ color: '#5e6ad2', fontWeight: '600', fontSize: 16 }}>
                {isSaving ? 'Saving...' : 'Save'}
              </Text>
            </TouchableOpacity>
          )}
          {!isNew && existingReminder && !existingReminder.isDone && (
            <TouchableOpacity onPress={() => markDone(existingReminder.id)} className='bg-neutral-400 dark:bg-neutral-800 p-2 rounded-lg border border-white/5'>
              <Ionicons name="checkmark-circle-outline" size={24} color="#22c55e" />
            </TouchableOpacity>
          )}
          {!isNew && (
            <TouchableOpacity onPress={() => {
              Haptics.notificationAsync(Haptics.NotificationFeedbackType.Warning);
              setShowDeleteDialog(true);
            }} className='bg-neutral-400 dark:bg-neutral-800 p-2 rounded-lg border border-white/5'>
              <Ionicons name="trash-outline" size={22} color="#ef4444" />
            </TouchableOpacity>
          )}
        </View>
      ),
    });
  }, [navigation, isNew, isDirty, isSaving, handleSave, existingReminder, markDone]);

  const isDone = existingReminder?.isDone ?? false;

  return (
    <SafeAreaView className="flex-1 bg-canvas" edges={['bottom']}>
      <KeyboardAvoidingView className="flex-1" behavior={Platform.OS === 'ios' ? 'padding' : 'height'}>
        <ScrollView className={`flex-1 px-4 ${isDone ? 'opacity-60' : ''}`} keyboardDismissMode="interactive" showsVerticalScrollIndicator={false}>
          <TextInput
            className="text-4xl font-medium text-white/70"
            value={title} onChangeText={(t) => { setTitle(sanitize(t)); setIsDirty(true); }}
            placeholder="Reminder title" placeholderTextColor="#8a8f98" editable={!isDone}
            multiline
          />
          {isDone && (
            <View className="flex-row items-center gap-2 bg-surface-2 border border-hairline rounded-md p-3 mb-4">
              <Ionicons name="checkmark-circle" size={18} color="#22c55e" />
              <Text className="text-sm text-ink-subtle font-medium">This reminder has been completed</Text>
            </View>
          )}
          <DateTimePicker value={dueAt} onChange={(d) => { setDueAt(d); setIsDirty(true); }} label="Due" />
          <TextInput
            className="text-lg text-ink-subtle leading-relaxed min-h-[240px] bg-surface-1 rounded-xl px-6 py-3 border border-white/5 mb-12"
            value={body} onChangeText={(t) => { setBody(sanitize(t)); setIsDirty(true); }}
            placeholder="Add notes..." placeholderTextColor="#8a8f98" multiline textAlignVertical="top" editable={!isDone}
          />
          {existingReminder && (
            <AttachmentPreview attachments={existingReminder.attachments} parentId={existingReminder.id} parentType="reminder" />
          )}
          <View className="h-8" />
        </ScrollView>
      </KeyboardAvoidingView>
      <ConfirmDialog
        visible={showDeleteDialog} title="Delete Reminder"
        message="This reminder and its scheduled notification will be permanently deleted."
        confirmText="Delete" destructive onConfirm={handleDelete}
        onCancel={() => setShowDeleteDialog(false)}
      />
    </SafeAreaView>
  );
}
