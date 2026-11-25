<script setup lang="ts">
import { computed, onBeforeUnmount, onMounted, ref } from 'vue';
import type { SalesPt } from '@/data';

/** "Performa belanja" line chart (Figma home/performa). Hover (pointer move) or touch-drag picks the
 *  nearest month and shows a tooltip; leaving returns to the default label on the latest month. */
const props = defineProps<{ data: SalesPt[] }>();
const H = 132, TOP = 10, BOTTOM = 100, X0 = 44, LBL = 30, GRID = 36, TW = 128;

const root = ref<HTMLElement>();
const w = ref(296);
const sel = ref<number | null>(null);
let ro: ResizeObserver | undefined;
onMounted(() => {
  if (root.value) { w.value = root.value.clientWidth || 296; ro = new ResizeObserver(() => { w.value = root.value?.clientWidth || w.value; }); ro.observe(root.value); }
});
onBeforeUnmount(() => ro?.disconnect());

const last = computed(() => props.data.length - 1);
const X1 = computed(() => w.value - 16);
const vals = computed(() => props.data.map(d => d.v));
const lo = computed(() => Math.floor((Math.min(...vals.value) - 20) / 100) * 100);
const hi = computed(() => Math.ceil((Math.max(...vals.value) + 20) / 100) * 100);
const ticks = computed(() => { const r: number[] = []; for (let t = lo.value; t <= hi.value; t += 100) r.push(t); return r; });
const y = (v: number) => BOTTOM - ((v - lo.value) / (hi.value - lo.value)) * (BOTTOM - TOP);
const step = computed(() => (last.value ? (X1.value - X0) / last.value : 0));
const x = (i: number) => (last.value ? X0 + i * step.value : (X0 + X1.value) / 2);
const avg = computed(() => Math.round(vals.value.reduce((a, b) => a + b, 0) / vals.value.length));
const line = computed(() => props.data.map((d, i) => `${i ? 'L' : 'M'}${x(i)} ${y(d.v)}`).join(' '));
const area = computed(() => `${line.value} L${x(last.value)} ${BOTTOM} L${x(0)} ${BOTTOM} Z`);
const labelEvery = computed(() => (props.data.length > 6 ? 2 : 1));

const i = computed(() => sel.value ?? last.value);
const d = computed(() => props.data[i.value]);
const delta = computed(() => (i.value > 0 ? Math.round(((d.value.v - props.data[i.value - 1].v) / props.data[i.value - 1].v) * 100) : null));
const tipLeft = computed(() => Math.max(0, Math.min(w.value - TW, x(i.value) - TW / 2)));
const tipTop = computed(() => (y(d.value.v) - 70 < -8 ? y(d.value.v) + 14 : y(d.value.v) - 70));

const pick = (e: PointerEvent) => {
  const px = e.clientX - (root.value?.getBoundingClientRect().left ?? 0);
  sel.value = Math.max(0, Math.min(last.value, Math.round((px - X0) / (step.value || 1))));
};
const clear = () => { sel.value = null; };
</script>

<template>
  <div ref="root" class="sc" :style="{ height: H + 'px' }" @pointerdown="pick" @pointermove="pick" @pointerleave="clear" @pointercancel="clear" @pointerup.passive="(e: PointerEvent) => e.pointerType === 'touch' && clear()">
    <svg :width="w" :height="H">
      <g v-for="t in ticks" :key="t">
        <line :x1="GRID" :x2="X1 + 8" :y1="y(t)" :y2="y(t)" class="sc__grid" />
        <text :x="LBL" :y="y(t) + 4" class="sc__lbl" text-anchor="end">{{ t }}jt</text>
      </g>
      <path :d="area" class="sc__area" />
      <line :x1="GRID" :x2="X1 + 8" :y1="y(avg)" :y2="y(avg)" class="sc__avg" stroke-dasharray="4 4" />
      <text :x="X1 + 4" :y="y(avg) + 14" class="sc__lbl" text-anchor="end">Rata-rata Rp{{ avg }}jt</text>
      <line v-if="sel !== null" :x1="x(i)" :x2="x(i)" :y1="TOP - 4" :y2="BOTTOM" class="sc__guide" stroke-dasharray="3 3" />
      <path :d="line" fill="none" class="sc__line" stroke-width="2" stroke-linecap="round" stroke-linejoin="round" />
      <template v-for="(p, k) in data" :key="p.s">
        <circle v-if="k === i" :cx="x(k)" :cy="y(p.v)" r="6" class="sc__dot sc__dot--on" stroke-width="2" />
        <circle v-else :cx="x(k)" :cy="y(p.v)" r="4" class="sc__dot" stroke-width="2" />
      </template>
      <text v-if="sel === null" :x="x(last) - 4" :y="y(data[last].v) - 10" class="sc__lbl sc__lbl--hi" text-anchor="end">Rp{{ data[last].v }}jt</text>
      <template v-for="(p, k) in data" :key="'m' + p.s">
        <text v-if="(last - k) % labelEvery === 0 || k === i" :x="x(k)" y="124" class="sc__lbl" :class="{ 'sc__lbl--hi': k === i, 'sc__lbl--b': k === i }" text-anchor="middle">{{ p.s }}</text>
      </template>
    </svg>
    <div v-if="sel !== null" class="sc__tip" :style="{ left: tipLeft + 'px', top: tipTop + 'px', width: TW + 'px' }">
      <span class="t-c2" style="color: rgba(255, 255, 255, 0.7)">{{ d.l }}</span>
      <span class="t-s2 c-inv">Rp{{ d.v }}jt</span>
      <span v-if="delta !== null" class="t-c2" :style="{ color: delta >= 0 ? '#7ee08f' : '#ff9c9c' }">{{ delta >= 0 ? '↗' : '↘' }} {{ Math.abs(delta) }}% dari {{ data[i - 1].s }}</span>
    </div>
  </div>
</template>

<style scoped lang="scss">
.sc { position: relative; touch-action: pan-y; user-select: none; svg { display: block; } }
.sc__grid { stroke: $blu-color-neutral-border-low; }
.sc__lbl { font-size: 12px; font-weight: 500; fill: $blu-color-neutral-text-med; font-family: inherit; &--hi { fill: $blu-color-neutral-text-high; } &--b { font-weight: 600; } }
.sc__area { fill: $blu-color-info-background-low; opacity: 0.8; }
.sc__avg { stroke: $blu-color-neutral-text-med; }
.sc__guide { stroke: $blu-color-info-background-high; opacity: 0.6; }
.sc__line { stroke: $blu-color-info-background-high; }
.sc__dot { fill: #fff; stroke: $blu-color-info-background-high; &--on { fill: $blu-color-info-background-high; stroke: #fff; } }
.sc__tip { position: absolute; pointer-events: none; background: #19222a; border-radius: 8px; padding: 6px 10px; display: flex; flex-direction: column; gap: 1px; box-sizing: border-box; }
</style>
