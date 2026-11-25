<script setup lang="ts">
import { ref, watch, nextTick } from 'vue';
import BliModal from '@blibli/blue.modal/dist/modal/blue/Modal';
import Confetti from './Confetti.vue';
import { sheet, sheetVisible, closeSheet } from '@/composables/overlay';

/** Confetti starts once the sheet has settled, from the trophy (modal header 56 + body 4 + half of the 112 medallion). */
const burst = ref<number | null>(null);
watch(sheetVisible, async v => {
  burst.value = null;
  if (!v || !sheet.value?.confetti) return;
  await nextTick();
  setTimeout(() => {
    if (!sheetVisible.value) return;
    const panel = document.querySelector<HTMLElement>('.blu-modal__body, .blu-modal-body')?.closest<HTMLElement>('.blu-modal__content, .blu-modal__dialog, .blu-modal') ?? null;
    const h = panel?.getBoundingClientRect().height ?? 330;
    burst.value = Math.max(80, window.innerHeight - h + 116);
  }, 420);
});
</script>

<template>
  <BliModal :active="sheetVisible" type="drawer" position="bottom" @blur="closeSheet()">
    <component :is="sheet.comp" v-if="sheet" v-bind="sheet.props" @close="closeSheet" />
  </BliModal>
  <Teleport to="body">
    <div v-if="burst !== null" class="confetti-layer"><Confetti :oy="burst" /></div>
  </Teleport>
</template>

<style>
.confetti-layer { position: fixed; inset: 0; z-index: 10000; pointer-events: none; display: flex; justify-content: center; }
.confetti-layer > .confetti { position: relative; width: 100%; max-width: 430px; height: 100%; }
</style>
