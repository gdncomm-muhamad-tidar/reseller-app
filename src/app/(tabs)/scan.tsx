import React, { useMemo, useState } from 'react';
import { Image, Pressable, ScrollView, TextInput, View } from 'react-native';
import { useSafeAreaInsets } from 'react-native-safe-area-context';
import { router, useLocalSearchParams } from 'expo-router';
import { C, F, fmt, rp } from '../../theme';
import { Art, Btn, Card, Divider, Grow, Icon, Row, T, Tabs } from '../../ui';
import { NAV_SPACE } from '../../ui/parts';
import { IMG, PRODUCTS } from '../../data';
import { Scan, ScanSt, useStore } from '../../store';

/*
 * Scan IMEI — list page (old flow "IMEI Scan process", rebuilt in the new UI):
 * summary + status bar, Terverifikasi / Menunggu / Gagal tabs, search, empty state.
 * "Scan IMEI" opens the camera (/scan-camera); results come back here on the right tab.
 */

const TABS: [ScanSt, string][] = [['ok', 'Terverifikasi'], ['pending', 'Menunggu'], ['fail', 'Gagal']];
const DOT: Record<ScanSt, string> = { ok: C.okBrand, pending: C.tosca, fail: C.warnHigh };

export default function ScanList() {
  const ins = useSafeAreaInsets();
  const { S } = useStore();
  const params = useLocalSearchParams<{ tab?: ScanSt; n?: string }>();
  // a result coming back from /scan-input (new `n`) picks the tab; a tap afterwards overrides it
  const [sel, setSel] = useState<{ tab: ScanSt; n?: string }>({ tab: params.tab ?? 'ok', n: params.n });
  const tab = params.tab && params.n !== sel.n ? params.tab : sel.tab;
  const setTab = (t: ScanSt) => setSel({ tab: t, n: params.n });
  const [q, setQ] = useState('');

  const count = (st: ScanSt) => S.scans.filter(s => s.st === st).length;
  const total = S.scans.length;
  const ok = S.scans.filter(s => s.st === 'ok');
  const cashback = ok.reduce((a, s) => a + s.cashback, 0);
  const poin = ok.reduce((a, s) => a + s.pts, 0);
  const list = useMemo(() => {
    const k = q.trim().toLowerCase();
    return S.scans.filter(s => s.st === tab && (!k || s.product.toLowerCase().includes(k) || s.imei.toLowerCase().includes(k)));
  }, [S.scans, tab, q]);
  const openCamera = () => router.push('/scan-camera');

  return (
    <ScrollView keyboardShouldPersistTaps="handled" contentContainerStyle={{ paddingTop: ins.top + 8, paddingBottom: NAV_SPACE + ins.bottom, gap: 16 }}>
      <Row style={{ paddingHorizontal: 16 }}>
        <T v="t1" style={{ flex: 1 }}>Scan IMEI</T>
        <Pressable onPress={() => router.push('/poin')} style={{ flexDirection: 'row', alignItems: 'center', gap: 6, height: 32, paddingHorizontal: 12, borderRadius: 16, backgroundColor: C.bg, borderWidth: 1, borderColor: C.borderLow }}>
          <Art name="badge-gold" width={16} /><T v="lbl">{fmt(S.poin)} poin</T>
        </Pressable>
      </Row>

      {/* summary */}
      <Card style={{ marginHorizontal: 16, gap: 12 }}>
        <Row gap={12}>
          <Grow><T v="c1" c={C.textMed}>Total IMEI di-scan</T><T v="t1">{fmt(total)}</T></Grow>
          <Btn title="Scan IMEI" size="sm" icon={<Icon name="scanNav" size={18} color="#fff" />} onPress={openCamera} />
        </Row>
        <View style={{ flexDirection: 'row', height: 6, borderRadius: 3, overflow: 'hidden', backgroundColor: C.bgMed, gap: total ? 2 : 0 }}>
          {total > 0 && TABS.map(([st]) => count(st) > 0 && <View key={st} style={{ flex: count(st), backgroundColor: DOT[st] }} />)}
        </View>
        <Row gap={12}>
          {TABS.map(([st, l]) => (
            <Row key={st} gap={4}><View style={{ width: 8, height: 8, borderRadius: 4, backgroundColor: DOT[st] }} /><T v="c1" c={C.textMed}>{count(st)} {l.toLowerCase()}</T></Row>
          ))}
        </Row>
        <Divider />
        <Row gap={12}>
          <Row gap={8} style={{ flex: 1 }}>
            <Icon name="cashIn" size={20} color={C.info} />
            <Grow><T v="c1" c={C.textMed}>Cashback terverifikasi</T><T v="s2">{rp(cashback)}</T></Grow>
          </Row>
          <View style={{ width: 1, alignSelf: 'stretch', backgroundColor: C.borderLow }} />
          <Row gap={8} style={{ flex: 1 }}>
            <Art name="badge-gold" width={18} />
            <Grow><T v="c1" c={C.textMed}>Poin dari scan</T><T v="s2">+{fmt(poin)}</T></Grow>
          </Row>
        </Row>
      </Card>

      {/* list */}
      <View>
        <Tabs items={TABS.map(([st, l]) => [st, `${l} (${count(st)})`])} value={tab} onChange={k => setTab(k as ScanSt)} />
        <View style={{ padding: 16, gap: 12 }}>
          <Row style={{ height: 40, borderRadius: 8, backgroundColor: C.bg, borderWidth: 1, borderColor: C.borderLow, paddingHorizontal: 12 }}>
            <Icon name="search" size={18} color={C.icon} />
            <TextInput value={q} onChangeText={setQ} placeholder="Cari produk atau IMEI" placeholderTextColor={C.textLow} autoCapitalize="none"
              style={{ flex: 1, fontFamily: F.medium, fontSize: 14, color: C.text, paddingVertical: 0, outlineWidth: 0 }} />
            {!!q && <Pressable hitSlop={8} onPress={() => setQ('')}><Icon name="close" size={16} color={C.icon} /></Pressable>}
          </Row>

          {list.length === 0 ? (
            q ? (
              <T v="c1" c={C.textMed} center style={{ paddingVertical: 24 }}>Tidak ada hasil untuk “{q}”.</T>
            ) : (
              <Card style={{ alignItems: 'center', gap: 8, paddingVertical: 24 }}>
                <View style={{ width: 64, height: 64 }}>
                  <Image source={IMG.routinePayments} style={{ position: 'absolute', left: 0.4, top: 3, width: 63.7, height: 63.7 }} />
                  <Image source={IMG.warning} style={{ position: 'absolute', left: 32.4, top: 32, width: 29.3, height: 29.3 }} />
                </View>
                <T v="s2">Belum ada data</T>
                <T v="c1" c={C.textMed} center>Yuk, scan IMEI produk terjual untuk klaim cashback.</T>
                <Btn title="Scan IMEI" size="sm" icon={<Icon name="scanNav" size={18} color="#fff" />} onPress={openCamera} style={{ marginTop: 4 }} />
              </Card>
            )
          ) : (
            <Card style={{ paddingVertical: 4 }}>
              {list.map((s, i) => <ScanRow key={s.imei} s={s} first={i === 0} />)}
            </Card>
          )}
        </View>
      </View>
    </ScrollView>
  );
}

function ScanRow({ s, first }: { s: Scan; first: boolean }) {
  const p = s.productId ? PRODUCTS[s.productId] : null;
  return (
    <Row gap={12} style={{ paddingVertical: 12, borderTopWidth: first ? 0 : 1, borderTopColor: C.borderLow, alignItems: 'flex-start' }}>
      <View style={{ width: 48, height: 48, borderRadius: 8, overflow: 'hidden', backgroundColor: C.bgLow, alignItems: 'center', justifyContent: 'center' }}>
        {p ? <Image source={p.img} style={{ width: 44, height: 44 }} resizeMode="contain" /> : <Image source={IMG.device} style={{ width: 32, height: 32 }} />}
        {s.st === 'fail' && <Image source={IMG.warning} style={{ position: 'absolute', right: 2, bottom: 2, width: 18, height: 18 }} />}
      </View>
      <Grow style={{ gap: 2 }}>
        <T v="s2" numberOfLines={1}>{s.product}</T>
        <T v="c1" c={C.textMed}>{s.imei}</T>
        {s.st === 'ok' && <T v="c1" c={C.ok}>{[s.cashback ? `+${rp(s.cashback)} cashback` : '', `+${fmt(s.pts)} poin`].filter(Boolean).join(' · ')}</T>}
        {s.st === 'pending' && <T v="c1" c={C.textMed}>Mencocokkan No. Seri dengan data pembelian…</T>}
        {s.st === 'fail' && <T v="c1" c={C.danger}>{s.reason}</T>}
      </Grow>
    </Row>
  );
}
