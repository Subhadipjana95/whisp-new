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
    <View className="flex-row items-center bg-surface-1 rounded-md px-3 py-2 mx-4 mb-4 border border-hairline focus:border-hairline-strong">
      <Ionicons name="search" size={16} color="#8a8f98" />
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
        <TouchableOpacity onPress={onClear} hitSlop={{ top: 8, bottom: 8, left: 8, right: 8 }}>
          <Ionicons name="close-circle" size={16} color="#8a8f98" />
        </TouchableOpacity>
      )}
    </View>
  );
});
