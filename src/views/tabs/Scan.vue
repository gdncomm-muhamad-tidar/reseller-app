<script setup lang="ts">
import { computed, reactive, ref } from 'vue';
import { useRoute, useRouter } from 'vue-router';
import BliButton from '@blibli/blue.button/dist/button/blue/Button';
import BliTabs from '@blibli/blue.tabs/dist/tabs/blue/Tabs';
import BliTab from '@blibli/blue.tabs/dist/tabs/blue/Tab';
import AppIcon from '@/components/AppIcon.vue';
import AppArt from '@/components/AppArt.vue';
import { NAV_SPACE } from '@/components/constants';
import { IMG, PRODUCTS } from '@/data';
import { fmt, rp } from '@/theme';
import { useStore, type ScanSt } from '@/store';

/* Scan IMEI list: summary + status bar, Terverifikasi / Menunggu / Gagal tabs, search, empty state. */
const TABS: [ScanSt, string][] = [['ok', 'Terverifikasi'], ['pending', 'Menunggu'], ['fail', 'Gagal']];
const DOT: Record<ScanSt, string> = { ok: '#0fb41b', pending: '#00b5b0', fail: '#fa8c00' };

const router = useRouter();
const route = useRoute();
const { S } = useStore();

const qTab = computed(() => route.query.tab as ScanSt | undefined);
const qN = computed(() => route.query.n as string | undefined);
// a result coming back from /scan-input (new `n`) picks the tab; a tap afterwards overrides it
const sel = reactive<{ tab: ScanSt; n?: string }>({ tab: qTab.value ?? 'ok', n: qN.value });
const tab = computed<ScanSt>(() => (qTab.value && qN.value !== sel.n ? qTab.value : sel.tab));
const setTab = (t: ScanSt) => { sel.tab = t; sel.n = qN.value; };
const q = ref('');

const count = (st: ScanSt) => S.scans.filter(s => s.st === st).length;
const total = computed(() => S.scans.length);
const okList = computed(() => S.scans.filter(s => s.st === 'ok'));
const cashback = computed(() => okList.value.reduce((a, s) => a + s.cashback, 0));
const poin = computed(() => okList.value.reduce((a, s) => a + s.pts, 0));
const list = computed(() => {
  const k = q.value.trim().toLowerCase();
  return S.scans.filter(s => s.st === tab.value && (!k || s.product.toLowerCase().includes(k) || s.imei.toLowerCase().includes(k)));
});
const openCamera = () => router.push('/scan-camera');
const okLine = (cb: number, pts: number) => [cb ? `+${rp(cb)} cashback` : '', `+${fmt(pts)} poin`].filter(Boolean).join(' · ');
</script>

<template>
  <div class="screen scan">
    <div class="screen__scroll no-scrollbar" :style="{ paddingBottom: `${NAV_SPACE}px` }">
      <div class="scan__top row">
        <h1 class="t-t1 grow">Scan IMEI</h1>
        <button class="scan__poin" @click="router.push('/poin')">
          <AppArt name="badge-gold" :width="16" /><span class="t-lbl">{{ fmt(S.poin) }} poin</span>
        </button>
      </div>

      <div class="card scan__sum">
        <div class="row">
          <div class="col grow"><span class="t-c1 c-med">Total IMEI di-scan</span><span class="t-t1">{{ fmt(total) }}</span></div>
          <BliButton size="small" @click="openCamera">
            <template #item-leading><AppIcon name="scanNav" :size="18" color="#fff" /></template>
            Scan IMEI
          </BliButton>
        </div>
        <div class="scan__bar" :style="{ gap: total ? '2px' : '0' }">
          <template v-if="total > 0">
            <template v-for="[st] in TABS" :key="st">
              <div v-if="count(st) > 0" :style="{ flex: count(st), background: DOT[st] }" />
            </template>
          </template>
        </div>
        <div class="row legend">
          <div v-for="[st, l] in TABS" :key="st" class="row legend__i">
            <span class="dot" :style="{ background: DOT[st] }" /><span class="t-c1 c-med">{{ count(st) }} {{ l.toLowerCase() }}</span>
          </div>
        </div>
        <div class="divider" />
        <div class="row stats">
          <div class="row grow stats__i">
            <AppIcon name="cashIn" :size="20" color="var(--blu-color-info-icon-default, #0072ff)" />
            <div class="col grow"><span class="t-c1 c-med">Cashback terverifikasi</span><span class="t-s2">{{ rp(cashback) }}</span></div>
          </div>
          <div class="stats__sep" />
          <div class="row grow stats__i">
            <AppArt name="badge-gold" :width="18" />
            <div class="col grow"><span class="t-c1 c-med">Poin dari scan</span><span class="t-s2">+{{ fmt(poin) }}</span></div>
          </div>
        </div>
      </div>

      <div>
        <BliTabs :model-value="tab" variant="fixed" @update:model-value="(k: string) => k !== tab && setTab(k as ScanSt)">
          <BliTab v-for="[st, l] in TABS" :key="st" :value="st">{{ l }} ({{ count(st) }})</BliTab>
        </BliTabs>
        <div class="scan__list col">
          <label class="scan__search row">
            <AppIcon name="search" :size="18" />
            <input v-model="q" class="scan__input t-b2" placeholder="Cari produk atau IMEI" autocapitalize="none" />
            <button v-if="q" aria-label="Hapus" @click="q = ''"><AppIcon name="close" :size="16" /></button>
          </label>

          <template v-if="list.length === 0">
            <p v-if="q" class="t-c1 c-med center scan__none">Tidak ada hasil untuk “{{ q }}”.</p>
            <div v-else class="card scan__empty">
              <div class="scan__emptyimg">
                <img :src="IMG.routinePayments" class="e1" alt="" />
                <img :src="IMG.warning" class="e2" alt="" />
              </div>
              <span class="t-s2">Belum ada data</span>
              <span class="t-c1 c-med center">Yuk, scan IMEI produk terjual untuk klaim cashback.</span>
              <BliButton size="small" @click="openCamera">
                <template #item-leading><AppIcon name="scanNav" :size="18" color="#fff" /></template>
                Scan IMEI
              </BliButton>
            </div>
          </template>
          <div v-else class="card scan__rows">
            <div v-for="(s, i) in list" :key="s.imei" class="scan__row row" :class="{ first: i === 0 }">
              <div class="scan__thumb">
                <img v-if="s.productId && PRODUCTS[s.productId]" :src="PRODUCTS[s.productId].img" class="p" alt="" />
                <img v-else :src="IMG.device" class="d" alt="" />
                <img v-if="s.st === 'fail'" :src="IMG.warning" class="w" alt="" />
              </div>
              <div class="col grow">
                <span class="t-s2 ellipsis">{{ s.product }}</span>
                <span class="t-c1 c-med">{{ s.imei }}</span>
                <span v-if="s.st === 'ok'" class="t-c1 c-ok">{{ okLine(s.cashback, s.pts) }}</span>
                <span v-else-if="s.st === 'pending'" class="t-c1 c-med">Mencocokkan No. Seri dengan data pembelian…</span>
                <span v-else class="t-c1 c-danger">{{ s.reason }}</span>
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  </div>
</template>

<style scoped lang="scss">
.scan { background: $blu-color-neutral-background-low; }
.screen__scroll { display: flex; flex-direction: column; gap: $blu-spacing-m; padding-top: calc(env(safe-area-inset-top) + 8px); overflow-y: auto; }
.scan__top { padding: 0 $blu-spacing-m; h1 { margin: 0; } }
.scan__poin {
  display: flex; align-items: center; gap: 6px; height: 32px; padding: 0 12px; border-radius: 16px;
  background: $blu-color-neutral-background-default; border: 1px solid $blu-color-neutral-border-low;
}
.scan__sum { margin: 0 $blu-spacing-m; display: flex; flex-direction: column; gap: 12px; .row { gap: 12px; } }
.scan__bar { display: flex; height: 6px; border-radius: 3px; overflow: hidden; background: $blu-color-neutral-background-med; }
.legend__i { gap: 4px; }
.dot { width: 8px; height: 8px; border-radius: 4px; }
.stats__i { gap: 8px; flex: 1; }
.stats__sep { width: 1px; align-self: stretch; background: $blu-color-neutral-border-low; }
.scan__list { padding: $blu-spacing-m; gap: 12px; }
.scan__search {
  height: 40px; border-radius: 8px; background: $blu-color-neutral-background-default; border: 1px solid $blu-color-neutral-border-low; padding: 0 12px; gap: 8px;
}
.scan__input { flex: 1; min-width: 0; border: 0; outline: 0; background: transparent; color: $blu-color-neutral-text-high; padding: 0; }
.scan__none { padding: 24px 0; margin: 0; }
.scan__empty { display: flex; flex-direction: column; align-items: center; gap: 8px; padding: 24px $blu-spacing-m; .e1, .e2 { position: absolute; } }
.scan__emptyimg { position: relative; width: 64px; height: 64px; .e1 { left: 0.4px; top: 3px; width: 63.7px; height: 63.7px; } .e2 { left: 32.4px; top: 32px; width: 29.3px; height: 29.3px; } }
.scan__rows { padding: 4px $blu-spacing-m; }
.scan__row { gap: 12px; padding: 12px 0; align-items: flex-start; border-top: 1px solid $blu-color-neutral-border-low; &.first { border-top: 0; } }
.scan__thumb {
  position: relative; width: 48px; height: 48px; border-radius: 8px; overflow: hidden; flex: none; background: $blu-color-neutral-background-low;
  display: flex; align-items: center; justify-content: center;
  .p { width: 44px; height: 44px; object-fit: contain; } .d { width: 32px; height: 32px; }
  .w { position: absolute; right: 2px; bottom: 2px; width: 18px; height: 18px; }
}
</style>
