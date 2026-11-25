<script setup lang="ts">
import { computed, ref } from 'vue';
import { useRouter } from 'vue-router';
import BliBadge from '@blibli/blue.badge/dist/badge/blue/Badge';
import BliButton from '@blibli/blue.button/dist/button/blue/Button';
import BliChips from '@blibli/blue.chips/dist/chips/blue/Chips';
import BliChip from '@blibli/blue.chips/dist/chips/blue/Chip';
import BliProgressBar from '@blibli/blue.progress-bar/dist/progress-bar/blue/ProgressBar';
import BliTabs from '@blibli/blue.tabs/dist/tabs/blue/Tabs';
import BliTab from '@blibli/blue.tabs/dist/tabs/blue/Tab';
import AppIcon from '@/components/AppIcon.vue';
import AppArt from '@/components/AppArt.vue';
import Medal from '@/components/Medal.vue';
import NavyGlow from '@/components/NavyGlow.vue';
import { openSheet } from '@/composables/overlay';
import RewardsTierSheet from '@/views/sheets/RewardsTierSheet.vue';
import { useStore } from '@/store';
import { MissionKey, MISSIONS } from '@/data';
import { goBack, goTab } from '@/nav';
import { fmt, rp, short } from '@/theme';

const router = useRouter();
const { S } = useStore();

const keys = Object.keys(MISSIONS) as MissionKey[];
const running = computed(() => keys.filter(k => S.missions[k] < MISSIONS[k].tg));
const potential = computed(() => running.value.reduce((a, k) => a + MISSIONS[k].reward, 0));
const nodes: [string, number][] = [['Classic', 0], ['Gold', 33.3], ['Platinum', 66.6], ['Infinite Pro', 100]];
const missions = computed(() => keys.map(k => {
  const m = MISSIONS[k], v = S.missions[k];
  return { k, m, v, done: v >= m.tg, left: Math.round((m.tg - v) * 10) / 10 };
}));

const seg = ref('misi');
const chip = ref('aktif');
const onSeg = (t: string | number) => { if (t === 'poin') router.push('/poin'); else seg.value = String(t); };
const nodeStyle = (i: number, x: number, now: boolean) => ({
  left: `${x}%`, top: now ? '2px' : '6px', alignItems: i === 0 ? 'flex-start' : i === 3 ? 'flex-end' : 'center',
  marginLeft: i === 0 ? '-6px' : i === 3 ? '-84px' : '-45px',
});
</script>

<template>
  <div class="screen">
    <div class="screen__scroll no-scrollbar">
      <div class="hero">
        <NavyGlow />
        <div class="row bar">
          <button class="back" aria-label="Kembali" @click="goBack"><AppIcon name="back" :size="24" color="#fff" /></button>
          <span class="t-t2 c-inv grow">Misi &amp; Rewards</span>
        </div>
        <div class="row" style="gap: 12px; margin-top: 4px; position: relative">
          <Medal tier="gold" :size="56" ring />
          <div class="grow col"><span class="t-c1 soft">Tier Anda</span><span class="t-h1 c-inv big">Gold</span></div>
          <button class="benefit" @click="openSheet(RewardsTierSheet)"><span class="t-lbl c-inv">Benefit tier</span></button>
        </div>
        <div class="track">
          <span class="track__bg" />
          <span class="track__on" />
          <div v-for="([n, x], i) in nodes" :key="n" class="node" :style="nodeStyle(i, x, n === 'Gold')">
            <span class="node__dot" :class="{ now: n === 'Gold' }" />
            <span :class="n === 'Gold' ? 't-s2 c-inv' : 't-c1 soft2'" :style="{ marginTop: n === 'Gold' ? '6px' : '10px' }">{{ n }}</span>
          </div>
        </div>
        <p class="t-c1 soft2" style="margin-top: 8px; position: relative">Rata-rata belanja 3 bulan terakhir Rp320jt/bulan. Rp180jt lagi per bulan untuk naik ke Platinum.</p>
      </div>

      <div class="card sum">
        <div class="row" style="align-items: stretch; gap: 16px">
          <div class="grow col" style="gap: 4px">
            <div class="row" style="gap: 6px"><AppArt name="badge-gold" :width="18" /><span class="t-c1 c-med">Poin</span></div>
            <span class="t-h1">{{ fmt(S.poin) }}</span>
            <span class="t-c1 c-warn">2.000 poin hangus 31 Des</span>
          </div>
          <span class="vsep" />
          <div class="grow col" style="gap: 4px">
            <span class="t-c1 c-med">Hadiah misi bulan ini</span>
            <span class="t-h1">{{ short(potential) }}</span>
            <span class="t-c1 c-med">Potensi credit note dari {{ running.length }} misi berjalan</span>
          </div>
        </div>
        <div class="row">
          <BliButton size="small" prominence="secondary" full-width @click="router.push('/poin')">Tukar poin</BliButton>
          <BliButton size="small" full-width @click="goTab('/scan')">Scan IMEI</BliButton>
        </div>
      </div>

      <div class="list">
        <div class="segs">
          <BliTabs :model-value="seg" variant="fixed" no-border @update:model-value="onSeg">
            <BliTab value="misi" title="Misi" />
            <BliTab value="poin" title="Poin" />
          </BliTabs>
        </div>
        <BliChips v-model="chip" single-select mandatory>
          <BliChip value="aktif">Aktif ({{ running.length }})</BliChip>
          <BliChip value="next">Akan datang</BliChip>
          <BliChip value="done">Selesai ({{ 3 + S.missionsDone.length }})</BliChip>
        </BliChips>
        <div v-for="x in missions" :key="x.k" class="card mc" role="button" tabindex="0" @click="router.push(`/misi/${x.k}`)">
          <div class="row" style="gap: 12px">
            <Medal :tier="x.m.lvl" :size="40" />
            <div class="grow col"><span class="t-s1">{{ x.m.t }}</span><span class="t-c1 c-med">Level {{ x.m.L }} · {{ x.done ? 'tercapai' : 'sisa 14 hari' }}</span></div>
            <AppIcon name="chev" :size="16" />
          </div>
          <BliProgressBar :model-value="(x.v / x.m.tg) * 100" size="small" :status="x.done ? 'success' : 'info'" />
          <div class="row">
            <span class="t-c1 grow">Rp{{ x.v }}jt dari Rp{{ x.m.tg }}jt</span>
            <BliBadge v-if="x.done" color="green">Tercapai</BliBadge>
            <BliBadge v-else color="yellow" prominence="secondary">Rp{{ x.left }}jt lagi</BliBadge>
          </div>
          <div class="row" style="gap: 6px">
            <AppIcon name="voucher" :size="16" color="var(--blu-color-success-icon-default)" />
            <span class="t-c1 c-ok">Credit note {{ rp(x.m.reward) }}{{ x.done ? ' · sudah masuk' : '' }}</span>
          </div>
        </div>
        <div class="more"><button class="t-lbl c-info" @click="router.push('/misi')">Lihat semua misi</button></div>
      </div>
    </div>
  </div>
</template>

<style scoped lang="scss">
.hero { position: relative; overflow: hidden; background: linear-gradient(180deg, #1258c9, #05183a); padding: env(safe-area-inset-top) $blu-spacing-m 100px; }
.bar { height: 56px; gap: 16px; position: relative; }
.back { display: flex; }
.soft { color: rgba(255, 255, 255, 0.8); }
.soft2 { color: rgba(255, 255, 255, 0.85); }
.big { font-size: 28px; line-height: 34px; }
.benefit { height: 28px; padding: 0 12px; border-radius: 14px; background: rgba(255, 255, 255, 0.18); border: 1px solid rgba(255, 255, 255, 0.3); }
.track { position: relative; height: 48px; margin: 20px 6px 0; }
.track__bg { position: absolute; left: 0; right: 0; top: 10px; height: 4px; border-radius: 2px; background: rgba(255, 255, 255, 0.3); }
.track__on { position: absolute; left: 0; width: 33.3%; top: 10px; height: 4px; border-radius: 2px; background: #ebbf4f; }
.node { position: absolute; display: flex; flex-direction: column; width: 90px; }
.node__dot { width: 12px; height: 12px; border-radius: 10px; background: #fff; border: 2px solid rgba(255, 255, 255, 0.6);
  &.now { width: 20px; height: 20px; background: #ebbf4f; border: 3px solid #fff; } }
.sum { position: relative; margin: -84px $blu-spacing-m 0; display: flex; flex-direction: column; gap: 12px; box-shadow: $blu-shadow-med; }
.vsep { width: 1px; background: $blu-color-neutral-border-low; }
.list { padding: $blu-spacing-m; display: flex; flex-direction: column; gap: 12px; padding-bottom: 32px; }
.segs { border: 1px solid $blu-color-neutral-border-low; border-radius: 12px; background: $blu-color-neutral-background-default; overflow: hidden; }
.mc { display: flex; flex-direction: column; gap: 10px; border: 1px solid $blu-color-neutral-border-low; cursor: pointer; }
.more { display: flex; justify-content: center; padding: 8px 0; }
</style>
