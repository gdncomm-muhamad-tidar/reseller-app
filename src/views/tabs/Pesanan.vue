<script setup lang="ts">
import { computed, ref } from 'vue';
import { useRouter } from 'vue-router';
import BliButton from '@blibli/blue.button/dist/button/blue/Button';
import BliBadge from '@blibli/blue.badge/dist/badge/blue/Badge';
import BliChips from '@blibli/blue.chips/dist/chips/blue/Chips';
import BliChip from '@blibli/blue.chips/dist/chips/blue/Chip';
import AppHeader from '@/components/AppHeader.vue';
import AppIcon from '@/components/AppIcon.vue';
import { NAV_SPACE } from '@/components/constants';
import { rp, short } from '@/theme';
import { useStore } from '@/store';
import { allOrders, dueIn, shortDate, STATUS_LABEL, type OrderView } from '@/orders';
import { dayAfter, PRODUCTS } from '@/data';
import { openFin } from '@/nav';
import { toast } from '@/composables/overlay';

type Step = 'done' | 'now' | '';
type NoteTone = 'warn' | 'info' | 'ok' | 'gray' | 'danger';
type Action = { t: string; pri?: boolean; on: () => void };
type CardInfo = { steps: Step[]; note: string; noteTone: NoteTone; actions: Action[] };

const router = useRouter();
const { S, invoices, payInvoices, addToCart } = useStore();
const LABELS = ['Disetujui', 'Bayar', 'Proses', 'Kirim', 'Selesai'];
const BADGE: Record<string, 'yellow' | 'blue' | 'tosca' | 'green' | 'gray'> = { orange: 'yellow', blue: 'blue', tosca: 'tosca', green: 'green', gray: 'gray' };

const pay = (inv: string) => { payInvoices([inv]); router.push('/bayar'); };
const again = (x: OrderView) => { x.items.forEach(l => addToCart(l.id, l.qty)); router.push('/keranjang'); };
/** credit note of the last `left` units of an order (the unscanned ones) */
const unscannedCN = (o: OrderView, left: number) => o.items.flatMap(l => Array.from({ length: l.qty }, () => PRODUCTS[l.id].cn)).slice(-left).reduce((a, v) => a + v, 0);

/** Card content per status — shared wording with Detail pesanan */
function info(o: OrderView): CardInfo {
  const inv = o.invoice;
  switch (o.status) {
    case 'wait': return { steps: ['now', '', '', '', ''], noteTone: 'info', note: 'Sales Budi cek stok & harga · ±2 jam', actions: [{ t: 'Chat sales', on: () => toast('Chat sales belum tersedia di demo ini') }] };
    case 'approved': return {
      steps: ['done', 'now', '', '', ''], noteTone: 'warn', note: `Bayar sebelum ${o.term === 'cbd' ? '17 Nov 2026, 23.59 WIB' : `${dayAfter(o.netDays ?? 30)} 2026`}`,
      actions: [{ t: 'Tagihan', on: () => openFin('inv') }, { t: 'Bayar', pri: true, on: () => pay(o.inv!) }],
    };
    case 'paid': return { steps: ['done', 'done', 'now', '', ''], noteTone: 'info', note: 'Pembayaran diterima. Pesanan sedang dikemas gudang.', actions: [{ t: 'Tagihan', on: () => openFin('inv') }] };
    case 'ship': return {
      steps: ['done', 'done', 'done', 'now', ''], noteTone: 'info', note: `Tiba besok, ${o.arrive} · GDN Logistics`,
      actions: [{ t: 'Lacak', on: () => toast(`GDN Logistics · tiba besok, ${o.arrive}`) }, { t: 'Diterima', pri: true, on: () => toast(`Pesanan ${o.id} ditandai diterima`) }],
    };
    case 'expired': return { steps: [], noteTone: 'gray', note: 'Kedaluwarsa · pembayaran CBD lewat batas 7 Nov, 23.59 WIB', actions: [{ t: 'Pesan lagi', pri: true, on: () => again(o) }] };
    default: {
      const all: Step[] = ['done', 'done', 'done', 'done', 'done'];
      if (inv && inv.st !== 'paid') return {
        steps: all, noteTone: inv.st === 'over' ? 'danger' : 'warn',
        note: inv.st === 'over' ? `Tagihan ${inv.id} lewat jatuh tempo 4 hari` : `Tagihan ${inv.id} jatuh tempo ${dueIn(inv.due)}`,
        actions: [{ t: 'Beli lagi', on: () => again(o) }, { t: 'Bayar', pri: true, on: () => pay(inv.id) }],
      };
      const left = o.units - (o.scanned ?? 0);
      return {
        steps: all, noteTone: 'ok',
        note: `${o.scanned ?? 0} dari ${o.units} IMEI scan${left ? ` · scan ${left} lagi, dapat ${short(unscannedCN(o, left))}` : ''}`,
        actions: [...(left ? [{ t: 'Scan IMEI', on: () => { router.push('/scan'); } }] : []), { t: 'Beli lagi', pri: true, on: () => again(o) }],
      };
    }
  }
}

const CHIP_OF: Record<string, OrderView['status'][]> = { all: ['wait', 'approved', 'paid', 'ship', 'done', 'expired'], act: ['wait', 'approved'], proc: ['paid'], ship: ['ship'], done: ['done', 'expired'] };
const list = computed(() => allOrders(S.orders, S.cns, invoices.value));
const chip = ref('all');
const count = (k: string) => list.value.filter(o => CHIP_OF[k].includes(o.status)).length;
const chips = computed<[string, string][]>(() => [['all', 'Semua'], ['act', `Perlu tindakan (${count('act')})`], ['proc', 'Diproses'], ['ship', 'Dikirim'], ['done', 'Selesai']]);
const shown = computed(() => list.value.filter(o => CHIP_OF[chip.value].includes(o.status)).map(o => ({ o, ...info(o) })));
</script>

<template>
  <div class="screen pes">
    <AppHeader title="Pesanan" no-back />
    <div class="screen__scroll no-scrollbar" :style="{ paddingBottom: `${NAV_SPACE}px` }">
      <div class="pes__chips no-scrollbar">
        <BliChips v-model="chip" single-select mandatory>
          <BliChip v-for="[k, l] in chips" :key="k" :value="k" size="small">{{ l }}</BliChip>
        </BliChips>
      </div>
      <div class="pes__list">
        <div class="row pes__rt"><AppIcon name="time" :size="14" /><span class="t-c1 c-med">Real-time · diperbarui 08.20</span></div>
        <div v-for="c in shown" :key="c.o.id" class="card pes__card" role="button" @click="router.push(`/order/${c.o.slug}`)">
          <div class="col pes__head">
            <div class="row">
              <span class="t-s1 grow">{{ c.o.id }}</span>
              <BliBadge :color="BADGE[STATUS_LABEL[c.o.status][1]]" prominence="secondary" size="extra-small">{{ STATUS_LABEL[c.o.status][0] }}</BliBadge>
            </div>
            <span class="t-c1 c-med">{{ shortDate(c.o.date) }} · {{ c.o.items.length }} produk · {{ c.o.units }} unit</span>
          </div>
          <div v-if="c.o.status !== 'expired'" class="trk">
            <div v-for="(l, i) in LABELS" :key="l" class="trk__s" :style="{ zIndex: 10 - i }">
              <div v-if="i > 0" class="trk__line" :class="{ on: c.steps[i] === 'done' || c.steps[i] === 'now' }" />
              <div class="trk__dotw">
                <span v-if="c.steps[i] === 'now'" class="trk__now" />
                <span v-else class="trk__dot" :class="{ done: c.steps[i] === 'done' }" />
              </div>
              <span :class="c.steps[i] === 'now' ? 't-lbl c-info' : 't-c1 c-med'">{{ l }}</span>
            </div>
          </div>
          <div class="row pes__note" :class="`n-${c.noteTone}`">
            <AppIcon name="info" :size="16" /><span class="t-lbl grow c-text">{{ c.note }}</span>
          </div>
          <div class="row">
            <span class="t-s2 grow">{{ rp(c.o.total) }}</span>
            <BliButton v-for="a in c.actions" :key="a.t" size="small" :prominence="a.pri ? 'primary' : 'secondary'" @click.stop="a.on()">{{ a.t }}</BliButton>
          </div>
        </div>
      </div>
    </div>
  </div>
</template>

<style scoped lang="scss">
$ok-brand: #0fb41b;
.pes { background: $blu-color-neutral-background-low; }
.screen__scroll { overflow-y: auto; }
.pes__chips { overflow-x: auto; padding: $blu-spacing-m; }
.pes__list { padding: 0 $blu-spacing-m; display: flex; flex-direction: column; gap: 12px; }
.pes__rt { gap: 6px; color: $blu-color-neutral-text-med; }
.pes__card { display: flex; flex-direction: column; gap: 12px; cursor: pointer; }
.pes__head { gap: 4px; }
.trk { display: flex; align-items: flex-start; }
.trk__s { flex: 1; position: relative; display: flex; flex-direction: column; align-items: center; gap: 6px; }
.trk__line { position: absolute; top: 7px; left: -50%; right: 50%; height: 2px; background: $blu-color-neutral-background-med; &.on { background: $ok-brand; } }
.trk__dotw { height: 16px; display: flex; align-items: center; z-index: 1; }
.trk__now { width: 16px; height: 16px; border-radius: 8px; background: $blu-color-info-background-high; border: 3px solid $blu-color-info-background-low; }
.trk__dot { width: 8px; height: 8px; border-radius: 5px; background: $blu-color-neutral-background-med; &.done { width: 10px; height: 10px; background: $ok-brand; } }
.pes__note { gap: 8px; padding: 8px 12px; border-radius: 8px; align-items: center;
  &.n-warn { background: $blu-color-alert-background-low; color: $blu-color-alert-text-default; }
  &.n-info { background: $blu-color-info-background-default; color: $blu-color-info-text-default; }
  &.n-ok { background: $blu-color-success-background-low; color: $ok-brand; }
  &.n-gray { background: $blu-color-neutral-background-med; color: $blu-color-neutral-text-med; }
  &.n-danger { background: $blu-color-danger-background-low; color: $blu-color-danger-text-default; }
}
</style>
