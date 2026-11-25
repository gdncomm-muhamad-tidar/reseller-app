<script setup lang="ts">
import { computed, onBeforeUnmount, ref } from 'vue';
import { useRouter } from 'vue-router';
import BliButton from '@blibli/blue.button/dist/button/blue/Button';
import BliBadge from '@blibli/blue.badge/dist/badge/blue/Badge';
import BliBanner from '@blibli/blue.banner/dist/banner/blue/Banner';
import AppHeader from '@/components/AppHeader.vue';
import AppFooter from '@/components/AppFooter.vue';
import AppIcon from '@/components/AppIcon.vue';
import BankLogo from '@/components/BankLogo.vue';
import VaPaidSheet from './sheets/VaPaidSheet.vue';
import { rp } from '@/theme';
import { orderCN } from '@/data';
import { useStore } from '@/store';
import { toast, openSheet } from '@/composables/overlay';

const STEPS: Record<string, string[]> = {
  BCA: ['Buka BCA mobile, pilih m-BCA, lalu masukkan kode akses.', 'Pilih m-Transfer → BCA Virtual Account.', 'Masukkan nomor VA 8077 0812 3456 7890.', 'Cek nama toko dan total bayar, lalu pilih OK.', 'Masukkan PIN m-BCA. Selesai.'],
};
const generic = (b: string) => [`Buka aplikasi mobile banking ${b}.`, 'Pilih Transfer → Virtual Account.', 'Masukkan nomor VA di atas.', 'Cek nama toko dan total bayar.', 'Konfirmasi dengan PIN. Selesai.'];

const router = useRouter();
const { S, completePayment } = useStore();
const sec = ref(39 * 3600 + 39 * 60 + 59); // now 16 Nov 08.20 → batas 17 Nov 23.59
const checking = ref(false);
const open = ref(0);
const timer = setInterval(() => { sec.value = Math.max(0, sec.value - 1); }, 1000);
onBeforeUnmount(() => clearInterval(timer));

const ctx = computed(() => S.payCtx);
const num = '8077 0812 3456 7890';
const pad = (n: number) => String(n).padStart(2, '0');
const parts = computed(() => [Math.floor(sec.value / 3600), Math.floor((sec.value % 3600) / 60), sec.value % 60]);
const copy = async (v: string, label: string) => {
  try { await navigator.clipboard.writeText(v); } catch { /* clipboard unavailable */ }
  toast(`${label} disalin`);
};
const steps = computed(() => STEPS[S.va] ?? generic(S.va));
const sections = computed(() => [
  { t: `m-${S.va === 'BCA' ? 'BCA (BCA mobile)' : 'Banking ' + S.va}`, s: steps.value },
  { t: S.va === 'BCA' ? 'KlikBCA (internet banking)' : `Internet banking ${S.va}`, s: ['Login internet banking.', 'Pilih Transfer Dana → Virtual Account.', 'Masukkan nomor VA, lalu konfirmasi.'] },
  { t: `ATM ${S.va}`, s: ['Masukkan kartu & PIN.', 'Pilih Transaksi Lainnya → Transfer → Virtual Account.', 'Masukkan nomor VA, lalu konfirmasi.'] },
]);

const check = () => {
  const c = ctx.value;
  if (!c) return;
  checking.value = true;
  setTimeout(() => {
    checking.value = false;
    const isOrder = S.orders.some(o => c.ids.includes(o.inv));
    const mine = S.orders.filter(o => c.ids.includes(o.inv));
    const r = completePayment();
    navigator.vibrate?.(10); // pembayaran berhasil · +poin / +credit note
    openSheet(VaPaidSheet, { amt: c.amt, refText: c.ref, pts: r.pts, rfq: mine.map(o => o.id).join(', '), cn: orderCN(mine.flatMap(o => o.items)), isOrder });
  }, 1400);
};
</script>

<template>
  <div class="screen">
    <AppHeader :title="`${S.va} Virtual Account`" />
    <template v-if="ctx">
      <div class="screen__scroll va__scroll">
        <div class="card va__timer">
          <BliBadge color="yellow" prominence="secondary" size="extra-small">Menunggu pembayaran</BliBadge>
          <span class="t-c1 c-med">Selesaikan pembayaran dalam</span>
          <div class="row va__clock">
            <template v-for="(n, i) in parts" :key="i">
              <span v-if="i > 0" class="t-s1 c-med">:</span>
              <span class="va__cell t-s1 c-info">{{ pad(n) }}</span>
            </template>
          </div>
          <span class="t-lbl c-med">Lakukan sebelum 17 Nov 2026, 23.59 WIB</span>
          <!-- stepper (horizontal, small): 1 Bayar (active) — 2 Diproses -->
          <div class="va__stepper">
            <span class="va__dot va__dot--on t-lbl">1</span>
            <span class="t-s2">Bayar</span>
            <span class="va__line" />
            <span class="va__dot t-lbl">2</span>
            <span class="t-s2 va__off">Diproses</span>
          </div>
        </div>

        <div class="card va__acc">
          <div class="row"><BankLogo :b="S.va" /><span class="t-s2">{{ S.va }} Virtual Account</span></div>
          <div class="divider" />
          <div>
            <div class="t-c1 c-med">Nomor virtual account</div>
            <div class="row">
              <span class="t-s1 grow">{{ num }}</span>
              <button class="row va__copy" @click="copy(num.replace(/ /g, ''), 'Nomor VA')"><AppIcon name="copy" :size="16" color="var(--blu-color-info-text-default)" /><span class="t-lbl c-info">Salin</span></button>
            </div>
          </div>
          <div>
            <div class="t-c1 c-med">Total bayar</div>
            <div class="row">
              <span class="t-s2 grow">{{ rp(ctx.amt) }}</span>
              <button class="row va__copy" @click="copy(String(ctx.amt), 'Total bayar')"><AppIcon name="copy" :size="16" color="var(--blu-color-info-text-default)" /><span class="t-lbl c-info">Salin</span></button>
            </div>
          </div>
          <BliBanner status="info" full-width size="small"><span class="t-c1">Transfer sesuai total bayar. Status otomatis diperbarui 1–5 menit setelah transfer, tanpa perlu upload bukti.</span></BliBanner>
        </div>

        <div class="card va__how">
          <div v-for="(sec2, i) in sections" :key="sec2.t" class="va__sec" :class="{ 'va__sec--last': i === 2 }">
            <button class="row va__head" @click="open = open === i ? -1 : i">
              <span class="grow" :class="open === i ? 't-s2' : 't-c1'">{{ sec2.t }}</span>
              <span class="va__chev" :class="{ 'va__chev--up': open === i }"><AppIcon name="chevD" :size="open === i ? 24 : 20" color="var(--blu-color-neutral-text-high)" /></span>
            </button>
            <div v-if="open === i" class="va__steps">
              <div v-for="(s, j) in sec2.s" :key="j" class="va__step">
                <span class="va__n t-c1 c-info">{{ j + 1 }}</span>
                <span class="t-c1 grow">{{ s }}</span>
              </div>
            </div>
          </div>
        </div>
      </div>
      <AppFooter>
        <BliButton class="grow" prominence="secondary" @click="router.back()">Ganti metode</BliButton>
        <BliButton class="grow" :disabled="checking" @click="check">{{ checking ? 'Mengecek…' : 'Cek status' }}</BliButton>
      </AppFooter>
    </template>
  </div>
</template>

<style scoped lang="scss">
.va__scroll { padding: $blu-spacing-m; display: flex; flex-direction: column; gap: $blu-spacing-m; }
.va__timer { display: flex; flex-direction: column; align-items: center; gap: $blu-spacing-ms; }
.va__clock { gap: 6px; }
.va__cell { padding: 6px $blu-spacing-s; border-radius: 6px; background: $blu-color-info-background-low; min-width: 36px; text-align: center; }
.va__stepper { display: flex; align-items: center; gap: $blu-spacing-s; width: 240px; padding: 0 $blu-spacing-m; }
.va__dot { width: 18px; height: 18px; border-radius: 50%; display: flex; align-items: center; justify-content: center; flex: none; background: $blu-color-neutral-background-disabled; color: rgba(25, 34, 42, 0.3);
  &--on { background: $blu-color-info-background-high; color: #fff; } }
.va__line { flex: 1; height: 2px; border-radius: 1px; background: $blu-color-neutral-background-disabled; }
.va__off { color: rgba(25, 34, 42, 0.3); }
.va__acc { display: flex; flex-direction: column; gap: $blu-spacing-ms; }
.va__copy { gap: $blu-spacing-xs; }
.va__how { padding-top: $blu-spacing-xs; padding-bottom: $blu-spacing-xs; }
.va__sec { padding: 14px 0; border-bottom: 1px solid $blu-color-neutral-border-low; &--last { border-bottom: 0; } }
.va__head { width: 100%; text-align: left; }
.va__chev { display: flex; transition: transform 0.2s; &--up { transform: rotate(180deg); } }
.va__steps { display: flex; flex-direction: column; gap: 10px; margin-top: $blu-spacing-ms; }
.va__step { display: flex; align-items: flex-start; gap: 10px; }
.va__n { width: 20px; height: 20px; border-radius: 50%; background: $blu-color-info-background-low; display: flex; align-items: center; justify-content: center; flex: none; }
</style>
