import React from 'react';
import { Pressable, ScrollView, View } from 'react-native';
import { router } from 'expo-router';
import { C, rp } from '../theme';
import { Btn, Card, Check, Footer, Grow, Header, Icon, Row, T } from '../ui';
import { MiImage, ProductLabel, ProductPhoto, QtyField } from '../ui/parts';
import { IMG, PRODUCTS } from '../data';
import { useStore } from '../store';
import { goTab } from '../nav';

export default function Keranjang() {
  const { S, sub, orig, units, setQty, clearCart, cnReady } = useStore();
  return (
    <View style={{ flex: 1, backgroundColor: C.bgLow }}>
      <Header title="Daftar pesanan" />
      <ScrollView contentContainerStyle={{ padding: 16, gap: 16 }}>
        {S.cart.length === 0 ? (
          <Card style={{ alignItems: 'center', gap: 12, paddingVertical: 32 }}>
            <Icon name="cart" size={40} color={C.icon} />
            <T v="s1">Daftar pesanan masih kosong</T>
            <T v="c1" c={C.textMed} center>Pilih produk dari Beranda atau Katalog untuk mulai pesan.</T>
            <Btn title="Buka katalog" size="sm" onPress={() => goTab('/katalog')} />
          </Card>
        ) : (<>
          <Card style={{ gap: 12 }}>
            <Row gap={12}><Check on /><T v="s2" style={{ flex: 1 }}>Pilih semua ({S.cart.length} produk, {units} item)</T><Pressable onPress={clearCart}><T v="lbl" c={C.info}>Hapus</T></Pressable></Row>
            {S.cart.map(c => {
              const p = PRODUCTS[c.id];
              return (
                <Row key={c.id} gap={12} style={{ alignItems: 'flex-start' }}>
                  <Check on />
                  <ProductPhoto src={p.img} />
                  <Grow style={{ gap: 8 }}>
                    <T v="b2">{p.n}</T>
                    <T v="s2">{rp(p.p)}</T>
                    {p.o && <Row gap={4}><ProductLabel kind="disc" label={p.d!} /><T v="c1" style={{ textDecorationLine: 'line-through' }}>{rp(p.o)}</T></Row>}
                    <Row style={{ justifyContent: 'space-between' }}>
                      <QtyField qty={c.qty} onChange={q => setQty(c.id, q)} />
                      <Pressable onPress={() => setQty(c.id, 0)} hitSlop={8}><Icon name="trash" size={20} color={C.icon} /></Pressable>
                    </Row>
                  </Grow>
                </Row>
              );
            })}
          </Card>
          {cnReady > 0 && (
            /* Figma cn-teaser: Ⓐ mi.money (with background) + copy */
            <Row style={{ paddingHorizontal: 12, paddingVertical: 8, borderRadius: 8, backgroundColor: C.infoLow }}>
              <MiImage src={IMG.money} />
              <T v="c1" style={{ flex: 1 }}>Anda punya credit note <T v="lbl">{rp(cnReady)}</T> yang bisa dipakai di checkout.</T>
            </Row>
          )}
          <T v="c1" c={C.textMed}>Harga akhir & ketersediaan stok produk akan dikonfirmasi sales setelah pesanan diajukan.</T>
        </>)}
      </ScrollView>
      {S.cart.length > 0 && (
        <Footer>
          <Grow style={{ gap: 2 }}><T v="c1" c={C.textMed}>Total ({units} item)</T><T v="s2">{rp(sub)}</T>{orig > sub && <T v="c1" c={C.ok}>Hemat {rp(orig - sub)}</T>}</Grow>
          <Btn title={`Checkout (${units})`} onPress={() => router.push('/checkout')} />
        </Footer>
      )}
    </View>
  );
}
