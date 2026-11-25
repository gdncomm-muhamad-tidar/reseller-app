<script setup lang="ts">
/* Detail pesanan — structure from the reference "current order history detail" (Figma 733:28367),
 * restyled with the app's BLUE components. One screen covers every status:
 * menunggu persetujuan · menunggu pembayaran (CBD) · diproses · dikirim · selesai · kedaluwarsa. */
import { computed, ref } from 'vue';
import { useRoute, useRouter } from 'vue-router';
import BliBadge from '@blibli/blue.badge/dist/badge/blue/Badge';
import BliBanner from '@blibli/blue.banner/dist/banner/blue/Banner';
import BliButton from '@blibli/blue.button/dist/button/blue/Button';
import AppHeader from '@/components/AppHeader.vue';
import AppFooter from '@/components/AppFooter.vue';
import AppIcon from '@/components/AppIcon.vue';
import ProductLabel from '@/components/ProductLabel.vue';
import ProductPhoto from '@/components/ProductPhoto.vue';
import { toast } from '@/composables/overlay';
import { useStore } from '@/store';
import { dayAfter, lineP, PRODUCTS } from '@/data';
import { allOrders, dueIn, OrderView, STATUS_LABEL } from '@/orders';
import { openFin } from '@/nav';
import { rp, short } from '@/theme';

type BannerTone = 'info' | 'warn' | 'danger' | 'ok' | 'gray';
const BANNER: Record<BannerTone, 'info' | 'alert' | 'error' | 'success' | 'general'> = { info: 'info', warn: 'alert', danger: 'error', ok: 'success', gray: 'general' };
/** status badge tones (BLUE badge has no orange → yellow) */
const TAG: Record<'orange' | 'blue' | 'tosca' | 'green' | 'gray', 'yellow' | 'blue' | 'tosca' | 'green' | 'gray'> = { orange: 'yellow', blue: 'blue', tosca: 'tosca', green: 'green', gray: 'gray' };

const route = useRoute();
const router = useRouter();
const { S, invoices, payInvoices, addToCart } = useStore();
const slug = String(route.params.id ?? '');
const o = computed(() => allOrders(S.orders, S.cns, invoices.value).find(x => x.slug === slug));
const all = ref(false);
const open = ref(true);

/** status-specific banner on top (reference: quotation deadline / CBD reminder) */
function topBanner(x: OrderView): [BannerTone, string] | null {
  const inv = x.invoice;
  switch (x.status) {
    case 'wait': return ['info', 'Sales Budi sedang cek stok & harga. Biasanya selesai ±2 jam, Anda akan dapat notifikasi.'];
    case 'approved': return x.term === 'cbd'
      ? ['warn', 'Bayar sebelum 17 Nov 2026, 23.59 WIB agar pesanan mulai diproses. Lewat batas ini, pesanan kedaluwarsa.']
      : ['info', `Pesanan disetujui. Tagihan Net ${x.netDays ?? 30} jatuh tempo ${dayAfter(x.netDays ?? 30)} 2026.`];
    case 'paid': return ['info', 'Pembayaran diterima. Pesanan sedang dikemas gudang dan dikirim 1–2 hari kerja.'];
    case 'ship': return ['info', `Dikirim dengan GDN Logistics, tiba besok ${x.arrive}. Tagihan Net 30 terbit setelah pesanan sampai.`];
    case 'expired': return ['gray', 'Pesanan kedaluwarsa karena pembayaran CBD melewati batas 7 Nov 2026, 23.59 WIB.'];
    default:
      if (inv?.st === 'over') return ['danger', `Tagihan ${inv.id} lewat jatuh tempo 4 hari. Denda 0,1% per hari, segera bayar.`];
      if (inv && inv.st !== 'paid') return ['warn', `Tagihan ${inv.id} jatuh tempo ${dueIn(inv.due)} (${inv.due.match(/\d+ (Nov|Des)/)?.[0]} 2026).`];
      return null;
  }
}

const inv = computed(() => o.value?.invoice);
const paid = computed(() => !!o.value && (o.value.status === 'paid' || inv.value?.st === 'paid' || (o.value.term === 'cbd' && (o.value.status === 'ship' || o.value.status === 'done'))));
const banner = computed(() => (o.value ? topBanner(o.value) : null));
const left = computed(() => (o.value?.status === 'done' ? o.value.units - (o.value.scanned ?? 0) : 0));
const shown = computed(() => (all.value ? o.value?.items : o.value?.items.slice(0, 3)) ?? []);
const stat = computed(() => (o.value ? STATUS_LABEL[o.value.status] : null));
const leftCn = computed(() => o.value ? short(o.value.items.flatMap(l => Array.from({ length: l.qty }, () => PRODUCTS[l.id].cn)).slice(-left.value).reduce((a, v) => a + v, 0)) : '');

const pay = (i: string) => { payInvoices([i]); router.push('/bayar'); };
const again = () => { o.value?.items.forEach(l => addToCart(l.id, l.qty)); router.push('/keranjang'); };
const copy = async (k: string, v: string) => {
  try { await navigator.clipboard.writeText(v); } catch { /* clipboard unavailable */ }
  toast(`${k} disalin`);
};
const prod = (id: string) => PRODUCTS[id];

const actions = computed<{ t: string; pri?: boolean; on: () => void }[]>(() => {
  const x = o.value;
  if (!x) return [];
  const i = x.invoice;
  return x.status === 'wait' ? [{ t: 'Chat sales', pri: true, on: () => toast('Chat sales belum tersedia di demo ini') }]
    : x.status === 'approved' ? [{ t: 'Lihat tagihan', on: () => openFin('inv') }, { t: 'Bayar', pri: true, on: () => pay(x.inv!) }]
    : x.status === 'paid' ? [{ t: 'Lihat tagihan', pri: true, on: () => openFin('inv') }]
    : x.status === 'ship' ? [{ t: 'Lacak', on: () => toast(`GDN Logistics · tiba besok, ${x.arrive}`) }, { t: 'Pesanan diterima', pri: true, on: () => toast(`Pesanan ${x.id} ditandai diterima`) }]
    : x.status === 'expired' ? [{ t: 'Pesan lagi', pri: true, on: again }]
    : i && i.st !== 'paid' ? [{ t: 'Beli lagi', on: again }, { t: 'Bayar tagihan', pri: true, on: () => pay(i.id) }]
    : [...(left.value ? [{ t: 'Scan IMEI', on: () => router.push('/scan') }] : []), { t: 'Beli lagi', pri: true, on: again }];
});
</script>

<template>
  <div v-if="!o" class="screen">
    <AppHeader title="Detail pesanan" />
    <p class="t-b2 center" style="margin-top: 24px">Pesanan tidak ditemukan.</p>
  </div>

  <div v-else class="screen">
    <AppHeader title="Detail pesanan" />
    <div class="screen__scroll no-scrollbar">
      <div class="wrap">
        <!-- order info + status -->
        <section class="sec">
          <BliBanner v-if="banner" :status="BANNER[banner[0]]" full-width>{{ banner[1] }}</BliBanner>
          <div class="col" style="gap: 8px">
            <div class="row info"><span class="t-c1 c-med grow">Nomor pesanan</span><span class="t-c1 ellipsis val">{{ o.id }}</span><button aria-label="Salin" @click="copy('Nomor pesanan', o.id)"><AppIcon name="copy" :size="16" color="var(--blu-color-info-icon-default)" /></button></div>
            <div v-if="o.so" class="row info"><span class="t-c1 c-med grow">Nomor sales order</span><span class="t-c1 ellipsis val">{{ o.so }}</span><button aria-label="Salin" @click="copy('Nomor sales order', o.so!)"><AppIcon name="copy" :size="16" color="var(--blu-color-info-icon-default)" /></button></div>
            <div v-if="inv" class="row info"><span class="t-c1 c-med grow">Nomor tagihan</span><span class="t-c1 ellipsis val">{{ inv.id }}</span><button aria-label="Salin" @click="copy('Nomor tagihan', inv!.id)"><AppIcon name="copy" :size="16" color="var(--blu-color-info-icon-default)" /></button></div>
            <div class="row info"><span class="t-c1 c-med grow">Tanggal dibuat</span><span class="t-c1 ellipsis val">{{ o.date }}</span></div>
            <div class="row info"><span class="t-c1 c-med grow">Dibuat oleh</span><span class="t-c1 ellipsis val">Leonni · Raja Ponsel</span></div>
            <div class="row info">
              <span class="t-c1 c-med grow">Syarat pembayaran</span>
              <span class="t-c1 ellipsis val">{{ o.term === 'cbd' ? 'CBD (bayar di muka)' : `Net ${o.netDays ?? 30} hari` }}</span>
              <BliBadge v-if="o.status !== 'wait' && o.status !== 'expired'" :color="paid ? 'green' : 'gray'" prominence="secondary" size="extra-small">{{ paid ? 'Lunas' : 'Belum bayar' }}</BliBadge>
            </div>
            <div class="row info"><span class="t-c1 c-med grow">Nama sales</span><span class="t-c1 ellipsis val">Budi Santoso</span></div>
          </div>

          <div class="card status">
            <button class="row status__head" @click="open = !open">
              <span class="t-s2 grow">Status pesanan</span>
              <BliBadge v-if="stat" :color="TAG[stat[1]]" prominence="secondary" size="extra-small">{{ stat[0] }}</BliBadge>
              <span class="chev" :class="{ up: open }"><AppIcon name="chevD" :size="20" color="var(--blu-color-neutral-icon-high)" /></span>
            </button>
            <template v-if="open">
              <div class="divider" />
              <div>
                <div v-if="o.next" class="row tl">
                  <div class="tl__rail"><span class="tl__next" /><span class="tl__line" /></div>
                  <p class="t-b2 c-low grow" style="padding-bottom: 16px">{{ o.next }}</p>
                </div>
                <div v-for="([t, time], i) in o.steps" :key="t" class="row tl">
                  <div class="tl__rail">
                    <span class="tl__dot" :class="{ bad: i === 0 && o.status === 'expired' }">
                      <AppIcon :name="i === 0 && o.status === 'expired' ? 'close' : 'check'" :size="10" color="#fff" />
                    </span>
                    <span v-if="i < o.steps.length - 1" class="tl__line" />
                  </div>
                  <div class="grow col" style="gap: 2px" :style="{ paddingBottom: i < o.steps.length - 1 ? '16px' : '0' }">
                    <span class="t-b2">{{ t }}</span><span class="t-c1 c-med">{{ time }}</span>
                  </div>
                </div>
              </div>
            </template>
          </div>
        </section>

        <!-- address -->
        <section class="sec">
          <p class="t-s1">Alamat pengiriman</p>
          <div class="row"><AppIcon name="pin" :size="18" color="var(--blu-color-info-icon-default)" /><span class="t-s2">Raja Ponsel · ITC Kuningan</span></div>
          <div class="col" style="gap: 4px">
            <p class="t-b2">Leonni &nbsp;|&nbsp; 08332100392</p>
            <p class="t-b2 c-med">Gedung Sarana Jaya, Jl. Budi Kemuliaan No.1, RT.2/RW.3, Gambir, Kecamatan Gambir, Kota Jakarta Pusat, DKI Jakarta 10110</p>
          </div>
        </section>

        <!-- products -->
        <section class="sec">
          <div class="row"><span class="t-s1 grow">Daftar produk</span><span class="t-c1 c-med">{{ o.items.length }} produk · {{ o.units }} unit</span></div>
          <BliBanner v-if="o.status === 'wait'" status="info" full-width>Jumlah dan harga produk, total pesanan, dan syarat pembayaran mungkin berubah setelah dicek sales. Mohon cek lagi.</BliBanner>
          <div v-for="l in shown" :key="l.id" class="prod">
            <div class="row prod__top">
              <ProductPhoto :src="prod(l.id).img" />
              <div class="grow col" style="gap: 2px"><span class="t-c2 c-med">{{ prod(l.id).mta }}</span><span class="t-b2">{{ prod(l.id).n }}</span></div>
              <span class="t-c1">{{ l.qty }} unit</span>
            </div>
            <div class="prod__bot">
              <div class="row" style="gap: 6px">
                <span class="t-c1 grow">Harga satuan</span>
                <span v-if="prod(l.id).o && lineP(l) === prod(l.id).p" class="t-c1 c-med strike">{{ rp(prod(l.id).o!) }}</span>
                <span class="t-lbl">{{ rp(lineP(l)) }}</span>
                <ProductLabel v-if="prod(l.id).o && lineP(l) === prod(l.id).p" kind="disc" :label="prod(l.id).d!" />
              </div>
              <div class="row"><span class="t-c1 grow">Total harga</span><span class="t-lbl">{{ rp(lineP(l) * l.qty) }}</span></div>
            </div>
          </div>
          <button v-if="o.items.length > 3" class="t-lbl c-info more" @click="all = !all">{{ all ? 'Lihat lebih sedikit' : 'Lihat semua' }}</button>
          <BliBanner v-if="left > 0" status="success" full-width>{{ o.scanned }} dari {{ o.units }} IMEI sudah discan. Scan {{ left }} unit lagi untuk dapat credit note {{ leftCn }}.</BliBanner>
        </section>

        <!-- payment -->
        <section class="sec">
          <p class="t-s1">Pembayaran</p>
          <div class="pay">
            <div class="row"><span class="t-c1 grow">Total harga ({{ o.units }} unit)</span><span class="t-c1">{{ rp(o.sub) }}</span></div>
            <div v-if="o.cbd > 0" class="row"><span class="t-c1 grow">Diskon CBD</span><span class="t-c1 c-ok">−{{ rp(o.cbd) }}</span></div>
            <div v-if="o.cn > 0" class="row"><span class="t-c1 grow">Credit note</span><span class="t-c1 c-ok">−{{ rp(o.cn) }}</span></div>
            <div class="row"><span class="t-c1 grow">Ongkos kirim</span><span class="t-c1 c-ok">Gratis</span></div>
            <div class="divider" />
            <div class="row"><span class="t-s2 grow">Total pembayaran</span><span class="t-s1">{{ rp(o.total) }}</span></div>
          </div>
          <p v-if="o.status !== 'expired'" class="t-c1 c-med">Potensi credit note dari scan IMEI: {{ short(o.cnPotential) }} ({{ o.units }} unit)</p>
        </section>
      </div>
    </div>
    <AppFooter>
      <BliButton v-for="a in actions" :key="a.t" class="grow" full-width :prominence="a.pri ? 'primary' : 'secondary'" @click="a.on">{{ a.t }}</BliButton>
    </AppFooter>
  </div>
</template>

<style scoped lang="scss">
.wrap { display: flex; flex-direction: column; gap: 8px; padding-bottom: 24px; }
.sec { background: $blu-color-neutral-background-default; padding: $blu-spacing-m; display: flex; flex-direction: column; gap: 12px; }
.info { gap: 8px; }
.val { flex-shrink: 1; text-align: right; max-width: 60%; }
.status { display: flex; flex-direction: column; gap: 12px; padding: 12px; border: 1px solid $blu-color-neutral-border-low; }
.status__head { width: 100%; text-align: left; }
.chev { display: flex; transition: transform 0.2s; &.up { transform: rotate(180deg); } }
.tl { align-items: stretch; gap: 12px; }
.tl__rail { display: flex; flex-direction: column; align-items: center; width: 16px; }
.tl__line { flex: 1; width: 1px; background: $blu-color-neutral-border-med; }
.tl__next { width: 12px; height: 12px; border-radius: 6px; margin-top: 3px; background: $blu-color-neutral-background-med; }
.tl__dot { width: 16px; height: 16px; margin-top: 1px; border-radius: 8px; display: flex; align-items: center; justify-content: center; background: $blu-color-brand-success-background-default; &.bad { background: $blu-color-danger-text-default; } }
.prod { border: 1px solid $blu-color-neutral-border-low; border-radius: 8px; overflow: hidden; }
.prod__top { padding: 12px; align-items: flex-start; gap: 12px; }
.prod__bot { background: $blu-color-neutral-background-low; padding: 8px 12px; display: flex; flex-direction: column; gap: 4px; }
.strike { text-decoration: line-through; }
.more { align-self: center; }
.pay { background: $blu-color-neutral-background-low; border-radius: 8px; padding: 12px; display: flex; flex-direction: column; gap: 8px; }
</style>
