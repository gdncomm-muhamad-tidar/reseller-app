<script setup lang="ts">
import { onMounted, ref } from 'vue';
import { useRouter } from 'vue-router';
import { useStore } from '@/store';
import AppIcon from '@/components/AppIcon.vue';

/** Demo start: simulated lock screen with the "misi tercapai" notification (web: no real notification). */
const router = useRouter();
const { setPopup } = useStore();
const now = new Date();
const hh = String(now.getHours()).padStart(2, '0'), mm = String(now.getMinutes()).padStart(2, '0');
const days = ['Minggu', 'Senin', 'Selasa', 'Rabu', 'Kamis', 'Jumat', 'Sabtu'];
const months = ['Januari', 'Februari', 'Maret', 'April', 'Mei', 'Juni', 'Juli', 'Agustus', 'September', 'Oktober', 'November', 'Desember'];
const shown = ref(false);
onMounted(() => { setTimeout(() => { shown.value = true; }, 600); });

const open = () => { setPopup(true); router.replace('/home'); };
</script>

<template>
  <div class="lock">
    <div class="lock__clock">
      <span class="t-c1 lock__date">{{ days[now.getDay()] }}, {{ now.getDate() }} {{ months[now.getMonth()] }}</span>
      <span class="t-h1 c-inv lock__time">{{ hh }}:{{ mm }}</span>
    </div>

    <div class="lock__notif" :class="{ on: shown }">
      <button type="button" class="lock__card" @click="open">
        <span class="lock__icon"><AppIcon name="shield" :size="24" color="#fff" /></span>
        <span class="col grow lock__txt">
          <span class="t-c1 c-med">Reseller App · sekarang</span>
          <span class="t-s2">Misi Aksesori tercapai! 🎉</span>
          <span class="t-c1 c-med">Credit note Rp130.000 sudah masuk dan siap dipakai belanja. Ketuk untuk lihat.</span>
        </span>
      </button>
      <p class="t-c1 lock__hint">Ketuk notifikasi untuk membuka aplikasi</p>
    </div>

    <div class="grow" />
    <div class="lock__foot">
      <button type="button" class="lock__skip t-lbl" @click="router.replace('/home')">Lewati, buka Beranda</button>
    </div>
  </div>
</template>

<style scoped lang="scss">
.lock {
  flex: 1; min-height: 0; display: flex; flex-direction: column; overflow: hidden;
  padding: env(safe-area-inset-top) 0 calc(env(safe-area-inset-bottom) + 16px);
  background: linear-gradient(160deg, #1258c9 0%, #0a2b64 55%, #000208 100%);
}
.lock__clock { display: flex; flex-direction: column; align-items: center; margin-top: 56px; }
.lock__date { color: rgba(255, 255, 255, 0.8); }
.lock__time { font-size: 72px; line-height: 80px; }
.lock__notif { margin: 24px 12px 0; opacity: 0; transform: translateY(-120px); transition: opacity 0.52s, transform 0.52s cubic-bezier(0.34, 1.4, 0.64, 1); &.on { opacity: 1; transform: none; } }
.lock__card { width: 100%; display: flex; gap: 12px; padding: 14px; border-radius: 20px; background: rgba(255, 255, 255, 0.94); text-align: left; cursor: pointer; transition: transform 0.12s; &:active { transform: scale(0.98); } }
.lock__icon { width: 40px; height: 40px; border-radius: 10px; background: $blu-color-info-background-high; display: flex; align-items: center; justify-content: center; flex: none; }
.lock__txt { gap: 2px; min-width: 0; }
.lock__hint { margin: 16px 0 0; text-align: center; color: rgba(255, 255, 255, 0.8); }
.lock__foot { padding: 0 24px; display: flex; flex-direction: column; gap: 8px; }
.lock__skip { padding: 10px; color: rgba(255, 255, 255, 0.85); cursor: pointer; }
</style>
