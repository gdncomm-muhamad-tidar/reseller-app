import React, { useState } from 'react';
import { Animated, Pressable, View } from 'react-native';
import Svg, { Circle } from 'react-native-svg';
import { LinearGradient } from 'expo-linear-gradient';
import { useSafeAreaInsets } from 'react-native-safe-area-context';
import { useLocalSearchParams } from 'expo-router';
import { C, rp } from '../../theme';
import { Art, Btn, Card, Divider, Footer, Grow, Icon, Prog, Row, T } from '../../ui';
import { TierIcon } from '../../ui/parts';
import { FloatingHeader, HEADER_H, ParallaxBg, useScrollHeader } from '../../ui/ScrollHeader';
import { useStore } from '../../store';
import { MISSION_OKT, MissionKey, MISSIONS, QUARTER_BONUS, STAGE_POIN, TierKey, TIERS } from '../../data';
import { useGoReco } from '../../nav';

/* Figma 5d / 5e header: vertical gradient in the tone of the tier's 3D badge
 * (same two stops as the btds_ic_tier_icon gradient, light → dark). */
const HEAD_BG: Record<TierKey, [string, string]> = {
  gold: ['#EBBF4F', '#614500'],
  classic: ['#1258C9', '#000208'],
  platinum: ['#838990', '#0F0F0F'],
  infinite: ['#CBD6EC', '#47506F'],
};
const jt = (n: number) => String(Math.round(n * 10) / 10).replace('.', ',');

/** 🅑 badge, extra-small (h14, caption-2) */
type XsTone = 'green' | 'blue' | 'gray' | 'graySec' | 'greenSec';
const XS: Record<XsTone, [string, string, string]> = {
  green: [C.bg, C.okBorder, C.ok],
  blue: [C.infoLow, '#fff', C.info],
  gray: [C.bg, '#c8cbcd', C.textMed],
  graySec: [C.bgMed, '#fff', C.textMed],
  greenSec: [C.okLow, '#fff', C.ok],
};
function XsBadge({ label, tone }: { label: string; tone: XsTone }) {
  const [bg, bd, fg] = XS[tone];
  return (
    <View style={{ alignSelf: 'flex-start', height: 14, paddingHorizontal: 4, borderRadius: 4, borderWidth: 1, borderColor: bd, backgroundColor: bg, justifyContent: 'center' }}>
      <T v="c2" c={fg}>{label}</T>
    </View>
  );
}


/** Figma "recap": white card, 16px, title subtitle-2 */
function Recap({ title, children }: { title: string; children: React.ReactNode }) {
  return (
    <View style={{ backgroundColor: C.bg, borderRadius: 12, padding: 16, gap: 12 }}>
      <T v="s2">{title}</T>
      {children}
    </View>
  );
}

/** 80px donut (Figma "Subtract" ring) */
function Donut({ pct, color }: { pct: number; color: string }) {
  const r = 32, c = 2 * Math.PI * r;
  return (
    <View style={{ width: 80, height: 80, alignItems: 'center', justifyContent: 'center' }}>
      <Svg width={80} height={80} style={{ position: 'absolute' }}>
        <Circle cx={40} cy={40} r={r} stroke="#f9f9fa" strokeWidth={16} fill="none" />
        <Circle cx={40} cy={40} r={r} stroke={color} strokeWidth={16} fill="none" strokeDasharray={`${(pct / 100) * c} ${c}`} transform="rotate(-90 40 40)" />
      </Svg>
      <T v="s2">{pct}%</T>
    </View>
  );
}

const pctNum = (s: string) => parseFloat(s.replace('%', '').replace(',', '.')) / 100;
/** 120% target bonus (Figma step 4 "Bonus credit note Rp500.000") */
const OVER_BONUS = 500000;

/* Figma 5d "Capaian" tab. Q4 numbers are derived: target/bulan = MISSIONS[k].tg, Okt = MISSION_OKT,
 * Nov = belanja berjalan, Des belum dimulai; insentif = CN % tier × belanja di bulan yang tercapai. */
function CapaianTab({ k, v }: { k: MissionKey; v: number }) {
  const m = MISSIONS[k], tg = m.tg * 1e6, rate = pctNum(m.pct);
  const steps: [number, string, XsTone][] = [...STAGE_POIN.map(([p, pt]) => [p, `Bonus ${pt} poin`, 'green'] as [number, string, XsTone]),
    [100, `Bisa dapat credit note ${rp(m.reward)}`, 'blue'], [120, `Bonus credit note ${rp(OVER_BONUS)}`, 'gray']];
  let curSet = false;
  const tierIdx = TIERS.findIndex(t => t[0] === m.lvl);
  const next = TIERS[tierIdx + 1];
  const months: [string, number | null][] = [['Oktober', MISSION_OKT[k] * 1e6], ['November', v * 1e6], ['Desember', null]];
  const got = months.reduce((a, [, x]) => a + (x ?? 0), 0);
  const filled = months.filter(([, x]) => x !== null).length;
  const inc = months.map(([n, x]) => [n, x !== null && x >= tg ? Math.round(x * rate) : 0] as const);
  return (
    <View style={{ padding: 16, gap: 24 }}>
      <T v="c1" c={C.textMed}>Terakhir diperbarui: 16 Nov 2026, 08.20 WIB</T>
      <View style={{ gap: 12 }}>
        <View style={{ gap: 2 }}><T v="s2">Capaian Anda</T><T v="c1" c={C.textMed}>Penuhi capaian di tiap tingkatan untuk dapat semua bonusnya.</T></View>
        <Card>
          {steps.map(([p, b, tone], i) => {
            const amt = (m.tg * p) / 100, ok = v >= amt;
            let st: 'done' | 'now' | '' = ok ? 'done' : '';
            if (!ok && !curSet) { st = 'now'; curSet = true; }
            return (
              <Row key={p} gap={12} style={{ alignItems: 'stretch' }}>
                <View style={{ alignItems: 'center' }}>
                  <View style={{ width: 24, height: 24, borderRadius: 12, alignItems: 'center', justifyContent: 'center', backgroundColor: st === 'done' ? C.okBrand : st === 'now' ? C.info : C.bgMed }}>
                    {st === 'done' ? <Icon name="check" size={14} color="#fff" /> : <T v="c1" c={st === 'now' ? '#fff' : C.textMed}>{i + 1}</T>}
                  </View>
                  {i < steps.length - 1 && <View style={{ flex: 1, width: 2, backgroundColor: ok ? C.okBrand : C.borderLow }} />}
                </View>
                <View style={{ flex: 1, gap: 8, paddingBottom: i < steps.length - 1 ? 16 : 0 }}>
                  <T v="s2" c={st === '' ? C.textMed : C.text}>{p}% · Rp{jt(amt)}jt</T>
                  <XsBadge label={b} tone={tone} />
                  {st === 'now' && <T v="c1" c={C.warn}>Tambah transaksi Rp{jt(amt - v)}jt lagi</T>}
                </View>
              </Row>
            );
          })}
        </Card>
      </View>

      <View style={{ gap: 12 }}>
        <T v="s2">Tier Anda di misi ini</T>
        <Card style={{ gap: 12 }}>
          <Row gap={4} style={{ alignItems: 'stretch' }}>
            {TIERS.map(([tk, n, req, p]) => {
              const on = tk === m.lvl;
              return (
                <View key={tk} style={[{ flex: 1, alignItems: 'center', gap: 4, paddingVertical: 8, borderRadius: 8 }, on && { backgroundColor: C.infoLow, borderWidth: 1, borderColor: C.infoBorder }]}>
                  <TierIcon tier={tk} size={on ? 40 : 32} />
                  <T v={on ? 's2' : 'c1'} center>{n}</T>
                  <T v="c1" c={C.textMed} center>{req}</T>
                  <T v="c1" c={on ? C.info : C.textMed}>CN {p}</T>
                </View>
              );
            })}
          </Row>
          {next && (
            /* 🅑 banner.general with Ⓐ pi.inspiration */
            <Row gap={8} style={{ padding: 8, borderRadius: 8, borderWidth: 1, borderColor: '#e1e3e4', backgroundColor: C.bgLow, alignItems: 'flex-start' }}>
              <Art name="inspiration" width={18} height={20.69} />
              <T v="c1" c={C.textMed} style={{ flex: 1 }}>Tingkatkan rata-rata transaksi bulanan Anda menjadi {next[2].replace('/bln', '')} untuk naik ke tier {next[1]}.</T>
            </Row>
          )}
        </Card>
      </View>

      <View style={{ gap: 12 }}>
        <T v="s2">Detail capaian Anda</T>
        <Recap title="Progres bulanan">
          {months.map(([n, x], i) => {
            const pct = x === null ? 0 : Math.min(100, Math.round((x / tg) * 100));
            const ok = x !== null && x >= tg;
            return (
              <View key={n} style={{ gap: 8, paddingBottom: 16, borderBottomWidth: 1, borderBottomColor: '#e1e3e4' }}>
                <Row><T v="b2" c={C.textMed} style={{ flex: 1 }}>{n}</T><XsBadge label={ok ? 'Memenuhi target' : x === null ? 'Belum dimulai' : 'Belum memenuhi target'} tone={ok ? 'greenSec' : 'graySec'} /></Row>
                <Row gap={12}>
                  <Donut pct={pct} color={ok ? '#0072ff' : '#1d8fff'} />
                  <Row gap={8} style={{ flex: 1 }}>
                    <View style={{ flex: 1, gap: 4 }}><T v="c1">Tercapai</T><T v={(x ?? 0) >= 1e8 ? 'c1' : 'b2'} c={C.textMed} numberOfLines={1}>{rp(x ?? 0)}</T></View>
                    <View style={{ width: 1, height: 24, backgroundColor: '#e1e3e4' }} />
                    <View style={{ flex: 1, gap: 4 }}><T v="c1">Target</T><T v={tg >= 1e8 ? 'c1' : 'b2'} c={C.textMed} numberOfLines={1}>{rp(tg)}</T></View>
                  </Row>
                </Row>
              </View>
            );
          })}
          <T v="b2" c={C.textMed}>Rata-rata transaksi tiap bulan: {rp(Math.round(got / filled))}</T>
        </Recap>
        <Recap title="Total transaksi 3 bulan (Oktober – Desember)">
          <View style={{ gap: 8 }}>
            <Row gap={4}><T v="b2" c={C.textMed} style={{ flex: 1 }}>Saat ini</T><XsBadge label={got >= 3 * tg ? 'Memenuhi target' : 'Belum memenuhi target'} tone={got >= 3 * tg ? 'greenSec' : 'graySec'} /></Row>
            <Row gap={4}><T v="s1" style={{ flex: 1 }}>{rp(got)}</T><T v="c1" c={C.textMed}>dari {rp(3 * tg)}</T></Row>
            <Row gap={4} style={{ borderRadius: 8, overflow: 'hidden' }}>
              <View style={{ width: `${Math.min(100, (got / (3 * tg)) * 100)}%`, height: 3, borderRadius: 8, backgroundColor: C.info }} />
              <View style={{ flex: 1, height: 3, borderRadius: 8, backgroundColor: C.bgMed }} />
            </Row>
          </View>
        </Recap>
        <Recap title="Insentif (Back margin)">
          <View style={{ gap: 8, paddingBottom: 16, borderBottomWidth: 1, borderBottomColor: '#e1e3e4' }}>
            <T v="b2" c={C.textMed}>Insentif bulanan · CN {m.pct}</T>
            <View style={{ gap: 4 }}>
              {inc.map(([n, x]) => <Row key={n} style={{ justifyContent: 'space-between' }}><T v="b2">{n}</T><T v="s2">{rp(x)}</T></Row>)}
            </View>
          </View>
          <View style={{ gap: 4 }}><T v="b2" c={C.textMed}>Akumulatif 3 bulan insentif</T><T v="s1">{rp(inc.reduce((a, [, x]) => a + x, 0))}</T></View>
        </Recap>
        <Recap title="Bonus">
          {m.streak && <View style={{ gap: 4, paddingBottom: 16, borderBottomWidth: 1, borderBottomColor: '#e1e3e4' }}><T v="b2" c={C.textMed}>Bonus kuartal (target 3 bulan beruntun)</T><T v="s1">{rp(QUARTER_BONUS)}</T></View>}
          <View style={{ gap: 4 }}><T v="b2" c={C.textMed}>Bonus capai 120% target</T><T v="s1">{rp(OVER_BONUS)}</T></View>
        </Recap>
      </View>
    </View>
  );
}

function SnkTab({ k }: { k: MissionKey }) {
  const m = MISSIONS[k];
  const rules = [`Berlaku 1 – 30 Nov 2026 untuk pembelian kategori ${m.cat}.`, 'Dihitung dari pesanan yang sudah dibayar, termasuk yang dibayar pakai credit note.', 'Credit note dikirim otomatis paling lambat 7 hari kerja setelah periode berakhir.', 'Tier di tiap misi akan dievaluasi tiap 3 bulan, dihitung dari rata-rata transaksi Anda.'];
  return (
    <View style={{ padding: 16, gap: 4 }}>
      {rules.map((t, i) => <Row key={i} gap={8} style={{ alignItems: 'flex-start', paddingLeft: 6 }}><T v="b2" c={C.textMed}>•</T><T v="b2" c={C.textMed} style={{ flex: 1 }}>{t}</T></Row>)}
    </View>
  );
}

export default function MissionDetail() {
  const ins = useSafeAreaInsets();
  const { id } = useLocalSearchParams<{ id: MissionKey }>();
  const k = (id && MISSIONS[id] ? id : 'smart') as MissionKey;
  const m = MISSIONS[k];
  const head = HEAD_BG[m.lvl];
  const { S } = useStore();
  const goReco = useGoReco();
  const h = useScrollHeader();
  const [tab, setTab] = useState<'cap' | 'snk'>('cap');
  const v = S.missions[k], done = v >= m.tg, pc = Math.min(100, Math.round((v / m.tg) * 100)), left = Math.round((m.tg - v) * 10) / 10;

  return (
    <View style={{ flex: 1, backgroundColor: C.bgLow }}>
      <Animated.ScrollView onScroll={h.onScroll} scrollEventThrottle={16} contentContainerStyle={{ paddingBottom: 24, flexGrow: 1 }}>
        {/* gradient header (no stroke) — header turns white once scrolled past it */}
        <View onLayout={e => h.setThreshold(e.nativeEvent.layout.height - ins.top - HEADER_H)} style={{ paddingTop: ins.top + HEADER_H, overflow: 'hidden' }}>
          <ParallaxBg scrollY={h.scrollY}><LinearGradient colors={head} style={{ flex: 1 }} /></ParallaxBg>
          <View style={{ padding: 16, paddingBottom: 20 }}>
            <Card style={{ gap: 12, shadowColor: 'rgb(13,38,102)', shadowOpacity: 0.1, shadowRadius: 16, shadowOffset: { width: 0, height: 4 }, elevation: 4 }}>
              <Row gap={12}>
                <TierIcon tier={m.lvl} size={48} />
                <Grow style={{ gap: 4 }}>
                  <Row gap={8}><T v="c1" c={C.textMed}>Tier {m.L}</T><XsBadge label={done ? 'Selesai' : 'Otomatis ikut'} tone="green" /></Row>
                  <T v="s2">{m.t}</T>
                  <T v="c1" c={C.textMed}>{done ? 'Diselesaikan 16 Nov 2026' : '1 – 30 Nov 2026 · berakhir dalam 14 hari'}</T>
                </Grow>
              </Row>
              <Divider />
              <Row gap={8} style={{ alignItems: 'baseline' }}><T v="s1">Rp{jt(v)}jt</T><T v="c1" c={C.textMed} style={{ flex: 1 }}>dari target Rp{m.tg}jt</T><T v="s2" c={done ? C.ok : C.info}>{pc}%</T></Row>
              <Prog pct={pc} color={done ? C.okBrand : C.infoMed} />
              <Row gap={8} style={{ padding: 8, borderRadius: 8, borderWidth: 1, borderColor: C.infoBorder, backgroundColor: C.infoBg, alignItems: 'flex-start' }}>
                <Icon name="info" size={18} color={C.info} />
                <T v="c1" c={C.textMed} style={{ flex: 1 }}>{done ? `Credit note ${rp(m.reward)} sudah masuk dan siap dipakai belanja.` : `Rp${jt(left)}jt lagi untuk dapat credit note ${rp(m.reward)}.`}</T>
              </Row>
            </Card>
          </View>
        </View>
        {/* 🅑 tabs.primary.fixed */}
        <View style={{ flexDirection: 'row', backgroundColor: C.bg, paddingTop: 8, borderBottomWidth: 1, borderBottomColor: '#c8cbcd' }}>
          {([['cap', 'Capaian'], ['snk', 'Syarat & ketentuan']] as const).map(([key, l]) => (
            <Pressable key={key} onPress={() => setTab(key)} style={{ flex: 1, height: 40, alignItems: 'center', justifyContent: 'center' }}>
              <T v="b2" c={tab === key ? C.info : C.textMed}>{l}</T>
              {tab === key && <View style={{ position: 'absolute', left: 0, right: 0, bottom: 0, height: 2, backgroundColor: C.info }} />}
            </Pressable>
          ))}
        </View>
        {tab === 'cap' ? <CapaianTab k={k} v={v} /> : <SnkTab k={k} />}
      </Animated.ScrollView>
      <FloatingHeader title="Detail misi" scrollY={h.scrollY} threshold={h.threshold} solid={h.solid} heroColor={head[0]} />
      <Footer>
        <Grow style={{ gap: 2 }}><T v="c1" c={C.textMed}>{done ? 'Misi selesai' : `Tambah Rp${jt(left)}jt lagi`}</T><T v="s2" c={done ? C.ok : C.text}>Credit note {rp(m.reward)}</T></Grow>
        <Btn title={done ? 'Pakai credit note' : 'Belanja sekarang'} onPress={() => goReco(done ? undefined : `Belanja ${m.cat} dihitung ke ${m.t}`)} />
      </Footer>
    </View>
  );
}
