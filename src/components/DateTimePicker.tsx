import React, { memo, useState } from 'react';
import { View, Text, TouchableOpacity, Platform, Modal } from 'react-native';
import { format } from 'date-fns';
import DateTimePickerNative from '@react-native-community/datetimepicker';

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

  const handleOpen = (pickerMode: 'date' | 'time') => {
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
    onChange(tempDate);
    setShowPicker(false);
  };

  return (
    <View className="flex-row items-center gap-3 py-3 border-b border-hairline">
      <Text className="text-base text-ink-subtle w-12">{label}</Text>
      <TouchableOpacity onPress={() => handleOpen('date')}>
        <Text className="text-base text-primary font-medium">
          {format(value, 'EEE, MMM d, yyyy')}
        </Text>
      </TouchableOpacity>
      <Text className="text-gray-300">·</Text>
      <TouchableOpacity onPress={() => handleOpen('time')}>
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
        />
      )}
    </View>
  );
});
