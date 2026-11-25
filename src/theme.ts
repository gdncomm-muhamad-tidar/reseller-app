export const fmt = (n: number) => String(Math.round(n)).replace(/\B(?=(\d{3})+(?!\d))/g, '.');
export const rp = (n: number) => 'Rp' + fmt(n);
/** short rupiah: Rp1,05jt / Rp22,8jt / Rp480rb (max 2 decimals) */
export const short = (n: number) => (n >= 1e6 ? `Rp${(Math.round(n / 1e4) / 100).toString().replace('.', ',')}jt` : `Rp${Math.round(n / 1000)}rb`);
