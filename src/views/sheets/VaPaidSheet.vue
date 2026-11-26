<script setup lang="ts">
import BliButton from '@blibli/blue.button/dist/button/blue/Button';
import BliBadge from '@blibli/blue.badge/dist/badge/blue/Badge';
import BliModalHeader from '@blibli/blue.modal/dist/modal/blue/ModalHeader';
import BliModalBody from '@blibli/blue.modal/dist/modal/blue/ModalBody';
import BliModalFooter from '@blibli/blue.modal/dist/modal/blue/ModalFooter';
import AppIcon from '@/components/AppIcon.vue';
import { rp, short } from '@/theme';
import { IMG } from '@/data';
import { closeSheet } from '@/composables/overlay';
import { goTab, openFin } from '@/nav';

defineProps<{ amt: number; refText: string; rfq?: string; pts: number; cn: number; isOrder: boolean }>();
const emit = defineEmits<{ close: [] }>();
</script>

<template>
  <div>
    <BliModalHeader @close="emit('close')" />
    <BliModalBody>
      <div class="paid">
        <!-- medallion 180x150: green radial glow (200) + ring (112) + check (80); glow & ring breathe while open -->
        <div class="paid__med">
          <svg class="paid__glow" width="200" height="200">
            <defs><radialGradient id="paidglow" cx="50%" cy="50%" r="50%"><stop offset="0" stop-color="#40CC73" stop-opacity="0.35" /><stop offset="1" stop-color="#40CC73" stop-opacity="0" /></radialGradient></defs>
            <circle cx="100" cy="100" r="100" fill="url(#paidglow)" />
          </svg>
          <div class="paid__ring" />
          <div class="paid__check"><img :src="IMG.trophyCheck" alt="" /></div>
        </div>
        <h2 class="t-t1 center">Pembayaran berhasil</h2>
        <p class="t-c1 c-med center">{{ isOrder ? `Pesanan ${rfq} akan segera diproses.` : `${rp(amt)} untuk ${refText} sudah masuk. Limit kredit Anda kembali bertambah.` }}</p>
        <div class="paid__badges">
          <BliBadge color="blue" prominence="secondary" size="extra-small">
            <template #item-leading><AppIcon name="pointsLine" :size="12" color="var(--blu-color-info-icon-default)" /></template>
            +{{ pts.toLocaleString('id-ID') }} poin
          </BliBadge>
          <BliBadge v-if="isOrder && cn > 0" color="green" prominence="secondary" size="extra-small">
            <template #item-leading><AppIcon name="cashIn" :size="12" color="var(--blu-color-success-icon-default)" /></template>
            +{{ short(cn) }} credit note
          </BliBadge>
        </div>
      </div>
    </BliModalBody>
    <BliModalFooter>
      <BliButton full-width @click="closeSheet(() => (isOrder ? goTab('/pesanan') : openFin('inv')))">{{ isOrder ? 'Lihat pesanan' : 'Lihat invoice' }}</BliButton>
      <BliButton full-width prominence="tertiary" @click="closeSheet(() => goTab('/home'))">Kembali ke Beranda</BliButton>
    </BliModalFooter>
  </div>
</template>

<style scoped lang="scss">
.paid { display: flex; flex-direction: column; align-items: center; gap: $blu-spacing-ms; h2, p { margin: 0; } }
.paid__med { position: relative; width: 180px; height: 150px; }
.paid__glow { position: absolute; left: -10px; top: -25px; animation: breathe 1800ms ease-in-out infinite; }
.paid__ring { position: absolute; left: 34px; top: 19px; width: 112px; height: 112px; border-radius: 50%; background: $blu-color-success-background-low; animation: breathe-ring 1800ms ease-in-out infinite; }
.paid__check { position: absolute; left: 50px; top: 35px; width: 80px; height: 80px; display: flex; align-items: center; justify-content: center; img { width: 70px; height: 70px; } }
.paid__badges { display: flex; flex-wrap: wrap; justify-content: center; gap: $blu-spacing-s; }
@keyframes breathe { 0%, 100% { transform: scale(1); } 50% { transform: scale(0.86); } }
@keyframes breathe-ring { 0%, 100% { transform: scale(1); } 50% { transform: scale(0.92); } }
</style>
