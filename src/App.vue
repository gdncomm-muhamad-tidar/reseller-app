<script setup lang="ts">
import OverlayHost from './components/OverlayHost.vue';
import MagicFab from './components/MagicFab.vue';
import { computed } from 'vue';
import { useRoute } from 'vue-router';

/** Screens that have a tablet/desktop layout get the full browser width; the rest stay phone-width. */
const WIDE = ['/home'];
const route = useRoute();
const wide = computed(() => WIDE.includes(route.path));
</script>

<template>
  <div class="stage">
    <div class="phone" :class="{ 'phone--wide': wide }">
      <RouterView v-slot="{ Component, route }">
        <Transition name="dissolve" mode="out-in">
          <component :is="Component" :key="route.path.startsWith('/home') || ['/katalog', '/scan', '/pesanan', '/finansial'].includes(route.path) ? 'tabs' : route.path" />
        </Transition>
      </RouterView>
      <MagicFab />
      <OverlayHost />
    </div>
  </div>
</template>

<style lang="scss">
/* On desktop the app is shown as a phone-width column; on a phone it fills the screen.
   .phone--wide screens (Home) fill the browser and adapt via `@container phone` queries:
   ≥600px = tablet, ≥1024px = desktop. Other screens keep the 430px column, so those queries never fire there. */
.stage { min-height: 100%; display: flex; justify-content: center; background: $blu-color-neutral-background-med; }
.phone {
  position: relative; width: 100%; max-width: 430px; height: 100dvh; overflow: hidden;
  background: $blu-color-neutral-background-low; display: flex; flex-direction: column;
  container: phone / inline-size;
  @media (min-width: 500px) { box-shadow: $blu-shadow-med; }
  &--wide { max-width: none; @media (min-width: 500px) { box-shadow: none; } }
}
.dissolve-enter-active, .dissolve-leave-active { transition: opacity 0.14s ease; }
.dissolve-enter-from, .dissolve-leave-to { opacity: 0; }
/* Every screen is a flex column that fills .phone and scrolls inside */
.screen { flex: 1; min-height: 0; display: flex; flex-direction: column; background: $blu-color-neutral-background-low; position: relative; }
.screen__scroll { flex: 1; min-height: 0; overflow-y: auto; overflow-x: hidden; -webkit-overflow-scrolling: touch; }
</style>
