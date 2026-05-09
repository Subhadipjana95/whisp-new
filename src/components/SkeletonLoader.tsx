import React, { useEffect, memo } from 'react';
import { View } from 'react-native';
import Animated, {
  useSharedValue,
  useAnimatedStyle,
  withRepeat,
  withTiming,
  withSequence,
} from 'react-native-reanimated';

interface SkeletonLoaderProps {
  count?: number;
}

function SkeletonCard() {
  const opacity = useSharedValue(0.3);
  useEffect(() => {
    opacity.value = withRepeat(
      withSequence(withTiming(1, { duration: 700 }), withTiming(0.3, { duration: 700 })),
      -1, false
    );
  }, [opacity]);
  const animatedStyle = useAnimatedStyle(() => ({ opacity: opacity.value }));
  return (
    <Animated.View style={animatedStyle}>
      <View className="bg-white dark:bg-gray-800 rounded-2xl p-4 mx-4 mb-3">
        <View className="h-4 w-3/4 bg-gray-200 dark:bg-gray-700 rounded-lg mb-2" />
        <View className="h-3 w-full bg-gray-100 dark:bg-gray-700/50 rounded-lg mb-1" />
        <View className="h-3 w-2/3 bg-gray-100 dark:bg-gray-700/50 rounded-lg mb-3" />
        <View className="h-2 w-1/3 bg-gray-100 dark:bg-gray-700/50 rounded-lg" />
      </View>
    </Animated.View>
  );
}

export const SkeletonLoader = memo(function SkeletonLoader({ count = 4 }: SkeletonLoaderProps) {
  return (
    <View className="mt-2">
      {Array.from({ length: count }).map((_, i) => (<SkeletonCard key={i} />))}
    </View>
  );
});
