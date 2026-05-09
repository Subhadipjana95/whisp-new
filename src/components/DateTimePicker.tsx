import DateTimePickerNative from '@react-native-community/datetimepicker';
import { format } from 'date-fns';
import React, { memo, useState, useCallback } from 'react';
import { Modal, Platform, Text, TouchableOpacity, View } from 'react-native';
import * as Haptics from 'expo-haptics';
import { useSettingsStore } from '../stores/settingsStore';

interface DateTimePickerProps {
  value: Date;
  onChange: (date: Date) => void;
  label?: string;
}

export const DateTimePicker = memo(function DateTimePicker({
  value,
  onChange,
  label = 'Due',
}: DateTimePickerProps) {
  const [showPicker, setShowPicker] = useState(false);
  const [mode, setMode] = useState<'date' | 'time'>('date');
  const [tempDate, setTempDate] = useState(value);
  const hapticEnabled = useSettingsStore((s) => s.hapticFeedback);

  const triggerHaptic = useCallback(() => {
    if (hapticEnabled) {
      Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Light);
    }
  }, [hapticEnabled]);

  const handleOpen = (pickerMode: 'date' | 'time') => {
    triggerHaptic();
    setMode(pickerMode);
    setTempDate(value);
    setShowPicker(true);
  };

  const handleChange = (_: unknown, selected?: Date) => {
    if (selected) {
      setTempDate(selected);
      if (Platform.OS === 'android') {
        setShowPicker(false);
        onChange(selected);
      }
    }
  };

  const handleConfirm = () => {
    triggerHaptic();
    onChange(tempDate);
    setShowPicker(false);
  };

  return (
    <View className="flex-row items-center gap-2 mb-6">
      <TouchableOpacity onPress={() => handleOpen('date')} className='bg-surface-2 px-3 py-1 rounded-full border border-white/5'>
        <Text className="text-base text-primary font-medium">
          {format(value, 'EEE, MMM d, yyyy')}
        </Text>
      </TouchableOpacity>
      <TouchableOpacity onPress={() => handleOpen('time')} className='bg-surface-2 px-3 py-1 rounded-full border border-white/5'>
        <Text className="text-base text-primary font-medium">{format(value, 'h:mm a')}</Text>
      </TouchableOpacity>

      {Platform.OS === 'ios' && showPicker && (
        <Modal transparent animationType="slide" visible>
          <View className="flex-1 justify-end bg-black/80">
            <View className="bg-surface-1 rounded-t-xl p-4 border-t border-hairline">
              <View className="flex-row justify-between mb-4">
                <TouchableOpacity onPress={() => setShowPicker(false)}>
                  <Text className="text-base text-ink-subtle">Cancel</Text>
                </TouchableOpacity>
                <TouchableOpacity onPress={handleConfirm}>
                  <Text className="text-base text-primary font-semibold">Done</Text>
                </TouchableOpacity>
              </View>
              <DateTimePickerNative
                value={tempDate}
                mode={mode}
                display="spinner"
                onChange={handleChange}
                minimumDate={new Date()}
                themeVariant="dark"
              />
            </View>
          </View>
        </Modal>
      )}

      {Platform.OS === 'android' && showPicker && (
        <DateTimePickerNative
          value={tempDate}
          mode={mode}
          display="default"
          onChange={handleChange}
          minimumDate={new Date()}
          themeVariant="dark"
        />
      )}
    </View>
  );
});
