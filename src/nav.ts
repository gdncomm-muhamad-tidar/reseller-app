import { router } from './router';
import { useStore } from './store';

type TabHref = '/home' | '/katalog' | '/scan' | '/pesanan' | '/finansial';

/** Jump back to Beranda, scroll to "Produk pilihan", pulse the first card and toast. */
export function useGoReco() {
  const { focusHome } = useStore();
  return (msg?: string) => {
    focusHome(typeof msg === 'string' ? msg : undefined);
    router.push('/home');
  };
}
export const openFin = (tab: 'ring' | 'inv' | 'cn') => router.push({ path: '/finansial', query: { tab, t: String(Date.now()) } });
export const goTab = (href: TabHref) => router.push(href);
/** Back if there is history, else Beranda. */
export const goBack = () => (window.history.state?.back ? router.back() : router.replace('/home'));
