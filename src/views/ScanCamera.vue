<script setup lang="ts">
/*
 * Scan IMEI — camera page (black viewfinder, corner frame, tips, "Isi manual").
 * Web: getUserMedia + BarcodeDetector. Reads the IMEI / MEID / serial-number barcode on the product box,
 * then opens /scan-input with the value. Without camera / BarcodeDetector support it shows a message
 * with a link to manual input.
 */
import { computed, onActivated, onBeforeUnmount, onMounted, ref } from 'vue';
import { useRouter } from 'vue-router';
import BliButton from '@blibli/blue.button/dist/button/blue/Button';
import BliLink from '@blibli/blue.link/dist/link/blue/Link';
import AppIcon from '@/components/AppIcon.vue';
import { toast } from '@/composables/overlay';
import { IMEI_RULES } from '@/data';

type Detector = { detect: (src: CanvasImageSource) => Promise<{ rawValue: string }[]> };
type DetectorCtor = { new (opts?: { formats?: string[] }): Detector };

const FORMATS = ['code_128', 'code_39', 'code_93', 'ean_13', 'qr_code', 'data_matrix'];
const router = useRouter();
const video = ref<HTMLVideoElement | null>(null);
/** loading → ready | denied (permission) | error (camera cannot open) | unsupported (no camera API / no BarcodeDetector) */
const status = ref<'loading' | 'ready' | 'denied' | 'error' | 'unsupported'>('loading');
const noDetector = ref(false);
let stream: MediaStream | null = null;
let detector: Detector | null = null;
let raf = 0;
let last = 0;
let lock = false;

const stop = () => {
  cancelAnimationFrame(raf);
  stream?.getTracks().forEach(t => t.stop());
  stream = null;
};

const onCode = (raw: string) => {
  if (lock) return;
  lock = true;
  const code = (raw ?? '').replace(/[^0-9A-Za-z]/g, '');
  if (code.length < IMEI_RULES.min || code.length > IMEI_RULES.max) {
    toast('Barcode ini bukan IMEI/No. Seri. Arahkan ke barcode berjudul IMEI atau isi manual.', { tone: 'danger' });
    setTimeout(() => { lock = false; }, 2500);
    return;
  }
  navigator.vibrate?.(10);
  router.push({ path: '/scan-input', query: { src: 'scan', code } });
};

const loop = (t: number) => {
  raf = requestAnimationFrame(loop);
  const el = video.value;
  if (!detector || !el || lock || el.readyState < 2 || t - last < 250) return;
  last = t;
  detector.detect(el).then(r => { if (r[0]) onCode(r[0].rawValue); }).catch(() => { /* frame not ready */ });
};

const start = async () => {
  stop();
  const BD = (window as unknown as { BarcodeDetector?: DetectorCtor }).BarcodeDetector;
  if (!navigator.mediaDevices?.getUserMedia || !BD) { noDetector.value = !!navigator.mediaDevices?.getUserMedia && !BD; status.value = 'unsupported'; return; }
  status.value = 'loading';
  try {
    stream = await navigator.mediaDevices.getUserMedia({ video: { facingMode: { ideal: 'environment' } }, audio: false });
    detector = new BD({ formats: FORMATS });
    status.value = 'ready';
    await Promise.resolve();
    if (video.value) { video.value.srcObject = stream; await video.value.play().catch(() => undefined); }
    lock = false;
    raf = requestAnimationFrame(loop);
  } catch (e) {
    stop();
    status.value = (e as DOMException)?.name === 'NotAllowedError' || (e as DOMException)?.name === 'SecurityError' ? 'denied' : 'error';
  }
};

const ready = computed(() => status.value === 'ready');
const title = computed(() => status.value === 'denied' ? 'Izinkan akses kamera' : status.value === 'unsupported' ? 'Scan kamera belum tersedia' : 'Kamera tidak tersedia');
const body = computed(() => status.value === 'denied'
  ? 'Kamera dipakai untuk membaca barcode IMEI/No. Seri di dus produk. Kami tidak menyimpan foto apa pun. Akses kamera diblokir. Izinkan lewat ikon gembok di address bar, lalu coba lagi.'
  : status.value === 'unsupported'
    ? (noDetector.value ? 'Browser ini belum bisa membaca barcode lewat kamera. Anda tetap bisa memasukkan IMEI/No. Seri secara manual.' : 'Perangkat atau browser ini tidak mendukung akses kamera. Anda tetap bisa memasukkan IMEI/No. Seri secara manual.')
    : 'Kamera di perangkat ini tidak bisa dibuka. Anda tetap bisa memasukkan IMEI/No. Seri secara manual.');

onMounted(start);
onActivated(() => { lock = false; if (!stream && status.value === 'ready') start(); });
onBeforeUnmount(stop);
</script>

<template>
  <div class="screen cam">
    <div class="stage">
      <video v-show="ready" ref="video" class="video" playsinline muted autoplay />

      <div class="over">
        <div class="row bar">
          <button aria-label="Tutup" @click="router.back()"><AppIcon name="close" :size="24" color="#fff" /></button>
        </div>
        <div class="mid">
          <div v-if="status === 'loading'" class="spin" aria-label="Memuat kamera" />
          <div v-else-if="ready" class="frame">
            <span class="corner tl" /><span class="corner tr" /><span class="corner bl" /><span class="corner br" />
            <span class="laser" />
          </div>
          <div v-else class="nocam">
            <span class="nocam__ic"><AppIcon name="scanNav" :size="24" color="#fff" /></span>
            <p class="t-s1 c-inv center">{{ title }}</p>
            <p class="t-c1 nocam__t center">{{ body }}</p>
            <BliButton v-if="status === 'denied'" size="small" style="margin-top: 4px" @click="start">Coba lagi</BliButton>
            <BliLink to="/scan-input?src=manual" color="invert" size="label" style="margin-top: 4px">Isi manual</BliLink>
          </div>
          <div v-if="ready" class="row hint"><AppIcon name="scanNav" :size="18" color="#fff" /><span class="t-s2 c-inv">Scan IMEI</span></div>
        </div>
      </div>
    </div>

    <!-- tips + manual entry -->
    <div class="panel">
      <p class="t-c1 c-med center">Tips: Scan barcode berjudul IMEI/MEID atau (S) Serial No. Letakkan tepat di tengah agar terbaca jelas.</p>
      <BliButton prominence="secondary" full-width @click="router.push('/scan-input?src=manual')">Isi manual</BliButton>
    </div>
  </div>
</template>

<style scoped lang="scss">
$gold: #ffcd00;
.cam { background: #000; }
.stage { position: relative; flex: 1; min-height: 0; overflow: hidden; }
.video { position: absolute; inset: 0; width: 100%; height: 100%; object-fit: cover; }
.over { position: absolute; inset: 0; display: flex; flex-direction: column; padding-top: env(safe-area-inset-top); }
.bar { height: 56px; padding: 0 $blu-spacing-m; justify-content: space-between; flex: none; }
.mid { flex: 1; display: flex; flex-direction: column; align-items: center; justify-content: center; }
.frame { position: relative; width: 280px; height: 150px; box-shadow: 0 0 0 2000px rgba(0, 0, 0, 0.55); }
.corner { position: absolute; width: 28px; height: 28px; border: 0 solid $gold;
  &.tl { top: 0; left: 0; border-top-width: 3px; border-left-width: 3px; border-top-left-radius: 10px; }
  &.tr { top: 0; right: 0; border-top-width: 3px; border-right-width: 3px; border-top-right-radius: 10px; }
  &.bl { bottom: 0; left: 0; border-bottom-width: 3px; border-left-width: 3px; border-bottom-left-radius: 10px; }
  &.br { bottom: 0; right: 0; border-bottom-width: 3px; border-right-width: 3px; border-bottom-right-radius: 10px; } }
.laser { position: absolute; left: 16px; right: 16px; top: 0; height: 2px; border-radius: 1px; background: $gold; opacity: 0.85; animation: sweep 2.8s ease-in-out infinite; }
@keyframes sweep { 0%, 100% { transform: translateY(12px); } 50% { transform: translateY(136px); } }
.hint { margin-top: 20px; gap: 8px; }
.spin { width: 32px; height: 32px; border-radius: 50%; border: 3px solid rgba(255, 255, 255, 0.3); border-top-color: #fff; animation: spin 0.9s linear infinite; }
@keyframes spin { to { transform: rotate(360deg); } }
.nocam { margin: 0 32px; padding: 20px; border-radius: 16px; background: rgba(255, 255, 255, 0.08); display: flex; flex-direction: column; align-items: center; gap: 8px; }
.nocam__ic { width: 48px; height: 48px; border-radius: 24px; background: $blu-color-brand-info-background-default; display: flex; align-items: center; justify-content: center; }
.nocam__t { color: rgba(255, 255, 255, 0.75); }
.panel { flex: none; background: $blu-color-neutral-background-default; border-radius: 16px 16px 0 0; padding: 16px 16px calc(16px + env(safe-area-inset-bottom)); display: flex; flex-direction: column; gap: 12px; }
</style>
