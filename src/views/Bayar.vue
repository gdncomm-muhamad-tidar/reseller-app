<script setup lang="ts">
import { computed } from 'vue';
import { useRouter } from 'vue-router';
import BliButton from '@blibli/blue.button/dist/button/blue/Button';
import BliRadio from '@blibli/blue.radio/dist/radio/blue/Radio';
import BliBanner from '@blibli/blue.banner/dist/banner/blue/Banner';
import AppHeader from '@/components/AppHeader.vue';
import AppFooter from '@/components/AppFooter.vue';
import BankLogo from '@/components/BankLogo.vue';
import { rp } from '@/theme';
import { BANKS, TODAY } from '@/data';
import { useStore } from '@/store';

const router = useRouter();
const { S, setVA, invoices } = useStore();
const ctx = computed(() => S.payCtx);

// earliest due date of the invoices being paid ("Jatuh tempo 19 Nov" → 19, "16 Des" → 46)
const dueText = computed(() => {
  const c = ctx.value;
  if (!c) return '';
  const dues = invoices.value.filter(i => c.ids.includes(i.id))
    .map(i => i.due.match(/(\d+) (Nov|Des)/))
    .filter((m): m is RegExpMatchArray => !!m)
    .map(m => [+m[1] + (m[2] === 'Des' ? 30 : 0), m[1], m[2]] as const)
    .sort((a, b) => a[0] - b[0]);
  const first = dues[0];
  if (!first) return '';
  return first[0] < TODAY ? `Lewat jatuh tempo ${first[1]} ${first[2]} 2026. Denda 0,1% per hari, segera bayar.` : `Bayar sebelum ${first[1]} ${first[2]} 2026, 23.59 WIB`;
});
</script>

<template>
  <div class="screen">
    <AppHeader title="Pembayaran" />
    <template v-if="ctx">
      <div class="screen__scroll by__scroll">
        <div class="card by__total">
          <span class="t-c1 c-med">Total tagihan</span>
          <span class="t-s1">{{ rp(ctx.amt) }}</span>
          <span class="t-c1 c-med">{{ ctx.ref }}</span>
          <BliBanner status="alert" full-width size="small"><span class="t-b2">{{ dueText }}</span></BliBanner>
        </div>
        <div class="by__va">
          <span class="t-s2">Virtual account</span>
          <div class="card by__banks">
            <button v-for="([b], i) in BANKS" :key="b" class="by__bank" :class="{ 'by__bank--n': i }" @click="setVA(b)">
              <BankLogo :b="b" />
              <span class="grow" :class="S.va === b ? 't-s2' : 't-c1'">{{ b }} Virtual Account</span>
              <BliRadio :model-value="S.va" :value="b" label-hidden />
            </button>
          </div>
        </div>
        <p class="t-c1 c-med center by__note">Pembayaran diproses aman oleh Midtrans</p>
      </div>
      <AppFooter>
        <div class="grow by__tot">
          <span class="t-c1 c-med">Total bayar</span>
          <span class="t-s2">{{ rp(ctx.amt) }}</span>
        </div>
        <BliButton @click="router.push('/va')">Bayar via {{ S.va === 'CIMB Niaga' ? 'CIMB' : S.va }}</BliButton>
      </AppFooter>
    </template>
  </div>
</template>

<style scoped lang="scss">
.by__scroll { padding: $blu-spacing-m; display: flex; flex-direction: column; gap: $blu-spacing-m; }
.by__total { display: flex; flex-direction: column; gap: $blu-spacing-s; }
.by__va { display: flex; flex-direction: column; gap: $blu-spacing-xs; }
.by__banks { padding-top: 0; padding-bottom: 0; }
.by__bank { display: flex; align-items: center; gap: $blu-spacing-ms; width: 100%; padding: $blu-spacing-m 0; text-align: left; &--n { border-top: 1px solid $blu-color-neutral-border-low; } }
.by__note { margin: 0; }
.by__tot { display: flex; flex-direction: column; gap: $blu-spacing-2xs; }
</style>
