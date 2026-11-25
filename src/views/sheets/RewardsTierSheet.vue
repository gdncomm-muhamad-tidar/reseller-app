<script setup lang="ts">
import BliBadge from '@blibli/blue.badge/dist/badge/blue/Badge';
import BliModalHeader from '@blibli/blue.modal/dist/modal/blue/ModalHeader';
import BliModalBody from '@blibli/blue.modal/dist/modal/blue/ModalBody';
import Medal from '@/components/Medal.vue';
import { TIERS } from '@/data';

const emit = defineEmits<{ close: [] }>();
</script>

<template>
  <div>
    <BliModalHeader @close="emit('close')"><template #title>Benefit tiap tier</template></BliModalHeader>
    <BliModalBody>
      <div class="tiers">
        <p class="t-c1 c-med">Tier ditinjau tiap 3 bulan dari rata-rata belanja. Tier bisa naik atau turun.</p>
        <div v-for="[k, n, req, pct, extra] in TIERS" :key="k" class="row tier" :class="{ on: k === 'gold' }">
          <Medal :tier="k" :size="40" />
          <div class="grow col">
            <div class="row"><span class="t-s2 grow">{{ n }}</span><BliBadge v-if="k === 'gold'" color="blue" prominence="secondary" size="extra-small">Tier Anda</BliBadge></div>
            <span class="t-c1 c-med">Rata-rata {{ req }}</span>
            <span class="t-c1" style="margin-top: 4px">Credit note misi {{ pct }}{{ extra ? ' · ' + extra : '' }}</span>
          </div>
        </div>
      </div>
    </BliModalBody>
  </div>
</template>

<style scoped lang="scss">
.tiers { display: flex; flex-direction: column; gap: 8px; padding-bottom: 16px; }
.tier { gap: 12px; padding: 12px; border-radius: 12px; border: 1px solid $blu-color-neutral-border-med; background: $blu-color-neutral-background-default;
  &.on { border-color: $blu-color-info-background-high; background: $blu-color-info-background-default; } }
</style>
