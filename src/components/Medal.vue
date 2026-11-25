<script setup lang="ts">
import { IMG, TIER_TINT, type TierKey } from '@/data';

/** Tier medal (3D asset, tinted per tier). */
withDefaults(defineProps<{ tier: TierKey; size?: number; ring?: boolean }>(), { size: 40 });
</script>

<template>
  <div class="medal" :style="{ width: size + 'px', height: size + 'px', background: TIER_TINT[tier], border: ring ? '2px solid #fff' : 'none' }">
    <img :src="IMG.medal" alt="" draggable="false" :style="{ width: size * 0.72 + 'px', height: size * 0.72 + 'px', opacity: tier === 'gold' ? 1 : 0.95 }" />
  </div>
</template>

<style scoped lang="scss">
.medal { border-radius: 50%; display: flex; align-items: center; justify-content: center; box-sizing: border-box; flex: none; img { object-fit: contain; } }
</style>
