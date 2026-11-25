<script setup lang="ts">
import { computed, onMounted, onUnmounted, ref, watch } from 'vue';
import { useRoute, useRouter } from 'vue-router';
import BliButton from '@blibli/blue.button/dist/button/blue/Button';
import BliBadge from '@blibli/blue.badge/dist/badge/blue/Badge';
import BliBanner from '@blibli/blue.banner/dist/banner/blue/Banner';
import BliCheckbox from '@blibli/blue.checkbox/dist/checkbox/blue/Checkbox';
import BliChips from '@blibli/blue.chips/dist/chips/blue/Chips';
import BliChip from '@blibli/blue.chips/dist/chips/blue/Chip';
import BliProgressBar from '@blibli/blue.progress-bar/dist/progress-bar/blue/ProgressBar';
import BliTabs from '@blibli/blue.tabs/dist/tabs/blue/Tabs';
import BliTab from '@blibli/blue.tabs/dist/tabs/blue/Tab';
import AppIcon from '@/components/AppIcon.vue';
import CircleIcon from '@/components/CircleIcon.vue';
import Glow from '@/components/Glow.vue';
import Performa from '@/components/Performa.vue';
import { NAV_SPACE } from '@/components/constants';
import { toast } from '@/composables/overlay';
import { useStore } from '@/store';
import { CREDIT_LIMIT, type CN, type Inv } from '@/data';
import type { IconName } from '@/icons';
import { useGoReco } from '@/nav';
import { slugOf } from '@/orders';
import { cnEvents } from '@/cnHistory';
import { rp } from '@/theme';

/* Finansial — 4a Ringkasan · 4b Tagihan · 4c Credit note (gradient header + tabs). */
type Tab = 'ring' | 'inv' | 'cn';
type InvF = 'all' | 'open' | 'paid';

const route = useRoute();
const router = useRouter();
const { S, invoices, unpaid, cnTotal, limitUsed, payInvoices, toggleInvSel } = useStore();
const goReco = useGoReco();

const asTab = (v: unknown): Tab | undefined => (v === 'ring' || v === 'inv' || v === 'cn' ? v : undefined);
const tab = ref<Tab>(asTab(route.query.tab) ?? 'ring');
const scroller = ref<HTMLElement | null>(null);
// re-react whenever a new `t` arrives (openFin pushes a fresh timestamp)
watch(() => route.query.t, () => {
  const t = asTab(route.query.tab);
  if (t) tab.value = t;
  scroller.value?.scrollTo({ top: 0 });
});
const invF = ref<InvF>('all');
const cnF = ref<CN['st']>('use');

// theme-color of the browser chrome follows the header gradient while this tab is shown
let prevTheme: string | null = null;
onMounted(() => {
  const m = document.querySelector('meta[name="theme-color"]');
  if (m) { prevTheme = m.getAttribute('content'); m.setAttribute('content', '#e6f1ff'); }
});
onUnmounted(() => {
  const m = document.querySelector('meta[name="theme-color"]');
  if (m && prevTheme !== null) m.setAttribute('content', prevTheme);
});

const over = computed(() => unpaid.value.filter(i => i.st === 'over'));
const sumU = computed(() => unpaid.value.reduce((a, x) => a + x.amt, 0));
const sumO = computed(() => over.value.reduce((a, x) => a + x.amt, 0));
const sel = computed(() => unpaid.value.filter(i => S.invSel[i.id] !== false));
const showBulk = computed(() => tab.value === 'inv' && sel.value.length > 0);
const next = computed(() => unpaid.value.find(i => i.st === 'due') ?? unpaid.value[0]);
const pay = (ids: string[]) => { payInvoices(ids); router.push('/bayar'); };

const recentInv = computed(() => invoices.value.filter(x => x.st !== 'over').slice(0, 3));
const hist = computed(() => cnEvents(S.cns).slice(0, 3));
const invList = computed(() => invoices.value.filter(x => invF.value === 'all' || (invF.value === 'paid' ? x.st === 'paid' : x.st !== 'paid')));
const cnList = computed(() => S.cns.filter(c => c.st === cnF.value));
const nCN = (st: CN['st']) => S.cns.filter(c => c.st === st).length;
const SRC: Record<CN['icon'], IconName> = { scan: 'scan', medal: 'gift', receipt: 'receipt', trophy0: 'mission' };

type Tag = { label: string; color: 'red' | 'yellow' | 'green' | 'gray' | 'blue'; prom: 'secondary' | 'tertiary' };
function invTag(i: Inv): Tag {
  if (i.st === 'paid') return { label: 'Lunas', color: 'green', prom: 'secondary' };
  if (i.st === 'over') return { label: i.badge?.[1] ?? 'Lewat jatuh tempo', color: 'red', prom: 'tertiary' };
  return i.badge?.[0] === 'red' ? { label: i.badge[1], color: 'red', prom: 'secondary' } : { label: i.badge?.[1] ?? 'Menunggu pembayaran', color: 'yellow', prom: 'secondary' };
}
const onRecent = (x: Inv) => (x.st === 'paid' ? toast('Tagihan ini sudah lunas') : pay([x.id]));
const onHist = (e: { order?: string; inv?: string }) => {
  if (e.order) router.push(`/order/${slugOf(e.order)}`);
  else if (e.inv) tab.value = 'inv';
};
</script>

<template>
  <div class="screen fin">
    <div ref="scroller" class="screen__scroll no-scrollbar" :style="{ paddingBottom: `${showBulk ? 180 : NAV_SPACE}px` }">
      <div class="fin__hdr">
        <Glow color="#0072FF" :cx="20" :cy="20" :rx="110" :ry="90" :opacity="0.2" />
        <Glow color="#1D8FFF" :cx="50" :cy="10" :rx="120" :ry="100" :opacity="0.5" right />
        <h1 class="t-t1 fin__title">Finansial</h1>
        <div class="fin__pad">
          <BliTabs v-model="tab" variant="fixed" no-border class="fin__tabs">
            <BliTab value="ring">Ringkasan</BliTab>
            <BliTab value="inv">Tagihan</BliTab>
            <BliTab value="cn">Credit note</BliTab>
          </BliTabs>
        </div>
        <div class="fin__pad">
          <div class="fin__hero">
            <!-- 4a -->
            <template v-if="tab === 'ring'">
              <span class="t-c1 c-med">Tagihan belum dibayar</span>
              <span class="fin__big t-h1">{{ rp(next ? next.amt : 0) }}</span>
              <div v-if="next" class="row mt12">
                <BliBadge color="red" prominence="secondary" size="extra-small">{{ next.due.split(' · ')[0] }}</BliBadge>
                <span class="t-c1 c-med">1 tagihan · {{ next.term }}</span>
              </div>
              <BliButton class="mt12" full-width :disabled="!next" @click="next && pay([next.id])">Bayar sekarang</BliButton>
              <div class="divider mt12 mb12" />
              <div class="row"><span class="t-b2 grow">Limit kredit tersisa</span><span class="t-s2">{{ rp(CREDIT_LIMIT - limitUsed) }}</span></div>
              <BliProgressBar class="mt12 mb12" size="small" :model-value="(limitUsed / CREDIT_LIMIT) * 100" />
              <span class="t-c1 c-med">Terpakai {{ rp(limitUsed) }} dari {{ rp(CREDIT_LIMIT) }}</span>
            </template>
            <!-- 4b -->
            <div v-else-if="tab === 'inv'" class="row fin__sum">
              <div class="col grow"><span class="t-c1 c-med">Belum dibayar</span><span class="t-s1">{{ rp(sumU) }}</span><span class="t-c1 c-med">{{ unpaid.length }} tagihan</span></div>
              <div class="col grow">
                <span class="t-c1 c-med">Lewat jatuh tempo</span>
                <span class="t-s1" :class="sumO ? 'c-danger' : 'c-text'">{{ rp(sumO) }}</span>
                <span class="t-c1 c-med">{{ over.length ? `${over.length} tagihan · terkena denda` : 'Tidak ada' }}</span>
              </div>
            </div>
            <!-- 4c -->
            <template v-else>
              <div class="row">
                <AppIcon name="cashIn" :size="20" />
                <span class="t-c1 c-med grow">Credit note Anda</span>
                <button class="lnk t-s2" @click="router.push('/cn-riwayat')">Riwayat</button>
              </div>
              <span class="fin__big t-t1 ellipsis mt12">{{ rp(cnTotal) }}</span>
              <div class="row mt12 fin__two">
                <BliButton class="grow" size="small" prominence="secondary" @click="goReco()">Pakai belanja</BliButton>
                <BliButton class="grow" size="small" prominence="secondary" @click="tab = 'inv'">Bayar tagihan</BliButton>
              </div>
            </template>
          </div>
        </div>
      </div>

      <!-- body 4a -->
      <template v-if="tab === 'ring'">
        <div class="fin__sec">
          <div class="row between"><span class="t-s1">Tagihan terbaru</span><button class="lnk t-s2" @click="tab = 'inv'">Lihat semua</button></div>
          <div class="card fin__list">
            <button v-for="x in recentInv" :key="x.id" class="fin__li" @click="onRecent(x)">
              <div class="col grow"><span class="t-s2">{{ x.id }}</span><span class="t-c1 c-med">{{ rp(x.amt) }} · {{ x.term }}</span></div>
              <BliBadge :color="invTag(x).color" :prominence="invTag(x).prom" size="extra-small">{{ invTag(x).label }}</BliBadge>
              <AppIcon name="chev" :size="16" />
            </button>
          </div>
        </div>
        <div class="fin__pad">
          <Performa><template #title><span class="t-s1">Ringkasan belanja November</span></template></Performa>
        </div>
        <div class="fin__sec">
          <div class="row between"><span class="t-s1">Riwayat credit note</span><button class="lnk t-s2" @click="router.push('/cn-riwayat')">Lihat semua</button></div>
          <div class="card fin__list">
            <button v-for="e in hist" :key="e.k" class="fin__li" :disabled="!e.order && !e.inv" @click="onHist(e)">
              <CircleIcon :bg="e.tone === 'off' ? 'var(--blu-color-neutral-background-med)' : 'var(--blu-color-info-background-default)'">
                <AppIcon :name="e.icon" :size="20" :color="e.tone === 'off' ? 'var(--blu-color-neutral-text-med)' : 'var(--blu-color-info-text-default)'" />
              </CircleIcon>
              <div class="col grow"><span class="t-s2 ellipsis">{{ e.title }}</span><span class="t-c1 c-med">{{ e.sub }}</span></div>
              <span class="t-s2" :class="e.tone === 'in' ? 'c-ok' : e.tone === 'off' ? 'c-low' : 'c-text'">{{ e.amt > 0 ? '+' : '−' }}{{ rp(Math.abs(e.amt)) }}</span>
            </button>
          </div>
        </div>
      </template>

      <!-- body 4b -->
      <div v-else-if="tab === 'inv'" class="fin__sec">
        <BliChips v-model="invF" single-select mandatory>
          <BliChip value="all" size="small">Semua ({{ invoices.length }})</BliChip>
          <BliChip value="open" size="small">Belum dibayar ({{ unpaid.length }})</BliChip>
          <BliChip value="paid" size="small">Lunas ({{ invoices.length - unpaid.length }})</BliChip>
        </BliChips>
        <BliBanner v-if="over.length" status="alert" size="extra-small" full-width>
          {{ over.length }} tagihan jatuh tempo. Segera lakukan pembayaran agar pesanan berikutnya tidak tertahan &amp; denda tidak bertambah.
        </BliBanner>
        <div v-for="x in invList" :key="x.id" class="card fin__inv" :class="{ over: x.st === 'over' && !x.fresh, fresh: x.fresh }">
          <div class="row top">
            <BliCheckbox v-if="x.st !== 'paid'" label-hidden :model-value="S.invSel[x.id] !== false" @update:model-value="toggleInvSel(x.id)" />
            <div class="col grow"><span class="t-s2">{{ x.id }}</span><span class="t-lbl c-info">Pesanan {{ x.rfq }}</span></div>
            <BliBadge :color="invTag(x).color" :prominence="invTag(x).prom" size="extra-small">{{ invTag(x).label }}</BliBadge>
          </div>
          <span class="t-c1 c-med">{{ x.due }}</span>
          <div class="divider" />
          <div class="row">
            <div class="col grow"><span class="t-c1 c-med">Total tagihan</span><span class="t-s1" :class="x.st === 'over' ? 'c-danger' : 'c-text'">{{ rp(x.amt) }}</span></div>
            <BliButton v-if="x.st === 'paid'" size="small" prominence="tertiary" @click="toast('Bukti bayar diunduh')">Bukti bayar</BliButton>
            <template v-else>
              <BliButton size="small" prominence="tertiary" @click="toast('Tagihan PDF diunduh')">Unduh PDF</BliButton>
              <BliButton size="small" @click="pay([x.id])">Bayar</BliButton>
            </template>
          </div>
        </div>
      </div>

      <!-- body 4c -->
      <div v-else class="fin__sec">
        <BliChips v-model="cnF" single-select mandatory>
          <BliChip value="use" size="small">Tersedia ({{ nCN('use') }})</BliChip>
          <BliChip value="used" size="small">Terpakai ({{ nCN('used') }})</BliChip>
          <BliChip value="expired" size="small">Hangus ({{ nCN('expired') }})</BliChip>
        </BliChips>
        <div v-for="c in cnList" :key="c.k" class="cn">
          <div class="cn__main" :class="{ off: c.st === 'expired' }">
            <div class="col cn__txt">
              <div class="row cn__amt">
                <AppIcon :name="SRC[c.icon]" :size="16" :color="c.st === 'expired' ? 'var(--blu-color-neutral-text-low)' : 'var(--blu-color-info-text-default)'" />
                <span class="t-t2 cn__v" :class="{ 'c-low': c.st === 'expired' }">{{ rp(c.amt) }}</span>
              </div>
              <span class="t-c1 ellipsis" :class="{ 'c-low': c.st === 'expired' }">{{ c.t }}</span>
              <span class="t-c1" :class="c.st === 'expired' ? 'c-low' : 'c-med'">{{ c.c }} • {{ c.st === 'use' ? `berlaku hingga ${c.exp}` : c.st === 'used' ? c.usedAt : `Kedaluwarsa ${c.exp}` }}</span>
            </div>
            <div v-if="c.st === 'used' && c.usedBy" class="row">
              <BliBadge :color="c.usedFor === 'inv' ? 'magenta' : 'blue'" prominence="tertiary" size="extra-small">{{ c.usedFor === 'inv' ? 'Tagihan' : 'Pesanan' }}</BliBadge>
              <button class="lnk t-s2" @click="c.usedFor === 'inv' ? (tab = 'inv') : router.push(`/order/${slugOf(c.usedBy!)}`)">{{ c.usedBy.replace('#', '') }}</button>
            </div>
          </div>
          <div class="cn__act">
            <BliButton v-if="c.st === 'use'" size="small" prominence="secondary" @click="goReco()">Pakai</BliButton>
            <button v-else class="cn__dl" aria-label="Unduh" @click="toast(`${c.c} diunduh`)"><AppIcon name="download" :size="18" /></button>
          </div>
        </div>
        <p v-if="!cnList.length" class="t-c1 c-med center fin__none">Belum ada credit note di sini.</p>
      </div>
    </div>

    <div v-if="showBulk" class="fin__bulk">
      <div class="col grow"><span class="t-c1 c-med">{{ sel.length }} invoice</span><span class="t-s1">{{ rp(sel.reduce((a, x) => a + x.amt, 0)) }}</span></div>
      <BliButton size="small" @click="pay(sel.map(x => x.id))">Bayar sekaligus</BliButton>
    </div>
  </div>
</template>

<style scoped lang="scss">
.fin { background: $blu-color-neutral-background-low; position: relative; }
.screen__scroll { overflow-y: auto; display: flex; flex-direction: column; gap: 24px; }
.fin__hdr {
  position: relative; overflow: hidden; display: flex; flex-direction: column; gap: $blu-spacing-m; flex: none;
  padding: calc(env(safe-area-inset-top) + 8px) 0 8px;
  background: linear-gradient(180deg, $blu-color-info-background-low 0%, $blu-color-info-background-default 60%, $blu-color-neutral-background-low 100%);
}
.fin__title { margin: 0; padding: 0 $blu-spacing-m; position: relative; }
.fin__pad { padding: 0 $blu-spacing-m; position: relative; }
.fin__tabs { background: $blu-color-neutral-background-default; border-radius: 12px; overflow: hidden; }
.fin__hero { border-radius: 16px; background: $blu-color-neutral-background-default; padding: $blu-spacing-m; display: flex; flex-direction: column; }
.fin__big { font-size: 32px; line-height: 38px; margin-top: 12px; &.t-t1 { font-size: 24px; line-height: 28px; } }
.mt12 { margin-top: 12px; } .mb12 { margin-bottom: 12px; }
.fin__sum { align-items: flex-start; gap: $blu-spacing-m; .col { gap: 2px; } }
.fin__two { :deep(.blu-button) { width: 100%; } }
.lnk { color: $blu-color-info-text-default; padding: 0; }
.fin__sec { padding: 0 $blu-spacing-m; display: flex; flex-direction: column; gap: 12px; }
.fin__list { padding: 0; overflow: hidden; }
.fin__li {
  display: flex; align-items: center; gap: 12px; padding: 12px $blu-spacing-m; width: 100%; text-align: left;
  & + & { border-top: 1px solid $blu-color-neutral-border-low; }
  .col { gap: 2px; }
}
.fin__inv { display: flex; flex-direction: column; gap: 12px;
  &.over { border: 1px solid $blu-color-danger-border-default; }
  &.fresh { border: 2px solid $blu-color-info-background-high; }
  .top { align-items: flex-start; gap: 12px; } .col { gap: 2px; }
}
.cn { display: flex; align-items: stretch; }
.cn__main {
  flex: 1; min-width: 0; display: flex; flex-direction: column; gap: 8px; padding: $blu-spacing-m 12px; border-radius: 8px 0 0 8px;
  border: 1px solid $blu-color-neutral-border-low; border-right: 0; background: $blu-color-neutral-background-default;
  &.off { background: $blu-color-neutral-background-med; }
}
.cn__txt { gap: 2px; }
.cn__amt { gap: 6px; }
.cn__v { font-size: 18px; line-height: 24px; }
.cn__act { padding: 12px; display: flex; align-items: center; border-radius: 0 8px 8px 0; border: 1px solid $blu-color-neutral-border-low; background: $blu-color-neutral-background-default; }
.cn__dl { width: 36px; height: 36px; border-radius: 18px; border: 1px solid $blu-color-info-background-high; display: flex; align-items: center; justify-content: center; }
.fin__none { margin: 24px 0 0; }
.fin__bulk {
  position: absolute; left: 0; right: 0; bottom: 0; background: $blu-color-neutral-background-default; padding: 12px $blu-spacing-m calc(#{88px} + env(safe-area-inset-bottom));
  display: flex; align-items: center; gap: $blu-spacing-m; box-shadow: $blu-shadow-med; .col { gap: 2px; }
}
</style>
