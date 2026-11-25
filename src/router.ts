import { createRouter, createWebHistory } from 'vue-router';

/** Same route map as the former Expo Router file tree. */
export const router = createRouter({
  history: createWebHistory(),
  routes: [
    { path: '/', component: () => import('./views/LockScreen.vue') },
    {
      path: '/',
      component: () => import('./views/tabs/TabsLayout.vue'),
      children: [
        { path: 'home', component: () => import('./views/tabs/Home.vue') },
        { path: 'katalog', component: () => import('./views/tabs/Katalog.vue') },
        { path: 'scan', component: () => import('./views/tabs/Scan.vue') },
        { path: 'pesanan', component: () => import('./views/tabs/Pesanan.vue') },
        { path: 'finansial', component: () => import('./views/tabs/Finansial.vue') },
      ],
    },
    { path: '/bayar', component: () => import('./views/Bayar.vue') },
    { path: '/checkout', component: () => import('./views/Checkout.vue') },
    { path: '/cn-riwayat', component: () => import('./views/CnRiwayat.vue') },
    { path: '/credit-note', component: () => import('./views/CreditNote.vue') },
    { path: '/diajukan', component: () => import('./views/Diajukan.vue') },
    { path: '/keranjang', component: () => import('./views/Keranjang.vue') },
    { path: '/misi', component: () => import('./views/misi/MisiIndex.vue') },
    { path: '/misi/:id', component: () => import('./views/misi/MisiDetail.vue') },
    { path: '/order/:id', component: () => import('./views/OrderDetail.vue') },
    { path: '/poin', component: () => import('./views/Poin.vue') },
    { path: '/produk/:id', component: () => import('./views/ProdukDetail.vue') },
    { path: '/rewards', component: () => import('./views/Rewards.vue') },
    { path: '/scan-camera', component: () => import('./views/ScanCamera.vue') },
    { path: '/scan-input', component: () => import('./views/ScanInput.vue') },
    { path: '/va', component: () => import('./views/Va.vue') },
    { path: '/:pathMatch(.*)*', redirect: '/home' },
  ],
  scrollBehavior: () => ({ top: 0 }),
});
