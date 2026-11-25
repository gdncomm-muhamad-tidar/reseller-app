<script setup lang="ts">
import { ref } from 'vue';
import BliModalHeader from '@blibli/blue.modal/dist/modal/blue/ModalHeader';
import BliModalBody from '@blibli/blue.modal/dist/modal/blue/ModalBody';
import BliModalFooter from '@blibli/blue.modal/dist/modal/blue/ModalFooter';
import BliButton from '@blibli/blue.button/dist/button/blue/Button';
import BliRadio from '@blibli/blue.radio/dist/radio/blue/Radio';
import { BRANDS, type Brand } from '@/data';

/** "Pilih brand": list with trailing radio, footer "Lanjut" */
const props = defineProps<{ current: Brand; onPick: (b: Brand) => void }>();
const emit = defineEmits<{ close: [] }>();
const sel = ref<Brand>(props.current);
const brands: Brand[] = ['apple', 'samsung'];
</script>

<template>
  <div>
    <BliModalHeader @close="emit('close')"><template #title>Pilih brand</template></BliModalHeader>
    <BliModalBody>
      <button v-for="b in brands" :key="b" class="opt" type="button" @click="sel = b">
        <span class="t-b1 c-text grow">{{ BRANDS[b].name }}</span>
        <BliRadio v-model="sel" :value="b" label-hidden name="brand" @click.stop />
      </button>
    </BliModalBody>
    <BliModalFooter><BliButton full-width @click="props.onPick(sel)">Lanjut</BliButton></BliModalFooter>
  </div>
</template>

<style scoped lang="scss">
.opt { display: flex; align-items: center; gap: $blu-spacing-s; height: 56px; width: 100%; text-align: left; background: none; border: 0; padding: 0; cursor: pointer;
  & + & { border-top: 1px solid $blu-color-neutral-border-low; } }
</style>
