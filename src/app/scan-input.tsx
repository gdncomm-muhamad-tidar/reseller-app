import React, { useState } from 'react';
import { KeyboardAvoidingView, Platform, Pressable, ScrollView, TextInput, View } from 'react-native';
import { useSafeAreaInsets } from 'react-native-safe-area-context';
import { router, useLocalSearchParams } from 'expo-router';
import * as Haptics from 'expo-haptics';
import { C, F } from '../theme';
import { Btn, Chip, Footer, Icon, Row, T } from '../ui';
import { useOverlay } from '../ui/overlay';
import { useStore } from '../store';
import { IMEI_RULES } from '../data';

/*
 * Scan IMEI — "IMEI & No. Seri" page (old flow, hybrid validation):
 *  - prefilled from the camera, or typed via "Isi manual"
 *  - letters & digits only → otherwise "Isi dengan huruf dan angka saja." (Lanjut disabled)
 *  - max 50 chars is enforced while typing; < 10 → "Nomor harus antara 10–50 karakter." on Lanjut
 *  - not in data → "No. IMEI/No. Seri tidak terdaftar." (Lanjut stays enabled)
 *  - already scanned → toast "Produk ini sudah pernah diverifikasi sebelumnya." + Lihat
 *  - otherwise saved to the list on Terverifikasi / Menunggu / Gagal with a toast
 */

const DEMO: [string, string][] = [['IMEI valid', '356789104512345'], ['Gagal verifikasi', '352723092208967'], ['No. Seri', 'R58W30ABCDE'], ['Tidak terdaftar', '8001234567890']];

export default function ScanInput() {
  const ins = useSafeAreaInsets();
  const { code, src } = useLocalSearchParams<{ code?: string; src?: 'scan' | 'manual' }>();
  const { S, submitScan } = useStore();
  const { toast } = useOverlay();
  const [v, setV] = useState(code ?? '');
  const [err, setErr] = useState<string | null>(null);
  const [focus, setFocus] = useState(false);

  const charErr = v && !/^[0-9A-Za-z]+$/.test(v) ? 'Isi dengan huruf dan angka saja.' : null;
  const error = charErr ?? err;
  const canGo = v.length > 0 && !charErr;

  const change = (t: string) => { setV(t.replace(/\s/g, '').slice(0, IMEI_RULES.max)); setErr(null); };
  const lanjut = () => {
    if (v.length < IMEI_RULES.min) { setErr(`Nomor harus antara ${IMEI_RULES.min}–${IMEI_RULES.max} karakter.`); return; }
    const r = submitScan(v);
    if (r.kind === 'dup') {
      const st = S.scans.find(s => s.imei === v.toUpperCase())?.st ?? 'ok';
      toast('Produk ini sudah pernah diverifikasi sebelumnya.', { action: { label: 'Lihat', onPress: () => router.dismissTo({ pathname: '/scan', params: { tab: st, n: String(Date.now()) } }) } });
      return;
    }
    if (r.kind === 'unregistered') { setErr('No. IMEI/No. Seri tidak terdaftar.'); return; }
    router.dismissTo({ pathname: '/scan', params: { tab: r.kind, n: String(Date.now()) } });
    if (r.kind === 'ok') Haptics.notificationAsync(Haptics.NotificationFeedbackType.Success).catch(() => {});
    setTimeout(() => {
      if (r.kind === 'ok') toast('Verifikasi berhasil! Anda bisa klaim cashbacknya.', { tone: 'ok' });
      else if (r.kind === 'fail') toast('Verifikasi gagal, tapi hal ini mungkin berubah di kemudian hari. Silakan cek secara berkala, ya.');
      else toast('No. Seri sedang dicocokkan dengan data pembelian. Status diperbarui otomatis.');
    }, 350);
  };

  return (
    <KeyboardAvoidingView behavior={Platform.OS === 'ios' ? 'padding' : undefined} style={{ flex: 1, backgroundColor: C.bg }}>
      <View style={{ paddingTop: ins.top }}>
        <Row style={{ height: 56, paddingHorizontal: 16 }} gap={16}>
          <Pressable hitSlop={10} onPress={() => router.back()} accessibilityLabel="Tutup"><Icon name="close" size={24} /></Pressable>
          <T v="t2" style={{ flex: 1 }}>IMEI & No. Seri</T>
          {src !== 'scan' && <Pressable hitSlop={8} onPress={() => router.back()}><T v="lbl" c={C.info}>Scan kamera</T></Pressable>}
        </Row>
      </View>

      <ScrollView keyboardShouldPersistTaps="handled" contentContainerStyle={{ padding: 16, gap: 8 }}>
        {src === 'scan' && <T v="c1" c={C.textMed}>Hasil scan. Cek lagi sebelum lanjut, ubah kalau ada yang salah.</T>}
        <View style={{ borderRadius: 8, backgroundColor: C.bgLow, borderWidth: 1, borderColor: error ? C.danger : focus ? C.info : 'transparent', paddingHorizontal: 12, paddingVertical: 8, flexDirection: 'row', alignItems: 'center', gap: 8 }}>
          <View style={{ flex: 1 }}>
            <T v="c2" c={error ? C.danger : C.info}>No. IMEI/No. Seri</T>
            <TextInput value={v} onChangeText={change} onFocus={() => setFocus(true)} onBlur={() => setFocus(false)} autoFocus={src !== 'scan'}
              autoCapitalize="characters" autoCorrect={false} maxLength={IMEI_RULES.max} placeholder="Contoh: 356789104512345" placeholderTextColor={C.textLow}
              returnKeyType="done" onSubmitEditing={() => canGo && lanjut()}
              style={{ fontFamily: F.medium, fontSize: 16, lineHeight: 22, color: C.text, paddingVertical: 2, letterSpacing: 0.5, outlineWidth: 0 }} />
          </View>
          {error ? <Icon name="alert" size={20} color={C.danger} /> : !!v && <Pressable hitSlop={8} onPress={() => change('')} accessibilityLabel="Hapus"><Icon name="close" size={18} color={C.icon} /></Pressable>}
        </View>
        <Row style={{ justifyContent: 'space-between', alignItems: 'flex-start' }}>
          <T v="c1" c={error ? C.danger : C.textMed} style={{ flex: 1 }}>{error ?? 'Isi IMEI 1, IMEI 2, atau No. Seri. Kami cocokkan otomatis.'}</T>
          <T v="c1" c={C.textLow}>{v.length}/{IMEI_RULES.max}</T>
        </Row>

        <View style={{ marginTop: 16, gap: 8 }}>
          <T v="c1" c={C.textLow}>Untuk demo, coba:</T>
          <Row gap={8} style={{ flexWrap: 'wrap' }}>{DEMO.map(([l, c]) => <Chip key={c} label={l} on={v === c} onPress={() => change(c)} />)}</Row>
        </View>
      </ScrollView>

      <Footer><Btn title="Lanjut" full disabled={!canGo} onPress={lanjut} style={{ flex: 1 }} /></Footer>
    </KeyboardAvoidingView>
  );
}
