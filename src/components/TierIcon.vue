<script setup lang="ts">
import { computed } from 'vue';
import type { TierKey } from '@/data';
import type { ArtName } from '@/icons';
import AppArt from './AppArt.vue';

/** Tier icon (Figma btds_ic_tier_icon). */
const props = withDefaults(defineProps<{ tier: TierKey; size?: number }>(), { size: 40 });
const name = computed(() => (`tier-${props.tier}`) as ArtName);
</script>

<template><AppArt :name="name" :width="size" /></template>
