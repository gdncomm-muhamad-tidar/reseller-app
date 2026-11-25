// BLUE 3.0 alias tokens (values resolved from the BLUE 3.0 Figma library)
export const C = {
  bg: '#ffffff',
  bgLow: '#f9f9fa',
  bgMed: '#f1f2f2',
  text: '#19222a',
  textMed: 'rgba(25,34,42,0.70)',
  textLow: 'rgba(25,34,42,0.40)',
  textInv: '#ffffff',
  borderLow: '#f1f2f2',
  border: '#e2e4e6',
  icon: '#797f85',
  info: '#0072ff',
  infoBg: '#f3f9ff',
  infoLow: '#e1f1ff',
  infoMed: '#1d8fff',
  infoBorder: '#b8dcff',
  ok: '#1c832a',
  okLow: '#d6f7da',
  okBorder: '#b2efb9',
  okBrand: '#1f912e',
  danger: '#d33534',
  dangerLow: '#ffe6e6',
  dangerBorder: '#fecccb',
  warn: '#a76005',
  warnBg: '#fff8e0',
  warnLow: '#feedb1',
  warnHigh: '#ffcd00',
  navy: '#1258c9',
  navyDeep: '#000208',
  gold: '#ebbf4f',
  tosca: '#077a7a',
  toscaBorder: '#a8e6e6',
  magenta: '#b0168a',
  magentaBorder: '#f5c2ea',
  scrim: 'rgba(0,0,0,0.5)',
};

export const F = {
  regular: 'TTCommons-Regular',
  medium: 'TTCommons-Medium',
  demi: 'TTCommons-DemiBold',
  bold: 'TTCommons-Bold',
};

export const R = { xs: 4, s: 8, ms: 12, m: 16, circle: 999 };
export const SP = { xs: 4, s: 8, ms: 12, m: 16, ls: 20, l: 24, xl: 32 };

export const shadow = {
  default: { shadowColor: '#19222a', shadowOpacity: 0.08, shadowRadius: 8, shadowOffset: { width: 0, height: 2 }, elevation: 2 },
  med: { shadowColor: '#19222a', shadowOpacity: 0.14, shadowRadius: 24, shadowOffset: { width: 0, height: 8 }, elevation: 6 },
};

// type scale (BLUE): size / line-height / family
export const TYPE = {
  h1: { fontSize: 24, lineHeight: 28, fontFamily: F.demi },
  t1: { fontSize: 20, lineHeight: 24, fontFamily: F.demi },
  t2: { fontSize: 18, lineHeight: 24, fontFamily: F.demi },
  s1: { fontSize: 16, lineHeight: 20, fontFamily: F.demi },
  s2: { fontSize: 14, lineHeight: 18, fontFamily: F.demi },
  b1: { fontSize: 16, lineHeight: 20, fontFamily: F.medium },
  b2: { fontSize: 14, lineHeight: 18, fontFamily: F.medium },
  c1: { fontSize: 12, lineHeight: 16, fontFamily: F.medium },
  lbl: { fontSize: 12, lineHeight: 16, fontFamily: F.demi },
  c2: { fontSize: 10, lineHeight: 14, fontFamily: F.medium },
  c2b: { fontSize: 10, lineHeight: 14, fontFamily: F.demi },
} as const;
export type TypeKey = keyof typeof TYPE;

export const fmt = (n: number) => String(Math.round(n)).replace(/\B(?=(\d{3})+(?!\d))/g, '.');
export const rp = (n: number) => 'Rp' + fmt(n);
/** short rupiah: Rp1,05jt / Rp22,8jt / Rp480rb (max 2 decimals) */
export const short = (n: number) => (n >= 1e6 ? `Rp${(Math.round(n / 1e4) / 100).toString().replace('.', ',')}jt` : `Rp${Math.round(n / 1000)}rb`);
