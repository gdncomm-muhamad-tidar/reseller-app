/* Skeleton loading (shimmer pulse) — shown on Beranda while the interface switches brand. */
import React, { createContext, ReactNode, useContext, useEffect, useState } from 'react';
import { Animated, DimensionValue, Easing, View } from 'react-native';
import { C } from '../theme';

const Pulse = createContext<Animated.Value | null>(null);

export function SkeletonGroup({ children }: { children: ReactNode }) {
  const [a] = useState(() => new Animated.Value(0));
  useEffect(() => {
    const loop = Animated.loop(Animated.sequence([
      Animated.timing(a, { toValue: 1, duration: 650, easing: Easing.inOut(Easing.quad), useNativeDriver: true }),
      Animated.timing(a, { toValue: 0, duration: 650, easing: Easing.inOut(Easing.quad), useNativeDriver: true }),
    ]));
    loop.start();
    return () => loop.stop();
  }, [a]);
  return <Pulse.Provider value={a}>{children}</Pulse.Provider>;
}

export function Bone({ w = '100%', h = 12, r = 6, style }: { w?: DimensionValue; h?: number; r?: number; style?: any }) {
  const a = useContext(Pulse);
  return <Animated.View style={[{ width: w, height: h, borderRadius: r, backgroundColor: '#e1e3e4', opacity: a ? a.interpolate({ inputRange: [0, 1], outputRange: [1, 0.45] }) : 1 }, style]} />;
}

const CardBox = ({ children, style }: { children: ReactNode; style?: any }) => <View style={[{ backgroundColor: C.bg, borderRadius: 12, padding: 16, gap: 12 }, style]}>{children}</View>;

/** Credit note card placeholder (inside the gradient header) */
export function SkeletonCN() {
  return (
    <SkeletonGroup>
    <CardBox style={{ marginTop: 16, borderRadius: 16 }}>
      <Bone w={120} h={12} />
      <Bone w={190} h={28} r={8} />
      <View style={{ height: 1, backgroundColor: C.borderLow }} />
      <View style={{ flexDirection: 'row', gap: 16 }}><View style={{ flex: 1, gap: 8 }}><Bone w={60} /><Bone w={80} h={16} /></View><View style={{ flex: 1, gap: 8 }}><Bone w={70} /><Bone w={90} h={16} /></View></View>
    </CardBox>
    </SkeletonGroup>
  );
}

/** Beranda sections placeholder: perlu tindakan, ringkasan belanja, misi, product rows */
export function SkeletonHome() {
  const productRow = (
    <View style={{ flexDirection: 'row', gap: 12 }}>
      {[0, 1, 2].map(i => (
        <View key={i} style={{ width: 144, backgroundColor: C.bg, borderRadius: 12, overflow: 'hidden', gap: 8, paddingBottom: 12 }}>
          <Bone w="100%" h={120} r={0} /><Bone w={110} style={{ marginHorizontal: 12 }} /><Bone w={80} h={14} style={{ marginHorizontal: 12 }} /><Bone w={96} style={{ marginHorizontal: 12 }} />
        </View>
      ))}
    </View>
  );
  return (
    <SkeletonGroup>
    <View style={{ gap: 24, paddingTop: 8, paddingHorizontal: 16 }}>
      <View style={{ gap: 12 }}>
        <Bone w={140} h={18} />
        <CardBox style={{ gap: 16 }}>
          {[0, 1, 2].map(i => (
            <View key={i} style={{ flexDirection: 'row', alignItems: 'center', gap: 12 }}>
              <View style={{ flex: 1, gap: 8 }}><Bone w="70%" h={14} /><Bone w="50%" /></View><Bone w={64} h={32} r={16} />
            </View>
          ))}
        </CardBox>
      </View>
      <View style={{ gap: 12 }}>
        <Bone w={200} h={18} />
        <CardBox><Bone w={120} h={24} r={8} /><Bone w="100%" h={120} r={8} /><View style={{ flexDirection: 'row', gap: 8 }}><Bone w="48%" h={56} r={8} /><Bone w="48%" h={56} r={8} /></View></CardBox>
      </View>
      <View style={{ gap: 12 }}><Bone w={110} h={18} />{productRow}</View>
      <View style={{ gap: 12 }}><Bone w={160} h={18} />{productRow}</View>
    </View>
    </SkeletonGroup>
  );
}
