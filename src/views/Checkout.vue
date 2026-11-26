<script setup lang="ts">
import { useRouter } from 'vue-router';
import BliButton from '@blibli/blue.button/dist/button/blue/Button';
import BliRadio from '@blibli/blue.radio/dist/radio/blue/Radio';
import AppHeader from '@/components/AppHeader.vue';
import AppFooter from '@/components/AppFooter.vue';
import AppIcon from '@/components/AppIcon.vue';
import ProductPhoto from '@/components/ProductPhoto.vue';
import ProductLabel from '@/components/ProductLabel.vue';
import QtyField from '@/components/QtyField.vue';
import CircleIcon from '@/components/CircleIcon.vue';
import KV from '@/components/KV.vue';
import CheckoutNetSheet from './sheets/CheckoutNetSheet.vue';
import CheckoutTermsSheet from './sheets/CheckoutTermsSheet.vue';
import { ref } from 'vue';
import { fmt, rp, short } from '@/theme';
import { BRANDS, CBD_DISCOUNT, dayAfter, IMG, orderCN, PRODUCTS } from '@/data';
import { useStore } from '@/store';
import { toast, openSheet, closeSheet, sheetVisible } from '@/composables/overlay';

const router = useRouter();
const { S, sub, orig, units, cnAmt, total, usable, setTerm, setQty, submitOrder, setSkipTerms } = useStore();
const ok = 'var(--blu-color-success-text-default)';
const dd = ref(false);

/* Dropdown (mobile): options open in a bottom sheet "Pilih jangka waktu" — Net days only, CBD is its own option */
const pickNet = () => {
  dd.value = true;
  openSheet(CheckoutNetSheet, {
    value: S.term === 'net' ? S.netDays : undefined,
    onPick: (d: number) => closeSheet(() => { setTerm('net', d); dd.value = false; }),
  });
};
const send = () => { const o = submitOrder(); router.replace({ path: '/diajukan', query: { id: o.id } }); };
const ajukan = () => {
  if (S.skipTerms) return send();
  openSheet(CheckoutTermsSheet, { onSend: (skip: boolean) => closeSheet(() => { if (skip) setSkipTerms(true); send(); }) });
};
const selCount = () => usable.value.filter(c => S.cnSel[c.k]).length;
const save = () => orig.value - sub.value + cnAmt.value + (S.term === 'cbd' ? CBD_DISCOUNT : 0);
const info = (k: 'cbd' | 'net') => toast(k === 'cbd' ? 'CBD: bayar sebelum pesanan diproses, dapat diskon Rp500rb.' : 'Net: bayar setelah pesanan sampai, sesuai jumlah hari yang dipilih.');
</script>

<template>
  <div v-if="!S.cart.length" class="screen">
    <AppHeader title="Checkout" />
    <p class="t-b2 c-med center co__empty">Daftar pesanan kosong.</p>
  </div>
  <div v-else class="screen">
    <AppHeader title="Checkout">
      <div class="co__steps">
        <div class="row co__st"><span class="co__dot co__dot--done"><AppIcon name="check" :size="12" color="#fff" /></span><span class="t-c1">Keranjang</span></div>
        <div class="co__line co__line--done" />
        <div class="row co__st"><span class="co__dot co__dot--now t-c2b">2</span><span class="t-lbl c-info">Checkout</span></div>
        <div class="co__line" />
        <div class="row co__st"><span class="co__dot t-c2b">3</span><span class="t-c1 c-med">Tagihan</span></div>
      </div>
    </AppHeader>
    <div class="screen__scroll co__scroll">
      <div class="card">
        <div class="row co__row">
          <CircleIcon><AppIcon name="pin" color="var(--blu-color-info-icon-default)" /></CircleIcon>
          <div class="grow">
            <div class="t-s2">{{ BRANDS[S.brand].store }} · ITC Kuningan</div>
            <div class="t-c1 c-med">Gedung Sarana Jaya, Jl. Budi Kemuliaan No.1, Gambir, Jakarta Pusat</div>
          </div>
          <span class="t-lbl c-info">Ubah</span>
        </div>
        <div class="divider co__div" />
        <div class="row co__row">
          <CircleIcon><AppIcon name="chat" color="var(--blu-color-info-icon-default)" /></CircleIcon>
          <div class="grow">
            <div class="t-s2">Sales: Budi Santoso</div>
            <div class="t-c1 c-med">Menyetujui ±2 jam kerja</div>
          </div>
          <BliButton size="small" prominence="secondary" @click="toast('Chat sales belum tersedia di demo ini')">Chat</BliButton>
        </div>
      </div>

      <div class="card co__items">
        <span class="t-s2">{{ S.cart.length }} produk, {{ units }} item</span>
        <div v-for="c in S.cart" :key="c.id" class="row co__row">
          <ProductPhoto :src="PRODUCTS[c.id].img" />
          <div class="grow co__pbody">
            <span class="t-b2 co__name">{{ PRODUCTS[c.id].n }}</span>
            <span class="t-s2">{{ rp(PRODUCTS[c.id].p) }}</span>
            <div v-if="PRODUCTS[c.id].o" class="row co__disc">
              <ProductLabel kind="disc" :label="PRODUCTS[c.id].d!" />
              <span class="t-c1 co__strike">{{ rp(PRODUCTS[c.id].o!) }}</span>
            </div>
          </div>
          <QtyField :qty="c.qty" @change="(q: number) => setQty(c.id, q)" />
        </div>
      </div>

      <!-- credit-note-voucher: confetti backdrop, ticket-shaped amount, entry row -->
      <div class="card co__cn">
        <img :src="IMG.cnConfetti" class="co__confetti" alt="" />
        <div class="row">
          <span class="t-s2 grow">Credit note &amp; voucher</span>
          <span v-if="cnAmt > 0" class="co__ticket t-c1 c-ok">−{{ rp(cnAmt) }}</span>
        </div>
        <button class="co__cnbtn" @click="router.push('/credit-note')">
          <div class="grow co__cnbody">
            <div class="row co__cnt"><AppIcon name="voucher" :size="20" color="var(--blu-color-info-icon-default)" /><span class="t-s2 c-info">{{ selCount() ? `${selCount()} credit note dipakai` : 'Pilih credit note' }}</span></div>
            <span class="t-c1 c-med">Cek credit note dan voucher lainnya</span>
          </div>
          <AppIcon name="chev" :size="16" color="var(--blu-color-info-icon-default)" />
        </button>
      </div>

      <div class="card co__terms">
        <span class="t-s2 co__h">Syarat pembayaran</span>
        <div v-for="(k, i) in (['cbd', 'net'] as const)" :key="k" class="co__term" :class="{ 'co__term--n': i }" role="button" @click="setTerm(k)">
          <div class="grow co__tbody">
            <div class="row co__tt">
              <span class="t-s2">{{ k === 'cbd' ? 'Cash Before Delivery (CBD)' : 'Net' }}</span>
              <button aria-label="Info" @click.stop="info(k)"><AppIcon name="infoLine" :size="16" /></button>
            </div>
            <template v-if="k === 'cbd'">
              <span class="t-c1 c-med">Bayar di muka</span>
              <div class="row co__tt"><AppIcon name="discount" :size="14" color="var(--blu-color-info-icon-default)" /><span class="t-c1 c-info">Diskon {{ short(CBD_DISCOUNT) }} kalau bayar di muka</span></div>
            </template>
            <template v-else>
              <button class="co__dd" @click.stop="pickNet">
                <span class="t-b2 c-med">Net {{ S.netDays }} hari</span>
                <span class="co__chev" :class="{ 'co__chev--up': dd && sheetVisible }"><AppIcon name="chevD" :size="16" color="var(--blu-color-neutral-icon-default)" /></span>
              </button>
              <span class="t-c1 c-med">Jatuh tempo {{ dayAfter(S.netDays) }}</span>
            </template>
          </div>
          <BliRadio :model-value="S.term" :value="k" label-hidden @update:model-value="setTerm(k)" />
        </div>
        <span v-if="S.term === 'net' && total > 40000000" class="t-c1 c-danger">Total melebihi limit tempo. Sales akan menyesuaikan atau pilih CBD.</span>
      </div>

      <div class="card co__sum">
        <span class="t-s2 co__h">Ringkasan pembayaran</span>
        <KV :k="`Total harga (${units} item)`" :v="rp(orig)" />
        <KV v-if="orig > sub" k="Promo produk" :v="'−' + rp(orig - sub)" :vc="ok" />
        <KV v-if="S.term === 'cbd'" k="Diskon CBD" :v="'−' + rp(CBD_DISCOUNT)" :vc="ok" />
        <KV k="Credit note" :v="'−' + rp(cnAmt)" :vc="ok" />
        <KV k="Ongkos kirim" v="Gratis" :vc="ok" />
        <div class="divider co__div2" />
        <KV k="Total bayar" :v="rp(total)" bold />
      </div>
    </div>
    <div class="co__bottom">
      <div class="row co__reward">
        <AppIcon name="voucher" :size="16" color="var(--blu-color-info-icon-default)" />
        <span class="t-c1 c-med grow">Bisa dapat credit note <span class="t-lbl c-text">{{ short(orderCN(S.cart)) }} + {{ fmt(Math.round(total / 100000)) }}</span> poin</span>
      </div>
      <AppFooter>
        <div class="grow co__tot">
          <span class="t-s1">{{ rp(total) }}</span>
          <span class="t-c1 c-ok">Hemat {{ rp(save()) }}</span>
        </div>
        <BliButton @click="ajukan">Ajukan pesanan</BliButton>
      </AppFooter>
    </div>
  </div>
</template>

<style scoped lang="scss">
$ok-brand: #1f912e;
.co__empty { margin-top: 40px; }
.co__steps { display: flex; align-items: center; gap: 6px; padding: 0 $blu-spacing-m $blu-spacing-ms; }
.co__st { gap: $blu-spacing-xs; }
.co__dot { width: 20px; height: 20px; border-radius: 50%; display: flex; align-items: center; justify-content: center; background: $blu-color-neutral-background-med; color: $blu-color-neutral-text-high;
  &--done { background: $ok-brand; } &--now { background: $blu-color-info-background-high; color: #fff; } }
.co__line { flex: 1; height: 2px; background: $blu-color-neutral-background-med; &--done { background: $ok-brand; } }
.co__scroll { padding: $blu-spacing-m; display: flex; flex-direction: column; gap: $blu-spacing-m; }
.co__row { gap: $blu-spacing-ms; }
.co__div { margin: $blu-spacing-ms 0; }
.co__div2 { margin: $blu-spacing-xs 0; }
.co__items { display: flex; flex-direction: column; gap: $blu-spacing-ms; }
.co__pbody { display: flex; flex-direction: column; }
.co__name { display: -webkit-box; -webkit-line-clamp: 2; -webkit-box-orient: vertical; overflow: hidden; }
.co__disc { gap: $blu-spacing-xs; }
.co__strike { text-decoration: line-through; }
.co__cn { position: relative; overflow: hidden; display: flex; flex-direction: column; gap: $blu-spacing-ms; }
.co__confetti { position: absolute; top: 0; left: -26.6%; width: 153.2%; aspect-ratio: 5; pointer-events: none; }
.co__cn > :not(.co__confetti) { position: relative; }
.co__ticket { background: $blu-color-success-background-low; border-left: 1px dashed #b2efb9; border-right: 1px dashed #b2efb9; padding: 1px $blu-spacing-s; border-radius: $blu-border-radius-2xs; }
.co__cnbtn { display: flex; align-items: center; gap: $blu-spacing-s; padding: $blu-spacing-ms; border-radius: $blu-border-radius-s; background: $blu-color-info-background-low; text-align: left; }
.co__cnbody { display: flex; flex-direction: column; gap: $blu-spacing-2xs; }
.co__cnt { gap: $blu-spacing-xs; }
.co__terms, .co__sum { display: flex; flex-direction: column; gap: $blu-spacing-s; }
.co__h { margin-bottom: $blu-spacing-xs; }
.co__term { display: flex; align-items: center; gap: $blu-spacing-ms; cursor: pointer; &--n { padding-top: $blu-spacing-ms; } }
.co__tbody { display: flex; flex-direction: column; gap: $blu-spacing-xs; }
.co__tt { gap: $blu-spacing-xs; }
.co__dd { display: flex; align-items: center; gap: $blu-spacing-xs; align-self: flex-start; height: 32px; padding: 0 $blu-spacing-ms; border-radius: $blu-border-radius-m; background: $blu-color-neutral-background-med; }
.co__chev { display: flex; transition: transform 0.2s; &--up { transform: rotate(180deg); } }
.co__bottom { flex: none; }
.co__reward { padding: $blu-spacing-s $blu-spacing-m; background: $blu-color-info-background-low; }
.co__bottom :deep(.foot) { padding-top: $blu-spacing-ms; }
.co__tot { display: flex; flex-direction: column; }
</style>
