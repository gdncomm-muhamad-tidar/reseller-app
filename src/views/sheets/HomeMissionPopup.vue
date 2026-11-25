<script setup lang="ts">
import BliModalHeader from '@blibli/blue.modal/dist/modal/blue/ModalHeader';
import BliModalBody from '@blibli/blue.modal/dist/modal/blue/ModalBody';
import BliModalFooter from '@blibli/blue.modal/dist/modal/blue/ModalFooter';
import BliButton from '@blibli/blue.button/dist/button/blue/Button';
import BliProgressBar from '@blibli/blue.progress-bar/dist/progress-bar/blue/ProgressBar';
import Glow from '@/components/Glow.vue';
import Trophy from '@/components/Trophy.vue';
import Sparkle from '@/components/Sparkle.vue';
import { useStore } from '@/store';
import { IMG, MISSIONS } from '@/data';
import { rp } from '@/theme';

/** "Misi berhasil diselesaikan" modal — header close · body · footer CTAs */
defineProps<{ onUse: () => void }>();
const emit = defineEmits<{ close: [] }>();
const { S } = useStore();
const tab = S.missions.tab;
</script>

<template>
  <div>
    <BliModalHeader @close="emit('close')" />
    <BliModalBody>
      <div class="pop">
        <div class="pop__medal">
          <Glow color="#FEEDB1" :cx="70" :cy="56" :rx="70" :blur="20" />
          <div class="pop__trophy"><Trophy :size="96" /></div>
          <Sparkle :size="14" :x="6" :y="8" /><Sparkle :size="18" :x="118" :y="0" /><Sparkle :size="10" :x="124" :y="70" /><Sparkle :size="10" :x="2" :y="80" />
        </div>
        <div class="pop__main">
          <div class="pop__text col center">
            <span class="t-s1 c-text">Misi berhasil diselesaikan</span>
            <span class="t-c1 c-med">Anda mendapatkan credit note {{ rp(MISSIONS.aks.reward) }}. Jangan lupa pakai di transaksi selanjutnya, ya.</span>
          </div>
          <div class="pop__next col">
            <span class="t-c1 c-med">Masih ada misi lainnya</span>
            <div class="row">
              <div class="pop__img"><img :src="IMG.mission" alt="" /></div>
              <div class="grow col pop__gap">
                <span class="t-s2 c-text">{{ MISSIONS.tab.t }}</span>
                <span class="t-c1 c-warn">Tinggal Rp{{ MISSIONS.tab.tg - tab }}jt lagi · bisa dapat CN {{ rp(MISSIONS.tab.reward) }}</span>
              </div>
            </div>
            <BliProgressBar :model-value="(tab / MISSIONS.tab.tg) * 100" size="small" />
          </div>
        </div>
      </div>
    </BliModalBody>
    <BliModalFooter>
      <BliButton full-width @click="onUse()">Pakai credit note</BliButton>
      <BliButton full-width prominence="tertiary" @click="emit('close')">Nanti saja</BliButton>
    </BliModalFooter>
  </div>
</template>

<style scoped lang="scss">
.pop { display: flex; flex-direction: column; align-items: center; gap: $blu-spacing-s; }
.pop__medal { position: relative; width: 140px; height: 112px; }
.pop__trophy { position: absolute; left: 22px; top: 8px; }
.pop__main { align-self: stretch; padding-top: $blu-spacing-m; display: flex; flex-direction: column; align-items: center; gap: $blu-spacing-s; }
.pop__text { width: 240px; gap: 4px; }
.pop__next { align-self: stretch; background: $blu-color-neutral-background-low; border-radius: 12px; padding: $blu-spacing-s; gap: $blu-spacing-xs; }
.pop__img { width: 48px; height: 48px; display: flex; align-items: center; justify-content: center; img { width: 56px; height: 56px; } }
.pop__gap { gap: 2px; }
</style>
