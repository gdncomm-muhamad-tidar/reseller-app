<script setup lang="ts">
import BliBadge from '@blibli/blue.badge/dist/badge/blue/Badge';
import AppIcon from './AppIcon.vue';

/** Figma product-label (badge extra-small). kind: promo | down | pre | pop | disc */
const props = defineProps<{ kind: 'promo' | 'down' | 'pre' | 'pop' | 'disc'; label: string }>();
const COLOR = { promo: 'green', down: 'green', pre: 'gray', pop: 'magenta', disc: 'red' } as const;
</script>

<template>
  <span class="plabel">
    <BliBadge :color="COLOR[props.kind]" :prominence="props.kind === 'disc' ? 'primary' : 'secondary'" size="extra-small">
      <template v-if="props.kind === 'down'" #item-leading><AppIcon name="trendDown" :size="12" color="currentColor" /></template>
      {{ label }}
    </BliBadge>
  </span>
</template>

<style scoped lang="scss">
.plabel { display: inline-flex; align-self: flex-start; }
</style>
