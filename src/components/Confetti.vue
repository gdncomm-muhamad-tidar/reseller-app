<script setup lang="ts">
/** Confetti burst from (ox, oy) inside the nearest positioned parent. 70 pieces, 1s flight. */
const props = withDefaults(defineProps<{ ox?: number; oy: number; dur?: number }>(), { dur: 1000 });
const PAL = ['#0072ff', '#ffcd00', '#1f912e', '#ebbf4f', '#1d8fff', '#d33534'];
const W = typeof window !== 'undefined' ? Math.min(window.innerWidth, 430) : 430;
const ox = props.ox ?? W / 2;
const pieces = Array.from({ length: 70 }).map((_, i) => {
  const up = Math.random() < 0.85;
  const th = up ? -Math.PI * (0.05 + 0.9 * Math.random()) : Math.PI * (0.1 + 0.8 * Math.random());
  const d = 90 + Math.random() * Math.min(230, W * 0.6);
  const rect = i % 3 === 2;
  const size = rect ? [6, 12] : i % 3 ? [6, 6] : [9, 9];
  const bx = Math.cos(th) * d * 1.1, by = Math.sin(th) * d * 1.2, fall = 260 + Math.random() * 360, drift = (Math.random() - 0.5) * 120;
  return {
    style: {
      left: ox - size[0] / 2 + 'px', top: props.oy - size[1] / 2 + 'px', width: size[0] + 'px', height: size[1] + 'px',
      borderRadius: rect ? '2px' : '99px', background: PAL[i % PAL.length], animationDuration: props.dur + 'ms',
      '--bx': bx + 'px', '--by': by + 'px', '--ex': bx + drift + 'px', '--ey': by + fall * 0.5 + 'px', '--rot': Math.random() * 540 - 270 + 'deg',
    } as Record<string, string>,
  };
});
</script>

<template>
  <div class="confetti"><span v-for="(p, i) in pieces" :key="i" class="confetti__p" :style="p.style" /></div>
</template>

<style scoped lang="scss">
.confetti { position: absolute; inset: 0; pointer-events: none; overflow: hidden; z-index: 1000; }
.confetti__p { position: absolute; opacity: 0; animation: confetti-fly 1s cubic-bezier(0.25, 0.46, 0.45, 0.94) forwards; }
@keyframes confetti-fly {
  0% { opacity: 0; transform: translate(0, 0) rotate(0) scale(0.3); }
  6% { opacity: 1; }
  45% { transform: translate(var(--bx), var(--by)) rotate(calc(var(--rot) * 0.45)) scale(1); }
  70% { opacity: 1; }
  100% { opacity: 0; transform: translate(var(--ex), var(--ey)) rotate(var(--rot)) scale(1); }
}
</style>
