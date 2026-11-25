<script setup lang="ts">
import { computed, onBeforeUnmount, onMounted, ref, watch } from 'vue';
import { useRouter } from 'vue-router';
import { rp, short } from '@/theme';
import { goTab } from '@/nav';
import { IMG, NET_DAYS, PRODUCTS, QUARTER_BONUS, type Brand } from '@/data';

/** Homepage banner carousel (below the credit note section). Max 5 banners, 112px tall, one per page,
 *  auto-advances every 4s and pauses while the user is swiping. */
const props = defineProps<{ brand: Brand }>();
const router = useRouter();
const H = 112, MAX = 5, AUTO_MS = 4000;

type Banner = { key: string; title: string; sub: string; img: string; photo?: boolean; bg: [string, string]; go: () => void };
const product = (id: string, sub: string, bg: [string, string]): Banner => ({
  key: id, title: PRODUCTS[id].n.replace(/ \d+GB.*$/, ''), sub, img: PRODUCTS[id].img, photo: true, bg, go: () => router.push(`/produk/${id}`),
});
const banners = computed<Banner[]>(() => {
  const shared: Banner[] = [
    { key: 'misi', title: `Bonus kuartal ${short(QUARTER_BONUS)}`, sub: 'Selesaikan misi dan dapatkan credit note tambahan', img: IMG.mission, bg: ['#FFF4CC', '#FFE38A'], go: () => router.push('/misi') },
    { key: 'scan', title: 'Scan IMEI, dapat poin', sub: 'Verifikasi produk yang sudah Anda beli', img: IMG.scan, bg: ['#DDF7EA', '#B9EDD3'], go: () => goTab('/scan') },
    { key: 'net', title: `Bayar tempo hingga ${Math.max(...NET_DAYS)} hari`, sub: 'Belanja sekarang, bayar dengan metode Net', img: IMG.money, bg: ['#EFE7FF', '#DCCBFF'], go: () => goTab('/katalog') },
  ];
  const own = props.brand === 'apple'
    ? [product('ip17pm', `Credit note ${rp(PRODUCTS.ip17pm.cn)} per unit`, ['#E1F1FF', '#C7E4FF']), product('ip17', `Pre-order sekarang · credit note ${rp(PRODUCTS.ip17.cn)}`, ['#FFE7EC', '#FFCAD5'])]
    : [product('ultra', `Credit note ${rp(PRODUCTS.ultra.cn)} per unit`, ['#E1F1FF', '#C7E4FF']), product('flip7', `Credit note ${rp(PRODUCTS.flip7.cn)} per unit`, ['#FFE7EC', '#FFCAD5'])];
  return [...own, ...shared].slice(0, MAX);
});

const scroller = ref<HTMLElement>();
const idx = ref(0);
const paused = ref(false);
let timer: ReturnType<typeof setTimeout> | undefined;

const schedule = () => {
  clearTimeout(timer);
  const el = scroller.value;
  if (!el || paused.value || banners.value.length < 2) return;
  timer = setTimeout(() => el.scrollTo({ left: ((idx.value + 1) % banners.value.length) * el.clientWidth, behavior: 'smooth' }), AUTO_MS);
};
const onScroll = () => {
  const el = scroller.value;
  if (!el?.clientWidth) return;
  idx.value = Math.min(Math.max(Math.round(el.scrollLeft / el.clientWidth), 0), banners.value.length - 1);
};
watch([idx, paused, () => banners.value.length], schedule);
onMounted(schedule);
onBeforeUnmount(() => clearTimeout(timer));
</script>

<template>
  <div class="bc">
    <div ref="scroller" class="bc__scroll no-scrollbar" @scroll.passive="onScroll" @pointerdown="paused = true" @pointerup="paused = false" @pointercancel="paused = false" @touchstart.passive="paused = true" @touchend.passive="paused = false">
      <div v-for="b in banners" :key="b.key" class="bc__page">
        <button type="button" class="bc__card" :style="{ height: H + 'px', background: `linear-gradient(135deg, ${b.bg[0]}, ${b.bg[1]})` }" :aria-label="`${b.title}. ${b.sub}`" @click="b.go()">
          <div class="bc__txt">
            <span class="t-s1 bc__clamp">{{ b.title }}</span>
            <span class="t-c1 c-med bc__clamp">{{ b.sub }}</span>
          </div>
          <div v-if="b.photo" class="bc__photo"><img :src="b.img" width="76" height="76" alt="" draggable="false" /></div>
          <img v-else :src="b.img" width="88" height="88" alt="" draggable="false" class="bc__art" />
        </button>
      </div>
    </div>
    <div v-if="banners.length > 1" class="bc__dots">
      <span v-for="(b, i) in banners" :key="b.key" class="bc__dot" :class="{ on: i === idx }" />
    </div>
  </div>
</template>

<style scoped lang="scss">
.bc { display: flex; flex-direction: column; gap: 8px; }
.bc__scroll { display: flex; overflow-x: auto; scroll-snap-type: x mandatory; }
.bc__page { flex: none; width: 100%; padding: 0 16px; box-sizing: border-box; scroll-snap-align: start; scroll-snap-stop: always; }
.bc__card { width: 100%; border-radius: 12px; overflow: hidden; display: flex; align-items: center; gap: 12px; padding: 0 12px 0 16px; text-align: left; cursor: pointer; &:active { opacity: 0.9; } }
.bc__txt { flex: 1; min-width: 0; display: flex; flex-direction: column; gap: 4px; }
.bc__clamp { display: -webkit-box; -webkit-line-clamp: 2; -webkit-box-orient: vertical; overflow: hidden; }
.bc__photo { width: 84px; height: 84px; border-radius: 12px; background: #fff; overflow: hidden; display: flex; align-items: center; justify-content: center; flex: none; img { object-fit: contain; } }
.bc__art { object-fit: contain; flex: none; }
.bc__dots { display: flex; justify-content: center; gap: 4px; }
.bc__dot { height: 6px; width: 6px; border-radius: 3px; background: $blu-color-neutral-border-default; transition: width 0.2s; &.on { width: 16px; background: $blu-color-info-background-high; } }
</style>
