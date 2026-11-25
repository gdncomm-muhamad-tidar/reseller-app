<script setup lang="ts">
import AppIcon from './AppIcon.vue';
import { goBack } from '@/nav';

/** White page header (BLUE header-simple look): back + title + right slot. `onBack` overrides history back. */
const props = defineProps<{ title: string; noBack?: boolean; onBack?: () => void }>();
const back = () => (props.onBack ? props.onBack() : goBack());
</script>

<template>
  <header class="hdr">
    <div class="hdr__bar">
      <button v-if="!noBack" class="hdr__back" aria-label="Kembali" @click="back"><AppIcon name="back" :size="24" /></button>
      <div class="hdr__title t-t2 ellipsis">{{ title }}</div>
      <slot name="right" />
    </div>
    <slot />
  </header>
</template>

<style scoped lang="scss">
.hdr { background: $blu-color-neutral-background-default; flex: none; padding-top: env(safe-area-inset-top); }
.hdr__bar { height: 56px; padding: 0 $blu-spacing-m; display: flex; align-items: center; gap: $blu-spacing-m; }
.hdr__back { display: flex; padding: 0; }
.hdr__title { flex: 1; min-width: 0; }
</style>
