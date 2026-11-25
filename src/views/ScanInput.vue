<script setup lang="ts">
/*
 * Scan IMEI — "IMEI & No. Seri" page (old flow, hybrid validation):
 *  - prefilled from the camera, or typed via "Isi manual"
 *  - letters & digits only → otherwise "Isi dengan huruf dan angka saja." (Lanjut disabled)
 *  - max 50 chars is enforced while typing; < 10 → "Nomor harus antara 10–50 karakter." on Lanjut
 *  - not in data → "No. IMEI/No. Seri tidak terdaftar." (Lanjut stays enabled)
 *  - already scanned → toast "Produk ini sudah pernah diverifikasi sebelumnya." + Lihat
 *  - otherwise saved to the list on Terverifikasi / Menunggu / Gagal with a toast
 */
import { computed, onMounted, ref } from 'vue';
import { useRoute, useRouter } from 'vue-router';
import BliButton from '@blibli/blue.button/dist/button/blue/Button';
import BliChip from '@blibli/blue.chips/dist/chips/blue/Chip';
import BliField from '@blibli/blue.field/dist/field/blue/Field';
import BliTextField from '@blibli/blue.text-field/dist/text-field/blue/TextField';
import AppFooter from '@/components/AppFooter.vue';
import AppIcon from '@/components/AppIcon.vue';
import { toast } from '@/composables/overlay';
import { useStore } from '@/store';
import { IMEI_RULES } from '@/data';

const DEMO: [string, string][] = [['IMEI valid', '356789104512345'], ['Gagal verifikasi', '352723092208967'], ['No. Seri', 'R58W30ABCDE'], ['Tidak terdaftar', '8001234567890']];

const route = useRoute();
const router = useRouter();
const { S, submitScan } = useStore();
const q = (k: string) => { const x = route.query[k]; return typeof x === 'string' ? x : Array.isArray(x) ? (x[0] ?? undefined) : undefined; };
const src = q('src');
const v = ref(q('code') ?? '');
const err = ref<string | null>(null);
const root = ref<HTMLElement | null>(null);

const charErr = computed(() => (v.value && !/^[0-9A-Za-z]+$/.test(v.value) ? 'Isi dengan huruf dan angka saja.' : null));
const error = computed(() => charErr.value ?? err.value);
const canGo = computed(() => v.value.length > 0 && !charErr.value);

const change = (t: string) => { v.value = String(t ?? '').replace(/\s/g, '').slice(0, IMEI_RULES.max); err.value = null; };
const toScan = (tab: string) => router.replace({ path: '/scan', query: { tab, n: String(Date.now()) } });
const lanjut = () => {
  if (v.value.length < IMEI_RULES.min) { err.value = `Nomor harus antara ${IMEI_RULES.min}–${IMEI_RULES.max} karakter.`; return; }
  const r = submitScan(v.value);
  if (r.kind === 'dup') {
    const st = S.scans.find(s => s.imei === v.value.toUpperCase())?.st ?? 'ok';
    toast('Produk ini sudah pernah diverifikasi sebelumnya.', { action: { label: 'Lihat', onPress: () => toScan(st) } });
    return;
  }
  if (r.kind === 'unregistered') { err.value = 'No. IMEI/No. Seri tidak terdaftar.'; return; }
  toScan(r.kind);
  if (r.kind === 'ok') navigator.vibrate?.(10);
  setTimeout(() => {
    if (r.kind === 'ok') toast('Verifikasi berhasil! Anda bisa klaim cashbacknya.', { tone: 'ok' });
    else if (r.kind === 'fail') toast('Verifikasi gagal, tapi hal ini mungkin berubah di kemudian hari. Silakan cek secara berkala, ya.');
    else toast('No. Seri sedang dicocokkan dengan data pembelian. Status diperbarui otomatis.');
  }, 350);
};

onMounted(() => { if (src !== 'scan') root.value?.querySelector('input')?.focus(); });
</script>

<template>
  <div class="screen bg">
    <header class="row bar">
      <button aria-label="Tutup" @click="router.back()"><AppIcon name="close" :size="24" color="var(--blu-color-neutral-icon-high)" /></button>
      <span class="t-t2 grow">IMEI &amp; No. Seri</span>
      <button v-if="src !== 'scan'" class="t-lbl c-info" @click="router.back()">Scan kamera</button>
    </header>

    <div ref="root" class="screen__scroll no-scrollbar body">
      <p v-if="src === 'scan'" class="t-c1 c-med">Hasil scan. Cek lagi sebelum lanjut, ubah kalau ada yang salah.</p>
      <BliField label="No. IMEI/No. Seri" :error="!!error" :counter="true" @keydown.enter="canGo && lanjut()">
        <BliTextField :model-value="v" :max-length="IMEI_RULES.max" placeholder="Contoh: 356789104512345" @update:model-value="change" />
        <template #help-text>{{ error ?? 'Isi IMEI 1, IMEI 2, atau No. Seri. Kami cocokkan otomatis.' }}</template>
      </BliField>

      <div class="demo">
        <p class="t-c1 c-low">Untuk demo, coba:</p>
        <div class="row" style="flex-wrap: wrap; gap: 8px">
          <BliChip v-for="[l, c] in DEMO" :key="c" :value="c" :active="v === c" @select-chip="change(c)">{{ l }}</BliChip>
        </div>
      </div>
    </div>

    <AppFooter><BliButton full-width :disabled="!canGo" @click="lanjut">Lanjut</BliButton></AppFooter>
  </div>
</template>

<style scoped lang="scss">
.bg { background: $blu-color-neutral-background-default; }
.bar { height: 56px; padding: env(safe-area-inset-top) $blu-spacing-m 0; box-sizing: content-box; gap: 16px; flex: none; }
.body { padding: $blu-spacing-m; display: flex; flex-direction: column; gap: 8px; }
.demo { margin-top: 16px; display: flex; flex-direction: column; gap: 8px; }
</style>
