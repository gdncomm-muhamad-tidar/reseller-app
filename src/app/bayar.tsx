import React from 'react';
import { Pressable, ScrollView, View } from 'react-native';
import { router } from 'expo-router';
import { C, rp } from '../theme';
import { Btn, Card, Footer, Grow, Header, Icon, Radio, Row, T } from '../ui';
import { BANKS, TODAY } from '../data';
import { BankLogo } from '../ui/parts';
import { useStore } from '../store';

export default function Bayar() {
  const { S, setVA, invoices } = useStore();
  const ctx = S.payCtx;
  if (!ctx) return <View style={{ flex: 1 }}><Header title="Pembayaran" /></View>;
  // earliest due date of the invoices being paid ("Jatuh tempo 19 Nov" → 19, "16 Des" → 46)
  const dues = invoices.filter(i => ctx.ids.includes(i.id)).map(i => i.due.match(/(\d+) (Nov|Des)/)).filter(Boolean).map(m => [+m![1] + (m![2] === 'Des' ? 30 : 0), m![1], m![2]] as const).sort((a, b) => a[0] - b[0]);
  const first = dues[0];
  const dueText = !first ? '' : first[0] < TODAY ? `Lewat jatuh tempo ${first[1]} ${first[2]} 2026. Denda 0,1% per hari, segera bayar.` : `Bayar sebelum ${first[1]} ${first[2]} 2026, 23.59 WIB`;
  return (
    <View style={{ flex: 1, backgroundColor: C.bgLow }}>
      <Header title="Pembayaran" />
      <ScrollView contentContainerStyle={{ padding: 16, gap: 16 }}>
        <Card style={{ gap: 8 }}>
          <T v="c1" c={C.textMed}>Total tagihan</T>
          <T v="s1">{rp(ctx.amt)}</T>
          <T v="c1" c={C.textMed}>{ctx.ref}</T>
          {/* 🅑 banner.alert */}
          <Row gap={8} style={{ paddingVertical: 8, paddingHorizontal: 12, borderRadius: 8, borderWidth: 1, borderColor: '#fedd6c', backgroundColor: '#fff8e0', alignItems: 'flex-start' }}>
            <Icon name="alertFill" size={18} color="#bc6e06" /><T v="b2" c={C.textMed} style={{ flex: 1 }}>{dueText}</T>
          </Row>
        </Card>
        <View style={{ gap: 4 }}>
        <T v="s2">Virtual account</T>
        <Card style={{ paddingVertical: 0 }}>
          {BANKS.map(([b], i) => (
            <Pressable key={b} onPress={() => setVA(b)} style={{ flexDirection: 'row', alignItems: 'center', gap: 12, paddingVertical: 16, borderTopWidth: i ? 1 : 0, borderTopColor: C.borderLow }}>
              <BankLogo b={b} /><T v={S.va === b ? 's2' : 'c1'} style={{ flex: 1 }}>{b} Virtual Account</T><Radio on={S.va === b} />
            </Pressable>
          ))}
        </Card>
        </View>
        <T v="c1" c={C.textMed} center>Pembayaran diproses aman oleh Midtrans</T>
      </ScrollView>
      <Footer>
        <Grow style={{ gap: 2 }}><T v="c1" c={C.textMed}>Total bayar</T><T v="s2">{rp(ctx.amt)}</T></Grow>
        <Btn title={`Bayar via ${S.va === 'CIMB Niaga' ? 'CIMB' : S.va}`} onPress={() => router.push('/va')} />
      </Footer>
    </View>
  );
}
