import { router } from 'expo-router';
import { useStore } from './store';

/** Jump back to Beranda, scroll to "Produk pilihan", pulse the first card and toast. */
export function useGoReco() {
  const { focusHome } = useStore();
  return (msg?: string) => {
    focusHome(typeof msg === 'string' ? msg : undefined);
    if (router.canDismiss()) router.dismissAll();
    router.navigate('/home');
  };
}
export const openFin = (tab: 'ring' | 'inv' | 'cn') => {
  if (router.canDismiss()) router.dismissAll();
  router.navigate({ pathname: '/finansial', params: { tab, t: String(Date.now()) } });
};
export const goTab = (href: '/home' | '/katalog' | '/scan' | '/pesanan' | '/finansial') => {
  if (router.canDismiss()) router.dismissAll();
  router.navigate(href);
};
