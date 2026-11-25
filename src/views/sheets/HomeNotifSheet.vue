<script setup lang="ts">
import BliModalHeader from '@blibli/blue.modal/dist/modal/blue/ModalHeader';
import BliModalBody from '@blibli/blue.modal/dist/modal/blue/ModalBody';
import AppIcon from '@/components/AppIcon.vue';
import CircleIcon from '@/components/CircleIcon.vue';
import { IMG, UNSCANNED } from '@/data';
import { openFin } from '@/nav';
import { router } from '@/router';
import { closeSheet } from '@/composables/overlay';

const emit = defineEmits<{ close: [] }>();
const items: [string, string, string, () => void][] = [
  [IMG.trophy0, 'Misi Aksesori tercapai', 'Credit note Rp130.000 masuk · baru saja', () => closeSheet(() => openFin('cn'))],
  [IMG.money, 'Invoice INV/0062/2026 jatuh tempo 3 hari', 'Rp10.398.000 · Net 30 · 19 Nov', () => closeSheet(() => openFin('inv'))],
  [IMG.scan, `${UNSCANNED.length} IMEI belum discan`, 'Scan untuk dapat poin & credit note', () => closeSheet(() => router.push('/scan'))],
];
</script>

<template>
  <div>
    <BliModalHeader @close="emit('close')"><template #title>Notifikasi</template></BliModalHeader>
    <BliModalBody>
      <button v-for="([img, t, s, on], i) in items" :key="i" class="item" type="button" @click="on">
        <CircleIcon bg="var(--blu-color-info-background-default)"><img :src="img" alt="" width="28" height="28" /></CircleIcon>
        <div class="grow col item__txt"><span class="t-s2 c-text">{{ t }}</span><span class="t-c1 c-med">{{ s }}</span></div>
        <AppIcon name="chev" :size="16" />
      </button>
    </BliModalBody>
  </div>
</template>

<style scoped lang="scss">
.item { display: flex; align-items: center; gap: $blu-spacing-s; width: 100%; padding: $blu-spacing-s 0; text-align: left; background: none; border: 0; cursor: pointer;
  & + & { border-top: 1px solid $blu-color-neutral-border-low; } }
.item__txt { gap: 2px; }
</style>
