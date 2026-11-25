<script setup lang="ts">
import BliModalHeader from '@blibli/blue.modal/dist/modal/blue/ModalHeader';
import BliModalBody from '@blibli/blue.modal/dist/modal/blue/ModalBody';
import { NET_DAYS } from '@/data';

/** Dropdown option sheet: "Pilih jangka waktu", plain list items with dividers */
defineProps<{ value?: number; onPick: (d: number) => void }>();
</script>

<template>
  <div>
    <BliModalHeader keep-alive><template #title>Pilih jangka waktu</template></BliModalHeader>
    <BliModalBody has-no-padding>
      <div class="net">
        <template v-for="(d, i) in NET_DAYS" :key="d">
          <div v-if="i > 0" class="net__div" />
          <button class="net__item t-b1" :class="{ 'c-info': value === d }" @click="onPick(d)">Net - {{ d }} hari</button>
        </template>
      </div>
    </BliModalBody>
  </div>
</template>

<style scoped lang="scss">
.net { padding-bottom: $blu-spacing-s; }
.net__div { height: 1px; margin: 0 $blu-spacing-s; background: $blu-color-neutral-border-default; }
.net__item { display: block; width: 100%; text-align: left; padding: $blu-spacing-m; &:active { background: $blu-color-neutral-background-low; } }
</style>
