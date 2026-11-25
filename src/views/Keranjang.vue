<script setup lang="ts">
import { useRouter } from 'vue-router';
import BliButton from '@blibli/blue.button/dist/button/blue/Button';
import BliCheckbox from '@blibli/blue.checkbox/dist/checkbox/blue/Checkbox';
import AppHeader from '@/components/AppHeader.vue';
import AppFooter from '@/components/AppFooter.vue';
import AppIcon from '@/components/AppIcon.vue';
import ProductPhoto from '@/components/ProductPhoto.vue';
import ProductLabel from '@/components/ProductLabel.vue';
import QtyField from '@/components/QtyField.vue';
import MiImage from '@/components/MiImage.vue';
import { rp } from '@/theme';
import { IMG, PRODUCTS } from '@/data';
import { useStore } from '@/store';
import { goTab } from '@/nav';

const router = useRouter();
const { S, sub, orig, units, setQty, clearCart, cnReady } = useStore();
</script>

<template>
  <div class="screen">
    <AppHeader title="Daftar pesanan" />
    <div class="screen__scroll kr__scroll">
      <div v-if="S.cart.length === 0" class="card kr__empty">
        <AppIcon name="cart" :size="40" />
        <span class="t-s1">Daftar pesanan masih kosong</span>
        <span class="t-c1 c-med center">Pilih produk dari Beranda atau Katalog untuk mulai pesan.</span>
        <BliButton size="small" @click="goTab('/katalog')">Buka katalog</BliButton>
      </div>
      <template v-else>
        <div class="card kr__list">
          <div class="row kr__all">
            <BliCheckbox :model-value="true" label-hidden />
            <span class="t-s2 grow">Pilih semua ({{ S.cart.length }} produk, {{ units }} item)</span>
            <button class="t-lbl c-info" @click="clearCart">Hapus</button>
          </div>
          <div v-for="c in S.cart" :key="c.id" class="kr__item">
            <BliCheckbox :model-value="true" label-hidden />
            <ProductPhoto :src="PRODUCTS[c.id].img" />
            <div class="grow kr__body">
              <span class="t-b2">{{ PRODUCTS[c.id].n }}</span>
              <span class="t-s2">{{ rp(PRODUCTS[c.id].p) }}</span>
              <div v-if="PRODUCTS[c.id].o" class="row kr__disc">
                <ProductLabel kind="disc" :label="PRODUCTS[c.id].d!" />
                <span class="t-c1 kr__strike">{{ rp(PRODUCTS[c.id].o!) }}</span>
              </div>
              <div class="row between">
                <QtyField :qty="c.qty" @change="(q: number) => setQty(c.id, q)" />
                <button aria-label="Hapus" @click="setQty(c.id, 0)"><AppIcon name="trash" :size="20" /></button>
              </div>
            </div>
          </div>
        </div>
        <div v-if="cnReady > 0" class="row kr__cn">
          <MiImage :src="IMG.money" />
          <span class="t-c1 grow">Anda punya credit note <span class="t-lbl">{{ rp(cnReady) }}</span> yang bisa dipakai di checkout.</span>
        </div>
        <p class="t-c1 c-med kr__note">Harga akhir &amp; ketersediaan stok produk akan dikonfirmasi sales setelah pesanan diajukan.</p>
      </template>
    </div>
    <AppFooter v-if="S.cart.length > 0">
      <div class="grow kr__total">
        <span class="t-c1 c-med">Total ({{ units }} item)</span>
        <span class="t-s2">{{ rp(sub) }}</span>
        <span v-if="orig > sub" class="t-c1 c-ok">Hemat {{ rp(orig - sub) }}</span>
      </div>
      <BliButton @click="router.push('/checkout')">Checkout ({{ units }})</BliButton>
    </AppFooter>
  </div>
</template>

<style scoped lang="scss">
.kr__scroll { padding: $blu-spacing-m; display: flex; flex-direction: column; gap: $blu-spacing-m; }
.kr__empty { display: flex; flex-direction: column; align-items: center; gap: $blu-spacing-ms; padding: $blu-spacing-xl $blu-spacing-m; }
.kr__list { display: flex; flex-direction: column; gap: $blu-spacing-ms; }
.kr__all { gap: $blu-spacing-ms; }
.kr__item { display: flex; align-items: flex-start; gap: $blu-spacing-ms; }
.kr__body { display: flex; flex-direction: column; gap: $blu-spacing-s; }
.kr__disc { gap: $blu-spacing-xs; }
.kr__strike { text-decoration: line-through; }
.kr__cn { padding: $blu-spacing-s $blu-spacing-ms; border-radius: $blu-border-radius-s; background: $blu-color-info-background-low; }
.kr__note { margin: 0; }
.kr__total { display: flex; flex-direction: column; gap: $blu-spacing-2xs; }
</style>
