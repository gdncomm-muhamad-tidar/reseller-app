/* Scroll behaviour for pages with a gradient hero (Misi, Detail misi, Poin):
 * - the hero background moves slower than the content (parallax);
 * - once the content scrolls past `threshold`, the floating header turns into the
 *   🅑 header-simple default (white, text-high title, default icon colour, bottom border).
 * Usage: const h = useScrollHeader(); <Animated.ScrollView onScroll={h.onScroll} scrollEventThrottle={16}> … <FloatingHeader …/> */
import React, { ReactNode, useCallback, useMemo, useState } from 'react';
import { Animated, NativeScrollEvent, NativeSyntheticEvent, View } from 'react-native';
import { router } from 'expo-router';
import { StatusBar } from 'expo-status-bar';
import { useSafeAreaInsets } from 'react-native-safe-area-context';
import { C } from '../theme';
import { IconBtn, Row, T } from './index';
import { useWebThemeColor } from './useWebChrome';

export const HEADER_H = 56;

export function useScrollHeader() {
  const [scrollY] = useState(() => new Animated.Value(0));
  const [threshold, setThr] = useState(160);
  const [solid, setSolid] = useState(false);
  const setThreshold = useCallback((v: number) => setThr(v), []);
  const onScroll = useMemo(() => Animated.event([{ nativeEvent: { contentOffset: { y: scrollY } } }], {
    useNativeDriver: false,
    listener: (e: NativeSyntheticEvent<NativeScrollEvent>) => {
      const s = e.nativeEvent.contentOffset.y >= threshold - 2;
      setSolid(prev => (prev === s ? prev : s));
    },
  }), [scrollY, threshold]);
  return { scrollY, onScroll, threshold, setThreshold, solid };
}

/** Background layer of the hero: moves at `speed` × scroll (parallax) and stretches on pull-down. */
export function ParallaxBg({ scrollY, children, speed = 0.5 }: { scrollY: Animated.Value; children: ReactNode; speed?: number }) {
  return (
    <Animated.View pointerEvents="none" style={{
      position: 'absolute', left: 0, right: 0, top: 0, bottom: 0, overflow: 'hidden',
      transform: [{ translateY: scrollY.interpolate({ inputRange: [-200, 0, 600], outputRange: [-200, 0, 600 * speed], extrapolateRight: 'extend' }) }],
    }}>{children}</Animated.View>
  );
}

/** Content of the hero drifts up a little slower and fades as it leaves (parallax foreground). */
export function ParallaxFg({ scrollY, threshold, children }: { scrollY: Animated.Value; threshold: number; children: ReactNode }) {
  return (
    <Animated.View style={{
      opacity: scrollY.interpolate({ inputRange: [0, Math.max(1, threshold)], outputRange: [1, 0.35], extrapolate: 'clamp' }),
      transform: [{ translateY: scrollY.interpolate({ inputRange: [0, Math.max(1, threshold)], outputRange: [0, threshold * 0.25], extrapolate: 'clamp' }) }],
    }}>{children}</Animated.View>
  );
}

/** Floating header: transparent over the hero, 🅑 header-simple (white) after the threshold.
 *  tone="light" → white back/title on the hero (dark hero); tone="dark" → dark content on a light hero. */
export function FloatingHeader({ title, scrollY, threshold, solid, tone = 'light', heroColor, right }: {
  title: string; scrollY: Animated.Value; threshold: number; solid: boolean; tone?: 'light' | 'dark'; heroColor: string; right?: ReactNode;
}) {
  const ins = useSafeAreaInsets();
  useWebThemeColor(solid ? '#ffffff' : heroColor);
  const p = scrollY.interpolate({ inputRange: [threshold - 32, threshold], outputRange: [0, 1], extrapolate: 'clamp' });
  const back = () => (router.canGoBack() ? router.back() : router.replace('/home'));
  const content = (dark: boolean) => (
    <Row gap={8} style={{ height: HEADER_H, paddingHorizontal: 16 }}>
      <IconBtn name="back" color={dark ? C.icon : '#fff'} onPress={back} />
      <T v="s1" c={dark ? C.text : '#fff'} style={{ flex: 1 }} numberOfLines={1}>{title}</T>
      {right}
    </Row>
  );
  return (
    <View pointerEvents="box-none" style={{ position: 'absolute', left: 0, right: 0, top: 0, zIndex: 20 }}>
      <StatusBar style={solid || tone === 'dark' ? 'dark' : 'light'} />
      <Animated.View pointerEvents="none" style={{ position: 'absolute', left: 0, right: 0, top: 0, bottom: 0, backgroundColor: C.bg, borderBottomWidth: 1, borderBottomColor: '#e1e3e4', opacity: p }} />
      <View style={{ paddingTop: ins.top }}>
        {tone === 'dark' ? content(true) : (
          <View>
            <Animated.View style={{ opacity: p.interpolate({ inputRange: [0, 1], outputRange: [1, 0] }) }} pointerEvents={solid ? 'none' : 'auto'}>{content(false)}</Animated.View>
            <Animated.View style={{ position: 'absolute', left: 0, right: 0, top: 0, opacity: p }} pointerEvents={solid ? 'auto' : 'none'}>{content(true)}</Animated.View>
          </View>
        )}
      </View>
    </View>
  );
}
