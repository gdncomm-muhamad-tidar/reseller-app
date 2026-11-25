<script setup lang="ts">
import { computed } from 'vue';
import { useRoute } from 'vue-router';
import BliButton from '@blibli/blue.button/dist/button/blue/Button';
import BliBadge from '@blibli/blue.badge/dist/badge/blue/Badge';
import { rp } from '@/theme';
import { IMG } from '@/data';
import { useStore } from '@/store';
import { goTab } from '@/nav';

const route = useRoute();
const { S } = useStore();
const o = computed(() => S.orders.find(x => x.id === (route.query.id ?? route.params.id)) ?? S.orders[0]);
const units = computed(() => (o.value ? o.value.items.reduce((t, c) => t + c.qty, 0) : 0));
const rows = computed(() => (o.value
  ? [['No. pesanan', o.value.id], ['Status', null], [`Total (${units.value} unit)`, rp(o.value.total)], ['Pembayaran', o.value.term === 'cbd' ? 'CBD' : `Net ${o.value.netDays ?? 30}`]] as [string, string | null][]
  : []));
</script>

<template>
  <div class="screen dj">
    <div class="dj__pop">
      <!-- spot.document-paper (150x100): tile background + document + check badge; the check spins once -->
      <div class="dj__spot">
        <svg class="dj__bg" width="150" height="75" viewBox="0 0 150 75">
          <defs>
            <linearGradient id="docbg" x1="75" y1="0" x2="75" y2="75" gradientUnits="userSpaceOnUse"><stop stop-color="#E1F1FF" /><stop offset="1" stop-color="#F3F9FF" /></linearGradient>
            <clipPath id="docclip"><rect width="150" height="75" rx="14.2857" /></clipPath>
          </defs>
          <rect width="150" height="75" rx="14.2857" fill="url(#docbg)" />
          <path clip-path="url(#docclip)" d="M0 45.4423C0 45.4423 24.0119 37.5 74.7036 37.5C125.395 37.5 150 45.4423 150 45.4423V75.4464H0V45.4423Z" fill="#E1F1FF" />
        </svg>
        <img :src="IMG.docPaper" class="dj__doc" alt="" />
        <div class="dj__check"><img :src="IMG.trophyCheck" alt="" /></div>
      </div>
    </div>
    <div class="dj__copy">
      <h1 class="t-t1 center">Pesanan diajukan</h1>
      <p class="t-b2 c-med center">Sales akan cek stok &amp; harga produk dalam 2 hari kerja. Setelah disetujui, Anda dapat melakukan pembayaran.</p>
    </div>
    <div v-if="o" class="dj__sum">
      <div v-for="[k, v] in rows" :key="k" class="row dj__r">
        <span class="t-b2 c-med grow">{{ k }}</span>
        <BliBadge v-if="v === null" color="blue" prominence="secondary" size="extra-small">Diproses sales admin</BliBadge>
        <span v-else class="t-b2">{{ v }}</span>
      </div>
    </div>
    <div class="grow" />
    <div class="dj__actions">
      <BliButton full-width @click="goTab('/katalog')">Buat pesanan lain</BliButton>
      <BliButton full-width prominence="tertiary" @click="goTab('/pesanan')">Cek status pesanan</BliButton>
    </div>
  </div>
</template>

<style scoped lang="scss">
.dj { padding: calc(env(safe-area-inset-top) + 40px) $blu-spacing-m calc(env(safe-area-inset-bottom) + 16px); align-items: center; gap: $blu-spacing-l; }
.dj__pop { animation: pop 450ms cubic-bezier(0.215, 0.61, 0.355, 1) both; }
.dj__spot { position: relative; width: 150px; height: 100px; overflow: hidden; }
.dj__bg { position: absolute; left: 0; bottom: 12.5px; }
.dj__doc { position: absolute; left: 14.19px; top: -15.37px; width: 112.27px; height: 112.27px; }
.dj__check { position: absolute; left: 70.27px; top: 42.86px; width: 53.57px; height: 53.57px; display: flex; align-items: center; justify-content: center; opacity: 0;
  animation: spin 800ms 250ms cubic-bezier(0.215, 0.61, 0.355, 1) forwards; img { width: 46px; height: 46px; } }
.dj__copy { display: flex; flex-direction: column; gap: $blu-spacing-s; padding: 0 $blu-spacing-m; h1, p { margin: 0; } }
.dj__sum { align-self: stretch; background: $blu-color-neutral-background-default; border-radius: $blu-border-radius-s; border: 1px solid $blu-color-neutral-border-med; padding: $blu-spacing-m; display: flex; flex-direction: column; gap: $blu-spacing-xs; }
.dj__r { padding: $blu-spacing-xs 0; }
.dj__actions { align-self: stretch; display: flex; flex-direction: column; gap: $blu-spacing-s; }
@keyframes pop { from { opacity: 0; transform: translateY(12px); } to { opacity: 1; transform: none; } }
@keyframes spin {
  0% { opacity: 0; transform: rotate(0) scale(0.4); }
  20% { opacity: 1; }
  60% { opacity: 1; transform: rotate(216deg) scale(1.08); }
  100% { opacity: 1; transform: rotate(360deg) scale(1); }
}
</style>
