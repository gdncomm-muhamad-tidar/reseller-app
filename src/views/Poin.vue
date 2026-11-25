<script setup lang="ts">
import { computed, onMounted, ref } from 'vue';
import BliBadge from '@blibli/blue.badge/dist/badge/blue/Badge';
import BliButton from '@blibli/blue.button/dist/button/blue/Button';
import BliTabs from '@blibli/blue.tabs/dist/tabs/blue/Tabs';
import BliTab from '@blibli/blue.tabs/dist/tabs/blue/Tab';
import CircleIcon from '@/components/CircleIcon.vue';
import Glow from '@/components/Glow.vue';
import MiDevice from '@/components/MiDevice.vue';
import Sparkle from '@/components/Sparkle.vue';
import FloatingHeader from '@/components/FloatingHeader.vue';
import ParallaxBg from '@/components/ParallaxBg.vue';
import { useScrollHeader } from '@/composables/useScrollHeader';
import { openSheet, closeSheet, toast } from '@/composables/overlay';
import PoinRedeemSheet from '@/views/sheets/PoinRedeemSheet.vue';
import { useStore } from '@/store';
import { IMG, POIN_NOV, POIN_START, Reward, REWARDS } from '@/data';
import { goTab } from '@/nav';
import { fmt } from '@/theme';

const HEADER_H = 56;
// Figma "Header / point": alert high 0% → med 38.7% → low 77.3% → neutral-background-low 116% (beyond the frame;
// at 100% the ramp is ≈ #FBF1CC)
const GOLD_BG = 'linear-gradient(180deg, #FFCD00 0%, #FEDD6C 38.7%, #FEEDB1 77.3%, #FBF1CC 100%)';
const GOLD_TOP = '#FFCD00';

const { S, redeem } = useStore();
const { scrollY, onScroll, threshold, setThreshold, solid } = useScrollHeader();
const tab = ref<'tukar' | 'hadiah' | 'riw'>('tukar');
const heroEl = ref<HTMLElement | null>(null);

const can = computed(() => REWARDS.filter(r => S.poin >= r.c));
const near = computed(() => REWARDS.filter(r => S.poin < r.c));
const verified = computed(() => S.scans.filter(s => s.st === 'ok'));
const gained = computed(() => POIN_NOV.reduce((a, r) => a + r[2], 0) + S.poin - POIN_START + S.redeemed.reduce((a, r) => a + r.c, 0));
const tiles = computed(() => [
  { k: 's', a: `+${fmt(gained.value)}`, b: 'poin bulan ini' },
  { k: 'd', a: `${5 + verified.value.length} IMEI`, b: 'diverifikasi' },
  { k: 't', a: `${REWARDS.filter(r => S.poin >= r.c).length} hadiah`, b: 'bisa ditukar' },
]);
const gifts = computed(() => [
  ...S.redeemed.map(r => ({ img: r.img, t: r.t, s: 'Ditukar 16 Nov · diproses 1–3 hari kerja', color: 'blue' as const, l: 'Diproses' })),
  { img: IMG.medal, t: 'Voucher belanja Rp100.000', s: 'Ditukar 2 Okt · dipakai #RFQ/1102', color: 'green' as const, l: 'Terpakai' },
]);
const history = computed(() => [
  ...S.redeemed.map(r => ['Tukar ' + r.t, '16 Nov', '−' + fmt(r.c)]),
  ...verified.value.map(s => [`Scan IMEI · ${s.product}`, '16 Nov', '+' + s.pts]),
  ...POIN_NOV.map(([t, d, v]) => [t, d, '+' + fmt(v)]),
  ['Tukar voucher belanja Rp100.000', '2 Okt', '−2.000'],
]);

const ask = (r: Reward) => openSheet(PoinRedeemSheet, {
  r,
  onConfirm: () => { redeem(r.k); closeSheet(); tab.value = 'hadiah'; toast(`${r.t} berhasil ditukar`); },
});

// Figma "5f · Poin — Opsi C | Copy improved": gold header with parallax; header turns white past it
onMounted(() => { if (heroEl.value) setThreshold(heroEl.value.offsetHeight - 16 - HEADER_H); });
</script>

<template>
  <div class="screen">
    <div class="screen__scroll no-scrollbar" @scroll="onScroll">
      <div ref="heroEl" class="hero">
        <ParallaxBg :scroll-y="scrollY">
          <div class="hero__bg" :style="{ background: GOLD_BG }" />
          <Glow color="#ffffff" :cx="30" :cy="60" :rx="120" />
          <Glow color="#EBBF4F" :cx="20" :cy="230" :rx="110" right />
        </ParallaxBg>
        <!-- poin-hero: 3D coin + sparkles, balance, expiry -->
        <div class="coin">
          <div class="coin__art">
            <img :src="IMG.point" class="coin__img" alt="" />
            <Sparkle :size="14" :x="4" :y="10" color="#fff" /><Sparkle :size="18" :x="104" :y="2" color="#fff" /><Sparkle :size="10" :x="110" :y="56" color="#fff" /><Sparkle :size="8" :x="0" :y="60" color="#fff" />
          </div>
          <div class="row bal"><span class="t-h1 bal__n">{{ fmt(S.poin) }}</span><span class="t-s2">poin</span></div>
          <p class="t-c1 center ink">2.000 poin hangus 31 Des 2026</p>
        </div>
        <div class="row stats">
          <div v-for="t in tiles" :key="t.k" class="stat">
            <div v-if="t.k === 's'" class="scan"><img :src="IMG.scan" alt="" /></div>
            <MiDevice v-else-if="t.k === 'd'" />
            <img v-else :src="IMG.trophy0" width="40" height="40" alt="" />
            <span class="t-s2">{{ t.a }}</span><span class="t-c1" style="opacity: 0.75">{{ t.b }}</span>
          </div>
        </div>
      </div>

      <div class="body">
        <div class="card box">
          <div class="row" style="gap: 12px">
            <img :src="IMG.shopping" width="64" height="64" alt="" />
            <div class="grow col" style="gap: 2px">
              <p class="t-s2">Verifikasi IMEI, dapat poin</p>
              <p class="t-c1 c-med">Scan IMEI unit terjual dan tukar poinnya dengan produk menarik! Poin masuk 1 – 3 hari kerja setelah diverifikasi.</p>
            </div>
          </div>
          <BliButton size="small" full-width @click="goTab('/scan')">Scan IMEI</BliButton>
        </div>

        <!-- finansial/tabs (tab.primary.scrollable in a white rounded card) -->
        <div class="tabs">
          <BliTabs v-model="tab" variant="fixed" no-border>
            <BliTab value="tukar" title="Tukar poin" />
            <BliTab value="hadiah" title="Hadiah saya" />
            <BliTab value="riw" title="Riwayat" />
          </BliTabs>
        </div>

        <template v-if="tab === 'tukar'">
          <template v-for="g in [{ h: 'Bisa ditukar sekarang', l: can }, { h: 'Sedikit lagi', l: near }]" :key="g.h">
            <template v-if="g.l.length > 0">
              <p class="t-s2">{{ g.h }}</p>
              <div class="grid">
                <div v-for="r in g.l" :key="r.k" class="card tile">
                  <div class="tile__img" :class="{ photo: r.photo }"><img :src="r.img" :width="r.photo ? 96 : 64" :height="r.photo ? 96 : 64" alt="" /></div>
                  <div class="tile__body">
                    <p class="t-lbl">{{ r.t }}</p>
                    <span class="orange t-lbl">{{ fmt(r.c) }} poin</span>
                    <div class="grow" />
                    <BliButton v-if="S.poin >= r.c" size="small" full-width @click="ask(r)">Tukar</BliButton>
                    <p v-else class="t-c1 c-warn">Kurang {{ fmt(r.c - S.poin) }} poin</p>
                  </div>
                </div>
              </div>
            </template>
          </template>
        </template>

        <template v-if="tab === 'hadiah'">
          <div v-for="(g, i) in gifts" :key="i" class="card row" style="gap: 12px">
            <CircleIcon><img :src="g.img" width="28" height="28" alt="" style="object-fit: contain" /></CircleIcon>
            <div class="grow col"><span class="t-s2">{{ g.t }}</span><span class="t-c1 c-med">{{ g.s }}</span></div>
            <BliBadge :color="g.color" prominence="secondary" size="extra-small">{{ g.l }}</BliBadge>
          </div>
        </template>

        <div v-if="tab === 'riw'" class="card hist">
          <div v-for="(r, i) in history" :key="i" class="row hist__row" :class="{ first: !i }">
            <div class="grow col"><span class="t-s2">{{ r[0] }}</span><span class="t-c1 c-med">{{ r[1] }}</span></div>
            <span class="t-s2" :class="r[2].startsWith('+') ? 'c-ok' : 'c-text'">{{ r[2] }} poin</span>
          </div>
        </div>
      </div>
    </div>

    <FloatingHeader title="Poin" tone="dark" :scroll-y="scrollY" :threshold="threshold" :solid="solid" :hero-color="GOLD_TOP" />
  </div>
</template>

<style scoped lang="scss">
.hero { position: relative; overflow: hidden; padding: 56px 0 24px; }
.hero__bg { position: absolute; inset: 0; }
.coin { position: relative; display: flex; flex-direction: column; align-items: center; gap: 8px; padding: 0 $blu-spacing-m; }
.coin__art { position: relative; width: 120px; height: 88px; }
.coin__img { position: absolute; left: 4px; top: -12px; width: 100px; height: 100px; }
.bal { align-items: baseline; }
.bal__n { font-size: 32px; line-height: 38px; }
.ink { color: #614500; }
.stats { position: relative; padding: $blu-spacing-m; align-items: stretch; }
.stat { flex: 1; display: flex; flex-direction: column; align-items: center; padding: 8px; gap: 8px; background: rgba(255, 205, 0, 0.1); border: 1px solid rgba(255, 255, 255, 0.22); border-radius: 12px; text-align: center; }
.scan { position: relative; width: 40px; height: 40px; overflow: hidden; img { position: absolute; left: -7.6px; top: -7.6px; width: 53.7px; height: 53.7px; } }
.body { position: relative; margin-top: -16px; border-radius: 16px 16px 0 0; background: $blu-color-neutral-background-low; padding: 20px $blu-spacing-m 32px; display: flex; flex-direction: column; gap: 16px; }
.box { display: flex; flex-direction: column; gap: 12px; }
.tabs { background: $blu-color-neutral-background-default; border-radius: 12px; overflow: hidden; }
.grid { display: grid; grid-template-columns: 1fr 1fr; gap: 12px; }
.tile { padding: 0; overflow: hidden; display: flex; flex-direction: column; }
.tile__img { height: 104px; display: flex; align-items: center; justify-content: center; background: $blu-color-info-background-low; &.photo { background: $blu-color-neutral-background-default; } img { object-fit: contain; } }
.tile__body { flex: 1; display: flex; flex-direction: column; gap: 8px; padding: 10px 12px 12px; }
.orange { align-self: flex-start; height: 16px; padding: 0 4px; border-radius: 4px; border: 1px solid #fed2a5; background: $blu-color-neutral-background-default; color: #dc5300; display: inline-flex; align-items: center; }
.hist { padding-top: 0; padding-bottom: 0; }
.hist__row { padding: 12px 0; border-top: 1px solid $blu-color-neutral-border-low; &.first { border-top: 0; } }
</style>
