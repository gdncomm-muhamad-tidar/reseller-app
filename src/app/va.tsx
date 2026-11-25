import React, { useEffect, useState } from 'react';
import { Animated, Easing, Image, Pressable, ScrollView, View } from 'react-native';
import Svg, { Circle, Defs, RadialGradient, Stop } from 'react-native-svg';
import * as Clipboard from 'expo-clipboard';
import { router } from 'expo-router';
import { C, rp, short } from '../theme';
import { Btn, Card, Divider, Footer, Header, Icon, Row, T } from '../ui';
import { useAnim } from '../ui/useAnim';
import { hapticSuccess } from '../ui/haptics';
import { ModalBody, ModalFooter, ModalHeader } from '../ui/Modal';
import { BankLogo } from '../ui/parts';
import { useOverlay } from '../ui/overlay';
import { useStore } from '../store';
import { goTab, openFin } from '../nav';
import { IMG, orderCN } from '../data';

const STEPS: Record<string, string[]> = {
  BCA: ['Buka BCA mobile, pilih m-BCA, lalu masukkan kode akses.', 'Pilih m-Transfer → BCA Virtual Account.', 'Masukkan nomor VA 8077 0812 3456 7890.', 'Cek nama toko dan total bayar, lalu pilih OK.', 'Masukkan PIN m-BCA. Selesai.'],
};
const generic = (b: string) => [`Buka aplikasi mobile banking ${b}.`, 'Pilih Transfer → Virtual Account.', 'Masukkan nomor VA di atas.', 'Cek nama toko dan total bayar.', 'Konfirmasi dengan PIN. Selesai.'];

/** 🅑 badge (secondary, medium) with a 12px leading icon */
const SheetBadge = ({ icon, label, bg, fg }: { icon: React.ReactNode; label: string; bg: string; fg: string }) => (
  <Row gap={2} style={{ height: 16, paddingHorizontal: 4, borderRadius: 4, backgroundColor: bg }}>{icon}<T v="lbl" c={fg}>{label}</T></Row>
);

/** Figma 332:50 medallion 180×150: green radial glow (200) + ring (112) + check (80).
 *  Glow & ring breathe (shrink ↔ grow) while the sheet is open; no confetti. */
function PaidMedallion() {
  const b = useAnim(0);
  useEffect(() => {
    const loop = Animated.loop(Animated.sequence([
      Animated.timing(b, { toValue: 1, duration: 900, easing: Easing.inOut(Easing.quad), useNativeDriver: true }),
      Animated.timing(b, { toValue: 0, duration: 900, easing: Easing.inOut(Easing.quad), useNativeDriver: true }),
    ]));
    loop.start();
    return () => loop.stop();
  }, [b]);
  const scale = b.interpolate({ inputRange: [0, 1], outputRange: [1, 0.86] });
  return (
    <View style={{ width: 180, height: 150 }}>
      <Animated.View style={{ position: 'absolute', left: -10, top: -25, width: 200, height: 200, transform: [{ scale }] }}>
        <Svg width={200} height={200}>
          <Defs><RadialGradient id="paidglow" cx="50%" cy="50%" r="50%"><Stop offset={0} stopColor="#40CC73" stopOpacity={0.35} /><Stop offset={1} stopColor="#40CC73" stopOpacity={0} /></RadialGradient></Defs>
          <Circle cx={100} cy={100} r={100} fill="url(#paidglow)" />
        </Svg>
      </Animated.View>
      <Animated.View style={{ position: 'absolute', left: 34, top: 19, width: 112, height: 112, borderRadius: 56, backgroundColor: '#D6F7DA', transform: [{ scale: b.interpolate({ inputRange: [0, 1], outputRange: [1, 0.92] }) }] }} />
      <View style={{ position: 'absolute', left: 50, top: 35, width: 80, height: 80, alignItems: 'center', justifyContent: 'center' }}>
        <Image source={IMG.trophyCheck} style={{ width: 70, height: 70 }} />
      </View>
    </View>
  );
}

function PaidSheet({ amt, refText, rfq, pts, cn, isOrder, close }: { amt: number; refText: string; rfq?: string; pts: number; cn: number; isOrder: boolean; close: (then?: () => void) => void }) {
  return (
    <View>
      <ModalHeader onClose={() => close()} />
      <ModalBody style={{ alignItems: 'center', gap: 12 }}>
        <PaidMedallion />
        <T v="t1" center>Pembayaran berhasil</T>
        <T v="c1" c={C.textMed} center>{isOrder ? `Pesanan ${rfq} akan segera diproses.` : `${rp(amt)} untuk ${refText} sudah masuk. Limit kredit Anda kembali bertambah.`}</T>
        <Row gap={8} style={{ flexWrap: 'wrap', justifyContent: 'center' }}>
          <SheetBadge icon={<Icon name="pointsLine" size={12} color={C.info} />} label={`+${pts.toLocaleString('id-ID')} poin`} bg={C.infoLow} fg={C.info} />
          {isOrder && cn > 0 && <SheetBadge icon={<Icon name="cashIn" size={12} color={C.ok} />} label={`+${short(cn)} credit note`} bg={C.okLow} fg={C.ok} />}
        </Row>
      </ModalBody>
      <ModalFooter>
        <Btn title={isOrder ? 'Lihat pesanan' : 'Lihat invoice'} full onPress={() => close(() => (isOrder ? goTab('/pesanan') : openFin('inv')))} />
        <Btn title="Kembali ke Beranda" kind="ter" full onPress={() => close(() => goTab('/home'))} />
      </ModalFooter>
    </View>
  );
}

export default function VA() {
  const { S, completePayment } = useStore();
  const orders = S.orders;
  const { toast, openSheet, closeSheet } = useOverlay();
  const [sec, setSec] = useState(39 * 3600 + 39 * 60 + 59); // now 16 Nov 08.20 → batas 17 Nov 23.59
  const [checking, setChecking] = useState(false);
  const [open, setOpen] = useState(0);
  useEffect(() => { const t = setInterval(() => setSec(s => Math.max(0, s - 1)), 1000); return () => clearInterval(t); }, []);
  const ctx = S.payCtx;
  if (!ctx) return <View style={{ flex: 1 }}><Header title="Virtual Account" /></View>;
  const num = '8077 0812 3456 7890';
  const pad = (n: number) => String(n).padStart(2, '0');
  const copy = async (v: string, label: string) => { try { await Clipboard.setStringAsync(v); } catch {} toast(`${label} disalin`); };
  const isOrder = orders.some(o => ctx.ids.includes(o.inv));
  const check = () => {
    setChecking(true);
    setTimeout(() => {
      setChecking(false);
      const r = completePayment();
      hapticSuccess(); // pembayaran berhasil · +poin / +credit note
      openSheet(<PaidSheet amt={ctx.amt} refText={ctx.ref} pts={r.pts} rfq={orders.filter(o => ctx.ids.includes(o.inv)).map(o => o.id).join(', ')} cn={orderCN(orders.filter(o => ctx.ids.includes(o.inv)).flatMap(o => o.items))} isOrder={isOrder} close={closeSheet} />);
    }, 1400);
  };
  const steps = STEPS[S.va] ?? generic(S.va);
  return (
    <View style={{ flex: 1, backgroundColor: C.bgLow }}>
      <Header title={`${S.va} Virtual Account`} />
      <ScrollView contentContainerStyle={{ padding: 16, gap: 16 }}>
        <Card style={{ alignItems: 'center', gap: 12 }}>
          <View style={{ height: 16, paddingHorizontal: 4, borderRadius: 4, backgroundColor: '#fde2c2', justifyContent: 'center' }}><T v="lbl" c="#dc5300">Menunggu pembayaran</T></View>
          <T v="c1" c={C.textMed}>Selesaikan pembayaran dalam</T>
          <Row gap={6}>
            {[Math.floor(sec / 3600), Math.floor((sec % 3600) / 60), sec % 60].map((n, i) => (
              <React.Fragment key={i}>
                {i > 0 && <T v="s1" c={C.textMed}>:</T>}
                <View style={{ paddingHorizontal: 8, paddingVertical: 6, borderRadius: 6, backgroundColor: C.infoLow, alignItems: 'center' }}><T v="s1" c={C.info}>{pad(n)}</T></View>
              </React.Fragment>
            ))}
          </Row>
          <T v="lbl" c={C.textMed}>Lakukan sebelum 17 Nov 2026, 23.59 WIB</T>
          {/* 🅑 stepper (horizontal, small): 1 Bayar (active) — 2 Diproses */}
          <Row gap={8} style={{ width: 240, paddingHorizontal: 16 }}>
            <View style={{ width: 18, height: 18, borderRadius: 9, backgroundColor: C.info, alignItems: 'center', justifyContent: 'center' }}><T v="lbl" c="#fff">1</T></View>
            <T v="s2">Bayar</T>
            <View style={{ flex: 1, height: 2, borderRadius: 1, backgroundColor: '#e1e3e4' }} />
            <View style={{ width: 18, height: 18, borderRadius: 9, backgroundColor: '#e1e3e4', alignItems: 'center', justifyContent: 'center' }}><T v="lbl" c="rgba(25,34,42,0.3)">2</T></View>
            <T v="s2" c="rgba(25,34,42,0.3)">Diproses</T>
          </Row>
        </Card>
        <Card style={{ gap: 12 }}>
          <Row><BankLogo b={S.va} /><T v="s2">{S.va} Virtual Account</T></Row>
          <Divider />
          <View><T v="c1" c={C.textMed}>Nomor virtual account</T><Row><T v="s1" style={{ flex: 1 }}>{num}</T><Pressable onPress={() => copy(num.replace(/ /g, ''), 'Nomor VA')}><Row gap={4}><Icon name="copy" size={16} color={C.info} /><T v="lbl" c={C.info}>Salin</T></Row></Pressable></Row></View>
          <View><T v="c1" c={C.textMed}>Total bayar</T><Row><T v="s2" style={{ flex: 1 }}>{rp(ctx.amt)}</T><Pressable onPress={() => copy(String(ctx.amt), 'Total bayar')}><Row gap={4}><Icon name="copy" size={16} color={C.info} /><T v="lbl" c={C.info}>Salin</T></Row></Pressable></Row></View>
          {/* 🅑 banner.info */}
          <Row gap={8} style={{ padding: 8, borderRadius: 8, borderWidth: 1, borderColor: C.infoBorder, backgroundColor: C.infoBg, alignItems: 'flex-start' }}>
            <Icon name="info" size={18} color={C.info} /><T v="c1" c={C.textMed} style={{ flex: 1 }}>Transfer sesuai total bayar. Status otomatis diperbarui 1–5 menit setelah transfer, tanpa perlu upload bukti.</T>
          </Row>
        </Card>
        <Card style={{ paddingVertical: 4 }}>
          {[`m-${S.va === 'BCA' ? 'BCA (BCA mobile)' : 'Banking ' + S.va}`, S.va === 'BCA' ? 'KlikBCA (internet banking)' : `Internet banking ${S.va}`, `ATM ${S.va}`].map((t, i) => (
            <View key={t} style={{ paddingVertical: 14, borderBottomWidth: i < 2 ? 1 : 0, borderBottomColor: C.borderLow }}>
              <Pressable onPress={() => setOpen(open === i ? -1 : i)}><Row><T v={open === i ? 's2' : 'c1'} style={{ flex: 1 }}>{t}</T><View style={{ transform: [{ rotate: open === i ? '180deg' : '0deg' }] }}><Icon name="chevD" size={open === i ? 24 : 20} color={C.text} /></View></Row></Pressable>
              {open === i && (
                <View style={{ gap: 10, marginTop: 12 }}>
                  {(i === 0 ? steps : i === 1 ? ['Login internet banking.', 'Pilih Transfer Dana → Virtual Account.', 'Masukkan nomor VA, lalu konfirmasi.'] : ['Masukkan kartu & PIN.', 'Pilih Transaksi Lainnya → Transfer → Virtual Account.', 'Masukkan nomor VA, lalu konfirmasi.']).map((s, j) => (
                    <Row key={j} gap={10} style={{ alignItems: 'flex-start' }}>
                      <View style={{ width: 20, height: 20, borderRadius: 10, backgroundColor: C.infoLow, alignItems: 'center', justifyContent: 'center' }}><T v="c1" c={C.info}>{j + 1}</T></View>
                      <T v="c1" style={{ flex: 1 }}>{s}</T>
                    </Row>
                  ))}
                </View>
              )}
            </View>
          ))}
        </Card>
      </ScrollView>
      <Footer>
        <Btn title="Ganti metode" kind="sec" style={{ flex: 1 }} onPress={() => router.back()} />
        <Btn title={checking ? 'Mengecek…' : 'Cek status'} disabled={checking} style={{ flex: 1 }} onPress={check} />
      </Footer>
    </View>
  );
}
