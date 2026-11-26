<script setup lang="ts">
import { computed, nextTick, onBeforeUnmount, ref, watch } from 'vue';
import { useRouter } from 'vue-router';
import BliButton from '@blibli/blue.button/dist/button/blue/Button';
import BliLink from '@blibli/blue.link/dist/link/blue/Link';
import BliBadge from '@blibli/blue.badge/dist/badge/blue/Badge';
import BliProgressBar from '@blibli/blue.progress-bar/dist/progress-bar/blue/ProgressBar';
import AppIcon from '@/components/AppIcon.vue';
import AppArt from '@/components/AppArt.vue';
import Performa from '@/components/Performa.vue';
import NumberFlow from '@/components/NumberFlow.vue';
import CartBar from '@/components/CartBar.vue';
import ProductCard from '@/components/ProductCard.vue';
import Glow from '@/components/Glow.vue';
import TierIcon from '@/components/TierIcon.vue';
import SkeletonCN from '@/components/SkeletonCN.vue';
import SkeletonHome from '@/components/SkeletonHome.vue';
import BannerCarousel from '@/components/BannerCarousel.vue';
import { NAV_SPACE } from '@/components/constants';
import { useStore } from '@/store';
import { BRANDS, dueIn, IMG, MISSIONS, PRODUCTS, UNSCANNED, type Brand, type MissionKey } from '@/data';
import { fmt, rp, short } from '@/theme';
import { openFin, useGoReco } from '@/nav';
import { closeSheet, openSheet, sheetVisible, toast } from '@/composables/overlay';
import HomeMissionPopup from '@/views/sheets/HomeMissionPopup.vue';
import HomeBrandSheet from '@/views/sheets/HomeBrandSheet.vue';
import HomeNotifSheet from '@/views/sheets/HomeNotifSheet.vue';

const router = useRouter();
const store = useStore();
const { S, cnTotal, unpaid, units, reset, setPopup, payInvoices, seeCN, setBrand } = store;
const brand = computed(() => BRANDS[S.brand]);
/** skeleton while the interface switches brand (Pilih brand → Lanjut) */
const switching = ref(false);
const goReco = useGoReco();
const scrollEl = ref<HTMLElement | null>(null);
const recoEl = ref<HTMLElement | null>(null);
const pulse = ref(0);
const scrolled = ref(false);
const timers: ReturnType<typeof setTimeout>[] = [];
const later = (fn: () => void, ms: number) => { timers.push(setTimeout(fn, ms)); };
onBeforeUnmount(() => timers.forEach(clearTimeout));

// Credit note nudge: when the total has grown since the user last saw it, roll the number up,
// then reveal "+Rp… telah ditambahkan". Waits until no sheet (e.g. the "misi tercapai" popup) covers Beranda.
const shownCN = ref(S.cnSeen);
const addedIn = ref(!!S.cnAdded);
watch([sheetVisible, () => S.pendingPopup, cnTotal, () => S.cnSeen], (_v, _o, onCleanup) => {
  if (sheetVisible.value || S.pendingPopup || cnTotal.value === S.cnSeen) return;
  const silent = cnTotal.value < S.cnSeen || shownCN.value === cnTotal.value;
  const t = setTimeout(() => { shownCN.value = cnTotal.value; if (silent) seeCN(cnTotal.value); }, silent ? 0 : 500);
  onCleanup(() => clearTimeout(t));
}, { immediate: true });
const onCNRolled = (from: number, to: number) => {
  if (to <= from) return;
  seeCN(to);
  navigator.vibrate?.(10);
  addedIn.value = false;
  later(() => { addedIn.value = true; }, 80);
};

// pop up "misi tercapai" after opening from the notification
watch(() => S.pendingPopup, (v, _o, onCleanup) => {
  if (!v) return;
  const t = setTimeout(() => {
    setPopup(false);
    navigator.vibrate?.(10);
    openSheet(HomeMissionPopup, { onUse: () => closeSheet(() => goReco()) }, { confetti: true });
  }, 380);
  onCleanup(() => clearTimeout(t));
}, { immediate: true });

// "Pakai credit note" → scroll to Produk pilihan
watch(() => S.homeFocus.n, (n, _o, onCleanup) => {
  if (!n) return;
  const t = setTimeout(async () => {
    await nextTick();
    const sc = scrollEl.value, el = recoEl.value;
    if (sc && el) {
      const y = el.getBoundingClientRect().top - sc.getBoundingClientRect().top + sc.scrollTop - 16;
      sc.scrollTo({ top: Math.max(0, y), behavior: 'smooth' });
    }
    pulse.value += 1;
    toast(S.homeFocus.msg ?? 'Credit note Rp130.000 otomatis dipakai di checkout');
  }, 350);
  onCleanup(() => clearTimeout(t));
}, { immediate: true });

const overdue = computed(() => unpaid.value.filter(i => i.st === 'over'));
const bill = computed(() => unpaid.value.find(i => i.st === 'due'));
const missionKeys = Object.keys(MISSIONS) as MissionKey[];
const left = (k: MissionKey, v: number) => Math.round((MISSIONS[k].tg - v) * 10) / 10;
const finTo = (tab: 'ring' | 'inv' | 'cn') => ({ path: '/finansial', query: { tab, t: String(Date.now()) } });
const misiTo = (id: string) => ({ path: `/misi/${id}` });
const onScroll = (e: Event) => { scrolled.value = (e.target as HTMLElement).scrollTop > 30; };

// long-press the store avatar → reset demo
let lp: ReturnType<typeof setTimeout> | undefined;
const lpStart = () => { lp = setTimeout(() => { reset(); router.replace('/'); }, 800); };
const lpEnd = () => clearTimeout(lp);

const pickBrand = (b: Brand) => closeSheet(() => {
  if (b === S.brand) return;
  scrollEl.value?.scrollTo({ top: 0 });
  switching.value = true;
  setBrand(b);
  later(() => { switching.value = false; toast(`Akses belanja ${BRANDS[b].name}`); }, 1100);
});
const openBrand = () => openSheet(HomeBrandSheet, { current: S.brand, onPick: pickBrand });
const openNotif = () => openSheet(HomeNotifSheet);
const pay = (ids: string[]) => { payInvoices(ids); router.push('/bayar'); };

const actions = computed(() => {
  const rows: { title: string; sub: string; tone: string; cta: string; secondary?: boolean; on: () => void }[] = [];
  if (overdue.value.length) rows.push({ title: `${overdue.value.length} tagihan jatuh tempo`, sub: `Total ${short(overdue.value.reduce((t, i) => t + i.amt, 0))} · terlambat 4 hari`, tone: 'c-danger', cta: 'Bayar', on: () => pay(overdue.value.map(i => i.id)) });
  const b = bill.value;
  if (b) rows.push({ title: `Bayar ${b.id}`, sub: `${short(b.amt)} · jatuh tempo ${dueIn(b.due)}`, tone: 'c-warn', cta: 'Bayar', on: () => pay([b.id]) });
  rows.push({ title: 'Scan IMEI produk yang Anda beli', sub: `Bisa dapat credit note ${short(UNSCANNED.reduce((a, id) => a + PRODUCTS[id].cn, 0))}`, tone: 'c-ok', cta: 'Scan', secondary: true, on: () => router.push('/scan') });
  return rows;
});
</script>

<template>
  <div class="screen home">
    <div v-if="scrolled" class="home__safe" />
    <div ref="scrollEl" class="screen__scroll" :style="{ paddingBottom: `${NAV_SPACE + (units ? 64 : 0)}px` }" @scroll.passive="onScroll">
      <div class="hero">
        <Glow color="#0072FF" :cx="20" :cy="20" :rx="110" :ry="90" :opacity="0.2" />
        <Glow color="#1D8FFF" :cx="50" :cy="10" :rx="120" :ry="100" :opacity="0.5" right />
        <div class="hero__in">
          <div class="row hero__bar">
            <button class="avatar" type="button" @pointerdown="lpStart" @pointerup="lpEnd" @pointerleave="lpEnd" @pointercancel="lpEnd" @contextmenu.prevent>
              <span class="avatar__bg" /><img :src="IMG.store" alt="" />
            </button>
            <button class="grow col hero__store" type="button" @click="openBrand">
              <span class="t-c1 c-med">Selamat pagi,</span>
              <span class="row hero__name"><span class="t-s1 c-text">{{ brand.store }}</span><AppIcon name="chevD" :size="16" /></span>
            </button>
            <button class="circ" type="button" aria-label="Chat" @click="toast('Chat dengan Sales Budi belum tersedia di demo ini')"><AppIcon name="chat" /></button>
            <button class="circ" type="button" aria-label="Notifikasi" @click="openNotif">
              <AppIcon name="bell" />
              <BliBadge notification class="circ__n">3</BliBadge>
            </button>
          </div>

          <SkeletonCN v-if="switching" />
          <div v-else class="cn">
            <div role="button" tabindex="0" class="cn__tap" @click="openFin('cn')" @keyup.enter="openFin('cn')">
              <div class="row">
                <AppIcon name="cashIn" color="var(--blu-color-info-icon-default)" />
                <span class="t-c1 c-med grow">Credit note Anda</span>
                <BliLink to="/cn-riwayat" @click.stop>Riwayat</BliLink>
              </div>
              <div class="cn__amt">
                <NumberFlow class="amount" :value="shownCN" prefix="Rp" :duration="2400" continuous fade-color="#fff" @done="onCNRolled" />
              </div>
              <div v-if="S.cnAdded" class="cn__added" :class="{ 'cn__added--in': addedIn }">
                <BliBadge color="green">+{{ rp(S.cnAdded) }} telah ditambahkan</BliBadge>
              </div>
            </div>
            <div class="divider cn__div" />
            <div class="row cn__entries">
              <div role="button" tabindex="0" class="entry" @click="router.push('/poin')" @keyup.enter="router.push('/poin')">
                <div class="grow col entry__txt">
                  <span class="row entry__lbl"><AppArt name="points-blibli" :width="18" /><span class="t-c1 c-med">Poin</span></span>
                  <span class="t-s1 c-text">{{ fmt(S.poin) }}</span>
                </div>
                <AppIcon name="chev" :size="16" />
              </div>
              <div class="vsep" />
              <div role="button" tabindex="0" class="entry" @click="router.push('/misi')" @keyup.enter="router.push('/misi')">
                <div class="grow col entry__txt">
                  <span class="row entry__lbl"><AppIcon name="mission" :size="18" color="var(--blu-color-info-icon-default, #0072ff)" /><span class="t-c1 c-med">Misi diikuti</span></span>
                  <span class="t-s1 c-text">{{ missionKeys.length }} misi</span>
                </div>
                <AppIcon name="chev" :size="16" />
              </div>
            </div>
          </div>
        </div>
      </div>

      <SkeletonHome v-if="switching" class="wrap wrap--sk" />
      <div v-else class="body wrap">
        <BannerCarousel :key="S.brand" class="banner" :brand="S.brand" />
        <section class="sec sec--acts">
          <div class="row">
            <div class="warnico">
              <img :src="IMG.routinePayments" alt="" class="warnico__a" />
              <img :src="IMG.warning" alt="" class="warnico__b" />
            </div>
            <span class="t-s1 c-text grow">Perlu tindakan</span>
            <BliLink :to="finTo('inv')">Lihat semua ({{ unpaid.length }})</BliLink>
          </div>
          <div class="card acts">
            <div v-for="(a, i) in actions" :key="a.title" class="act" :class="{ 'act--last': i === actions.length - 1 }">
              <div class="grow col act__txt"><span class="t-s2 c-text">{{ a.title }}</span><span class="t-c1" :class="a.tone">{{ a.sub }}</span></div>
              <BliButton size="small" :prominence="a.secondary ? 'secondary' : 'primary'" @click="a.on()">{{ a.cta }}</BliButton>
            </div>
          </div>
        </section>

        <section class="sec sec--perf">
          <Performa>
            <template #title>
              <span class="row"><span class="t-s1 c-text">Ringkasan belanja Anda</span><span class="t-b2 c-med">•  November 2026</span></span>
            </template>
          </Performa>
        </section>

        <section class="sec sec--misi">
          <template v-if="S.brand === 'apple'">
            <div class="row between"><span class="t-s1 c-text">Misi Anda</span><BliLink :to="misiTo('smart')">Detail</BliLink></div>
            <div class="card mcard" role="button" tabindex="0" @click="router.push(misiTo('smart'))" @keyup.enter="router.push(misiTo('smart'))">
              <div class="row mcard__top"><TierIcon :tier="MISSIONS.smart.lvl" :size="32" /><div class="grow col act__txt"><span class="t-c1 c-med">Tier {{ MISSIONS.smart.L }}</span><span class="t-s2 c-text">{{ MISSIONS.smart.t }}</span></div></div>
              <div class="row mcard__amt">
                <span class="t-c1 c-text">Rp{{ S.missions.smart }}jt</span>
                <span class="t-c1 c-med grow">dari Rp{{ MISSIONS.smart.tg }}jt</span>
                <span v-if="S.missions.smart < MISSIONS.smart.tg" class="t-c1 c-warn">Rp{{ left('smart', S.missions.smart) }}jt lagi</span>
              </div>
              <BliProgressBar :model-value="(S.missions.smart / MISSIONS.smart.tg) * 100" size="small" />
            </div>
          </template>
          <template v-else>
            <div class="row between"><span class="t-s1 c-text">Misi Anda ({{ missionKeys.length }})</span><BliLink to="/misi">Lihat semua</BliLink></div>
            <div class="hscroll hscroll--misi no-scrollbar">
              <div v-for="k in missionKeys" :key="k" class="card mcard mcard--w" role="button" tabindex="0" @click="router.push(misiTo(k))" @keyup.enter="router.push(misiTo(k))">
                <div class="row mcard__top"><TierIcon :tier="MISSIONS[k].lvl" :size="32" /><div class="grow col act__txt"><span class="t-c1 c-med">Level {{ MISSIONS[k].L }}</span><span class="t-s2 c-text ellipsis">{{ MISSIONS[k].t }}</span></div></div>
                <div class="col mcard__bar">
                  <div class="row mcard__amt">
                    <span class="row grow mcard__nums"><span class="t-c1 c-text">Rp{{ S.missions[k] }}jt</span><span class="t-c1 c-med grow ellipsis">dari Rp{{ MISSIONS[k].tg }}jt</span></span>
                    <span v-if="S.missions[k] < MISSIONS[k].tg" class="t-c1 c-warn">Rp{{ left(k, S.missions[k]) }}jt lagi</span>
                  </div>
                  <BliProgressBar :model-value="(S.missions[k] / MISSIONS[k].tg) * 100" size="small" :status="S.missions[k] >= MISSIONS[k].tg ? 'success' : 'info'" />
                </div>
              </div>
            </div>
          </template>
        </section>

        <section class="sec sec--rebuy">
          <div class="row between"><span class="t-s1 c-text">Belanja lagi</span><BliLink to="/pesanan">Riwayat</BliLink></div>
          <div class="hscroll hscroll--prod no-scrollbar">
            <ProductCard v-for="r in brand.rebuy" :key="r.id" :p="PRODUCTS[r.id]" :drop="r.drop" :note="r.note" :tag="false" />
          </div>
        </section>

        <section ref="recoEl" class="sec sec--reco">
          <div class="row between"><span class="t-s1 c-text">Produk pilihan untuk Anda</span><BliLink to="/katalog">Katalog</BliLink></div>
          <div class="hscroll hscroll--prod no-scrollbar">
            <ProductCard v-for="(id, i) in brand.reco" :key="id" :p="PRODUCTS[id]" :pulse-key="i === 0 ? pulse : undefined" />
          </div>
        </section>

        <section class="sec sec--trend">
          <div class="row between"><span class="t-s1 c-text">Laris dibeli dealer lain</span><BliLink to="/katalog">Lihat semua</BliLink></div>
          <div class="hscroll hscroll--prod no-scrollbar">
            <ProductCard v-for="t in brand.trending" :key="t.id" :p="PRODUCTS[t.id]" :tag="!t.noTag && t.id !== 'tab'" />
          </div>
        </section>
      </div>
    </div>
    <CartBar />
  </div>
</template>

<style scoped lang="scss">
.home__safe { position: absolute; top: 0; left: 0; right: 0; height: env(safe-area-inset-top); background: $blu-color-neutral-background-default; z-index: 5; }
.hero { position: relative; overflow: hidden; padding: calc(env(safe-area-inset-top) + 8px) $blu-spacing-m $blu-spacing-m;
  background: linear-gradient(180deg, $blu-color-info-background-low 0%, $blu-color-info-background-default 60%, $blu-color-neutral-background-low 100%); }
.hero__bar { position: relative; gap: $blu-spacing-s; }
.hero__store { gap: 2px; text-align: left; align-items: flex-start; cursor: pointer; }
.hero__name { gap: 4px; }
.avatar { position: relative; width: 40px; height: 40px; border-radius: 20px; display: flex; align-items: center; justify-content: center; padding: 0; user-select: none; -webkit-touch-callout: none;
  img { width: 36px; height: 36px; position: relative; pointer-events: none; } }
.avatar__bg { position: absolute; width: 29.25px; height: 29.25px; border-radius: 9.75px; background: linear-gradient(180deg, #e1f1ff, #f3f9ff); }
.circ { position: relative; width: 40px; height: 40px; border-radius: 20px; background: $blu-color-neutral-background-default; box-shadow: $blu-shadow-default; display: flex; align-items: center; justify-content: center; padding: 0; }
.circ__n { position: absolute; top: 2px; right: 2px; }
.cn { position: relative; margin-top: $blu-spacing-m; border-radius: 16px; background: $blu-color-neutral-background-default; padding: $blu-spacing-m; }
.cn__tap { cursor: pointer; }
.cn__amt { margin-top: $blu-spacing-s; }
.amount { font-size: 24px; line-height: 28px; font-weight: 700; color: $blu-color-neutral-text-high; }
.cn__added { margin-top: 6px; opacity: 0; transform: translateY(8px) scale(0.92); transition: opacity 0.38s ease, transform 0.38s cubic-bezier(0.34, 1.56, 0.64, 1);
  &--in { opacity: 1; transform: none; } }
.cn__div { margin-top: $blu-spacing-s; }
.cn__entries { margin-top: $blu-spacing-s; gap: $blu-spacing-s; }
.entry { flex: 1; min-width: 0; display: flex; align-items: center; gap: $blu-spacing-xs; cursor: pointer; }
.entry__txt { gap: 2px; }
.entry__lbl { gap: 4px; }
.vsep { width: 1px; height: 40px; background: $blu-color-neutral-border-low; }
.body { display: flex; flex-direction: column; gap: 24px; padding-top: $blu-spacing-xs; }
.sec { padding: 0 $blu-spacing-m; display: flex; flex-direction: column; gap: $blu-spacing-s; }
.warnico { position: relative; width: 40px; height: 40px; }
.warnico__a { position: absolute; left: 0.25px; top: 1.85px; width: 39.79px; height: 39.79px; }
.warnico__b { position: absolute; left: 20.22px; top: 20px; width: 18.33px; height: 18.33px; }
.acts { padding: 0; overflow: hidden; }
.act { display: flex; align-items: center; gap: $blu-spacing-s; padding: $blu-spacing-s $blu-spacing-m; border-bottom: 1px solid $blu-color-neutral-border-low; &--last { border-bottom: 0; } }
.act__txt { gap: 2px; }
.mcard { display: flex; flex-direction: column; gap: 10px; cursor: pointer; text-align: left;
  &--w { width: 200px; flex: none; } }
.mcard__top { gap: $blu-spacing-s; }
.mcard__amt { align-items: baseline; gap: 4px; }
.mcard__bar { gap: 6px; }
.mcard__nums { min-width: 0; gap: 4px; align-items: baseline; }
.hscroll { display: flex; gap: $blu-spacing-s; margin: 0 (-$blu-spacing-m); padding: 0 $blu-spacing-m; overflow-x: auto; align-items: flex-start;
  > * { flex: none; } }

/* ---------- Tablet (≥600) & desktop (≥1024): container = .phone--wide (App.vue) ---------- */
@container phone (min-width: 600px) {
  /* hero background is full-bleed; hero content and body share one centred column */
  .hero { padding: calc(env(safe-area-inset-top) + 16px) 0 24px; }
  .hero__in, .wrap { position: relative; width: calc(100% - 48px); max-width: 1200px; margin: 0 auto; }
  .wrap--sk { width: calc(100% - 16px); max-width: 1232px; } /* SkeletonHome has its own 16px gutter */
  .avatar { width: 48px; height: 48px; border-radius: 24px; }
  /* credit note card: amount on the left, Poin / Misi on the right */
  .cn { display: flex; align-items: center; gap: $blu-spacing-m; padding: 20px 24px; }
  .cn__tap { flex: 1.2; min-width: 0; }
  .cn__div { margin: 0; width: 1px; height: 56px; }
  .cn__entries { flex: 1; min-width: 0; margin: 0; gap: $blu-spacing-m; }
  .amount { font-size: 28px; line-height: 32px; }

  .body { display: grid; grid-template-columns: minmax(0, 1fr) minmax(0, 1fr); column-gap: 24px; row-gap: 32px; align-items: start;
    padding: $blu-spacing-m 0 0;
    grid-template-areas: 'banner banner' 'acts perf' 'misi misi' 'rebuy rebuy' 'reco reco' 'trend trend'; }
  .banner { grid-area: banner; margin: 0 -8px; }
  .sec { padding: 0; }
  .sec--acts { grid-area: acts; } .sec--perf { grid-area: perf; } .sec--misi { grid-area: misi; }
  .sec--rebuy { grid-area: rebuy; } .sec--reco { grid-area: reco; } .sec--trend { grid-area: trend; }

  /* horizontal scrollers become wrapping grids */
  .hscroll { display: grid; margin: 0; padding: 0; overflow: visible; gap: $blu-spacing-m; align-items: stretch; }
  .hscroll--misi { grid-template-columns: repeat(auto-fill, minmax(220px, 1fr)); }
  .hscroll--prod { grid-template-columns: repeat(auto-fill, minmax(168px, 1fr)); }
  .mcard--w { width: auto; }
  .hscroll--prod > * { width: auto !important; } /* ProductCard sets a fixed inline width for the phone scroller */
}
@container phone (min-width: 1024px) {
  /* leave room for the vertical nav rail on the left */
  .screen__scroll { padding-left: 112px; }
  .hero__in, .wrap { width: calc(100% - 64px); }
  .wrap--sk { width: calc(100% - 32px); }
  .body { column-gap: 32px;
    grid-template-columns: minmax(0, 3fr) minmax(0, 2fr);
    grid-template-rows: auto auto 1fr auto auto auto;
    grid-template-areas: 'banner perf' 'acts perf' 'misi perf' 'rebuy rebuy' 'reco reco' 'trend trend'; }
  .sec--perf { position: sticky; top: 16px; }
  .hscroll--prod { grid-template-columns: repeat(auto-fill, minmax(184px, 1fr)); }
}
</style>
