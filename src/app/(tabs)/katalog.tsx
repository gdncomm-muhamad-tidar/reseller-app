/* Katalog — Figma 748:43959 (header, "Cari berdasarkan kategori" grid, search bar, "Produk pilihan" 2-column grid).
 * Categories and products follow the brand chosen in "Pilih brand" (Apple as in Figma; Samsung uses the same layout). */
import React, { useMemo, useState } from 'react';
import { Image, Pressable, ScrollView, TextInput, View } from 'react-native';
import { useSafeAreaInsets } from 'react-native-safe-area-context';
import { router } from 'expo-router';
import { C, F, rp } from '../../theme';
import { Icon, Row, T } from '../../ui';
import { AddBtn, CartBar, NAV_SPACE } from '../../ui/parts';
import { BRANDS, Product, PRODUCTS } from '../../data';
import { useStore } from '../../store';
import { useWebThemeColor } from '../../ui/useWebChrome';

/** Ⓟ product-card.grid */
function GridCard({ p }: { p: Product }) {
  return (
    <Pressable onPress={() => router.push({ pathname: '/produk/[id]', params: { id: p.id } })} style={({ pressed }) => [{ flex: 1, gap: 4 }, pressed && { opacity: 0.85 }]}>
      <View style={{ aspectRatio: 1, borderRadius: 8, borderWidth: 1, borderColor: C.borderLow, backgroundColor: C.bg, overflow: 'hidden', alignItems: 'center', justifyContent: 'center' }}>
        <Image source={p.img} style={{ width: '86%', height: '86%' }} resizeMode="contain" />
        <Row gap={3} style={{ position: 'absolute', bottom: 8 }}>
          {[0, 1, 2].map(i => <View key={i} style={{ width: i ? 4 : 6, height: 4, borderRadius: 2, backgroundColor: i ? C.border : C.info }} />)}
        </Row>
        <AddBtn id={p.id} style={{ position: 'absolute', right: 8, bottom: 20, width: 36, height: 36, borderRadius: 18, backgroundColor: '#fff', borderWidth: 1, borderColor: C.infoMed, alignItems: 'center', justifyContent: 'center' }} />
      </View>
      <T v="b2" numberOfLines={1} style={{ marginTop: 4 }}>{p.n}</T>
      <T v="s1">{rp(p.p)}</T>
      {p.variants.length > 1 && <T v="c1" c={C.textMed}>Harga bervariasi</T>}
    </Pressable>
  );
}

export default function Katalog() {
  const ins = useSafeAreaInsets();
  useWebThemeColor(C.bg);
  const { S, units } = useStore();
  const brand = BRANDS[S.brand];
  const [q, setQ] = useState('');
  const [cat, setCat] = useState(brand.cats[0][0]);
  const [seen, setSeen] = useState(S.brand);
  if (seen !== S.brand) { setSeen(S.brand); setCat(brand.cats[0][0]); setQ(''); }
  const isBrand = (p: Product) => (S.brand === 'apple' ? p.brand === 'apple' : !p.brand);
  const list = useMemo(() => {
    const t = q.trim().toLowerCase();
    return Object.values(PRODUCTS).filter(p => isBrand(p) && (t ? p.n.toLowerCase().includes(t) : p.kat === cat));
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [q, cat, S.brand]);
  const rows: Product[][] = [];
  for (let i = 0; i < list.length; i += 2) rows.push(list.slice(i, i + 2));
  return (
    <View style={{ flex: 1, backgroundColor: C.bgLow }}>
      <View style={{ backgroundColor: C.bg, paddingTop: ins.top }}>
        <Row style={{ padding: 16 }}><T v="s1" style={{ flex: 1 }}>Katalog</T></Row>
      </View>
      <ScrollView contentContainerStyle={{ paddingBottom: NAV_SPACE + ins.bottom + (units ? 64 : 0) }} keyboardShouldPersistTaps="handled">
        <View style={{ backgroundColor: C.bgLow }}>
          <T v="s1" style={{ padding: 16 }}>Cari berdasarkan kategori</T>
          <View style={{ flexDirection: 'row', flexWrap: 'wrap', gap: 8, paddingHorizontal: 16, paddingBottom: 16 }}>
            {brand.cats.map(([k, l, img]) => {
              const on = !q && cat === k;
              return (
                <Pressable key={k} onPress={() => { setCat(k); setQ(''); }} style={{ width: '31.5%', alignItems: 'center', paddingVertical: 8, paddingHorizontal: 4, borderRadius: 8, backgroundColor: C.bg, borderWidth: 1, borderColor: on ? C.infoMed : C.bg }}>
                  <Image source={img} style={{ width: 66, height: 66, borderRadius: 4 }} resizeMode="contain" />
                  <T v="b2" c={C.textMed} center>{l}</T>
                </Pressable>
              );
            })}
          </View>
        </View>
        <View style={{ backgroundColor: C.bg, padding: 16, gap: 16 }}>
          {/* 🅑 search-bar */}
          <Row gap={8} style={{ height: 36, borderRadius: 8, backgroundColor: C.bgMed, paddingHorizontal: 12 }}>
            <Icon name="search" size={18} color={C.icon} />
            <TextInput value={q} onChangeText={setQ} placeholder="Mau pesan produk apa?" placeholderTextColor={C.textMed} style={{ flex: 1, fontFamily: F.medium, fontSize: 14, color: C.text, paddingVertical: 0 }} />
          </Row>
          <T v="s1">{q ? `Hasil pencarian (${list.length})` : 'Produk pilihan'}</T>
          {rows.map((r, i) => (
            <Row key={i} gap={16} style={{ alignItems: 'flex-start' }}>
              {r.map(p => <GridCard key={p.id} p={p} />)}
              {r.length === 1 && <View style={{ flex: 1 }} />}
            </Row>
          ))}
          {!list.length && <T v="b2" c={C.textMed} center style={{ marginVertical: 24 }}>{q ? 'Produk tidak ditemukan. Coba kata kunci lain.' : 'Belum ada produk di kategori ini.'}</T>}
        </View>
      </ScrollView>
      <CartBar />
    </View>
  );
}
