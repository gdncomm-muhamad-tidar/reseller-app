<script setup lang="ts">
import { useRoute, useRouter } from 'vue-router';
import AppIcon from './AppIcon.vue';
import type { IconName } from '@/icons';

/** Floating bottom nav (frosted glass). Tablet: centred pill; desktop: vertical rail on the left. */
const NAV: [string, IconName, string][] = [['home', 'home', 'Home'], ['katalog', 'grid', 'Katalog'], ['scan', 'scanNav', 'Scan IMEI'], ['pesanan', 'box', 'Order'], ['finansial', 'wallet', 'Finansial']];
const route = useRoute();
const router = useRouter();
const go = (n: string) => { if (route.path !== '/' + n) router.push('/' + n); };
</script>

<template>
  <nav class="nav">
    <button v-for="[name, ic, label] in NAV" :key="name" class="nav__btn" :class="{ on: route.path === '/' + name, scan: name === 'scan' }" @click="go(name)">
      <span v-if="name === 'scan'" class="nav__scan"><AppIcon :name="ic" :size="18" color="#fff" /></span>
      <AppIcon v-else :name="ic" :size="24" :color="route.path === '/' + name ? 'var(--blu-color-info-icon-default, #0072ff)' : 'rgba(25,34,42,0.7)'" />
      <span class="nav__label" :class="route.path === '/' + name || name === 'scan' ? 't-c2b' : 't-c2'">{{ label }}</span>
    </button>
  </nav>
</template>

<style scoped lang="scss">
.nav {
  position: absolute; left: 16px; right: 16px; bottom: calc(12px + env(safe-area-inset-bottom)); z-index: 20; display: flex; padding: 4px;
  border-radius: 32px; background: rgba(255, 255, 255, 0.78); backdrop-filter: blur(20px); -webkit-backdrop-filter: blur(20px); box-shadow: $blu-shadow-med;
}
.nav__btn { flex: 1; display: flex; flex-direction: column; align-items: center; gap: 2px; padding: 6px 0; border-radius: 28px; color: $blu-color-neutral-text-high; &.on { background: $blu-color-info-background-low; } }
.nav__label { .on &, .scan & { color: $blu-color-info-text-default; } }
.nav__label { white-space: nowrap; }
.nav__scan { width: 32px; height: 32px; border-radius: 16px; background: $blu-color-info-background-med; display: flex; align-items: center; justify-content: center; }
@media (hover: hover) { .nav__btn { transition: background-color 0.2s; &:hover:not(.on) { background-color: rgba(25, 34, 42, 0.05); } } }

@container phone (min-width: 600px) {
  .nav { left: 50%; right: auto; width: 480px; translate: -50% 0; }
}
@container phone (min-width: 1024px) {
  .nav { left: 24px; top: 50%; bottom: auto; width: 88px; translate: 0 -50%; flex-direction: column; gap: 4px; padding: 8px 4px; border-radius: 28px; }
  .nav__btn { flex: none; padding: 10px 0; border-radius: 20px; }
}
</style>
