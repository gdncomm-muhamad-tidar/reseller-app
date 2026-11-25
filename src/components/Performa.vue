<script setup lang="ts">
import { computed, ref } from 'vue';
import { short } from '@/theme';
import { useStore } from '@/store';
import { closeSheet, openSheet } from '@/composables/overlay';
import { SALES, SALES_KPI, type SalesRange } from '@/data';
import AppIcon from './AppIcon.vue';
import SalesChart from './SalesChart.vue';
import PerformaRangeSheet from './PerformaRangeSheet.vue';

/** Figma home/performa: headline, line chart (hover/tap = month detail), KPI tiles; range is selectable. */
const { cnReady } = useStore();
const range = ref<SalesRange>(3);
const kpi = computed(() => SALES_KPI[range.value]);
const tiles = computed<[string, string, number][]>(() => [['Pesanan', kpi.value.orders[0], kpi.value.orders[1]], ['CN tersedia', short(cnReady.value), kpi.value.cnPct]]);
const pct = Math.round((SALES[SALES.length - 1].v / SALES[SALES.length - 2].v - 1) * 100);
const pickRange = () => openSheet(PerformaRangeSheet, { range: range.value, onPick: (r: SalesRange) => closeSheet(() => { range.value = r; }) });
</script>

<template>
  <div class="pf">
    <slot name="title" />
    <div class="card pf__card">
      <div class="row pf__head">
        <div class="row grow pf__big">
          <span class="t-t1">Rp{{ SALES[SALES.length - 1].v }}jt</span>
          <span class="row pf__up"><AppIcon name="trendUp" :size="16" color="var(--blu-color-success-icon-default, #1c832a)" /><span class="t-c1 c-ok">{{ pct }}% dari Oktober</span></span>
        </div>
        <button type="button" class="row pf__range" :aria-label="`Rentang ${range} bulan, ubah`" @click="pickRange">
          <span class="t-lbl c-info">{{ range }} bulan</span><AppIcon name="chevD" :size="16" color="var(--blu-color-info-icon-default, #0072ff)" />
        </button>
      </div>
      <SalesChart :key="range" :data="SALES.slice(-range)" />
      <div class="row pf__tiles">
        <div v-for="[l, v, p] in tiles" :key="l" class="pf__tile">
          <span class="t-c1 c-med ellipsis">{{ l }}</span>
          <span class="t-s2 ellipsis">{{ v }}</span>
          <span class="row pf__tp"><AppIcon name="arrowUp" :size="16" color="var(--blu-color-success-icon-default, #1c832a)" /><span class="t-lbl c-ok">{{ p }}%</span></span>
        </div>
      </div>
    </div>
  </div>
</template>

<style scoped lang="scss">
.pf { display: flex; flex-direction: column; gap: 12px; }
.pf__card { display: flex; flex-direction: column; gap: 12px; }
.pf__head { align-items: flex-end; gap: 6px; }
.pf__big { align-items: flex-end; gap: 6px; }
.pf__up { gap: 1px; padding-bottom: 3px; }
.pf__range { gap: 4px; padding-bottom: 2px; cursor: pointer; }
.pf__tiles { gap: 8px; align-items: stretch; }
.pf__tile { flex: 1; min-width: 0; background: $blu-color-neutral-background-low; border-radius: 8px; padding: 8px; display: flex; flex-direction: column; gap: 4px; }
.pf__tp { gap: 1px; }
</style>
