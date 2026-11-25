import type { ScrollViewInstance } from 'react-native';
import React, { useEffect, useRef, useState } from 'react';
import { Pressable, ScrollView, View } from 'react-native';
import { LinearGradient } from 'expo-linear-gradient';
import { useSafeAreaInsets } from 'react-native-safe-area-context';
import { router, useLocalSearchParams } from 'expo-router';
import { C, F, rp, shadow } from '../../theme';
import { Btn, Card, Check, CircleIcon, Divider, Icon, IconName, Link, Prog, Row, T } from '../../ui';
import { Glow, NAV_SPACE } from '../../ui/parts';
import { Performa } from '../../ui/Performa';
import { useOverlay } from '../../ui/overlay';
import { useStore } from '../../store';
import { CN, CREDIT_LIMIT, Inv } from '../../data';
import { useGoReco } from '../../nav';
import { slugOf } from '../../orders';
import { cnEvents } from '../../cnHistory';
import { useWebThemeColor } from '../../ui/useWebChrome';

/*
 * Finansial — Figma 4a Ringkasan · 4b Tagihan · 4c Credit note (header gradient + finansial/tabs).
 */

type Tab = 'ring' | 'inv' | 'cn';

/* 🅑 badge (tertiary / secondary) as used on these screens */
type Tone = 'red' | 'redFill' | 'orange' | 'green' | 'gray' | 'blue';
const TONE: Record<Tone, [string, string, string]> = {
  red: [C.bg, C.dangerBorder, C.danger], redFill: ['#ffe6e6', '#fff', C.danger], orange: [C.bg, '#fed2a5', '#dc5300'],
  green: [C.bg, '#b2efb9', C.ok], gray: [C.bg, '#c8cbcd', C.textMed], blue: [C.bg, C.infoBorder, C.info],
};
function Tag({ label, tone, center }: { label: string; tone: Tone; center?: boolean }) {
  const [bg, bd, fg] = TONE[tone];
  return <View style={{ alignSelf: center ? 'center' : 'flex-start', height: 16, paddingHorizontal: 4, borderRadius: 4, borderWidth: 1, borderColor: bd, backgroundColor: bg, justifyContent: 'center' }}><T v="lbl" c={fg}>{label}</T></View>;
}
function InvTag({ i, center }: { i: Inv; center?: boolean }) {
  if (i.st === 'paid') return <Tag label="Lunas" tone="green" center={center} />;
  if (i.st === 'over') return <Tag label={i.badge?.[1] ?? 'Lewat jatuh tempo'} tone="redFill" center={center} />;
  return i.badge?.[0] === 'red' ? <Tag label={i.badge[1]} tone="red" center={center} /> : <Tag label={i.badge?.[1] ?? 'Menunggu pembayaran'} tone="orange" center={center} />;
}

/* Figma section-header */
const Section = ({ title, link, onLink }: { title: string; link?: string; onLink?: () => void }) => (
  <Row style={{ justifyContent: 'space-between' }}><T v="s1">{title}</T>{link && <Link title={link} onPress={onLink} />}</Row>
);
/* Figma icon-circle (40) with a BLUE system icon */
const SrcIcon = ({ name, bg, color }: { name: IconName; bg: string; color: string }) => (
  <CircleIcon bg={bg}><Icon name={name} size={20} color={color} /></CircleIcon>
);

export default function Finansial() {
  const ins = useSafeAreaInsets();
  useWebThemeColor(C.infoLow);
  const params = useLocalSearchParams<{ tab?: Tab; t?: string }>();
  const [tab, setTab] = useState<Tab>((params.tab as Tab) ?? 'ring');
  const [seenT, setSeenT] = useState(params.t);
  if (params.t !== seenT) { setSeenT(params.t); if (params.tab) setTab(params.tab as Tab); }
  const { S, invoices, unpaid, cnTotal, limitUsed, payInvoices, toggleInvSel } = useStore();
  const { toast } = useOverlay();
  const goReco = useGoReco();
  const scroll = useRef<ScrollViewInstance>(null);
  useEffect(() => { scroll.current?.scrollTo({ y: 0, animated: false }); }, [params.t]);
  const [invF, setInvF] = useState<'all' | 'open' | 'paid'>('all');
  const [cnF, setCnF] = useState<CN['st']>('use');

  const over = unpaid.filter(i => i.st === 'over');
  const sumU = unpaid.reduce((a, x) => a + x.amt, 0), sumO = over.reduce((a, x) => a + x.amt, 0);
  const sel = unpaid.filter(i => S.invSel[i.id] !== false);
  const pay = (ids: string[]) => { payInvoices(ids); router.push('/bayar'); };
  const showBulk = tab === 'inv' && sel.length > 0;
  const next = unpaid.find(i => i.st === 'due') ?? unpaid[0];

  let hero: React.ReactNode, body: React.ReactNode;
  if (tab === 'ring') {
    /* 4a */
    hero = (<>
      <T v="c1" c={C.textMed}>Tagihan belum dibayar</T>
      <T v="h1" style={{ fontSize: 32, lineHeight: 38, marginTop: 12 }}>{rp(next ? next.amt : 0)}</T>
      {next && <Row gap={8} style={{ marginTop: 12 }}><Tag label={next.due.split(' · ')[0]} tone="red" /><T v="c1" c={C.textMed}>1 tagihan · {next.term}</T></Row>}
      <Btn title="Bayar sekarang" full style={{ marginTop: 12 }} disabled={!next} onPress={() => next && pay([next.id])} />
      <Divider style={{ marginVertical: 12 }} />
      <Row><T v="b2" style={{ flex: 1 }}>Limit kredit tersisa</T><T v="s2">{rp(CREDIT_LIMIT - limitUsed)}</T></Row>
      <Prog pct={(limitUsed / CREDIT_LIMIT) * 100} color={C.infoMed} style={{ marginTop: 12, marginBottom: 12 }} /><T v="c1" c={C.textMed}>Terpakai {rp(limitUsed)} dari {rp(CREDIT_LIMIT)}</T>
    </>);
    const hist = cnEvents(S.cns).slice(0, 3);
    body = (<>
      <View style={{ paddingHorizontal: 16, gap: 12 }}>
        <Section title="Tagihan terbaru" link="Lihat semua" onLink={() => setTab('inv')} />
        <Card style={{ padding: 0 }}>
          {invoices.filter(x => x.st !== 'over').slice(0, 3).map((x, i) => (
            <Pressable key={x.id} onPress={() => (x.st === 'paid' ? toast('Tagihan ini sudah lunas') : pay([x.id]))} style={{ flexDirection: 'row', alignItems: 'center', gap: 12, paddingHorizontal: 16, paddingVertical: 12, borderTopWidth: i ? 1 : 0, borderTopColor: C.borderLow }}>
              <View style={{ flex: 1, gap: 2 }}><T v="s2">{x.id}</T><T v="c1" c={C.textMed}>{rp(x.amt)} · {x.term}</T></View>
              <InvTag i={x} center /><Icon name="chev" size={16} color={C.icon} />
            </Pressable>
          ))}
        </Card>
      </View>
      <View style={{ paddingHorizontal: 16 }}>
        <Performa title={<T v="s1">Ringkasan belanja November</T>} />
      </View>
      <View style={{ paddingHorizontal: 16, gap: 12 }}>
        <Section title="Riwayat credit note" link="Lihat semua" onLink={() => router.push('/cn-riwayat')} />
        <Card style={{ padding: 0 }}>
          {hist.map((e, i) => (
            <Pressable key={e.k} disabled={!e.order && !e.inv} onPress={() => (e.order ? router.push({ pathname: '/order/[id]', params: { id: slugOf(e.order) } }) : e.inv && setTab('inv'))}
              style={{ flexDirection: 'row', alignItems: 'center', gap: 12, paddingHorizontal: 16, paddingVertical: 12, borderTopWidth: i ? 1 : 0, borderTopColor: C.borderLow }}>
              <SrcIcon name={e.icon} bg={e.tone === 'off' ? C.bgMed : C.infoBg} color={e.tone === 'off' ? C.textMed : C.info} />
              <View style={{ flex: 1, gap: 2 }}><T v="s2" numberOfLines={1}>{e.title}</T><T v="c1" c={C.textMed}>{e.sub}</T></View>
              <T v="s2" c={e.tone === 'in' ? C.ok : e.tone === 'off' ? C.textLow : C.text}>{e.amt > 0 ? '+' : '−'}{rp(Math.abs(e.amt))}</T>
            </Pressable>
          ))}
        </Card>
      </View>
    </>);
  } else if (tab === 'inv') {
    /* 4b */
    hero = (
      <Row style={{ alignItems: 'flex-start' }} gap={16}>
        <View style={{ flex: 1, gap: 2 }}><T v="c1" c={C.textMed}>Belum dibayar</T><T v="s1">{rp(sumU)}</T><T v="c1" c={C.textMed}>{unpaid.length} tagihan</T></View>
        <View style={{ flex: 1, gap: 2 }}><T v="c1" c={C.textMed}>Lewat jatuh tempo</T><T v="s1" c={sumO ? C.danger : C.text}>{rp(sumO)}</T><T v="c1" c={C.textMed}>{over.length ? `${over.length} tagihan · terkena denda` : 'Tidak ada'}</T></View>
      </Row>
    );
    const list = invoices.filter(x => invF === 'all' || (invF === 'paid' ? x.st === 'paid' : x.st !== 'paid'));
    const chip = (k: typeof invF, l: string) => (
      <Pressable key={k} onPress={() => setInvF(k)} style={{ height: 24, paddingHorizontal: 4, borderRadius: 8, justifyContent: 'center', backgroundColor: invF === k ? C.infoMed : C.bgMed }}>
        <T v="b2" c={invF === k ? '#fff' : C.info}>{l}</T>
      </Pressable>
    );
    body = (
      <View style={{ paddingHorizontal: 16, gap: 12 }}>
        <Row gap={8}>{chip('all', `Semua (${invoices.length})`)}{chip('open', `Belum dibayar (${unpaid.length})`)}{chip('paid', `Lunas (${invoices.length - unpaid.length})`)}</Row>
        {over.length > 0 && (
          /* 🅑 banner.warning — extra small */
          <Row gap={8} style={{ padding: 8, borderRadius: 8, borderWidth: 1, borderColor: '#fedd6c', backgroundColor: '#fff8e0', alignItems: 'flex-start' }}>
            <Icon name="alertFill" size={16} color="#bc6e06" />
            <T v="c1" c={C.textMed} style={{ flex: 1 }}>{over.length} tagihan jatuh tempo. Segera lakukan pembayaran agar pesanan berikutnya tidak tertahan & denda tidak bertambah.</T>
          </Row>
        )}
        {list.map(x => {
          const on = x.st !== 'paid' && S.invSel[x.id] !== false;
          return (
            <Card key={x.id} style={{ gap: 12, borderWidth: x.st === 'over' || x.fresh ? (x.fresh ? 2 : 1) : 0, borderColor: x.fresh ? C.info : C.dangerBorder }}>
              <Row gap={12} style={{ alignItems: 'flex-start' }}>
                {x.st !== 'paid' && <Pressable hitSlop={8} onPress={() => toggleInvSel(x.id)}><Check on={on} /></Pressable>}
                <View style={{ flex: 1, gap: 2 }}><T v="s2">{x.id}</T><T v="lbl" c={C.info}>Pesanan {x.rfq}</T></View>
                <InvTag i={x} />
              </Row>
              <T v="c1" c={C.textMed}>{x.due}</T>
              <Divider />
              <Row gap={8}>
                <View style={{ flex: 1, gap: 2 }}><T v="c1" c={C.textMed}>Total tagihan</T><T v="s1" c={x.st === 'over' ? C.danger : C.text}>{rp(x.amt)}</T></View>
                {x.st === 'paid' ? <Btn title="Bukti bayar" size="sm" kind="ter" onPress={() => toast('Bukti bayar diunduh')} />
                  : <><Btn title="Unduh PDF" size="sm" kind="ter" onPress={() => toast('Tagihan PDF diunduh')} /><Btn title="Bayar" size="sm" onPress={() => pay([x.id])} /></>}
              </Row>
            </Card>
          );
        })}
      </View>
    );
  } else {
    /* 4c / 4d — Credit note: tersedia · terpakai · hangus */
    const SRC: Record<CN['icon'], IconName> = { scan: 'scan', medal: 'gift', receipt: 'receipt', trophy0: 'mission' };
    const n = (st: CN['st']) => S.cns.filter(c => c.st === st).length;
    hero = (<>
      <Row gap={8}><Icon name="cashIn" size={20} color={C.info} /><T v="c1" c={C.textMed} style={{ flex: 1 }}>Credit note Anda</T><Link title="Riwayat" onPress={() => router.push('/cn-riwayat')} /></Row>
      <T v="h1" style={{ fontSize: 24, lineHeight: 28, marginTop: 12 }} numberOfLines={1}>{rp(cnTotal)}</T>
      <Row gap={12} style={{ marginTop: 12 }}>
        <Btn title="Pakai belanja" size="sm" kind="sec" style={{ flex: 1 }} onPress={() => goReco()} />
        <Btn title="Bayar tagihan" size="sm" kind="sec" style={{ flex: 1 }} onPress={() => setTab('inv')} />
      </Row>
    </>);
    const chip = (k: CN['st'], l: string) => (
      <Pressable key={k} onPress={() => setCnF(k)} style={{ height: 24, paddingHorizontal: 4, borderRadius: 8, justifyContent: 'center', backgroundColor: cnF === k ? C.infoMed : C.bgMed }}>
        <T v="b2" c={cnF === k ? '#fff' : C.info}>{l}</T>
      </Pressable>
    );
    const list = S.cns.filter(c => c.st === cnF);
    body = (
      <View style={{ paddingHorizontal: 16, gap: 12 }}>
        <Row gap={8}>{chip('use', `Tersedia (${n('use')})`)}{chip('used', `Terpakai (${n('used')})`)}{chip('expired', `Hangus (${n('expired')})`)}</Row>
        {list.map(c => {
          const off = c.st === 'expired';
          const fg = off ? C.textLow : C.text;
          return (
            <Row key={c.k} gap={0} style={{ alignItems: 'stretch' }}>
              {/* creditnote.list */}
              <View style={{ flex: 1, gap: 8, paddingHorizontal: 12, paddingVertical: 16, borderRadius: 8, borderWidth: 1, borderRightWidth: 0, borderColor: C.borderLow, backgroundColor: off ? C.bgMed : C.bg }}>
                <View style={{ gap: 2 }}>
                  <Row gap={6}><Icon name={SRC[c.icon]} size={16} color={off ? C.textLow : C.info} /><T v="t2" c={fg} style={{ fontSize: 18, lineHeight: 24 }}>{rp(c.amt)}</T></Row>
                  <T v="c1" c={fg} numberOfLines={1}>{c.t}</T>
                  <T v="c1" c={off ? C.textLow : C.textMed}>{c.c} • {c.st === 'use' ? `berlaku hingga ${c.exp}` : c.st === 'used' ? c.usedAt : `Kedaluwarsa ${c.exp}`}</T>
                </View>
                {c.st === 'used' && c.usedBy && (
                  <Row gap={8}>
                    {c.usedFor === 'inv'
                      ? <View style={{ height: 16, paddingHorizontal: 4, borderRadius: 4, backgroundColor: '#fddef0', justifyContent: 'center' }}><T v="lbl" c="#ff0f9d">Tagihan</T></View>
                      : <View style={{ height: 16, paddingHorizontal: 4, borderRadius: 4, backgroundColor: C.infoLow, justifyContent: 'center' }}><T v="lbl" c={C.info}>Pesanan</T></View>}
                    <Link title={c.usedBy.replace('#', '')} style={{ fontFamily: F.medium }} onPress={() => (c.usedFor === 'inv' ? setTab('inv') : router.push({ pathname: '/order/[id]', params: { id: slugOf(c.usedBy!) } }))} />
                  </Row>
                )}
              </View>
              {/* action */}
              <View style={{ padding: 12, justifyContent: 'center', borderRadius: 8, borderWidth: 1, borderColor: C.borderLow, backgroundColor: C.bg }}>
                {c.st === 'use'
                  ? <Btn title="Pakai" size="sm" kind="sec" onPress={() => goReco()} />
                  : <Pressable onPress={() => toast(`${c.c} diunduh`)} style={{ width: 36, height: 36, borderRadius: 18, borderWidth: 1, borderColor: C.infoMed, alignItems: 'center', justifyContent: 'center' }}><Icon name="download" size={18} color={C.info} /></Pressable>}
              </View>
            </Row>
          );
        })}
        {!list.length && <T v="c1" c={C.textMed} center style={{ marginTop: 24 }}>Belum ada credit note di sini.</T>}
      </View>
    );
  }

  return (
    <View style={{ flex: 1, backgroundColor: C.bgLow }}>
      <ScrollView ref={scroll} contentContainerStyle={{ paddingBottom: (showBulk ? 180 : NAV_SPACE) + ins.bottom, gap: 24 }}>
        {/* Figma header (gradient) — same as Beranda */}
        <LinearGradient colors={[C.infoLow, C.infoBg, C.bgLow]} locations={[0, 0.6, 1]} style={{ paddingTop: ins.top + 8, paddingBottom: 8, overflow: 'hidden', gap: 16 }}>
          <Glow color="#0072FF" cx={20} cy={20} rx={110} ry={90} opacity={0.2} />
          <Glow color="#1D8FFF" cx={50} cy={10} rx={120} ry={100} opacity={0.5} right />
          <Row style={{ paddingHorizontal: 16 }} gap={12}><T v="t1" style={{ flex: 1 }}>Finansial</T>
          </Row>
          <View style={{ paddingHorizontal: 16 }}>
            <View style={{ flexDirection: 'row', backgroundColor: C.bg, borderRadius: 12, overflow: 'hidden' }}>
              {([['ring', 'Ringkasan'], ['inv', 'Tagihan'], ['cn', 'Credit note']] as [Tab, string][]).map(([k, l]) => (
                <Pressable key={k} onPress={() => setTab(k)} style={{ flex: 1, height: 40, alignItems: 'center', justifyContent: 'center' }}>
                  <T v="b2" c={tab === k ? C.info : C.textMed}>{l}</T>
                  {tab === k && <View style={{ position: 'absolute', left: 8, right: 8, bottom: 0, height: 2, borderRadius: 2, backgroundColor: C.info }} />}
                </Pressable>
              ))}
            </View>
          </View>
          <View style={{ paddingHorizontal: 16 }}>
            <View style={{ borderRadius: 16, backgroundColor: C.bg, padding: 16 }}>{hero}</View>
          </View>
        </LinearGradient>
        {body}
      </ScrollView>
      {showBulk && (
        <View style={[{ position: 'absolute', left: 0, right: 0, bottom: 0, backgroundColor: C.bg, paddingHorizontal: 16, paddingTop: 12, paddingBottom: NAV_SPACE - 12 + ins.bottom, flexDirection: 'row', alignItems: 'center', gap: 16 }, shadow.med]}>
          <View style={{ flex: 1, gap: 2 }}><T v="c1" c={C.textMed}>{sel.length} invoice</T><T v="s1">{rp(sel.reduce((a, x) => a + x.amt, 0))}</T></View>
          <Btn title="Bayar sekaligus" size="sm" onPress={() => pay(sel.map(x => x.id))} />
        </View>
      )}
    </View>
  );
}
