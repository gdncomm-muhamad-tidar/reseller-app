import React, { useState } from 'react';
import { Image, ScrollView, View, Pressable } from 'react-native';
import { router, useLocalSearchParams } from 'expo-router';
import { C, rp } from '../../theme';
import { Badge, Btn, Chip, Divider, Footer, Header, Icon, IconBtn, Row, T } from '../../ui';
import { PRODUCTS, MISSIONS } from '../../data';
import { productTag } from '../../ui/parts';
import { useStore } from '../../store';
import { useOverlay } from '../../ui/overlay';

export default function PDP() {
  const { id } = useLocalSearchParams<{ id: string }>();
  const p = PRODUCTS[id ?? 'a36'] ?? PRODUCTS.a36;
  const { addToCart, units } = useStore();
  const { toast } = useOverlay();
  const [qty, setQty] = useState(5);
  const [variant, setVariant] = useState(p.variants[0]);
  const [color, setColor] = useState(p.colors[0]);
  return (
    <View style={{ flex: 1, backgroundColor: C.bg }}>
      <Header title="Detail produk" right={<IconBtn name="bag" color={C.icon} badge={units || undefined} onPress={() => router.push('/keranjang')} />} />
      <ScrollView contentContainerStyle={{ paddingBottom: 24 }}>
        <View style={{ alignItems: 'center', paddingVertical: 16, backgroundColor: '#fff' }}>
          <Image source={p.img} style={{ width: 240, height: 240 }} resizeMode="contain" />
        </View>
        <View style={{ padding: 16, gap: 8 }}>
          <Row>{productTag(p)}<T v="c1" c={C.textLow}>{p.mta}</T></Row>
          <T v="b1">{p.n}</T>
          <Row style={{ alignItems: 'baseline' }}><T v="t1">{rp(p.p)}</T>{p.o && <><T v="c1" c={C.textLow} style={{ textDecorationLine: 'line-through' }}>{rp(p.o)}</T><Badge label={p.d!} t="red" fill /></>}</Row>
          <T v="c1" c={C.ok}>{p.meta.includes('credit note') ? p.meta + ' · ' : ''}dihitung ke {MISSIONS[p.cat].t}</T>
          <T v="c1" c={C.textMed} style={{ marginTop: 8 }}>Kapasitas</T>
          <Row style={{ flexWrap: 'wrap' }}>{p.variants.map(v => <Chip key={v} label={v} on={variant === v} onPress={() => setVariant(v)} />)}</Row>
          <T v="c1" c={C.textMed} style={{ marginTop: 4 }}>Warna</T>
          <Row style={{ flexWrap: 'wrap' }}>{p.colors.map(c => <Chip key={c} label={c} on={color === c} onPress={() => setColor(c)} />)}</Row>
          <Divider style={{ marginVertical: 8 }} />
          <T v="s2">Deskripsi produk</T>
          <T v="c1" c={C.textMed}>{p.desc}</T>
          <View style={{ marginTop: 8, padding: 12, borderRadius: 8, backgroundColor: C.infoBg, gap: 4 }}>
            <T v="lbl">Harga grosir</T>
            <T v="c1" c={C.textMed}>Harga final dan ketersediaan dikonfirmasi sales setelah pesanan diajukan.</T>
          </View>
        </View>
      </ScrollView>
      <Footer>
        <Row gap={0} style={{ borderWidth: 1, borderColor: C.border, borderRadius: 8, height: 40 }}>
          <Pressable onPress={() => setQty(q => Math.max(1, q - 1))} style={{ width: 40, height: 40, alignItems: 'center', justifyContent: 'center' }}><Icon name="minus" size={16} color={C.info} /></Pressable>
          <T v="s2" style={{ width: 32, textAlign: 'center' }}>{qty}</T>
          <Pressable onPress={() => setQty(q => q + 1)} style={{ width: 40, height: 40, alignItems: 'center', justifyContent: 'center' }}><Icon name="plus" size={16} color={C.info} /></Pressable>
        </Row>
        <Btn title="Pesan" style={{ flex: 1 }} onPress={() => { addToCart(p.id, qty); toast(`${qty} unit ${p.n} masuk daftar pesanan`); router.push('/keranjang'); }} />
      </Footer>
    </View>
  );
}
