<script setup lang="ts">
import { computed } from 'vue';
import { useRouter } from 'vue-router';
import BliBadge from '@blibli/blue.badge/dist/badge/blue/Badge';
import BliBanner from '@blibli/blue.banner/dist/banner/blue/Banner';
import BliButton from '@blibli/blue.button/dist/button/blue/Button';
import BliCheckbox from '@blibli/blue.checkbox/dist/checkbox/blue/Checkbox';
import BliTabs from '@blibli/blue.tabs/dist/tabs/blue/Tabs';
import BliTab from '@blibli/blue.tabs/dist/tabs/blue/Tab';
import AppHeader from '@/components/AppHeader.vue';
import AppFooter from '@/components/AppFooter.vue';
import { toast } from '@/composables/overlay';
import { useStore } from '@/store';
import { rp } from '@/theme';

const router = useRouter();
const { S, usable, toggleCN, cnAmt } = useStore();
const blocked = computed(() => S.cns.filter(c => c.st === 'expired'));
const n = computed(() => usable.value.filter(c => S.cnSel[c.k]).length);
const onTab = (k: string | number) => { if (k === 'v') toast('Belum ada voucher yang bisa dipakai di pesanan ini'); };
</script>

<template>
  <div class="screen">
    <AppHeader title="Credit note & voucher">
      <BliTabs model-value="cn" variant="fixed" @update:model-value="onTab">
        <BliTab value="cn" :title="`Credit note (${usable.length + blocked.length})`" />
        <BliTab value="v" title="Voucher (1)" />
      </BliTabs>
    </AppHeader>
    <div class="screen__scroll no-scrollbar">
      <div class="list">
        <BliBanner status="info" full-width>Credit note bisa digabungkan. Potongan maksimumnya senilai total belanja.</BliBanner>
        <p class="t-s2" style="margin-top: 4px">Bisa dipakai ({{ usable.length }})</p>
        <div v-for="c in usable" :key="c.k" class="cn" :class="{ on: !!S.cnSel[c.k] }" role="button" tabindex="0" @click="toggleCN(c.k)">
          <div class="grow col" style="gap: 2px">
            <span class="t-s2">{{ rp(c.amt) }}</span>
            <span class="t-lbl">{{ c.t }}</span>
            <span class="t-c1 c-med">{{ c.c }} · berlaku hingga {{ c.exp ?? '31 Des 2026' }}</span>
          </div>
          <BliCheckbox class="nopt" :model-value="!!S.cnSel[c.k]" label-hidden tabindex="-1" />
        </div>
        <p v-if="!usable.length" class="t-c1 c-med">Belum ada credit note yang bisa dipakai.</p>
        <p v-if="blocked.length > 0" class="t-s2" style="margin-top: 4px">Tidak bisa dipakai ({{ blocked.length }})</p>
        <div v-for="c in blocked" :key="c.k" class="blocked">
          <div class="row"><span class="t-s2 c-med grow">{{ rp(c.amt) }}</span><BliBadge color="gray" prominence="tertiary" size="extra-small">Hangus</BliBadge></div>
          <span class="t-lbl c-med">{{ c.t }}</span>
        </div>
      </div>
    </div>
    <AppFooter>
      <div class="grow col" style="gap: 2px"><span class="t-c1 c-med">Total potongan ({{ n }} credit note)</span><span class="t-s2 c-ok">−{{ rp(cnAmt) }}</span></div>
      <BliButton :min-width="140" @click="router.back()">Pakai</BliButton>
    </AppFooter>
  </div>
</template>

<style scoped lang="scss">
.list { padding: $blu-spacing-m; display: flex; flex-direction: column; gap: 12px; }
.cn { display: flex; align-items: flex-start; gap: 12px; padding: 16px; border-radius: 12px; border: 1px solid $blu-color-neutral-border-low; background: $blu-color-neutral-background-default; cursor: pointer; text-align: left;
  &.on { border: 1.5px solid $blu-color-info-border-default; background: $blu-color-info-background-low; padding: 15.5px; } }
.nopt { pointer-events: none; }
.blocked { padding: 16px; border-radius: 12px; background: $blu-color-neutral-background-med; display: flex; flex-direction: column; gap: 2px; }
</style>
