<script setup lang="ts">
import BliModalHeader from '@blibli/blue.modal/dist/modal/blue/ModalHeader';
import BliModalBody from '@blibli/blue.modal/dist/modal/blue/ModalBody';
import BliRadio from '@blibli/blue.radio/dist/radio/blue/Radio';
import { SALES, SALES_RANGES, type SalesRange } from '@/data';

/** "Rentang waktu" sheet for Performa. `onPick` is called with the chosen range. */
defineProps<{ range: SalesRange; onPick: (r: SalesRange) => void }>();
const emit = defineEmits<{ (e: 'close'): void }>();
</script>

<template>
  <div>
    <BliModalHeader title="Rentang waktu" @close="emit('close')" />
    <BliModalBody>
      <div class="rs">
        <button v-for="(r, i) in SALES_RANGES" :key="r" type="button" class="rs__row" :class="{ 'rs__row--sep': i }" @click="onPick(r)">
          <div class="grow col">
            <span class="t-s2">{{ r }} bulan terakhir</span>
            <span class="t-c1 c-med">{{ SALES[SALES.length - r].l.replace(' 2026', '') }} – November 2026</span>
          </div>
          <BliRadio :model-value="range" :value="r" @click.prevent />
        </button>
      </div>
    </BliModalBody>
  </div>
</template>

<style scoped lang="scss">
.rs { padding-bottom: 16px; }
.rs__row { width: 100%; display: flex; align-items: center; gap: 12px; padding: 14px 0; text-align: left; cursor: pointer; &--sep { border-top: 1px solid $blu-color-neutral-border-low; } }
</style>
