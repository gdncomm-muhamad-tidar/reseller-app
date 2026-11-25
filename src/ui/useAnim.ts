import { useState } from 'react';
import { Animated } from 'react-native';

/** Stable Animated.Value (react-native-web has no useAnimatedValue). */
export function useAnim(initial: number) {
  const [v] = useState(() => new Animated.Value(initial));
  return v;
}
