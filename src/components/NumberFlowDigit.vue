<script setup lang="ts">
import { nextTick, onMounted, ref, watch } from 'vue';

/** One odometer column of NumberFlow (internal). */
const props = defineProps<{ to: number; from: number | null; trend: number; extra: number; n: number; lh: number; w: number[]; duration: number }>();
const STACK = [...'012345678901234567890123456789'];
const EASE = 'cubic-bezier(0.22, 1, 0.36, 1)';
const maxW = Math.max(...props.w);
const pos = ref(props.to);
const width = ref(props.w[props.to]);
const op = ref(1);
const anim = ref(false);
let snap: ReturnType<typeof setTimeout> | undefined;

const run = async () => {
  clearTimeout(snap);
  if (!props.n) { width.value = props.w[props.to]; return; }
  let s = props.to, e = props.to;
  const { from, to, trend, extra } = props;
  if (from !== null && (from !== to || extra)) {
    if (trend >= 0) { s = from; e = from + ((to - from + 10) % 10) + extra; }
    else { s = from + 20; e = s - ((from - to + 10) % 10) - extra; }
  }
  anim.value = false;
  pos.value = s; width.value = from === null ? 0 : props.w[from]; op.value = from === null ? 0 : 1;
  await nextTick();
  void document.body.offsetHeight; // reflow so the start state is committed
  anim.value = true;
  pos.value = e; width.value = props.w[to]; op.value = 1;
  snap = setTimeout(() => { anim.value = false; pos.value = to; }, props.duration + 30);
};
onMounted(() => { if (props.n) run(); });
watch(() => props.n, run);
</script>

<template>
  <span class="nfd" :style="{ width: width + 'px', height: lh + 'px', opacity: op, transition: anim ? `width ${duration}ms ${EASE}, opacity ${duration * 0.5}ms linear` : 'none' }">
    <span class="nfd__stack" :style="{ width: maxW + 'px', left: (width - maxW) / 2 + 'px', transform: `translateY(${-pos * lh}px)`, transition: anim ? `transform ${duration}ms ${EASE}, left ${duration}ms ${EASE}` : 'none' }">
      <span v-for="(d, i) in STACK" :key="i" class="nfd__d" :style="{ height: lh + 'px' }">{{ d }}</span>
    </span>
  </span>
</template>

<style scoped lang="scss">
.nfd { position: relative; display: inline-block; overflow: hidden; }
.nfd__stack { position: absolute; top: 0; display: flex; flex-direction: column; }
.nfd__d { display: block; text-align: center; }
</style>
