import React, { memo } from 'react';
import { View, TextInput, TouchableOpacity } from 'react-native';
import { Ionicons } from '@expo/vector-icons';

interface SearchBarProps {
  value: string;
  onChangeText: (text: string) => void;
  onClear: () => void;
  placeholder?: string;
}

export const SearchBar = memo(function SearchBar({
  value,
  onChangeText,
  onClear,
  placeholder = 'Search notes and reminders...',
}: SearchBarProps) {
  return (
    <View className="flex-row items-center bg-surface-1 rounded-full px-3  py-1.5 mx-4 mb-4 border border-hairline focus:border-hairline-strong">
      <TextInput
        className="flex-1 ml-2 text-base text-ink"
        value={value}
        onChangeText={onChangeText}
        placeholder={placeholder}
        placeholderTextColor="#8a8f98"
        returnKeyType="search"
        autoCapitalize="none"
        autoCorrect={false}
        clearButtonMode="never"
      />
      {value.length > 0 && (
        <TouchableOpacity onPress={onClear} hitSlop={{ top: 8, bottom: 8, left: 8, right: 8 }} className='bg-white/10 p-1.5 rounded-full items-center justify-center'>
          <Ionicons name="close-circle-outline" size={22} color="#8a8f98" />
        </TouchableOpacity>
      )}
    </View>
  );
});
