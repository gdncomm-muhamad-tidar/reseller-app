import React from 'react';
import { Pressable, ScrollView, View } from 'react-native';
import { LinearGradient } from 'expo-linear-gradient';
import { StatusBar } from 'expo-status-bar';
import { useSafeAreaInsets } from 'react-native-safe-area-context';
import { router } from 'expo-router';
import { C, fmt, rp, shadow, short } from '../theme';
import { Art, Badge, Btn, Card, Chip, Grow, Icon, IconBtn, Link, Prog, Row, T } from '../ui';
import { Medal, NAVY_BG, NavyGlow } from '../ui/parts';
import { useWebThemeColor } from '../ui/useWebChrome';
import { useOverlay } from '../ui/overlay';
import { ModalBody, ModalHeader } from '../ui/Modal';
import { useStore } from '../store';
import { MissionKey, MISSIONS, TIERS } from '../data';
import { goTab } from '../nav';

function TierSheet({ close }: { close: () => void }) {
  return (
    <View>
      <ModalHeader title="Benefit tiap tier" onClose={close} />
      <ModalBody style={{ gap: 8, paddingBottom: 16 }}>
      <T v="c1" c={C.textMed}>Tier ditinjau tiap 3 bulan dari rata-rata belanja. Tier bisa naik atau turun.</T>
      {TIERS.map(([k, n, req, pct, extra]) => (
        <Row key={k} gap={12} style={{ padding: 12, borderRadius: 12, borderWidth: 1, borderColor: k === 'gold' ? C.info : C.border, backgroundColor: k === 'gold' ? C.infoBg : C.bg }}>
          <Medal tier={k} size={40} />
          <Grow>
            <Row><T v="s2" style={{ flex: 1 }}>{n}</T>{k === 'gold' && <Badge label="Tier Anda" t="blue" />}</Row>
            <T v="c1" c={C.textMed}>Rata-rata {req}</T>
            <T v="c1" style={{ marginTop: 4 }}>Credit note misi {pct}{extra ? ' · ' + extra : ''}</T>
          </Grow>
        </Row>
      ))}
      </ModalBody>
    </View>
  );
}

export default function Rewards() {
  const ins = useSafeAreaInsets();
  useWebThemeColor(NAVY_BG[0]);
  const { S } = useStore();
  const { openSheet, closeSheet } = useOverlay();
  const keys = Object.keys(MISSIONS) as MissionKey[];
  const running = keys.filter(k => S.missions[k] < MISSIONS[k].tg);
  const potential = running.reduce((a, k) => a + MISSIONS[k].reward, 0);
  const nodes: [string, number][] = [['Classic', 0], ['Gold', 33.3], ['Platinum', 66.6], ['Infinite Pro', 100]];
  return (
    <View style={{ flex: 1, backgroundColor: C.bgLow }}>
      <StatusBar style="light" />
      <ScrollView contentContainerStyle={{ paddingBottom: 32 + ins.bottom }}>
        <LinearGradient colors={NAVY_BG} style={{ paddingTop: ins.top, paddingHorizontal: 16, paddingBottom: 100, overflow: 'hidden' }}>
          <NavyGlow />
          <Row style={{ height: 56 }} gap={16}><IconBtn name="back" color="#fff" onPress={() => router.back()} /><T v="t2" c="#fff" style={{ flex: 1 }}>Misi & Rewards</T></Row>
          <Row gap={12} style={{ marginTop: 4 }}>
            <Medal tier="gold" size={56} ring />
            <Grow><T v="c1" c="rgba(255,255,255,0.8)">Tier Anda</T><T v="h1" c="#fff" style={{ fontSize: 28, lineHeight: 34 }}>Gold</T></Grow>
            <Pressable onPress={() => openSheet(<TierSheet close={() => closeSheet()} />)} style={{ height: 28, paddingHorizontal: 12, borderRadius: 14, backgroundColor: 'rgba(255,255,255,0.18)', borderWidth: 1, borderColor: 'rgba(255,255,255,0.3)', justifyContent: 'center' }}>
              <T v="lbl" c="#fff">Benefit tier</T>
            </Pressable>
          </Row>
          <View style={{ height: 48, marginTop: 20, marginHorizontal: 6 }}>
            <View style={{ position: 'absolute', left: 0, right: 0, top: 10, height: 4, borderRadius: 2, backgroundColor: 'rgba(255,255,255,0.3)' }} />
            <View style={{ position: 'absolute', left: 0, width: '33.3%', top: 10, height: 4, borderRadius: 2, backgroundColor: C.gold }} />
            {nodes.map(([n, x], i) => {
              const now = n === 'Gold';
              return (
                <View key={n} style={{ position: 'absolute', left: `${x}%`, top: now ? 2 : 6, alignItems: i === 0 ? 'flex-start' : i === 3 ? 'flex-end' : 'center', width: 90, marginLeft: i === 0 ? -6 : i === 3 ? -84 : -45 }}>
                  <View style={{ width: now ? 20 : 12, height: now ? 20 : 12, borderRadius: 10, backgroundColor: now ? C.gold : '#fff', borderWidth: now ? 3 : 2, borderColor: now ? '#fff' : 'rgba(255,255,255,0.6)' }} />
                  <T v={now ? 's2' : 'c1'} c={now ? '#fff' : 'rgba(255,255,255,0.85)'} style={{ marginTop: now ? 6 : 10 }}>{n}</T>
                </View>
              );
            })}
          </View>
          <T v="c1" c="rgba(255,255,255,0.85)" style={{ marginTop: 8 }}>Rata-rata belanja 3 bulan terakhir Rp320jt/bulan. Rp180jt lagi per bulan untuk naik ke Platinum.</T>
        </LinearGradient>

        <Card style={[{ marginTop: -84, marginHorizontal: 16, gap: 12 }, shadow.med]}>
          <Row style={{ alignItems: 'stretch' }} gap={16}>
            <Grow style={{ gap: 4 }}><Row gap={6}><Art name="badge-gold" width={18} /><T v="c1" c={C.textMed}>Poin</T></Row><T v="h1">{fmt(S.poin)}</T><T v="c1" c={C.warn}>2.000 poin hangus 31 Des</T></Grow>
            <View style={{ width: 1, backgroundColor: C.borderLow }} />
            <Grow style={{ gap: 4 }}><T v="c1" c={C.textMed}>Hadiah misi bulan ini</T><T v="h1">{short(potential)}</T><T v="c1" c={C.textMed}>Potensi credit note dari {running.length} misi berjalan</T></Grow>
          </Row>
          <Row><Btn title="Tukar poin" size="sm" kind="sec" style={{ flex: 1 }} onPress={() => router.push('/poin')} /><Btn title="Scan IMEI" size="sm" style={{ flex: 1 }} onPress={() => goTab('/scan')} /></Row>
        </Card>

        <View style={{ padding: 16, gap: 12 }}>
          <Row style={{ borderWidth: 1, borderColor: C.borderLow, borderRadius: 12, backgroundColor: C.bg, paddingHorizontal: 4 }} gap={0}>
            <View style={{ flex: 1, height: 44, alignItems: 'center', justifyContent: 'center' }}><T v="s2" c={C.info}>Misi</T><View style={{ position: 'absolute', left: 16, right: 16, bottom: 0, height: 2, backgroundColor: C.info, borderRadius: 2 }} /></View>
            <Pressable onPress={() => router.push('/poin')} style={{ flex: 1, height: 44, alignItems: 'center', justifyContent: 'center' }}><T v="b2" c={C.textMed}>Poin</T></Pressable>
          </Row>
          <Row><Chip label={`Aktif (${running.length})`} on /><Chip label="Akan datang" /><Chip label={`Selesai (${3 + S.missionsDone.length})`} /></Row>
          {keys.map(k => {
            const m = MISSIONS[k], v = S.missions[k], done = v >= m.tg;
            return (
              <Card key={k} onPress={() => router.push({ pathname: '/misi/[id]', params: { id: k } })} style={{ gap: 10, borderWidth: 1, borderColor: C.borderLow }}>
                <Row gap={12}><Medal tier={m.lvl} size={40} /><Grow><T v="s1">{m.t}</T><T v="c1" c={C.textMed}>Level {m.L} · {done ? 'tercapai' : 'sisa 14 hari'}</T></Grow><Icon name="chev" size={16} color={C.icon} /></Row>
                <Prog pct={(v / m.tg) * 100} color={done ? C.okBrand : C.info} />
                <Row><T v="c1" style={{ flex: 1 }}>Rp{v}jt dari Rp{m.tg}jt</T>{done ? <Badge label="Tercapai" t="green" fill /> : <Badge label={`Rp${Math.round((m.tg - v) * 10) / 10}jt lagi`} t="yellow" />}</Row>
                <Row gap={6}><Icon name="voucher" size={16} color={C.ok} /><T v="c1" c={C.ok}>Credit note {rp(m.reward)}{done ? ' · sudah masuk' : ''}</T></Row>
              </Card>
            );
          })}
          <View style={{ alignItems: 'center', paddingVertical: 8 }}><Link title="Lihat semua misi" onPress={() => router.push('/misi')} /></View>
        </View>
      </ScrollView>
    </View>
  );
}
