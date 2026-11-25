<script setup lang="ts">
import AppIcon from './AppIcon.vue';
import { IMG } from '@/data';

/** Quarter streak months (Figma quarter-streak / months). */
withDefaults(defineProps<{ nowBorder?: string; nowPct?: number }>(), { nowBorder: 'var(--blu-color-info-background-default, #f3f9ff)', nowPct: 70 });
const M: [string, 'done' | 'now' | 'next' | 'gift'][] = [['Okt', 'done'], ['Nov', 'now'], ['Des', 'next'], ['Bonus', 'gift']];
</script>

<template>
  <div class="months">
    <div v-for="[m, s] in M" :key="m" class="mo" :class="`mo--${s}`" :style="s === 'now' ? { borderColor: nowBorder } : undefined">
      <div class="mo__head"><span class="t-c1">{{ m }}</span></div>
      <div class="mo__body">
        <template v-if="s === 'done'">
          <span class="mo__ok"><AppIcon name="check" :size="16" color="#fff" /></span><span class="t-c1 c-ok">Tercapai</span>
        </template>
        <template v-else-if="s === 'now'"><span class="t-s2">{{ nowPct }}%</span><span class="t-c1 c-med">Berjalan</span></template>
        <template v-else-if="s === 'next'"><img :src="IMG.monthNext" width="28" height="28" alt="" /><span class="t-c1 c-med">1 Des</span></template>
        <template v-else><AppIcon name="gift" :size="28" color="#BC6E06" /><span class="t-c1">CN Rp2,5jt</span></template>
      </div>
    </div>
  </div>
</template>

<style scoped lang="scss">
.months { display: flex; gap: 8px; align-items: stretch; }
.mo { flex: 1; border-radius: 8px; overflow: hidden; background: $blu-color-neutral-background-low; border: 0 solid transparent; box-sizing: border-box; }
.mo__head { padding: 4px 0; text-align: center; background: $blu-color-neutral-background-med; color: $blu-color-neutral-text-high; }
.mo__body { display: flex; flex-direction: column; align-items: center; justify-content: center; gap: 4px; padding: 8px 0; }
.mo__ok { width: 28px; height: 28px; border-radius: 16px; background: $blu-color-brand-success-background-med; display: flex; align-items: center; justify-content: center; }
.mo--now { border-width: 1.5px; background: $blu-color-info-background-low; .mo__head { background: $blu-color-info-background-high; color: #fff; } }
.mo--gift { background: #fff8e0; .mo__head { background: #feedb1; } }
</style>
