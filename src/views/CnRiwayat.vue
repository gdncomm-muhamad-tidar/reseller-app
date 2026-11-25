<script setup lang="ts">
/* Riwayat credit note — every movement (masuk · dipakai · hangus) from the credit note data,
 * in the row style of Finansial 4a "Riwayat credit note". */
import { computed } from 'vue';
import { useRouter } from 'vue-router';
import AppHeader from '@/components/AppHeader.vue';
import AppIcon from '@/components/AppIcon.vue';
import CircleIcon from '@/components/CircleIcon.vue';
import { useStore } from '@/store';
import { slugOf } from '@/orders';
import { cnEvents, type CnEvent } from '@/cnHistory';
import { openFin } from '@/nav';
import { rp } from '@/theme';

const router = useRouter();
const { S } = useStore();
const ev = computed(() => cnEvents(S.cns));
const avail = computed(() => S.cns.filter(c => c.st === 'use').reduce((a, c) => a + c.amt, 0));
const go = (e: CnEvent) => {
  if (e.order) router.push(`/order/${slugOf(e.order)}`);
  else if (e.inv) openFin('inv');
};
</script>

<template>
  <div class="screen">
    <AppHeader title="Riwayat credit note" />
    <div class="screen__scroll no-scrollbar">
      <div class="list">
        <p class="t-c1 c-med">Credit note tersedia saat ini: <span class="t-lbl c-text">{{ rp(avail) }}</span></p>
        <div class="card hist">
          <button v-for="(e, i) in ev" :key="e.k" class="row item" :class="{ first: !i }" :disabled="!e.order && !e.inv" @click="go(e)">
            <CircleIcon :bg="e.tone === 'off' ? 'var(--blu-color-neutral-background-med)' : 'var(--blu-color-info-background-default)'">
              <AppIcon :name="e.icon" :size="20" :color="e.tone === 'off' ? 'var(--blu-color-neutral-text-med)' : 'var(--blu-color-info-icon-default)'" />
            </CircleIcon>
            <div class="grow col" style="gap: 2px; text-align: left"><span class="t-s2 ellipsis">{{ e.title }}</span><span class="t-c1 c-med">{{ e.sub }}</span></div>
            <span class="t-s2" :class="e.tone === 'in' ? 'c-ok' : e.tone === 'off' ? 'c-low' : 'c-text'">{{ e.amt > 0 ? '+' : '−' }}{{ rp(Math.abs(e.amt)) }}</span>
          </button>
        </div>
      </div>
    </div>
  </div>
</template>

<style scoped lang="scss">
.list { padding: $blu-spacing-m; display: flex; flex-direction: column; gap: 12px; }
.hist { padding: 0; overflow: hidden; }
.item { width: 100%; gap: 12px; padding: 12px 16px; border-top: 1px solid $blu-color-neutral-border-low; &.first { border-top: 0; } &:disabled { cursor: default; } }
</style>
