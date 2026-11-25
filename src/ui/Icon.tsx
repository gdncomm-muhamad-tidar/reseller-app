import Svg, { Path, SvgXml } from 'react-native-svg';
import { C } from '../theme';
import { SVG, SvgName } from './icons.gen';

// BLUE system icons, exported from the Figma file (assets/icons → icons.gen.ts).
const BLUE = {
  back: 'arrow-left',
  chev: 'chevron-right',
  chevD: 'chevron-down',
  chat: 'chat',
  bell: 'bell',
  voucher: 'voucher',
  cashIn: 'cash-in',
  receipt: 'receipt',
  scan: 'scan',
  scanNav: 'scan-nav',
  home: 'home',
  grid: 'category',
  box: 'order',
  wallet: 'wallet',
  pin: 'location',
  time: 'time',
  copy: 'copy',
  check: 'check',
  circleCheck: 'circle-check',
  plus: 'plus',
  minus: 'minus',
  trash: 'delete',
  close: 'cross',
  info: 'info',
  mission: 'mission',
  bag: 'bag',
  discount: 'discount',
  ticket: 'ticket',
  arrowUp: 'arrow-up',
  trendUp: 'arrow-upprice',
  gift: 'gift',
  hotDeals: 'hot-deals',
  trendDown: 'arrow-downprice',
  alertFill: 'alert-fill',
  pointsLine: 'points-outline',
  download: 'download',
  infoLine: 'circle-outline-info',
  search: 'search',
} as const satisfies Record<string, SvgName>;

// No counterpart in the Figma file yet — simplified paths on a 24px grid.
const FALLBACK = {
  search: 'M10 3a7 7 0 0 1 5.6 11.2l5.1 5.1-1.4 1.4-5.1-5.1A7 7 0 1 1 10 3Zm0 2a5 5 0 1 0 0 10 5 5 0 0 0 0-10Z',
  alert: 'M12 2a10 10 0 1 0 0 20 10 10 0 0 0 0-20Zm-1 5h2v7h-2V7Zm0 9h2v2h-2v-2Z',
  shield: 'M12 2 4 6v6c0 5 3.4 9.4 8 10 4.6-.6 8-5 8-10V6l-8-4Zm-1.2 14.2-3.5-3.5 1.4-1.4 2.1 2.1 4.9-4.9 1.4 1.4-6.3 6.3Z',
  cart: 'M7 18a2 2 0 1 0 0 4 2 2 0 0 0 0-4Zm10 0a2 2 0 1 0 0 4 2 2 0 0 0 0-4ZM2 2h3.3l.9 2H21l-3.6 8.1a2 2 0 0 1-1.8 1.1H8.1L7 15h12v2H5.4l2.2-4.1L4 4H2V2Z',
  download: 'M11 3h2v9.2l3.3-3.3 1.4 1.4L12 16l-5.7-5.7 1.4-1.4 3.3 3.3V3ZM4 19h16v2H4v-2Z',
};

export type IconName = keyof typeof BLUE | keyof typeof FALLBACK;

export function Icon({ name, size = 20, color = C.text }: { name: IconName; size?: number; color?: string }) {
  if (name in BLUE) return <SvgXml xml={SVG[BLUE[name as keyof typeof BLUE]]} width={size} height={size} color={color} />;
  return (
    <Svg width={size} height={size} viewBox="0 0 24 24" fill={color}>
      <Path d={FALLBACK[name as keyof typeof FALLBACK]} />
    </Svg>
  );
}

/** Full-colour Figma art (not tintable). */
export function Art({ name, width, height = width }: { name: 'success-check' | 'points-blibli' | 'badge-gold' | 'medallion' | 'coin-gold' | 'supergraphic' | 'tier-gold' | 'tier-classic' | 'tier-platinum' | 'tier-infinite' | 'inspiration'; width: number; height?: number }) {
  return <SvgXml xml={SVG[name]} width={width} height={height} />;
}
