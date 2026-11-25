/* Homepage banner carousel (below the credit note section).
 * Max 5 banners, 112px tall (≤120px), one banner per page, auto-advances every 4s and pauses while the
 * user is swiping. Copy and amounts come from data.ts so they stay in sync with the rest of the demo. */
import React, { useEffect, useRef, useState } from 'react';
import { Image, ImageSourcePropType, Pressable, ScrollView, View } from 'react-native';
import type { NativeScrollEvent, NativeSyntheticEvent, ScrollViewInstance } from 'react-native';
import { LinearGradient } from 'expo-linear-gradient';
import { router } from 'expo-router';
import { C, rp, short } from '../theme';
import { T } from './index';
import { Brand, IMG, NET_DAYS, PRODUCTS, QUARTER_BONUS } from '../data';
import { goTab } from '../nav';

const H = 112, MAX = 5, AUTO_MS = 4000;

type Banner = { key: string; title: string; sub: string; img: ImageSourcePropType; photo?: boolean; bg: [string, string]; go: () => void };

const product = (id: string, sub: string, bg: [string, string]): Banner => ({
  key: id, title: PRODUCTS[id].n.replace(/ \d+GB.*$/, ''), sub, img: PRODUCTS[id].img, photo: true, bg,
  go: () => router.push({ pathname: '/produk/[id]', params: { id } }),
});

function bannersFor(brand: Brand): Banner[] {
  const shared: Banner[] = [
    { key: 'misi', title: `Bonus kuartal ${short(QUARTER_BONUS)}`, sub: 'Selesaikan misi dan dapatkan credit note tambahan', img: IMG.mission, bg: ['#FFF4CC', '#FFE38A'], go: () => router.push('/misi') },
    { key: 'scan', title: 'Scan IMEI, dapat poin', sub: 'Verifikasi produk yang sudah Anda beli', img: IMG.scan, bg: ['#DDF7EA', '#B9EDD3'], go: () => goTab('/scan') },
    { key: 'net', title: `Bayar tempo hingga ${Math.max(...NET_DAYS)} hari`, sub: 'Belanja sekarang, bayar dengan metode Net', img: IMG.money, bg: ['#EFE7FF', '#DCCBFF'], go: () => goTab('/katalog') },
  ];
  const own = brand === 'apple'
    ? [product('ip17pm', `Credit note ${rp(PRODUCTS.ip17pm.cn)} per unit`, ['#E1F1FF', '#C7E4FF']),
       product('ip17', `Pre-order sekarang · credit note ${rp(PRODUCTS.ip17.cn)}`, ['#FFE7EC', '#FFCAD5'])]
    : [product('ultra', `Credit note ${rp(PRODUCTS.ultra.cn)} per unit`, ['#E1F1FF', '#C7E4FF']),
       product('flip7', `Credit note ${rp(PRODUCTS.flip7.cn)} per unit`, ['#FFE7EC', '#FFCAD5'])];
  return [...own, ...shared].slice(0, MAX);
}

export function BannerCarousel({ brand }: { brand: Brand }) {
  const banners = bannersFor(brand);
  const scroll = useRef<ScrollViewInstance>(null);
  const [w, setW] = useState(0);
  const [idx, setIdx] = useState(0);
  const [paused, setPaused] = useState(false);

  // auto-advance; restarts whenever the page changes, stops while the user is swiping
  useEffect(() => {
    if (!w || paused || banners.length < 2) return;
    const t = setTimeout(() => {
      const next = (idx + 1) % banners.length;
      scroll.current?.scrollTo({ x: next * w, animated: true });
    }, AUTO_MS);
    return () => clearTimeout(t);
  }, [w, idx, paused, banners.length]);

  const onScroll = (e: NativeSyntheticEvent<NativeScrollEvent>) => {
    if (!w) return;
    const i = Math.round(e.nativeEvent.contentOffset.x / w);
    setIdx(prev => (prev === i ? prev : Math.min(Math.max(i, 0), banners.length - 1)));
  };

  return (
    <View style={{ gap: 8 }} onLayout={e => setW(e.nativeEvent.layout.width)}>
      <ScrollView ref={scroll} horizontal pagingEnabled showsHorizontalScrollIndicator={false} scrollEventThrottle={16}
        onScroll={onScroll} onScrollBeginDrag={() => setPaused(true)} onScrollEndDrag={() => setPaused(false)}
        onTouchStart={() => setPaused(true)} onTouchEnd={() => setPaused(false)}>
        {banners.map(b => (
          <View key={b.key} style={{ width: w || 1, paddingHorizontal: 16 }}>
            <Pressable onPress={b.go} accessibilityRole="button" accessibilityLabel={`${b.title}. ${b.sub}`}
              style={({ pressed }) => [{ height: H, borderRadius: 12, overflow: 'hidden' }, pressed && { opacity: 0.9 }]}>
              <LinearGradient colors={b.bg} start={{ x: 0, y: 0 }} end={{ x: 1, y: 1 }} style={{ flex: 1, flexDirection: 'row', alignItems: 'center', paddingLeft: 16, paddingRight: 12, gap: 12 }}>
                <View style={{ flex: 1, gap: 4 }}>
                  <T v="s1" numberOfLines={2}>{b.title}</T>
                  <T v="c1" c={C.textMed} numberOfLines={2}>{b.sub}</T>
                </View>
                {b.photo ? (
                  <View style={{ width: 84, height: 84, borderRadius: 12, backgroundColor: '#fff', overflow: 'hidden', alignItems: 'center', justifyContent: 'center' }}>
                    <Image source={b.img} resizeMode="contain" style={{ width: 76, height: 76 }} />
                  </View>
                ) : (
                  <Image source={b.img} resizeMode="contain" style={{ width: 88, height: 88 }} />
                )}
              </LinearGradient>
            </Pressable>
          </View>
        ))}
      </ScrollView>
      {banners.length > 1 && (
        <View style={{ flexDirection: 'row', justifyContent: 'center', gap: 4 }}>
          {banners.map((b, i) => (
            <View key={b.key} style={{ height: 6, width: i === idx ? 16 : 6, borderRadius: 3, backgroundColor: i === idx ? C.info : '#D6D9DB' }} />
          ))}
        </View>
      )}
    </View>
  );
}
