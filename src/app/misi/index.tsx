import React, { useState } from 'react';
import { Animated, Image, Pressable, View } from 'react-native';
import { LinearGradient } from 'expo-linear-gradient';
import { useSafeAreaInsets } from 'react-native-safe-area-context';
import { router } from 'expo-router';
import { C, fmt, rp, short } from '../../theme';
import { Btn, Card, Grow, Icon, Link, Prog, Row, T, Tabs } from '../../ui';
import { FloatingHeader, HEADER_H, ParallaxBg, ParallaxFg, useScrollHeader } from '../../ui/ScrollHeader';
import { glass, Months, NAVY_BG, NavyGlow, TierIcon, Trophy } from '../../ui/parts';
import { useStore } from '../../store';
import { IMG, MissionKey, MISSIONS, QUARTER_BONUS, stagePoin } from '../../data';
import { useGoReco } from '../../nav';

/* Figma mission-card/c: tier icon, level + title, period or "Tercapai" status, progress, CN reward + CTA */
function MissionCard({ k }: { k: MissionKey }) {
  const { S } = useStore();
  const goReco = useGoReco();
  const m = MISSIONS[k], v = S.missions[k], done = v >= m.tg, left = Math.round((m.tg - v) * 10) / 10;
  const cn = S.cns.find(c => c.k === k || c.k === 'm-' + k);
  return (
    <Card onPress={() => router.push({ pathname: '/misi/[id]', params: { id: k } })} style={{ gap: 12, borderWidth: 1, borderColor: C.borderLow }}>
      <Row gap={12}>
        <TierIcon tier={m.lvl} size={40} />
        <Grow style={{ gap: 2 }}><T v="c1" c={C.textMed}>Tier {m.L}</T><T v="s2">{m.t}</T></Grow>
        <Icon name="chev" size={18} color={C.icon} />
      </Row>
      <Row gap={8}>
        {done && (
          <View style={{ height: 14, paddingHorizontal: 4, borderRadius: 4, borderWidth: 1, borderColor: C.okBorder, backgroundColor: C.bg, justifyContent: 'center' }}>
            <T v="c2" c={C.ok}>Selesai</T>
          </View>
        )}
        <T v="c1" c={C.textMed}>{done ? 'Diselesaikan 16 Nov 2026' : '1 – 30 Nov · berakhir dalam 14 hari'}</T>
      </Row>
      <View style={{ gap: 6 }}>
        <Row gap={6} style={{ alignItems: 'baseline' }}>
          <T v="s2">Rp{v}jt</T><T v="c1" c={C.textMed} style={{ flex: 1 }}>dari Rp{m.tg}jt</T>
          {!done && <T v="c1" c={C.warn}>Rp{left}jt lagi{left <= 10 ? '!' : ''}</T>}
        </Row>
        <Prog pct={(v / m.tg) * 100} color={C.infoMed} />
      </View>
      <Row gap={8}>
        <Row gap={6} style={{ flex: 1, paddingVertical: 6, paddingHorizontal: 8, borderWidth: 1, borderColor: C.borderLow, borderRadius: 8 }}>
          <Icon name="voucher" size={16} color={C.info} />
          <T v="c1" style={{ flex: 1 }}>{done ? `Berhasil dapat credit note ${rp(m.reward)}` : `Bisa dapat credit note ${rp(m.reward)}`}</T>
        </Row>
        {done
          ? <Btn title="Pakai credit note" size="sm" disabled={cn?.st === 'used'} onPress={() => goReco()} />
          : <Btn title="Beli produk" size="sm" kind="sec" onPress={() => goReco(`Belanja ${m.cat} dihitung ke ${m.t}`)} />}
      </Row>
    </Card>
  );
}

export default function Missions() {
  const ins = useSafeAreaInsets();
  const { S, cnReady } = useStore();
  const goReco = useGoReco();
  const [tab, setTab] = useState('run');
  const [seenHist, setSeenHist] = useState(false);
  // Figma 5c: every mission of the current month sits under "Berjalan" (achieved ones show their
  // Tercapai state there); "Riwayat" holds achieved missions, flagged with a red dot.
  const keys = (Object.keys(MISSIONS) as MissionKey[]);
  const done = keys.filter(k => S.missions[k] >= MISSIONS[k].tg);
  const potential = keys.filter(k => S.missions[k] < MISSIONS[k].tg).reduce((a, k) => a + MISSIONS[k].reward, 0);
  const stageBonus = keys.reduce((a, k) => a + stagePoin(k, S.missions[k]), 0);
  const h = useScrollHeader();
  const ptsPill = (
    <Pressable onPress={() => router.push('/poin')} style={{ flexDirection: 'row', alignItems: 'center', gap: 4, paddingVertical: 4, paddingHorizontal: 8, borderRadius: 999, backgroundColor: C.info }}>
      <Icon name="pointsLine" size={16} color="#fff" /><T v="lbl" c="#fff">{fmt(S.poin)} poin</T>
    </Pressable>
  );
  return (
    <View style={{ flex: 1, backgroundColor: C.bgLow }}>
      <Animated.ScrollView onScroll={h.onScroll} scrollEventThrottle={16}>
        <View style={{ paddingTop: ins.top + HEADER_H, paddingHorizontal: 16, paddingBottom: 40, overflow: 'hidden' }}>
          <ParallaxBg scrollY={h.scrollY}><LinearGradient colors={NAVY_BG} style={{ flex: 1 }} /><NavyGlow /></ParallaxBg>
          <ParallaxFg scrollY={h.scrollY} threshold={h.threshold}>
          <View style={[glass, { padding: 16, flexDirection: 'row', alignItems: 'center', gap: 12 }]}>
            <View style={{ flex: 1 }}>
              <T v="c1" c="rgba(255,255,255,0.8)">Credit note dari misi · 2026</T>
              <T v="h1" c="#fff" style={{ fontSize: 28, lineHeight: 34, marginVertical: 4 }}>{rp(4200000 + S.cns.filter(c => c.k.startsWith('m-')).reduce((a, c) => a + c.amt, 0))}</T>
              <View style={{ alignSelf: 'flex-start', paddingHorizontal: 8, paddingVertical: 4, borderRadius: 12, backgroundColor: '#ffcd00' }}><T v="c1">{2 + S.missionsDone.length} misi selesai tahun ini</T></View>
            </View>
            <Trophy size={80} />
          </View>
          <Row style={{ marginTop: 12 }}>
            {[[IMG.mission, `${keys.length} misi`, 'berjalan'], [IMG.money, short(potential), 'potensi CN'], [IMG.point, `${fmt(stageBonus)} poin`, 'bonus tahapan']].map(([img, a, b], i) => (
              <View key={i} style={[glass, { flex: 1, alignItems: 'center', paddingVertical: 10, paddingHorizontal: 8, gap: 6, borderRadius: 12 }]}>
                <Image source={img as any} style={{ width: 40, height: 40 }} /><T v="s2" c="#fff">{a as string}</T><T v="c1" c="rgba(255,255,255,0.75)">{b as string}</T>
              </View>
            ))}
          </Row>
          </ParallaxFg>
        </View>
        {/* header turns white once the tabs reach it */}
        <View onLayout={e => h.setThreshold(e.nativeEvent.layout.y - ins.top - HEADER_H)} style={{ marginTop: -16, borderTopLeftRadius: 16, borderTopRightRadius: 16, overflow: 'hidden', backgroundColor: C.bgLow }}>
          <Tabs items={[['run', `Berjalan (${keys.length})`], ['next', 'Akan datang'], ['hist', 'Riwayat', done.length > 0 && !seenHist]]} value={tab} onChange={t => { setTab(t); if (t === 'hist') setSeenHist(true); }} />
          <View style={{ padding: 16, gap: 12, paddingBottom: 32 + ins.bottom }}>
            {tab === 'run' && (<>
              {/* Figma quarter-streak */}
              <Card style={{ gap: 12, borderWidth: 1, borderColor: C.borderLow }}>
                <Row style={{ alignItems: 'flex-start' }}>
                  <Grow style={{ gap: 2 }}><T v="s2">Bonus kuartal 4 2026</T><T v="c1" c={C.textMed}>Capai target misi ini 3 bulan beruntun dan dapatkan bonus credit note {short(QUARTER_BONUS)}.</T></Grow>
                  <Row gap={4} style={{ backgroundColor: '#feedb1', borderRadius: 16, paddingHorizontal: 8, paddingVertical: 4 }}>
                    <Icon name="hotDeals" size={16} color="#BC6E06" /><T v="s2">1</T>
                  </Row>
                </Row>
                <Months nowPct={Math.min(100, Math.round((S.missions.smart / MISSIONS.smart.tg) * 100))} />
              </Card>
              {/* Figma 5e cn-nudge: shown once a new mission is achieved this session */}
              {S.missionsDone.length > 1 && cnReady > 0 && (
                <Row gap={8} style={{ backgroundColor: C.infoLow, borderRadius: 8, paddingHorizontal: 12, paddingVertical: 8 }}>
                  <Icon name="voucher" size={20} color={C.info} />
                  <T v="c1" style={{ flex: 1 }}>Anda punya credit note {rp(cnReady)}. Pakai saat checkout, belanjanya tetap dihitung ke misi.</T>
                  <Link title="Pakai" onPress={() => goReco()} />
                </Row>
              )}
              <T v="s2">Misi bulan ini</T>
              {keys.map(k => <MissionCard key={k} k={k} />)}
              <T v="c1" c={C.textMed} center>Misi baru otomatis diikuti tiap awal bulan sesuai level Anda. Tier ditinjau tiap 3 bulan.</T>
            </>)}
            {tab === 'next' && (
              <Card style={{ gap: 8, borderWidth: 1, borderColor: C.borderLow }}>
                <Row gap={12}><TierIcon tier="gold" size={40} /><Grow style={{ gap: 2 }}><T v="c1" c={C.textMed}>Mulai 1 Des 2026</T><T v="s2">Misi Loyalty Smartphone · Des</T></Grow></Row>
                <T v="c1" c={C.textMed}>Target mengikuti level Anda di awal bulan. Otomatis diikuti, tidak perlu daftar.</T>
              </Card>
            )}
            {tab === 'hist' && (done.length ? done.map(k => <MissionCard key={k} k={k} />) : <T v="c1" c={C.textMed} center>Belum ada misi yang tercapai.</T>)}
          </View>
        </View>
      </Animated.ScrollView>
      <FloatingHeader title="Misi dealer" scrollY={h.scrollY} threshold={h.threshold} solid={h.solid} heroColor={NAVY_BG[0]} right={ptsPill} />
    </View>
  );
}
