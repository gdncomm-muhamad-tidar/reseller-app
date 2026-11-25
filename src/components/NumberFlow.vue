<script setup lang="ts">
import { computed, nextTick, onBeforeUnmount, onMounted, ref, watch } from 'vue';
import { fmt } from '@/theme';
import NumberFlowDigit from './NumberFlowDigit.vue';

/** Odometer-style number transition: changed digits spin vertically (up when growing, down when
 *  shrinking) while each column eases to its new width. `continuous`: every digit right of the highest
 *  changed digit also spins one extra turn. Font styling comes from class/style on the root;
 *  `lineHeight` (px) is optional; defaults to the computed line-height. Edges fade into `fadeColor`. */
const props = withDefaults(defineProps<{ value: number; prefix?: string; lineHeight?: number; duration?: number; continuous?: boolean; fadeColor?: string }>(), { prefix: '', duration: 1000, continuous: false });
const emit = defineEmits<{ (e: 'done', from: number, to: number): void }>();

const rootEl = ref<HTMLElement>();
const lhAuto = ref(0);
const lh = computed(() => props.lineHeight ?? lhAuto.value);
const w = ref<number[]>([]);
const measureEl = ref<HTMLElement>();
const measured = computed(() => w.value.length === 10 && w.value.every(x => x > 0));
const measure = () => {
  const kids = measureEl.value?.children;
  if (!kids) return;
  const next = Array.from(kids).map(k => (k as HTMLElement).getBoundingClientRect().width);
  if (next.every(x => x > 0)) w.value = next;
};
onMounted(async () => {
  if (rootEl.value && props.lineHeight == null) {
    const cs = getComputedStyle(rootEl.value);
    lhAuto.value = parseFloat(cs.lineHeight) || parseFloat(cs.fontSize) * 1.2;
  }
  await nextTick(); measure(); document.fonts?.ready.then(measure); });

let prev = props.value;
const run = ref({ from: props.value, to: props.value, n: 0 });
let doneT: ReturnType<typeof setTimeout> | undefined;
watch(() => props.value, v => {
  if (v === prev) return;
  run.value = { from: prev, to: v, n: run.value.n + 1 };
  prev = v;
  clearTimeout(doneT);
  const { from, to } = run.value;
  doneT = setTimeout(() => emit('done', from, to), props.duration);
});
onBeforeUnmount(() => clearTimeout(doneT));

const cols = computed(() => {
  const to = fmt(run.value.to), from = fmt(run.value.from), trend = Math.sign(run.value.to - run.value.from);
  let hi = -1;
  for (let i = 0; i < Math.max(to.length, from.length); i++) if (to[to.length - 1 - i] !== from[from.length - 1 - i]) hi = i;
  const out: { key: string; ch: string; to: number; from: number | null; trend: number; extra: number }[] = [];
  for (let i = 0; i < to.length; i++) {
    const t = to[to.length - 1 - i], f = from[from.length - 1 - i];
    const digit = t >= '0' && t <= '9';
    out.unshift({ key: (digit ? 'd' : 's') + i, ch: t, to: digit ? +t : 0, from: f !== undefined && f >= '0' && f <= '9' ? +f : null, trend, extra: props.continuous && trend && i < hi ? 10 : 0 });
  }
  return out;
});
</script>

<template>
  <span ref="rootEl" class="nf" :style="lh ? { height: lh + 'px', lineHeight: lh + 'px' } : undefined" :aria-label="prefix + fmt(value)" role="text">
    <span ref="measureEl" class="nf__measure" aria-hidden="true"><span v-for="d in 10" :key="d">{{ d - 1 }}</span></span>
    <span>{{ prefix }}</span>
    <template v-if="measured && lh">
      <template v-for="c in cols" :key="c.key">
        <span v-if="c.key[0] === 's'">{{ c.ch }}</span>
        <NumberFlowDigit v-else :to="c.to" :from="c.from" :trend="c.trend" :extra="c.extra" :n="run.n" :lh="lh" :w="w" :duration="duration" />
      </template>
    </template>
    <span v-else>{{ fmt(run.to) }}</span>
    <template v-if="fadeColor">
      <span class="nf__fade" :style="{ top: 0, height: lh * 0.18 + 'px', background: `linear-gradient(${fadeColor}, transparent)` }" />
      <span class="nf__fade" :style="{ bottom: 0, height: lh * 0.18 + 'px', background: `linear-gradient(transparent, ${fadeColor})` }" />
    </template>
  </span>
</template>

<style scoped lang="scss">
.nf { position: relative; display: inline-flex; white-space: nowrap; }
.nf__measure { position: absolute; visibility: hidden; display: flex; pointer-events: none; }
.nf__fade { position: absolute; left: 0; right: 0; pointer-events: none; }
</style>
