<script setup lang="ts">
import { onBeforeUnmount, onMounted, ref } from 'vue';
import { useRouter } from 'vue-router';
import BliModalHeader from '@blibli/blue.modal/dist/modal/blue/ModalHeader';
import BliModalBody from '@blibli/blue.modal/dist/modal/blue/ModalBody';
import { useStore } from '@/store';
import { closeSheet } from '@/composables/overlay';
import { goTab, openFin } from '@/nav';
import AppIcon from './AppIcon.vue';

/** "Pintasan flow demo" sheet opened by MagicFab (testing / demo only). */
const emit = defineEmits<{ (e: 'close'): void }>();
const router = useRouter();
const st = useStore();
type Flow = [label: string, sub: string | null, run: () => void];

const fillCart = () => {
  if (st.S.cart.length) return;
  st.addToCart('ultra', 2); st.addToCart('a56', 1); st.addToCart('buds', 1);
};
const order = (id: string) => () => router.push(`/order/${id}`);
const groups: [string, Flow[]][] = [
  ['Misi & notifikasi', [
    ['Notifikasi misi tercapai', 'Lock screen → ketuk notifikasi', () => router.replace('/')],
    ['Pop up misi tercapai', 'Beranda + modal "Misi berhasil diselesaikan"', () => { st.setPopup(true); goTab('/home'); }],
    ['Halaman Misi', null, () => router.push('/misi')],
    ['Detail misi', 'Misi Loyalty Smartphone', () => router.push('/misi/smart')],
    ['Poin', null, () => router.push('/poin')],
  ]],
  ['Belanja', [
    ['Beranda', null, () => goTab('/home')],
    ['Katalog', null, () => goTab('/katalog')],
    ['Daftar pesanan (keranjang)', 'Isi contoh: 2× S25 Ultra, A56, Buds3 Pro', () => { fillCart(); router.push('/keranjang'); }],
    ['Checkout', 'Keranjang otomatis terisi bila kosong', () => { fillCart(); router.push('/checkout'); }],
    ['Ketentuan kirim pesanan', 'Checkout → tekan "Ajukan pesanan"', () => { fillCart(); st.setSkipTerms(false); router.push('/checkout'); }],
    ['Pesanan diajukan', 'Halaman konfirmasi', () => router.push('/diajukan')],
  ]],
  ['Pesanan', [
    ['Riwayat pesanan', null, () => goTab('/pesanan')],
    ['Detail · Menunggu persetujuan', '#RFQ/1151', order('RFQ-1151')],
    ['Detail · Menunggu pembayaran', '#RFQ/1150', order('RFQ-1150')],
    ['Detail · Diproses', '#RFQ/1144', order('RFQ-1144')],
    ['Detail · Dikirim', '#RFQ/1138', order('RFQ-1138')],
    ['Detail · Selesai', '#RFQ/1102', order('RFQ-1102')],
    ['Detail · Kedaluwarsa', '#RFQ/1129', order('RFQ-1129')],
  ]],
  ['Pembayaran & finansial', [
    ['Pilih metode pembayaran', 'INV/0063/2026 · #RFQ/1150', () => { st.payInvoices(['INV/0063/2026']); router.push('/bayar'); }],
    ['Virtual account → Pembayaran berhasil', 'Tekan "Cek status" di halaman VA', () => { st.payInvoices(['INV/0063/2026']); st.setVA('BCA'); router.push('/va'); }],
    ['Finansial · Ringkasan', null, () => openFin('ring')],
    ['Finansial · Tagihan', null, () => openFin('inv')],
    ['Finansial · Credit note', null, () => openFin('cn')],
    ['Riwayat credit note', null, () => router.push('/cn-riwayat')],
  ]],
  ['Lainnya', [
    ['Scan IMEI', null, () => goTab('/scan')],
    ['Reset demo', 'Kembalikan semua data ke awal', () => { st.reset(); router.replace('/'); }],
  ]],
];

// The opening tap may fire a follow-up mouse click at the same spot (devtools touch emulation), which would
// land on whichever option slid under the cursor. Ignore presses until the sheet has settled.
const ready = ref(false);
let t: ReturnType<typeof setTimeout>;
onMounted(() => { t = setTimeout(() => { ready.value = true; }, 500); });
onBeforeUnmount(() => clearTimeout(t));
</script>

<template>
  <div>
    <BliModalHeader title="Pintasan flow demo" @close="emit('close')" />
    <BliModalBody>
      <div class="fs" :style="{ pointerEvents: ready ? 'auto' : 'none' }">
        <div v-for="[g, items] in groups" :key="g" class="fs__grp">
          <span class="t-lbl c-med">{{ g.toUpperCase() }}</span>
          <div class="fs__list">
            <button v-for="([l, sub, run], i) in items" :key="l" type="button" class="fs__item" :class="{ 'fs__item--sep': i }" @click="closeSheet(run)">
              <div class="col grow fs__txt"><span class="t-b2">{{ l }}</span><span v-if="sub" class="t-c1 c-med">{{ sub }}</span></div>
              <AppIcon name="chev" :size="16" />
            </button>
          </div>
        </div>
      </div>
    </BliModalBody>
  </div>
</template>

<style scoped lang="scss">
.fs { display: flex; flex-direction: column; gap: 16px; padding-bottom: 16px; }
.fs__grp { display: flex; flex-direction: column; gap: 4px; }
.fs__list { border-radius: 12px; border: 1px solid $blu-color-neutral-border-low; overflow: hidden; }
.fs__item { width: 100%; display: flex; align-items: center; gap: 8px; padding: 10px 12px; text-align: left; cursor: pointer; &--sep { border-top: 1px solid $blu-color-neutral-border-low; } &:hover { background: $blu-color-neutral-background-low; } &:active { background: $blu-color-neutral-border-low; } }
.fs__txt { gap: 2px; }
</style>
