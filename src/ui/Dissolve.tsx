/* Dissolve page transition: every screen fades in (opacity 0 → 1) when it is pushed and every time it
 * regains focus (back navigation, tab switch). Native stacks also use animation: 'fade'; this wrapper
 * gives the same dissolve on web, where native-stack has no animation. Used as navigator `screenLayout`. */
import React, { ReactNode, useEffect, useState } from 'react';
import { Animated, Easing } from 'react-native';

type Nav = { addListener: (e: 'focus', cb: () => void) => () => void };

export function Dissolve({ navigation, children }: { navigation: Nav; children: ReactNode }) {
  const [a] = useState(() => new Animated.Value(0));
  useEffect(() => {
    const run = () => { a.setValue(0); Animated.timing(a, { toValue: 1, duration: 280, easing: Easing.out(Easing.quad), useNativeDriver: true }).start(); };
    run();
    return navigation.addListener('focus', run);
  }, [a, navigation]);
  return <Animated.View style={{ flex: 1, opacity: a }}>{children}</Animated.View>;
}
