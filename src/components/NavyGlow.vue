<script setup lang="ts">
import Glow from './Glow.vue';
import AppArt from './AppArt.vue';

/** Decorations for the navy header (Figma "mission/header"): glow + supergraphic.
 *  Parent provides the position:relative; overflow:hidden gradient container. */
</script>

<template>
  <Glow color="#0072FF" :cx="40" :cy="30" :rx="130" :ry="110" :opacity="0.55" />
  <div class="ng"><AppArt name="supergraphic" :width="260" /></div>
</template>

<style scoped lang="scss">
.ng { position: absolute; top: -90px; right: -100px; pointer-events: none; }
</style>
