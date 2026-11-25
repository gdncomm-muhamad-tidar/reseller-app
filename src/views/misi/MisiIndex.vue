<script setup lang="ts">
import { computed, onMounted, ref } from 'vue';
import { useRouter } from 'vue-router';
import BliBadge from '@blibli/blue.badge/dist/badge/blue/Badge';
import BliButton from '@blibli/blue.button/dist/button/blue/Button';
import BliProgressBar from '@blibli/blue.progress-bar/dist/progress-bar/blue/ProgressBar';
import BliTabs from '@blibli/blue.tabs/dist/tabs/blue/Tabs';
import BliTab from '@blibli/blue.tabs/dist/tabs/blue/Tab';
import AppIcon from '@/components/AppIcon.vue';
import TierIcon from '@/components/TierIcon.vue';
import Trophy from '@/components/Trophy.vue';
import Months from '@/components/Months.vue';
import NavyGlow from '@/components/NavyGlow.vue';
import FloatingHeader from '@/components/FloatingHeader.vue';
import ParallaxBg from '@/components/ParallaxBg.vue';
import ParallaxFg from '@/components/ParallaxFg.vue';
import { useScrollHeader } from '@/composables/useScrollHeader';
import { useStore } from '@/store';
import { IMG, MissionKey, MISSIONS, QUARTER_BONUS, stagePoin } from '@/data';
import { useGoReco } from '@/nav';
import { fmt, rp, short } from '@/theme';

const HEADER_H = 56;
const NAVY = '#1258c9';

const router = useRouter();
const { S, cnReady } = useStore();
const goReco = useGoReco();
const { scrollY, onScroll, threshold, setThreshold, solid } = useScrollHeader();

const tab = ref<'run' | 'next' | 'hist'>('run');
const seenHist = ref(false);
const tabsEl = ref<HTMLElement | null>(null);

// Figma 5c: every mission of the current month sits under "Berjalan" (achieved ones show their
// Tercapai state there); "Riwayat" holds achieved missions, flagged with a red dot.
const keys = Object.keys(MISSIONS) as MissionKey[];
const done = computed(() => keys.filter(k => S.missions[k] >= MISSIONS[k].tg));
const potential = computed(() => keys.filter(k => S.missions[k] < MISSIONS[k].tg).reduce((a, k) => a + MISSIONS[k].reward, 0));
const stageBonus = computed(() => keys.reduce((a, k) => a + stagePoin(k, S.missions[k]), 0));
const missionCn = computed(() => 4200000 + S.cns.filter(c => c.k.startsWith('m-')).reduce((a, c) => a + c.amt, 0));
const stats = computed(() => [
  { img: IMG.mission, a: `${keys.length} misi`, b: 'berjalan' },
  { img: IMG.money, a: short(potential.value), b: 'potensi CN' },
  { img: IMG.point, a: `${fmt(stageBonus.value)} poin`, b: 'bonus tahapan' },
]);
const cards = computed(() => (tab.value === 'run' ? keys : tab.value === 'hist' ? done.value : []));
const nowPct = computed(() => Math.min(100, Math.round((S.missions.smart / MISSIONS.smart.tg) * 100)));

const info = (k: MissionKey) => {
  const m = MISSIONS[k], v = S.missions[k], isDone = v >= m.tg, left = Math.round((m.tg - v) * 10) / 10;
  return { m, v, isDone, left, cn: S.cns.find(c => c.k === k || c.k === 'm-' + k) };
};

const onTab = (t: string | number) => {
  tab.value = t as typeof tab.value;
  if (t === 'hist') seenHist.value = true;
};

// header turns white once the tabs reach it
onMounted(() => { if (tabsEl.value) setThreshold(tabsEl.value.offsetTop - 16 - HEADER_H); });
</script>

<template>
  <div class="screen misi">
    <div class="screen__scroll no-scrollbar" @scroll="onScroll">
      <div class="hero">
        <ParallaxBg :scroll-y="scrollY"><div class="hero__bg" /><NavyGlow /></ParallaxBg>
        <ParallaxFg :scroll-y="scrollY" :threshold="threshold">
          <div class="glass hero__total">
            <div class="grow">
              <p class="t-c1 hero__soft">Credit note dari misi · 2026</p>
              <p class="t-h1 c-inv hero__amt">{{ rp(missionCn) }}</p>
              <span class="t-c1 hero__pill">{{ 2 + S.missionsDone.length }} misi selesai tahun ini</span>
            </div>
            <Trophy :size="80" />
          </div>
          <div class="row hero__stats">
            <div v-for="(s, i) in stats" :key="i" class="glass hero__stat">
              <img :src="s.img" width="40" height="40" alt="" />
              <span class="t-s2 c-inv">{{ s.a }}</span>
              <span class="t-c1 hero__soft2">{{ s.b }}</span>
            </div>
          </div>
        </ParallaxFg>
      </div>

      <div ref="tabsEl" class="body">
        <BliTabs :model-value="tab" variant="fixed" @update:model-value="onTab">
          <BliTab value="run" :title="`Berjalan (${keys.length})`" />
          <BliTab value="next" title="Akan datang" />
          <BliTab value="hist" title="Riwayat">
            <template #trailing-area><BliBadge v-if="done.length > 0 && !seenHist" dot color="red" /></template>
          </BliTab>
        </BliTabs>

        <div class="list">
          <template v-if="tab === 'run'">
            <!-- Figma quarter-streak -->
            <div class="card box">
              <div class="row top">
                <div class="grow col gap2">
                  <p class="t-s2">Bonus kuartal 4 2026</p>
                  <p class="t-c1 c-med">Capai target misi ini 3 bulan beruntun dan dapatkan bonus credit note {{ short(QUARTER_BONUS) }}.</p>
                </div>
                <span class="row streak"><AppIcon name="hotDeals" :size="16" color="#BC6E06" /><span class="t-s2">1</span></span>
              </div>
              <Months :now-pct="nowPct" />
            </div>
            <!-- Figma 5e cn-nudge: shown once a new mission is achieved this session -->
            <div v-if="S.missionsDone.length > 1 && cnReady > 0" class="row nudge">
              <AppIcon name="voucher" :size="20" color="var(--blu-color-info-icon-default)" />
              <span class="t-c1 grow">Anda punya credit note {{ rp(cnReady) }}. Pakai saat checkout, belanjanya tetap dihitung ke misi.</span>
              <button class="link t-lbl c-info" @click="goReco()">Pakai</button>
            </div>
            <p class="t-s2">Misi bulan ini</p>
          </template>

          <div v-if="tab === 'next'" class="card box">
            <div class="row">
              <TierIcon tier="gold" :size="40" />
              <div class="grow col gap2"><p class="t-c1 c-med">Mulai 1 Des 2026</p><p class="t-s2">Misi Loyalty Smartphone · Des</p></div>
            </div>
            <p class="t-c1 c-med">Target mengikuti level Anda di awal bulan. Otomatis diikuti, tidak perlu daftar.</p>
          </div>

          <!-- Figma mission-card/c: tier icon, level + title, period or "Tercapai" status, progress, CN reward + CTA -->
          <div v-for="k in cards" :key="k" class="card box" role="button" tabindex="0" @click="router.push(`/misi/${k}`)">
            <div class="row">
              <TierIcon :tier="info(k).m.lvl" :size="40" />
              <div class="grow col gap2"><p class="t-c1 c-med">Tier {{ info(k).m.L }}</p><p class="t-s2">{{ info(k).m.t }}</p></div>
              <AppIcon name="chev" :size="18" />
            </div>
            <div class="row" style="gap: 8px">
              <BliBadge v-if="info(k).isDone" color="green" prominence="tertiary" size="extra-small">Selesai</BliBadge>
              <span class="t-c1 c-med">{{ info(k).isDone ? 'Diselesaikan 16 Nov 2026' : '1 – 30 Nov · berakhir dalam 14 hari' }}</span>
            </div>
            <div class="col" style="gap: 6px">
              <div class="row base" style="gap: 6px">
                <span class="t-s2">Rp{{ info(k).v }}jt</span>
                <span class="t-c1 c-med grow">dari Rp{{ info(k).m.tg }}jt</span>
                <span v-if="!info(k).isDone" class="t-c1 c-warn">Rp{{ info(k).left }}jt lagi{{ info(k).left <= 10 ? '!' : '' }}</span>
              </div>
              <BliProgressBar :model-value="(info(k).v / info(k).m.tg) * 100" size="small" status="info" />
            </div>
            <div class="row" style="gap: 8px">
              <div class="row reward grow">
                <AppIcon name="voucher" :size="16" color="var(--blu-color-info-icon-default)" />
                <span class="t-c1 grow">{{ info(k).isDone ? `Berhasil dapat credit note ${rp(info(k).m.reward)}` : `Bisa dapat credit note ${rp(info(k).m.reward)}` }}</span>
              </div>
              <BliButton v-if="info(k).isDone" size="small" :disabled="info(k).cn?.st === 'used'" @click.stop="goReco()">Pakai credit note</BliButton>
              <BliButton v-else size="small" prominence="secondary" @click.stop="goReco(`Belanja ${info(k).m.cat} dihitung ke ${info(k).m.t}`)">Beli produk</BliButton>
            </div>
          </div>

          <p v-if="tab === 'run'" class="t-c1 c-med center">Misi baru otomatis diikuti tiap awal bulan sesuai level Anda. Tier ditinjau tiap 3 bulan.</p>
          <p v-if="tab === 'hist' && !done.length" class="t-c1 c-med center">Belum ada misi yang tercapai.</p>
        </div>
      </div>
    </div>

    <FloatingHeader title="Misi dealer" :scroll-y="scrollY" :threshold="threshold" :solid="solid" :hero-color="NAVY">
      <template #right>
        <button class="pts" @click="router.push('/poin')">
          <AppIcon name="pointsLine" :size="16" color="#fff" /><span class="t-lbl c-inv">{{ fmt(S.poin) }} poin</span>
        </button>
      </template>
    </FloatingHeader>
  </div>
</template>

<style scoped lang="scss">
.misi { background: $blu-color-neutral-background-low; }
.hero { position: relative; overflow: hidden; padding: 56px $blu-spacing-m 40px; }
.hero__bg { position: absolute; inset: 0; background: linear-gradient(180deg, #1258c9, #05183a); }
.glass { background: rgba(255, 255, 255, 0.12); border: 1px solid rgba(255, 255, 255, 0.22); border-radius: 16px; }
.hero__total { padding: $blu-spacing-m; display: flex; align-items: center; gap: 12px; }
.hero__soft { color: rgba(255, 255, 255, 0.8); }
.hero__soft2 { color: rgba(255, 255, 255, 0.75); }
.hero__amt { font-size: 28px; line-height: 34px; margin: 4px 0; }
.hero__pill { display: inline-block; padding: 4px 8px; border-radius: 12px; background: #ffcd00; color: $blu-color-neutral-text-high; }
.hero__stats { margin-top: 12px; align-items: stretch; gap: $blu-spacing-s; }
.hero__stat { flex: 1; display: flex; flex-direction: column; align-items: center; padding: 10px 8px; gap: 6px; border-radius: 12px; text-align: center; }
.body { position: relative; margin-top: -16px; border-radius: 16px 16px 0 0; overflow: hidden; background: $blu-color-neutral-background-low; }
.list { padding: $blu-spacing-m; display: flex; flex-direction: column; gap: 12px; padding-bottom: 32px; }
.box { display: flex; flex-direction: column; gap: 12px; border: 1px solid $blu-color-neutral-border-low; text-align: left; }
.box[role='button'] { cursor: pointer; }
.top { align-items: flex-start; }
.gap2 { gap: 2px; }
.base { align-items: baseline; }
.streak { background: #feedb1; border-radius: 16px; padding: 4px 8px; gap: 4px; }
.nudge { background: $blu-color-info-background-low; border-radius: 8px; padding: 8px 12px; }
.link { padding: 0; }
.reward { padding: 6px 8px; border: 1px solid $blu-color-neutral-border-low; border-radius: 8px; gap: 6px; }
.pts { display: flex; align-items: center; gap: 4px; padding: 4px 8px; border-radius: 999px; background: $blu-color-info-background-high; }
</style>
