<script setup lang="ts">
import { ref } from 'vue';
import BliButton from '@blibli/blue.button/dist/button/blue/Button';
import BliCheckbox from '@blibli/blue.checkbox/dist/checkbox/blue/Checkbox';
import BliModalHeader from '@blibli/blue.modal/dist/modal/blue/ModalHeader';
import BliModalBody from '@blibli/blue.modal/dist/modal/blue/ModalBody';
import BliModalFooter from '@blibli/blue.modal/dist/modal/blue/ModalFooter';

/** Modal "Ketentuan kirim pesanan" */
const props = defineProps<{ onSend: (skip: boolean) => void }>();
const emit = defineEmits<{ close: [] }>();
const agree = ref(true);
const skip = ref(true);
const rules = [
  'Setelah mengirim daftar produk yang ingin dipesan, Anda akan menerima quotation resmi dari Blibli dalam 1-2 hari.',
  'Anda dapat menyetujui/menolak quotation berdasarkan harga, jumlah, maupun varian produk yang tersedia.',
  'Jika Anda menyetujui quotation yang diberikan, Blibli akan segera memprosesnya sebagai pesanan resmi (PO).',
];
</script>

<template>
  <div>
    <BliModalHeader @close="emit('close')"><template #title>Ketentuan kirim pesanan</template></BliModalHeader>
    <BliModalBody>
      <div v-for="(r, i) in rules" :key="i" class="terms__rule">
        <span class="t-b1 c-med terms__n">{{ i + 1 }}.</span>
        <span class="t-b1 c-med grow">{{ r }}</span>
      </div>
      <template #addition>
        <BliCheckbox v-model="agree">Saya telah membaca, memahami, dan menyetujui ketentuan di atas.</BliCheckbox>
        <BliCheckbox v-model="skip">Jangan tampilkan lagi untuk pesanan berikutnya.</BliCheckbox>
      </template>
    </BliModalBody>
    <BliModalFooter>
      <BliButton full-width :disabled="!agree" @click="props.onSend(skip)">Kirim</BliButton>
    </BliModalFooter>
  </div>
</template>

<style scoped lang="scss">
.terms__rule { display: flex; align-items: flex-start; gap: $blu-spacing-s; & + & { margin-top: $blu-spacing-s; } }
.terms__n { width: 16px; flex: none; }
</style>
