<script setup lang="ts">
import { computed, ref, watch } from 'vue';
import { useRouter } from 'vue-router';
import BliSearchBar from '@blibli/blue.search-bar/dist/search-bar/blue/SearchBar';
import BliTextField from '@blibli/blue.text-field/dist/text-field/blue/TextField';
import AppHeader from '@/components/AppHeader.vue';
import AddBtn from '@/components/AddBtn.vue';
import CartBar from '@/components/CartBar.vue';
import { NAV_SPACE } from '@/components/constants';
import { BRANDS, PRODUCTS, type Product } from '@/data';
import { useStore } from '@/store';
import { rp } from '@/theme';

/** Katalog: categories grid, search bar, "Produk pilihan" 2-column grid. Follows the brand chosen in "Pilih brand". */
const router = useRouter();
const { S, units } = useStore();
const brand = computed(() => BRANDS[S.brand]);
const q = ref('');
const cat = ref(brand.value.cats[0][0]);
watch(() => S.brand, () => { cat.value = brand.value.cats[0][0]; q.value = ''; });

const isBrand = (p: Product) => (S.brand === 'apple' ? p.brand === 'apple' : !p.brand);
const list = computed(() => {
  const t = q.value.trim().toLowerCase();
  return Object.values(PRODUCTS).filter(p => isBrand(p) && (t ? p.n.toLowerCase().includes(t) : p.kat === cat.value));
});
const rows = computed(() => {
  const r: Product[][] = [];
  for (let i = 0; i < list.value.length; i += 2) r.push(list.value.slice(i, i + 2));
  return r;
});
const pick = (k: string) => { cat.value = k; q.value = ''; };
const open = (id: string) => router.push({ path: `/produk/${id}` });
</script>

<template>
  <div class="screen">
    <AppHeader title="Katalog" no-back />
    <div class="screen__scroll" :style="{ paddingBottom: `${NAV_SPACE + (units ? 64 : 0)}px` }">
      <div class="cats">
        <p class="t-s1 c-text cats__title">Cari berdasarkan kategori</p>
        <div class="cats__grid">
          <button v-for="[k, l, img] in brand.cats" :key="k" type="button" class="cat" :class="{ 'cat--on': !q && cat === k }" @click="pick(k)">
            <img :src="img" alt="" class="cat__img" />
            <span class="t-b2 c-med center">{{ l }}</span>
          </button>
        </div>
      </div>
      <div class="list">
        <BliSearchBar @clear="q = ''">
          <BliTextField v-model="q" placeholder="Mau pesan produk apa?" />
        </BliSearchBar>
        <p class="t-s1 c-text">{{ q ? `Hasil pencarian (${list.length})` : 'Produk pilihan' }}</p>
        <div v-for="(r, i) in rows" :key="i" class="grid-row">
          <div v-for="p in r" :key="p.id" class="gc" role="button" tabindex="0" @click="open(p.id)" @keyup.enter="open(p.id)">
            <div class="gc__photo">
              <img :src="p.img" alt="" class="gc__img" />
              <div class="gc__dots"><i v-for="d in 3" :key="d" :class="{ on: d === 1 }" /></div>
              <AddBtn :id="p.id" class="gc__add" />
            </div>
            <span class="t-b2 c-text ellipsis gc__name">{{ p.n }}</span>
            <span class="t-s1 c-text">{{ rp(p.p) }}</span>
            <span v-if="p.variants.length > 1" class="t-c1 c-med">Harga bervariasi</span>
          </div>
          <div v-if="r.length === 1" class="gc gc--empty" />
        </div>
        <p v-if="!list.length" class="t-b2 c-med center empty">{{ q ? 'Produk tidak ditemukan. Coba kata kunci lain.' : 'Belum ada produk di kategori ini.' }}</p>
      </div>
    </div>
    <CartBar />
  </div>
</template>

<style scoped lang="scss">
.cats__title { padding: $blu-spacing-m; }
.cats__grid { display: flex; flex-wrap: wrap; gap: $blu-spacing-xs; padding: 0 $blu-spacing-m $blu-spacing-m; }
.cat { width: calc((100% - 16px) / 3 - 0.01px); display: flex; flex-direction: column; align-items: center; padding: $blu-spacing-xs 4px; border-radius: 8px; background: $blu-color-neutral-background-default; border: 1px solid $blu-color-neutral-background-default; cursor: pointer;
  &--on { border-color: $blu-color-info-border-default; } }
.cat__img { width: 66px; height: 66px; border-radius: 4px; object-fit: contain; }
.list { background: $blu-color-neutral-background-default; padding: $blu-spacing-m; display: flex; flex-direction: column; gap: $blu-spacing-m; }
.grid-row { display: flex; gap: $blu-spacing-m; align-items: flex-start; }
.gc { flex: 1; min-width: 0; display: flex; flex-direction: column; gap: 4px; cursor: pointer; &:active { opacity: 0.85; } }
.gc__photo { position: relative; aspect-ratio: 1; border-radius: 8px; border: 1px solid $blu-color-neutral-border-low; background: $blu-color-neutral-background-default; overflow: hidden; display: flex; align-items: center; justify-content: center; }
.gc__img { width: 86%; height: 86%; object-fit: contain; }
.gc__dots { position: absolute; bottom: 8px; display: flex; gap: 3px; align-items: center;
  i { width: 4px; height: 4px; border-radius: 2px; background: $blu-color-neutral-border-med; &.on { width: 6px; background: $blu-color-info-background-high; } } }
.gc__add { position: absolute; right: 8px; bottom: 20px; width: 36px; height: 36px; border-radius: 18px; background: $blu-color-neutral-background-default; border: 1px solid $blu-color-info-border-default; display: flex; align-items: center; justify-content: center; }
.gc__name { margin-top: 4px; }
.empty { margin: 24px 0; }
</style>
