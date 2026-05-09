import React, { Component, type ReactNode } from 'react';
import { View, Text, TouchableOpacity } from 'react-native';

interface Props { children: ReactNode; fallback?: ReactNode; }
interface State { hasError: boolean; error: Error | null; }

export class ErrorBoundary extends Component<Props, State> {
  state: State = { hasError: false, error: null };
  static getDerivedStateFromError(error: Error): State {
    return { hasError: true, error };
  }
  componentDidCatch(error: Error, info: React.ErrorInfo): void {
    console.error('[ErrorBoundary]', error, info);
  }
  handleReset = () => { this.setState({ hasError: false, error: null }); };
  render() {
    if (this.state.hasError) {
      if (this.props.fallback) return this.props.fallback;
      return (
        <View className="flex-1 items-center justify-center p-8">
          <Text className="text-xl font-bold text-gray-900 dark:text-white mb-2">Something went wrong</Text>
          <Text className="text-sm text-gray-500 dark:text-gray-400 text-center mb-6">
            {this.state.error?.message ?? 'An unexpected error occurred'}
          </Text>
          <TouchableOpacity onPress={this.handleReset} className="bg-primary rounded-2xl px-6 py-3">
            <Text className="text-white font-semibold">Try Again</Text>
          </TouchableOpacity>
        </View>
      );
    }
    return this.props.children;
  }
}
