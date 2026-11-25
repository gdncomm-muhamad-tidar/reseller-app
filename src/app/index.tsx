import React, { useEffect, useState } from 'react';
import { Animated, Easing, Platform, Pressable, View } from 'react-native';
import { LinearGradient } from 'expo-linear-gradient';
import { StatusBar } from 'expo-status-bar';
import { useSafeAreaInsets } from 'react-native-safe-area-context';
import { router } from 'expo-router';
import * as Notifications from 'expo-notifications';
import { AndroidImportance } from 'expo-notifications';
import { useAnim } from '../ui/useAnim';
import { C } from '../theme';
import { Btn, Icon, Row, T } from '../ui';
import { useStore } from '../store';
import { useOverlay } from '../ui/overlay';

/** Demo start: simulated lock screen with the "misi tercapai" notification,
 *  plus a real local notification sent to this phone. */
export default function LockScreen() {
  const ins = useSafeAreaInsets();
  const { setPopup } = useStore();
  const { toast } = useOverlay();
  const slide = useAnim(0);
  const [sent, setSent] = useState(false);
  const [now] = useState(() => new Date());
  const hh = String(now.getHours()).padStart(2, '0'), mm = String(now.getMinutes()).padStart(2, '0');
  const days = ['Minggu', 'Senin', 'Selasa', 'Rabu', 'Kamis', 'Jumat', 'Sabtu'];
  const months = ['Januari', 'Februari', 'Maret', 'April', 'Mei', 'Juni', 'Juli', 'Agustus', 'September', 'Oktober', 'November', 'Desember'];

  useEffect(() => {
    Animated.timing(slide, { toValue: 1, duration: 520, delay: 600, easing: Easing.out(Easing.back(1.4)), useNativeDriver: true }).start();
  }, [slide]);

  const open = () => { setPopup(true); router.replace('/home'); };

  const sendReal = async () => {
    try {
      if (Platform.OS === 'android') await Notifications.setNotificationChannelAsync('misi', { name: 'Misi & rewards', importance: AndroidImportance.HIGH });
      const cur = await Notifications.getPermissionsAsync();
      let ok = cur.granted;
      if (!ok) ok = (await Notifications.requestPermissionsAsync()).granted;
      if (!ok) { toast('Izin notifikasi ditolak. Ketuk notifikasi di layar ini saja.'); return; }
      await Notifications.scheduleNotificationAsync({
        content: { title: 'Misi Aksesori tercapai! 🎉', body: 'Credit note Rp130.000 sudah masuk dan siap dipakai belanja. Ketuk untuk lihat.', data: { type: 'mission' } },
        trigger: { type: Notifications.SchedulableTriggerInputTypes.TIME_INTERVAL, seconds: 5, ...(Platform.OS === 'android' ? { channelId: 'misi' } : {}) },
      });
      setSent(true);
      toast('Notifikasi dikirim dalam 5 detik. Kunci HP atau keluar dari app dulu.');
    } catch {
      toast('Notifikasi asli tidak tersedia di sini. Ketuk notifikasi di layar ini.');
    }
  };

  return (
    <LinearGradient colors={['#1258c9', '#0a2b64', '#000208']} locations={[0, 0.55, 1]} start={{ x: 0.1, y: 0 }} end={{ x: 0.9, y: 1 }} style={{ flex: 1, paddingTop: ins.top, paddingBottom: ins.bottom + 16 }}>
      <StatusBar style="light" />
      <View style={{ alignItems: 'center', marginTop: 56 }}>
        <T v="c1" c="rgba(255,255,255,0.8)">{days[now.getDay()]}, {now.getDate()} {months[now.getMonth()]}</T>
        <T v="h1" c="#fff" style={{ fontSize: 72, lineHeight: 80 }}>{hh}:{mm}</T>
      </View>

      <Animated.View style={{ marginHorizontal: 12, marginTop: 24, opacity: slide, transform: [{ translateY: slide.interpolate({ inputRange: [0, 1], outputRange: [-120, 0] }) }] }}>
        <Pressable onPress={open} style={({ pressed }) => [{ backgroundColor: 'rgba(255,255,255,0.94)', borderRadius: 20, padding: 14, flexDirection: 'row', gap: 12 }, pressed && { transform: [{ scale: 0.98 }] }]}>
          <View style={{ width: 40, height: 40, borderRadius: 10, backgroundColor: C.info, alignItems: 'center', justifyContent: 'center' }}><Icon name="shield" size={24} color="#fff" /></View>
          <View style={{ flex: 1 }}>
            <Row style={{ justifyContent: 'space-between' }}><T v="c1" c={C.textMed}>Reseller App · sekarang</T></Row>
            <T v="s2" style={{ marginTop: 2 }}>Misi Aksesori tercapai! 🎉</T>
            <T v="c1" c={C.textMed} style={{ marginTop: 2 }}>Credit note Rp130.000 sudah masuk dan siap dipakai belanja. Ketuk untuk lihat.</T>
          </View>
        </Pressable>
        <T v="c1" c="rgba(255,255,255,0.8)" center style={{ marginTop: 16 }}>Ketuk notifikasi untuk membuka aplikasi</T>
      </Animated.View>

      <View style={{ flex: 1 }} />
      <View style={{ paddingHorizontal: 24, gap: 8 }}>
        {Platform.OS !== 'web' && (
          <Btn title={sent ? 'Kirim ulang notifikasi asli' : 'Kirim notifikasi asli ke HP ini'} kind="sec" tc="#fff" onPress={sendReal} style={{ backgroundColor: 'rgba(255,255,255,0.12)', borderColor: 'rgba(255,255,255,0.5)' }} />
        )}
        <Pressable onPress={() => router.replace('/home')} style={{ alignItems: 'center', padding: 10 }}>
          <T v="lbl" c="rgba(255,255,255,0.85)">Lewati, buka Beranda</T>
        </Pressable>
      </View>
    </LinearGradient>
  );
}
