<script setup lang="ts">
/** Figma product-photo (cart/checkout): white bg + photo + 5% black scrim. */
withDefaults(defineProps<{ src: string; size?: number }>(), { size: 48 });
</script>

<template>
  <div class="pp" :style="{ width: size + 'px', height: size + 'px' }">
    <img :src="src" :width="size" :height="size" alt="" draggable="false" />
    <div class="pp__scrim" />
  </div>
</template>

<style scoped lang="scss">
.pp { position: relative; border-radius: 8px; overflow: hidden; background: $blu-color-neutral-background-default; flex: none; img { display: block; object-fit: contain; } }
.pp__scrim { position: absolute; inset: 0; background: rgba(0, 0, 0, 0.05); pointer-events: none; }
</style>
