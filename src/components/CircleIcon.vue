<script setup lang="ts">
/** Round icon holder. Default slot = the icon. */
withDefaults(defineProps<{ bg?: string; size?: number }>(), { bg: 'var(--blu-color-info-background-low, #e1f1ff)', size: 40 });
</script>

<template>
  <div class="ci" :style="{ width: size + 'px', height: size + 'px', background: bg }"><slot /></div>
</template>

<style scoped lang="scss">
.ci { border-radius: 50%; display: flex; align-items: center; justify-content: center; flex: none; }
</style>
