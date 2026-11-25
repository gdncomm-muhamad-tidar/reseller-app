<template>
  <footer class="foot"><slot /></footer>
</template>

<style scoped lang="scss">
/* Sticky footer: white bar with default elevation, buttons in a row */
.foot {
  flex: none; background: $blu-color-neutral-background-default; padding: $blu-spacing-m $blu-spacing-m calc(#{$blu-spacing-m} + env(safe-area-inset-bottom));
  display: flex; align-items: center; gap: $blu-spacing-m; box-shadow: 0 -2px 8px rgba(25, 34, 42, 0.08);
}
</style>
