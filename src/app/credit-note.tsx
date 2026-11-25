import React from 'react';
import { Pressable, ScrollView, View } from 'react-native';
import { router } from 'expo-router';
import { C, rp } from '../theme';
import { Btn, Check, Footer, Grow, Header, Icon, Row, T, Tabs } from '../ui';
import { useStore } from '../store';
import { useOverlay } from '../ui/overlay';

export default function CreditNotePicker() {
  const { S, usable, toggleCN, cnAmt } = useStore();
  const { toast } = useOverlay();
  const blocked = S.cns.filter(c => c.st === 'expired');
  const n = usable.filter(c => S.cnSel[c.k]).length;
  return (
    <View style={{ flex: 1, backgroundColor: C.bgLow }}>
      <Header title="Credit note & voucher">
        <Tabs items={[['cn', `Credit note (${usable.length + blocked.length})`], ['v', 'Voucher (1)']]} value="cn" onChange={k => k === 'v' && toast('Belum ada voucher yang bisa dipakai di pesanan ini')} />
      </Header>
      <ScrollView contentContainerStyle={{ padding: 16, gap: 12 }}>
        {/* 🅑 banner.info */}
        <Row gap={8} style={{ padding: 8, borderRadius: 8, borderWidth: 1, borderColor: C.infoBorder, backgroundColor: C.infoBg, alignItems: 'flex-start' }}>
          <Icon name="info" size={18} color={C.info} />
          <T v="b2" c={C.textMed} style={{ flex: 1 }}>Credit note bisa digabungkan. Potongan maksimumnya senilai total belanja.</T>
        </Row>
        <T v="s2" style={{ marginTop: 4 }}>Bisa dipakai ({usable.length})</T>
        {usable.map(c => {
          const on = !!S.cnSel[c.k];
          return (
            <Pressable key={c.k} onPress={() => toggleCN(c.k)} style={{ flexDirection: 'row', gap: 12, padding: 16, borderRadius: 12, borderWidth: on ? 1.5 : 1, borderColor: on ? C.infoBorder : C.borderLow, backgroundColor: on ? C.infoLow : C.bg, alignItems: 'flex-start' }}>
              <Grow style={{ gap: 2 }}><T v="s2">{rp(c.amt)}</T><T v="lbl">{c.t}</T><T v="c1" c={C.textMed}>{c.c} · berlaku hingga {c.exp ?? '31 Des 2026'}</T></Grow>
              <Check on={on} />
            </Pressable>
          );
        })}
        {!usable.length && <T v="c1" c={C.textMed}>Belum ada credit note yang bisa dipakai.</T>}
        {blocked.length > 0 && <T v="s2" style={{ marginTop: 4 }}>Tidak bisa dipakai ({blocked.length})</T>}
        {blocked.map(c => (
          <View key={c.k} style={{ padding: 16, borderRadius: 12, backgroundColor: C.bgMed, gap: 2 }}>
            <Row gap={8}>
              <T v="s2" c={C.textMed} style={{ flex: 1 }}>{rp(c.amt)}</T>
              <View style={{ height: 16, paddingHorizontal: 4, borderRadius: 4, borderWidth: 1, borderColor: '#c8cbcd', backgroundColor: C.bg, justifyContent: 'center' }}><T v="lbl" c={C.textMed}>Hangus</T></View>
            </Row>
            <T v="lbl" c={C.textMed}>{c.t}</T>
          </View>
        ))}
      </ScrollView>
      <Footer>
        <Grow style={{ gap: 2 }}><T v="c1" c={C.textMed}>Total potongan ({n} credit note)</T><T v="s2" c={C.ok}>−{rp(cnAmt)}</T></Grow>
        <Btn title="Pakai" style={{ minWidth: 140 }} onPress={() => router.back()} />
      </Footer>
    </View>
  );
}
