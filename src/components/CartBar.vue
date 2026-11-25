<script setup lang="ts">
import { useRouter } from 'vue-router';
import { useStore } from '@/store';

/** Sticky footer / floating navigation: "Total / N produk" + inverted "Cek" -> Daftar pesanan.
 *  Sits above the floating bottom nav while the cart has items. */
const { units } = useStore();
const router = useRouter();
</script>

<template>
  <Transition name="cartbar">
    <div v-if="units > 0" class="cartbar">
      <button type="button" class="cartbar__btn" @click="router.push('/keranjang')">
        <div class="cartbar__txt"><span class="t-b2 c-inv">Total</span><span class="t-s2 c-inv">{{ units }} produk</span></div>
        <span class="cartbar__cek t-s2 c-inv">Cek</span>
      </button>
    </div>
  </Transition>
</template>

<style scoped lang="scss">
.cartbar { position: absolute; left: 16px; right: 16px; bottom: calc(12px + env(safe-area-inset-bottom) + 64px + 8px); z-index: 19; pointer-events: none; }
.cartbar__btn {
  pointer-events: auto; width: 100%; display: flex; align-items: center; gap: 16px; padding: 8px 16px; border-radius: 8px;
  background: $blu-color-info-background-high; box-shadow: $blu-shadow-default; cursor: pointer; text-align: left;
}
.cartbar__txt { flex: 1; display: flex; flex-direction: column; }
.cartbar__cek { height: 36px; padding: 0 16px; border-radius: 999px; border: 1px solid #fff; background: rgba(25, 34, 42, 0.3); display: flex; align-items: center; justify-content: center; }
.cartbar-enter-active, .cartbar-leave-active { transition: opacity 0.25s, transform 0.25s cubic-bezier(0.34, 1.4, 0.64, 1); }
.cartbar-enter-from, .cartbar-leave-to { opacity: 0; transform: translateY(24px); }
</style>
