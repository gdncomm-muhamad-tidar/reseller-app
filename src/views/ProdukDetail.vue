<script setup lang="ts">
import { computed, ref, watch } from 'vue';
import { useRoute, useRouter } from 'vue-router';
import BliButton from '@blibli/blue.button/dist/button/blue/Button';
import BliBadge from '@blibli/blue.badge/dist/badge/blue/Badge';
import BliChips from '@blibli/blue.chips/dist/chips/blue/Chips';
import BliChip from '@blibli/blue.chips/dist/chips/blue/Chip';
import AppHeader from '@/components/AppHeader.vue';
import AppFooter from '@/components/AppFooter.vue';
import AppIcon from '@/components/AppIcon.vue';
import ProductLabel from '@/components/ProductLabel.vue';
import { rp } from '@/theme';
import { PRODUCTS, MISSIONS, TAG_LABEL } from '@/data';
import { useStore } from '@/store';
import { toast } from '@/composables/overlay';

const route = useRoute();
const router = useRouter();
const { addToCart, units } = useStore();
const p = computed(() => PRODUCTS[String(route.params.id ?? 'a36')] ?? PRODUCTS.a36);
const qty = ref(5);
const variant = ref(p.value.variants[0]);
const color = ref(p.value.colors[0]);
watch(p, np => { variant.value = np.variants[0]; color.value = np.colors[0]; });

const order = () => {
  addToCart(p.value.id, qty.value);
  toast(`${qty.value} unit ${p.value.n} masuk daftar pesanan`);
  router.push('/keranjang');
};
</script>

<template>
  <div class="screen pdp">
    <AppHeader title="Detail produk">
      <template #right>
        <button class="pdp__bag" aria-label="Daftar pesanan" @click="router.push('/keranjang')">
          <AppIcon name="bag" :size="24" />
          <BliBadge v-if="units" class="pdp__bag-badge" notification>{{ units }}</BliBadge>
        </button>
      </template>
    </AppHeader>
    <div class="screen__scroll">
      <div class="pdp__photo"><img :src="p.img" alt="" /></div>
      <div class="pdp__info">
        <div class="row">
          <ProductLabel v-if="p.tag" :kind="p.tag" :label="TAG_LABEL[p.tag]" />
          <span class="t-c1 c-low">{{ p.mta }}</span>
        </div>
        <p class="t-b1 pdp__name">{{ p.n }}</p>
        <div class="row pdp__price">
          <span class="t-t1">{{ rp(p.p) }}</span>
          <template v-if="p.o">
            <span class="t-c1 c-low pdp__strike">{{ rp(p.o) }}</span>
            <BliBadge color="red">{{ p.d }}</BliBadge>
          </template>
        </div>
        <p class="t-c1 c-ok">{{ p.meta.includes('credit note') ? p.meta + ' · ' : '' }}dihitung ke {{ MISSIONS[p.cat].t }}</p>
        <p class="t-c1 c-med pdp__lbl">Kapasitas</p>
        <BliChips v-model="variant" single-select mandatory>
          <BliChip v-for="v in p.variants" :key="v" :value="v">{{ v }}</BliChip>
        </BliChips>
        <p class="t-c1 c-med pdp__lbl pdp__lbl--s">Warna</p>
        <BliChips v-model="color" single-select mandatory>
          <BliChip v-for="c in p.colors" :key="c" :value="c">{{ c }}</BliChip>
        </BliChips>
        <div class="divider pdp__div" />
        <p class="t-s2">Deskripsi produk</p>
        <p class="t-c1 c-med">{{ p.desc }}</p>
        <div class="pdp__note">
          <span class="t-lbl">Harga grosir</span>
          <span class="t-c1 c-med">Harga final dan ketersediaan dikonfirmasi sales setelah pesanan diajukan.</span>
        </div>
      </div>
    </div>
    <AppFooter>
      <div class="pdp__qty">
        <button aria-label="Kurangi" @click="qty = Math.max(1, qty - 1)"><AppIcon name="minus" :size="16" color="var(--blu-color-info-icon-default)" /></button>
        <span class="t-s2 pdp__qty-n">{{ qty }}</span>
        <button aria-label="Tambah" @click="qty += 1"><AppIcon name="plus" :size="16" color="var(--blu-color-info-icon-default)" /></button>
      </div>
      <BliButton class="grow" full-width @click="order">Pesan</BliButton>
    </AppFooter>
  </div>
</template>

<style scoped lang="scss">
.pdp { background: $blu-color-neutral-background-default; }
.pdp__bag { position: relative; display: flex; }
.pdp__bag-badge { position: absolute; top: -6px; right: -8px; }
.pdp__photo { display: flex; justify-content: center; padding: $blu-spacing-m 0; background: #fff; img { width: 240px; height: 240px; object-fit: contain; } }
.pdp__info { padding: $blu-spacing-m; display: flex; flex-direction: column; gap: $blu-spacing-s; padding-bottom: 24px; }
.pdp__name { margin: 0; }
.pdp__price { align-items: baseline; }
.pdp__strike { text-decoration: line-through; }
.pdp__lbl { margin-top: $blu-spacing-s; &--s { margin-top: $blu-spacing-xs; } }
.pdp__div { margin: $blu-spacing-s 0; }
.pdp__note { margin-top: $blu-spacing-s; padding: $blu-spacing-ms; border-radius: $blu-border-radius-s; background: $blu-color-info-background-default; display: flex; flex-direction: column; gap: $blu-spacing-xs; }
.pdp__qty { display: flex; align-items: center; height: 40px; border: 1px solid $blu-color-neutral-border-med; border-radius: $blu-border-radius-s;
  button { width: 40px; height: 40px; display: flex; align-items: center; justify-content: center; } }
.pdp__qty-n { width: 32px; text-align: center; }
p { margin: 0; }
</style>
