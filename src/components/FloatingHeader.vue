<script setup lang="ts">
import { computed, watchEffect } from 'vue';
import { goBack } from '@/nav';
import AppIcon from './AppIcon.vue';

/** Floating header: transparent over the hero, white header-simple after the threshold.
 *  tone="light" -> white back/title on the hero; tone="dark" -> dark content on a light hero. */
const props = withDefaults(defineProps<{ title: string; scrollY: number; threshold: number; solid: boolean; tone?: 'light' | 'dark'; heroColor: string }>(), { tone: 'light' });
const p = computed(() => Math.max(0, Math.min(1, (props.scrollY - (props.threshold - 32)) / 32)));
watchEffect(() => {
  const m = document.querySelector('meta[name="theme-color"]');
  m?.setAttribute('content', props.solid ? '#ffffff' : props.heroColor);
});
</script>

<template>
  <div class="fh">
    <div class="fh__bg" :style="{ opacity: p }" />
    <div class="fh__pad">
      <div v-if="tone === 'dark'" class="fh__bar">
        <button type="button" class="fh__back" aria-label="Kembali" @click="goBack"><AppIcon name="back" :size="24" /></button>
        <span class="t-s1 c-text ellipsis grow">{{ title }}</span><slot name="right" />
      </div>
      <div v-else class="fh__stack">
        <div class="fh__bar" :style="{ opacity: 1 - p, pointerEvents: solid ? 'none' : 'auto' }">
          <button type="button" class="fh__back" aria-label="Kembali" @click="goBack"><AppIcon name="back" :size="24" color="#fff" /></button>
          <span class="t-s1 c-inv ellipsis grow">{{ title }}</span><slot name="right" />
        </div>
        <div class="fh__bar fh__bar--abs" :style="{ opacity: p, pointerEvents: solid ? 'auto' : 'none' }">
          <button type="button" class="fh__back" aria-label="Kembali" @click="goBack"><AppIcon name="back" :size="24" /></button>
          <span class="t-s1 c-text ellipsis grow">{{ title }}</span><slot name="right" />
        </div>
      </div>
    </div>
  </div>
</template>

<style scoped lang="scss">
.fh { position: absolute; left: 0; right: 0; top: 0; z-index: 20; pointer-events: none; }
.fh__bg { position: absolute; inset: 0; background: $blu-color-neutral-background-default; border-bottom: 1px solid $blu-color-neutral-border-med; }
.fh__pad { position: relative; padding-top: env(safe-area-inset-top); }
.fh__stack { position: relative; }
.fh__bar { height: 56px; padding: 0 16px; display: flex; align-items: center; gap: 8px; pointer-events: auto; &--abs { position: absolute; left: 0; right: 0; top: 0; } }
.fh__back { display: flex; padding: 0; }
</style>
