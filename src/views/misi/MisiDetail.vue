<script setup lang="ts">
import { computed, onMounted, ref } from 'vue';
import { useRoute } from 'vue-router';
import BliBadge from '@blibli/blue.badge/dist/badge/blue/Badge';
import BliButton from '@blibli/blue.button/dist/button/blue/Button';
import BliProgressBar from '@blibli/blue.progress-bar/dist/progress-bar/blue/ProgressBar';
import BliTabs from '@blibli/blue.tabs/dist/tabs/blue/Tabs';
import BliTab from '@blibli/blue.tabs/dist/tabs/blue/Tab';
import AppIcon from '@/components/AppIcon.vue';
import AppArt from '@/components/AppArt.vue';
import AppFooter from '@/components/AppFooter.vue';
import TierIcon from '@/components/TierIcon.vue';
import FloatingHeader from '@/components/FloatingHeader.vue';
import ParallaxBg from '@/components/ParallaxBg.vue';
import { useScrollHeader } from '@/composables/useScrollHeader';
import { useStore } from '@/store';
import { MISSION_OKT, MissionKey, MISSIONS, QUARTER_BONUS, STAGE_POIN, TierKey, TIERS } from '@/data';
import { useGoReco } from '@/nav';
import { rp } from '@/theme';

const HEADER_H = 56;

/* Figma 5d / 5e header: vertical gradient in the tone of the tier's 3D badge
 * (same two stops as the btds_ic_tier_icon gradient, light → dark). */
const HEAD_BG: Record<TierKey, [string, string]> = {
  gold: ['#EBBF4F', '#614500'],
  classic: ['#1258C9', '#000208'],
  platinum: ['#838990', '#0F0F0F'],
  infinite: ['#CBD6EC', '#47506F'],
};
const jt = (n: number) => String(Math.round(n * 10) / 10).replace('.', ',');

/** extra-small badge variants (old XsBadge tones) */
type XsTone = 'green' | 'blue' | 'gray' | 'graySec' | 'greenSec';
const XS: Record<XsTone, ['green' | 'blue' | 'gray', 'secondary' | 'tertiary']> = {
  green: ['green', 'tertiary'], blue: ['blue', 'secondary'], gray: ['gray', 'tertiary'], graySec: ['gray', 'secondary'], greenSec: ['green', 'secondary'],
};

const pctNum = (s: string) => parseFloat(s.replace('%', '').replace(',', '.')) / 100;
/** 120% target bonus (Figma step 4 "Bonus credit note Rp500.000") */
const OVER_BONUS = 500000;

const route = useRoute();
const { S } = useStore();
const goReco = useGoReco();
const { scrollY, onScroll, threshold, setThreshold, solid } = useScrollHeader();

const id = String(route.params.id ?? '');
const k = (id && id in MISSIONS ? id : 'smart') as MissionKey;
const m = MISSIONS[k];
const head = HEAD_BG[m.lvl];
const tab = ref<'cap' | 'snk'>('cap');
const heroEl = ref<HTMLElement | null>(null);

const v = computed(() => S.missions[k]);
const done = computed(() => v.value >= m.tg);
const pc = computed(() => Math.min(100, Math.round((v.value / m.tg) * 100)));
const left = computed(() => Math.round((m.tg - v.value) * 10) / 10);

/* Figma 5d "Capaian" tab. Q4 numbers are derived: target/bulan = MISSIONS[k].tg, Okt = MISSION_OKT,
 * Nov = belanja berjalan, Des belum dimulai; insentif = CN % tier × belanja di bulan yang tercapai. */
const tg = m.tg * 1e6;
const rate = pctNum(m.pct);
const steps = computed(() => {
  const list: [number, string, XsTone][] = [
    ...STAGE_POIN.map(([p, pt]) => [p, `Bonus ${pt} poin`, 'green'] as [number, string, XsTone]),
    [100, `Bisa dapat credit note ${rp(m.reward)}`, 'blue'], [120, `Bonus credit note ${rp(OVER_BONUS)}`, 'gray'],
  ];
  let curSet = false;
  return list.map(([p, b, tone]) => {
    const amt = (m.tg * p) / 100, ok = v.value >= amt;
    let st: 'done' | 'now' | '' = ok ? 'done' : '';
    if (!ok && !curSet) { st = 'now'; curSet = true; }
    return { p, b, tone, amt, ok, st };
  });
});
const next = TIERS[TIERS.findIndex(t => t[0] === m.lvl) + 1];
const months = computed<[string, number | null][]>(() => [['Oktober', MISSION_OKT[k] * 1e6], ['November', v.value * 1e6], ['Desember', null]]);
const got = computed(() => months.value.reduce((a, [, x]) => a + (x ?? 0), 0));
const filled = computed(() => months.value.filter(([, x]) => x !== null).length);
const monthRows = computed(() => months.value.map(([n, x]) => {
  const pct = x === null ? 0 : Math.min(100, Math.round((x / tg) * 100));
  const ok = x !== null && x >= tg;
  return { n, x, pct, ok, label: ok ? 'Memenuhi target' : x === null ? 'Belum dimulai' : 'Belum memenuhi target' };
}));
const inc = computed(() => months.value.map(([n, x]) => [n, x !== null && x >= tg ? Math.round(x * rate) : 0] as const));
const incTotal = computed(() => inc.value.reduce((a, [, x]) => a + x, 0));
const R = 32, CIRC = 2 * Math.PI * R;
const rules = [`Berlaku 1 – 30 Nov 2026 untuk pembelian kategori ${m.cat}.`, 'Dihitung dari pesanan yang sudah dibayar, termasuk yang dibayar pakai credit note.', 'Credit note dikirim otomatis paling lambat 7 hari kerja setelah periode berakhir.', 'Tier di tiap misi akan dievaluasi tiap 3 bulan, dihitung dari rata-rata transaksi Anda.'];

// header turns white once scrolled past the gradient hero
onMounted(() => { if (heroEl.value) setThreshold(heroEl.value.offsetHeight - HEADER_H); });
</script>

<template>
  <div class="screen">
    <div class="screen__scroll no-scrollbar" @scroll="onScroll">
      <!-- gradient header (no stroke) -->
      <div ref="heroEl" class="hero">
        <ParallaxBg :scroll-y="scrollY"><div class="hero__bg" :style="{ background: `linear-gradient(180deg, ${head[0]}, ${head[1]})` }" /></ParallaxBg>
        <div class="hero__in">
          <div class="card head">
            <div class="row" style="gap: 12px">
              <TierIcon :tier="m.lvl" :size="48" />
              <div class="grow col" style="gap: 4px">
                <div class="row">
                  <span class="t-c1 c-med">Tier {{ m.L }}</span>
                  <BliBadge color="green" prominence="tertiary" size="extra-small">{{ done ? 'Selesai' : 'Otomatis ikut' }}</BliBadge>
                </div>
                <p class="t-s2">{{ m.t }}</p>
                <p class="t-c1 c-med">{{ done ? 'Diselesaikan 16 Nov 2026' : '1 – 30 Nov 2026 · berakhir dalam 14 hari' }}</p>
              </div>
            </div>
            <div class="divider" />
            <div class="row base">
              <span class="t-s1">Rp{{ jt(v) }}jt</span>
              <span class="t-c1 c-med grow">dari target Rp{{ m.tg }}jt</span>
              <span class="t-s2" :class="done ? 'c-ok' : 'c-info'">{{ pc }}%</span>
            </div>
            <BliProgressBar :model-value="pc" size="small" :status="done ? 'success' : 'info'" />
            <div class="row note">
              <AppIcon name="info" :size="18" color="var(--blu-color-info-icon-default)" />
              <span class="t-c1 c-med grow">{{ done ? `Credit note ${rp(m.reward)} sudah masuk dan siap dipakai belanja.` : `Rp${jt(left)}jt lagi untuk dapat credit note ${rp(m.reward)}.` }}</span>
            </div>
          </div>
        </div>
      </div>

      <!-- tabs.primary.fixed -->
      <div class="tabs">
        <BliTabs v-model="tab" variant="fixed">
          <BliTab value="cap" title="Capaian" />
          <BliTab value="snk" title="Syarat & ketentuan" />
        </BliTabs>
      </div>

      <div v-if="tab === 'cap'" class="cap">
        <p class="t-c1 c-med">Terakhir diperbarui: 16 Nov 2026, 08.20 WIB</p>

        <section class="sec">
          <div class="col" style="gap: 2px"><p class="t-s2">Capaian Anda</p><p class="t-c1 c-med">Penuhi capaian di tiap tingkatan untuk dapat semua bonusnya.</p></div>
          <div class="card">
            <div v-for="(s, i) in steps" :key="s.p" class="row step">
              <div class="step__rail">
                <span class="dot" :class="s.st">
                  <AppIcon v-if="s.st === 'done'" name="check" :size="14" color="#fff" />
                  <span v-else class="t-c1">{{ i + 1 }}</span>
                </span>
                <span v-if="i < steps.length - 1" class="line" :class="{ ok: s.ok }" />
              </div>
              <div class="grow col step__body" :class="{ last: i === steps.length - 1 }">
                <p class="t-s2" :class="s.st === '' ? 'c-med' : 'c-text'">{{ s.p }}% · Rp{{ jt(s.amt) }}jt</p>
                <BliBadge :color="XS[s.tone][0]" :prominence="XS[s.tone][1]" size="extra-small" style="align-self: flex-start">{{ s.b }}</BliBadge>
                <p v-if="s.st === 'now'" class="t-c1 c-warn">Tambah transaksi Rp{{ jt(s.amt - v) }}jt lagi</p>
              </div>
            </div>
          </div>
        </section>

        <section class="sec">
          <p class="t-s2">Tier Anda di misi ini</p>
          <div class="card" style="display: flex; flex-direction: column; gap: 12px">
            <div class="row tiers">
              <div v-for="[tk, n, req, p] in TIERS" :key="tk" class="tier" :class="{ on: tk === m.lvl }">
                <TierIcon :tier="tk" :size="tk === m.lvl ? 40 : 32" />
                <span :class="tk === m.lvl ? 't-s2' : 't-c1'" class="center">{{ n }}</span>
                <span class="t-c1 c-med center">{{ req }}</span>
                <span class="t-c1" :class="tk === m.lvl ? 'c-info' : 'c-med'">CN {{ p }}</span>
              </div>
            </div>
            <!-- banner.general with pi.inspiration -->
            <div v-if="next" class="row tip">
              <AppArt name="inspiration" :width="18" :height="20.69" />
              <span class="t-c1 c-med grow">Tingkatkan rata-rata transaksi bulanan Anda menjadi {{ next[2].replace('/bln', '') }} untuk naik ke tier {{ next[1] }}.</span>
            </div>
          </div>
        </section>

        <section class="sec">
          <p class="t-s2">Detail capaian Anda</p>
          <div class="recap">
            <p class="t-s2">Progres bulanan</p>
            <div v-for="r in monthRows" :key="r.n" class="mrow">
              <div class="row"><span class="t-b2 c-med grow">{{ r.n }}</span><BliBadge :color="r.ok ? 'green' : 'gray'" prominence="secondary" size="extra-small">{{ r.label }}</BliBadge></div>
              <div class="row" style="gap: 12px">
                <div class="donut">
                  <svg width="80" height="80" viewBox="0 0 80 80">
                    <circle cx="40" cy="40" :r="R" stroke="#f9f9fa" stroke-width="16" fill="none" />
                    <circle cx="40" cy="40" :r="R" :stroke="r.ok ? '#0072ff' : '#1d8fff'" stroke-width="16" fill="none" :stroke-dasharray="`${(r.pct / 100) * CIRC} ${CIRC}`" transform="rotate(-90 40 40)" />
                  </svg>
                  <span class="t-s2 donut__t">{{ r.pct }}%</span>
                </div>
                <div class="row grow" style="gap: 8px">
                  <div class="grow col" style="gap: 4px"><span class="t-c1">Tercapai</span><span class="c-med ellipsis" :class="(r.x ?? 0) >= 1e8 ? 't-c1' : 't-b2'">{{ rp(r.x ?? 0) }}</span></div>
                  <span class="vsep" />
                  <div class="grow col" style="gap: 4px"><span class="t-c1">Target</span><span class="c-med ellipsis" :class="tg >= 1e8 ? 't-c1' : 't-b2'">{{ rp(tg) }}</span></div>
                </div>
              </div>
            </div>
            <p class="t-b2 c-med">Rata-rata transaksi tiap bulan: {{ rp(Math.round(got / filled)) }}</p>
          </div>

          <div class="recap">
            <p class="t-s2">Total transaksi 3 bulan (Oktober – Desember)</p>
            <div class="col" style="gap: 8px">
              <div class="row" style="gap: 4px"><span class="t-b2 c-med grow">Saat ini</span><BliBadge :color="got >= 3 * tg ? 'green' : 'gray'" prominence="secondary" size="extra-small">{{ got >= 3 * tg ? 'Memenuhi target' : 'Belum memenuhi target' }}</BliBadge></div>
              <div class="row" style="gap: 4px"><span class="t-s1 grow">{{ rp(got) }}</span><span class="t-c1 c-med">dari {{ rp(3 * tg) }}</span></div>
              <div class="bar"><span :style="{ width: Math.min(100, (got / (3 * tg)) * 100) + '%' }" /></div>
            </div>
          </div>

          <div class="recap">
            <p class="t-s2">Insentif (Back margin)</p>
            <div class="mrow col" style="gap: 8px">
              <p class="t-b2 c-med">Insentif bulanan · CN {{ m.pct }}</p>
              <div class="col" style="gap: 4px">
                <div v-for="[n, x] in inc" :key="n" class="row between"><span class="t-b2">{{ n }}</span><span class="t-s2">{{ rp(x) }}</span></div>
              </div>
            </div>
            <div class="col" style="gap: 4px"><p class="t-b2 c-med">Akumulatif 3 bulan insentif</p><p class="t-s1">{{ rp(incTotal) }}</p></div>
          </div>

          <div class="recap">
            <p class="t-s2">Bonus</p>
            <div v-if="m.streak" class="mrow col" style="gap: 4px"><p class="t-b2 c-med">Bonus kuartal (target 3 bulan beruntun)</p><p class="t-s1">{{ rp(QUARTER_BONUS) }}</p></div>
            <div class="col" style="gap: 4px"><p class="t-b2 c-med">Bonus capai 120% target</p><p class="t-s1">{{ rp(OVER_BONUS) }}</p></div>
          </div>
        </section>
      </div>

      <div v-else class="snk">
        <div v-for="(t, i) in rules" :key="i" class="row rule"><span class="t-b2 c-med">•</span><span class="t-b2 c-med grow">{{ t }}</span></div>
      </div>
    </div>

    <FloatingHeader title="Detail misi" :scroll-y="scrollY" :threshold="threshold" :solid="solid" :hero-color="head[0]" />
    <AppFooter>
      <div class="grow col" style="gap: 2px">
        <span class="t-c1 c-med">{{ done ? 'Misi selesai' : `Tambah Rp${jt(left)}jt lagi` }}</span>
        <span class="t-s2" :class="done ? 'c-ok' : 'c-text'">Credit note {{ rp(m.reward) }}</span>
      </div>
      <BliButton @click="goReco(done ? undefined : `Belanja ${m.cat} dihitung ke ${m.t}`)">{{ done ? 'Pakai credit note' : 'Belanja sekarang' }}</BliButton>
    </AppFooter>
  </div>
</template>

<style scoped lang="scss">
.hero { position: relative; overflow: hidden; padding-top: 56px; }
.hero__bg { position: absolute; inset: 0; }
.hero__in { position: relative; padding: $blu-spacing-m $blu-spacing-m 20px; }
.head { display: flex; flex-direction: column; gap: 12px; box-shadow: 0 4px 16px rgba(13, 38, 102, 0.1); }
.base { align-items: baseline; }
.note { align-items: flex-start; padding: 8px; border-radius: 8px; border: 1px solid $blu-color-info-border-low; background: $blu-color-info-background-default; }
.tabs { background: $blu-color-neutral-background-default; padding-top: 8px; border-bottom: 1px solid $blu-color-neutral-border-default; }
.cap { padding: $blu-spacing-m; display: flex; flex-direction: column; gap: 24px; }
.sec { display: flex; flex-direction: column; gap: 12px; }
.step { align-items: stretch; gap: 12px; }
.step__rail { display: flex; flex-direction: column; align-items: center; }
.dot { width: 24px; height: 24px; border-radius: 12px; display: flex; align-items: center; justify-content: center; background: $blu-color-neutral-background-med; color: $blu-color-neutral-text-med;
  &.done { background: $blu-color-brand-success-background-default; }
  &.now { background: $blu-color-info-background-high; color: #fff; } }
.line { flex: 1; width: 2px; background: $blu-color-neutral-border-low; &.ok { background: $blu-color-brand-success-background-default; } }
.step__body { gap: 8px; padding-bottom: 16px; &.last { padding-bottom: 0; } }
.tiers { align-items: stretch; gap: 4px; }
.tier { flex: 1; display: flex; flex-direction: column; align-items: center; gap: 4px; padding: 8px 0; border-radius: 8px;
  &.on { background: $blu-color-info-background-low; border: 1px solid $blu-color-info-border-default; } }
.tip { align-items: flex-start; padding: 8px; border-radius: 8px; border: 1px solid $blu-color-neutral-border-low; background: $blu-color-neutral-background-low; }
.recap { background: $blu-color-neutral-background-default; border-radius: 12px; padding: $blu-spacing-m; display: flex; flex-direction: column; gap: 12px; }
.mrow { display: flex; flex-direction: column; gap: 8px; padding-bottom: 16px; border-bottom: 1px solid $blu-color-neutral-border-low; }
.donut { position: relative; width: 80px; height: 80px; flex: none; display: flex; align-items: center; justify-content: center; svg { position: absolute; inset: 0; } }
.donut__t { position: relative; }
.vsep { width: 1px; height: 24px; background: $blu-color-neutral-border-low; }
.bar { display: flex; height: 3px; border-radius: 8px; background: $blu-color-neutral-background-med; overflow: hidden; span { background: $blu-color-info-background-high; border-radius: 8px; } }
.snk { padding: $blu-spacing-m; display: flex; flex-direction: column; gap: 4px; }
.rule { align-items: flex-start; padding-left: 6px; gap: 8px; }
</style>
