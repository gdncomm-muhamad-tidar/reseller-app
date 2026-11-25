<script setup lang="ts">
import { ref, watch } from 'vue';
import { useRouter } from 'vue-router';
import { rp } from '@/theme';
import type { Product } from '@/data';
import { TAG_LABEL } from '@/data';
import AddBtn from './AddBtn.vue';
import ProductLabel from './ProductLabel.vue';

/** Product card (Figma product-card: 144 wide, 120 photo, CTA on the photo). */
const props = withDefaults(defineProps<{ p: Product; pulseKey?: number; width?: number | string; tag?: boolean; drop?: string; note?: string }>(), { width: 144, tag: true });
const router = useRouter();
const pulsing = ref(false);
let t: ReturnType<typeof setTimeout> | undefined;
watch(() => props.pulseKey, k => {
  if (!k) return;
  clearTimeout(t);
  pulsing.value = false;
  requestAnimationFrame(() => { pulsing.value = true; t = setTimeout(() => { pulsing.value = false; }, 2700); });
});
const w = () => (typeof props.width === 'number' ? props.width + 4 + 'px' : props.width);
</script>

<template>
  <div class="pc" :class="{ 'pc--pulse': pulsing }" :style="{ width: w() }">
    <div class="pc__in" role="button" tabindex="0" @click="router.push(`/produk/${p.id}`)" @keydown.enter="router.push(`/produk/${p.id}`)">
      <div class="pc__photo"><img :src="p.img" alt="" draggable="false" /></div>
      <AddBtn :id="p.id" />
      <div class="pc__body">
        <ProductLabel v-if="drop" kind="down" :label="drop" />
        <ProductLabel v-else-if="tag && p.tag" :kind="p.tag" :label="TAG_LABEL[p.tag]" />
        <span class="t-c1 c-text pc__name">{{ p.n }}</span>
        <span class="t-s2 ellipsis">{{ rp(p.p) }}</span>
        <div v-if="!note && !!p.o" class="row pc__old">
          <span class="t-c1 c-med ellipsis pc__strike">{{ rp(p.o) }}</span><ProductLabel kind="disc" :label="p.d!" />
        </div>
        <span class="t-c1" :class="!note && p.meta.includes('credit note') ? 'c-ok' : 'c-med'">{{ note ?? p.meta }}</span>
      </div>
    </div>
  </div>
</template>

<style scoped lang="scss">
.pc { flex: none; margin: -2px; border-radius: 14px; border: 2px solid rgba(0, 114, 255, 0); box-sizing: border-box; }
.pc--pulse { animation: pc-pulse 0.9s ease-in-out 3; }
@keyframes pc-pulse { 0%, 100% { border-color: rgba(0, 114, 255, 0); } 50% { border-color: rgba(0, 114, 255, 0.9); } }
.pc__in { position: relative; height: 100%; background: $blu-color-neutral-background-default; border-radius: 12px; overflow: hidden; cursor: pointer; &:active { opacity: 0.85; } }
.pc__photo { height: 120px; background: #fff; img { width: 100%; height: 100%; object-fit: contain; display: block; } }
.pc__body { padding: 10px 12px 12px; display: flex; flex-direction: column; gap: 4px; }
.pc__name { height: 32px; display: -webkit-box; -webkit-line-clamp: 2; -webkit-box-orient: vertical; overflow: hidden; }
.pc__old { gap: 4px; }
.pc__strike { text-decoration: line-through; min-width: 0; }
</style>
