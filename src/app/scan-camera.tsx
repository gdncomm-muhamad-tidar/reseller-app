import React, { useEffect, useRef, useState } from 'react';
import { ActivityIndicator, Animated, Easing, Linking, Platform, Pressable, StyleSheet, View } from 'react-native';
import { useSafeAreaInsets } from 'react-native-safe-area-context';
import { router, useIsFocused } from 'expo-router';
import { StatusBar } from 'expo-status-bar';
import { BarcodeScanningResult, CameraView, useCameraPermissions } from 'expo-camera';
import * as Haptics from 'expo-haptics';
import { C } from '../theme';
import { Btn, Icon, Row, T } from '../ui';
import { useOverlay } from '../ui/overlay';
import { useAnim } from '../ui/useAnim';
import { IMEI_RULES } from '../data';

/*
 * Scan IMEI — camera page (old flow: black viewfinder, corner frame, tips, "Isi manual").
 * Reads the IMEI / MEID / serial-number barcode on the product box, then opens
 * /scan-input with the value. Asks for camera permission on first open.
 */

const FRAME = { w: 280, h: 150 };
const TYPES = ['code128', 'code39', 'code93', 'ean13', 'qr', 'datamatrix'] as const;

export default function ScanCamera() {
  const ins = useSafeAreaInsets();
  const focused = useIsFocused();
  const { toast } = useOverlay();
  const [perm, requestPerm] = useCameraPermissions();
  const [torch, setTorch] = useState(false);
  const [camErr, setCamErr] = useState<string | null>(null);
  const lock = useRef(false);
  const asked = useRef(false);

  // ask once, right away — the OS prompt carries the reason (app.json → cameraPermission)
  useEffect(() => {
    if (perm && !perm.granted && perm.canAskAgain && !asked.current) { asked.current = true; requestPerm(); }
  }, [perm, requestPerm]);
  useEffect(() => { if (focused) lock.current = false; }, [focused]);

  const onScan = ({ data }: BarcodeScanningResult) => {
    if (lock.current) return;
    lock.current = true;
    const code = (data ?? '').replace(/[^0-9A-Za-z]/g, '');
    if (code.length < IMEI_RULES.min || code.length > IMEI_RULES.max) {
      toast('Barcode ini bukan IMEI/No. Seri. Arahkan ke barcode berjudul IMEI atau isi manual.', { tone: 'danger' });
      setTimeout(() => { lock.current = false; }, 2500);
      return;
    }
    Haptics.notificationAsync(Haptics.NotificationFeedbackType.Success).catch(() => {});
    router.push({ pathname: '/scan-input', params: { code, src: 'scan' } });
  };
  const manual = () => router.push({ pathname: '/scan-input', params: { src: 'manual' } });

  const ready = !!perm?.granted && !camErr;
  return (
    <View style={{ flex: 1, backgroundColor: '#000' }}>
      <StatusBar style="light" />
      <View style={{ flex: 1 }}>
        {ready && focused && (
          <CameraView
            style={StyleSheet.absoluteFill}
            facing="back"
            enableTorch={torch}
            barcodeScannerSettings={{ barcodeTypes: [...TYPES] }}
            onBarcodeScanned={onScan}
            onMountError={e => setCamErr(e.message || 'Kamera tidak bisa dibuka')}
          />
        )}

        {/* viewfinder: dim everything outside the frame */}
        <View style={[StyleSheet.absoluteFill, { paddingTop: ins.top }]} pointerEvents="box-none">
          <Row style={{ height: 56, paddingHorizontal: 16, justifyContent: 'space-between' }}>
            <Pressable hitSlop={12} onPress={() => router.back()} accessibilityLabel="Tutup"><Icon name="close" size={24} color="#fff" /></Pressable>
            {ready && Platform.OS !== 'web' && (
              <Pressable onPress={() => setTorch(t => !t)} style={[st.pill, torch && { backgroundColor: '#fff' }]}>
                <T v="lbl" c={torch ? C.text : '#fff'}>Senter {torch ? 'nyala' : 'mati'}</T>
              </Pressable>
            )}
          </Row>
          <View style={{ flex: 1, alignItems: 'center', justifyContent: 'center' }}>
            {perm === null ? (
              <ActivityIndicator color="#fff" />
            ) : ready ? (
              <Viewfinder />
            ) : (
              <NoCamera denied={!perm.granted} canAsk={perm.canAskAgain} err={camErr} onAsk={requestPerm} />
            )}
            {ready && (
              <Row gap={8} style={{ marginTop: 20 }}>
                <Icon name="scanNav" size={18} color="#fff" /><T v="s2" c="#fff">Scan IMEI</T>
              </Row>
            )}
          </View>
        </View>
      </View>

      {/* tips + manual entry */}
      <View style={[st.panel, { paddingBottom: 16 + ins.bottom }]}>
        <T v="c1" c={C.textMed} center>Tips: Scan barcode berjudul IMEI/MEID atau (S) Serial No. Letakkan tepat di tengah agar terbaca jelas.</T>
        <Btn title="Isi manual" kind="sec" full onPress={manual} />
      </View>
    </View>
  );
}

function Viewfinder() {
  const sweep = useAnim(0);
  useEffect(() => {
    const a = Animated.loop(Animated.sequence([
      Animated.timing(sweep, { toValue: 1, duration: 1400, easing: Easing.inOut(Easing.quad), useNativeDriver: true }),
      Animated.timing(sweep, { toValue: 0, duration: 1400, easing: Easing.inOut(Easing.quad), useNativeDriver: true }),
    ]));
    a.start();
    return () => a.stop();
  }, [sweep]);
  const corner = (pos: object, edges: object) => <View style={[st.corner, pos, edges]} />;
  return (
    <View style={{ width: FRAME.w, height: FRAME.h }}>
      {/* the dimmed surround is a huge border around the transparent frame */}
      <View pointerEvents="none" style={st.dim} />
      {corner({ top: 0, left: 0 }, { borderTopWidth: 3, borderLeftWidth: 3, borderTopLeftRadius: 10 })}
      {corner({ top: 0, right: 0 }, { borderTopWidth: 3, borderRightWidth: 3, borderTopRightRadius: 10 })}
      {corner({ bottom: 0, left: 0 }, { borderBottomWidth: 3, borderLeftWidth: 3, borderBottomLeftRadius: 10 })}
      {corner({ bottom: 0, right: 0 }, { borderBottomWidth: 3, borderRightWidth: 3, borderBottomRightRadius: 10 })}
      <Animated.View style={[st.laser, { transform: [{ translateY: sweep.interpolate({ inputRange: [0, 1], outputRange: [12, FRAME.h - 14] }) }] }]} />
    </View>
  );
}

function NoCamera({ denied, canAsk, err, onAsk }: { denied: boolean; canAsk: boolean; err: string | null; onAsk: () => void }) {
  const web = Platform.OS === 'web';
  const title = err ? 'Kamera tidak tersedia' : 'Izinkan akses kamera';
  const body = err
    ? 'Kamera di perangkat ini tidak bisa dibuka. Anda tetap bisa memasukkan IMEI/No. Seri secara manual.'
    : 'Kamera dipakai untuk membaca barcode IMEI/No. Seri di dus produk. Kami tidak menyimpan foto apa pun.';
  return (
    <View style={{ marginHorizontal: 32, padding: 20, borderRadius: 16, backgroundColor: 'rgba(255,255,255,0.08)', alignItems: 'center', gap: 8 }}>
      <View style={{ width: 48, height: 48, borderRadius: 24, backgroundColor: C.infoMed, alignItems: 'center', justifyContent: 'center' }}><Icon name="scanNav" size={24} color="#fff" /></View>
      <T v="s1" c="#fff" center>{title}</T>
      <T v="c1" c="rgba(255,255,255,0.75)" center>{body}</T>
      {!err && denied && (canAsk ? (
        <Btn title="Izinkan kamera" size="sm" onPress={onAsk} style={{ marginTop: 4 }} />
      ) : web ? (
        <T v="c1" c="#fff" center style={{ marginTop: 4 }}>Akses kamera diblokir. Izinkan lewat ikon gembok di address bar, lalu muat ulang halaman.</T>
      ) : (
        <Btn title="Buka Pengaturan" size="sm" onPress={() => Linking.openSettings()} style={{ marginTop: 4 }} />
      ))}
    </View>
  );
}

const st = StyleSheet.create({
  dim: { position: 'absolute', left: -1000, right: -1000, top: -1000, bottom: -1000, borderLeftWidth: 1000, borderRightWidth: 1000, borderTopWidth: 1000, borderBottomWidth: 1000, borderColor: 'rgba(0,0,0,0.55)' },
  corner: { position: 'absolute', width: 28, height: 28, borderColor: '#FFCD00' },
  laser: { position: 'absolute', left: 16, right: 16, height: 2, borderRadius: 1, backgroundColor: '#FFCD00', opacity: 0.85 },
  pill: { height: 32, paddingHorizontal: 12, borderRadius: 16, borderWidth: 1, borderColor: 'rgba(255,255,255,0.6)', alignItems: 'center', justifyContent: 'center' },
  panel: { backgroundColor: C.bg, borderTopLeftRadius: 16, borderTopRightRadius: 16, paddingHorizontal: 16, paddingTop: 16, gap: 12 },
});
