/* Riwayat credit note — every movement (masuk · dipakai · hangus) from the credit note data,
 * in the row style of Finansial 4a "Riwayat credit note". */
import React from 'react';
import { Pressable, ScrollView, View } from 'react-native';
import { router } from 'expo-router';
import { C, rp } from '../theme';
import { Card, CircleIcon, Header, Icon, T } from '../ui';
import { useStore } from '../store';
import { slugOf } from '../orders';
import { cnEvents } from '../cnHistory';
import { openFin } from '../nav';

export default function CnRiwayat() {
  const { S } = useStore();
  const ev = cnEvents(S.cns);
  return (
    <View style={{ flex: 1, backgroundColor: C.bgLow }}>
      <Header title="Riwayat credit note" />
      <ScrollView contentContainerStyle={{ padding: 16, gap: 12 }}>
        <T v="c1" c={C.textMed}>Credit note tersedia saat ini: <T v="lbl">{rp(S.cns.filter(c => c.st === 'use').reduce((a, c) => a + c.amt, 0))}</T></T>
        <Card style={{ padding: 0 }}>
          {ev.map((e, i) => (
            <Pressable key={e.k} disabled={!e.order && !e.inv} onPress={() => (e.order ? router.push({ pathname: '/order/[id]', params: { id: slugOf(e.order) } }) : e.inv && openFin('inv'))}
              style={{ flexDirection: 'row', alignItems: 'center', gap: 12, paddingHorizontal: 16, paddingVertical: 12, borderTopWidth: i ? 1 : 0, borderTopColor: C.borderLow }}>
              <CircleIcon bg={e.tone === 'off' ? C.bgMed : C.infoBg}><Icon name={e.icon} size={20} color={e.tone === 'off' ? C.textMed : C.info} /></CircleIcon>
              <View style={{ flex: 1, gap: 2 }}><T v="s2" numberOfLines={1}>{e.title}</T><T v="c1" c={C.textMed}>{e.sub}</T></View>
              <T v="s2" c={e.tone === 'in' ? C.ok : e.tone === 'off' ? C.textLow : C.text}>{e.amt > 0 ? '+' : '−'}{rp(Math.abs(e.amt))}</T>
            </Pressable>
          ))}
        </Card>
      </ScrollView>
    </View>
  );
}
