<script setup lang="ts">
import BliButton from '@blibli/blue.button/dist/button/blue/Button';
import BliModalHeader from '@blibli/blue.modal/dist/modal/blue/ModalHeader';
import BliModalBody from '@blibli/blue.modal/dist/modal/blue/ModalBody';
import BliModalFooter from '@blibli/blue.modal/dist/modal/blue/ModalFooter';
import KV from '@/components/KV.vue';
import { useStore } from '@/store';
import type { Reward } from '@/data';
import { fmt } from '@/theme';

defineProps<{ r: Reward }>();
const emit = defineEmits<{ close: []; confirm: [] }>();
const { S } = useStore();
</script>

<template>
  <div>
    <BliModalHeader @close="emit('close')" />
    <BliModalBody>
      <div class="sheet">
        <img :src="r.img" width="88" height="88" alt="" class="sheet__img" />
        <p class="t-t2 center">Tukar {{ fmt(r.c) }} poin?</p>
        <p class="t-b2 c-med center">{{ r.t }}{{ r.cat === 'cash' ? ' masuk ke saldo Finansial, bisa dicairkan ke BCA •••• 4417.' : r.cat === 'voucher' ? ' langsung bisa dipakai di checkout.' : ' dikirim bersama pesanan berikutnya.' }}</p>
        <div class="sheet__kv">
          <KV k="Poin sekarang" :v="fmt(S.poin)" /><KV k="Sisa setelah tukar" :v="fmt(S.poin - r.c)" />
        </div>
      </div>
    </BliModalBody>
    <BliModalFooter>
      <BliButton prominence="tertiary" full-width @click="emit('close')">Batal</BliButton>
      <BliButton full-width @click="emit('confirm')">Tukar sekarang</BliButton>
    </BliModalFooter>
  </div>
</template>

<style scoped lang="scss">
.sheet { display: flex; flex-direction: column; align-items: center; gap: 12px; }
.sheet__img { object-fit: contain; }
.sheet__kv { align-self: stretch; background: $blu-color-neutral-background-low; border-radius: 12px; padding: 12px; display: flex; flex-direction: column; gap: 8px; }
</style>
