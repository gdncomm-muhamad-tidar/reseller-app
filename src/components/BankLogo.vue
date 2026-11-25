<script setup lang="ts">
import { computed } from 'vue';
import { BANK_LOGO, BANKS } from '@/data';

/** Bank logo chip (34x34). */
const props = defineProps<{ b: string }>();
const logo = computed(() => BANK_LOGO[props.b]);
const fallbackBg = computed(() => BANKS.find(x => x[0] === props.b)?.[1] ?? '#0072ff');
const FIT = { contain: 'contain', cover: 'cover', stretch: 'fill' } as const;
</script>

<template>
  <div v-if="!logo" class="bl bl--txt" :style="{ background: fallbackBg }"><span class="t-c2b c-inv">{{ b.slice(0, 4) }}</span></div>
  <div v-else class="bl">
    <img :src="logo.src" alt="" draggable="false" :style="{ left: logo.box[0] + 'px', top: logo.box[1] + 'px', width: logo.box[2] + 'px', height: logo.box[3] + 'px', objectFit: FIT[logo.fit] }" />
  </div>
</template>

<style scoped lang="scss">
.bl { position: relative; width: 34px; height: 34px; overflow: hidden; flex: none; img { position: absolute; } }
.bl--txt { border-radius: 6px; display: flex; align-items: center; justify-content: center; }
</style>
