import { ref } from 'vue';

export const HEADER_H = 56;

/** Scroll behaviour for pages with a gradient hero (Misi, Detail misi, Poin).
 *  Bind `@scroll="h.onScroll"` on the scrolling element; pass scrollY/threshold/solid to
 *  FloatingHeader / ParallaxBg / ParallaxFg. */
export function useScrollHeader() {
  const scrollY = ref(0);
  const threshold = ref(160);
  const solid = ref(false);
  const setThreshold = (v: number) => { threshold.value = v; solid.value = scrollY.value >= v - 2; };
  const onScroll = (e: Event) => {
    const y = (e.target as HTMLElement).scrollTop;
    scrollY.value = y;
    solid.value = y >= threshold.value - 2;
  };
  return { scrollY, onScroll, threshold, setThreshold, solid };
}
