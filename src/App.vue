<script setup lang="ts">
import OverlayHost from './components/OverlayHost.vue';
import MagicFab from './components/MagicFab.vue';
</script>

<template>
  <div class="stage">
    <div class="phone">
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
/* On desktop the app is shown as a phone-width column; on a phone it fills the screen. */
.stage { min-height: 100%; display: flex; justify-content: center; background: $blu-color-neutral-background-med; }
.phone {
  position: relative; width: 100%; max-width: 430px; height: 100dvh; overflow: hidden;
  background: $blu-color-neutral-background-low; display: flex; flex-direction: column;
  @media (min-width: 500px) { box-shadow: $blu-shadow-med; }
}
.dissolve-enter-active, .dissolve-leave-active { transition: opacity 0.14s ease; }
.dissolve-enter-from, .dissolve-leave-to { opacity: 0; }
/* Every screen is a flex column that fills .phone and scrolls inside */
.screen { flex: 1; min-height: 0; display: flex; flex-direction: column; background: $blu-color-neutral-background-low; position: relative; }
.screen__scroll { flex: 1; min-height: 0; overflow-y: auto; overflow-x: hidden; -webkit-overflow-scrolling: touch; }
</style>
