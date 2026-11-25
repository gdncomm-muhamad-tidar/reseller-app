<script setup lang="ts">
import { computed } from 'vue';

/** Soft glow (Figma "glow/*"): ellipse as a radial gradient fading out ~2 sigma past the edge.
 *  cx is measured from the left, or from the right edge when `right` is set. */
const props = withDefaults(defineProps<{ color: string; cx: number; cy: number; rx: number; ry?: number; blur?: number; opacity?: number; right?: boolean }>(), { blur: 40, opacity: 1 });
const RX = computed(() => props.rx + props.blur * 2);
const RY = computed(() => (props.ry ?? props.rx) + props.blur * 2);
const core = computed(() => Math.max(0, props.rx - props.blur) / RX.value);
const id = computed(() => `glow-${props.color.replace('#', '')}-${props.cx}-${props.cy}`);
const pos = computed(() => ({ position: 'absolute' as const, pointerEvents: 'none' as const, top: props.cy - RY.value + 'px', ...(props.right ? { right: props.cx - RX.value + 'px' } : { left: props.cx - RX.value + 'px' }) }));
</script>

<template>
  <svg :width="RX * 2" :height="RY * 2" :style="pos">
    <defs>
      <radialGradient :id="id" cx="50%" cy="50%" r="50%">
        <stop :offset="core" :stop-color="color" :stop-opacity="opacity" />
        <stop offset="1" :stop-color="color" stop-opacity="0" />
      </radialGradient>
    </defs>
    <ellipse :cx="RX" :cy="RY" :rx="RX" :ry="RY" :fill="`url(#${id})`" />
  </svg>
</template>
