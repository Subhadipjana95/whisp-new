import React, { useEffect, memo } from 'react';
import { View } from 'react-native';
import Animated, {
  useSharedValue,
  useAnimatedStyle,
  withRepeat,
  withTiming,
  withSpring,
  Easing,
  cancelAnimation,
} from 'react-native-reanimated';

interface RecorderWheelProps {
  isRecording: boolean;
  meteringLevel: number; // 0–1
  size?: number;
}

export const RecorderWheel = memo(function RecorderWheel({
  isRecording,
  meteringLevel,
  size = 160,
}: RecorderWheelProps) {
  const rotation = useSharedValue(0);
  const scale = useSharedValue(1);
  const outerOpacity = useSharedValue(0.3);

  useEffect(() => {
    if (isRecording) {
      rotation.value = withRepeat(
        withTiming(360, { duration: 3000, easing: Easing.linear }),
        -1,
        false
      );
    } else {
      cancelAnimation(rotation);
    }
  }, [isRecording, rotation]);

  useEffect(() => {
    const targetScale = isRecording ? 1 + meteringLevel * 0.35 : 1;
    scale.value = withSpring(targetScale, { damping: 8, stiffness: 120 });
    outerOpacity.value = withSpring(isRecording ? 0.3 + meteringLevel * 0.5 : 0.15);
  }, [meteringLevel, isRecording, scale, outerOpacity]);

  const rotatingRingStyle = useAnimatedStyle(() => ({
    transform: [{ rotate: `${rotation.value}deg` }],
  }));

  const pulseStyle = useAnimatedStyle(() => ({
    transform: [{ scale: scale.value }],
  }));

  const outerPulseStyle = useAnimatedStyle(() => ({
    opacity: outerOpacity.value,
    transform: [{ scale: scale.value * 1.2 }],
  }));

  const innerRadius = size * 0.28;
  const outerRadius = size * 0.44;

  return (
    <View style={{ width: size, height: size, alignItems: 'center', justifyContent: 'center' }}>
      {/* Outer ambient pulse */}
      <Animated.View
        style={[
          outerPulseStyle,
          {
            position: 'absolute',
            width: outerRadius * 2.4,
            height: outerRadius * 2.4,
            borderRadius: outerRadius * 1.2,
            backgroundColor: '#5e6ad2',
          },
        ]}
      />

      {/* Rotating dashed ring */}
      <Animated.View
        style={[
          rotatingRingStyle,
          {
            position: 'absolute',
            width: outerRadius * 2,
            height: outerRadius * 2,
            borderRadius: outerRadius,
            borderWidth: 2,
            borderColor: '#5e6ad2',
            borderStyle: 'dashed',
          },
        ]}
      />

      {/* Core mic button */}
      <Animated.View
        style={[
          pulseStyle,
          {
            width: innerRadius * 2,
            height: innerRadius * 2,
            borderRadius: innerRadius,
            backgroundColor: '#5e6ad2',
            alignItems: 'center',
            justifyContent: 'center',
          },
        ]}
      >
        <View
          style={{
            width: 12,
            height: 20,
            borderRadius: 6,
            backgroundColor: 'white',
          }}
        />
        <View
          style={{
            position: 'absolute',
            bottom: innerRadius * 0.25,
            width: 20,
            height: 3,
            backgroundColor: 'white',
            borderRadius: 2,
          }}
        />
      </Animated.View>
    </View>
  );
});
