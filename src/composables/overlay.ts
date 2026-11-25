import { shallowRef, type Component } from 'vue';
import BliToast from '@blibli/blue.toast/dist/toast/blue/toast-index';

export type ToastOpts = { tone?: 'default' | 'ok' | 'danger'; action?: { label: string; onPress: () => void } };

/** Programmatic toast (BLUE BliToast). Tone is inferred from the message when not given. */
export function toast(msg: string, opts: ToastOpts = {}) {
  const tone = opts.tone ?? (/credit note|berhasil|tercapai|terverifikasi|disetujui|masuk/i.test(msg) ? 'ok' : 'default');
  BliToast.open({
    text: msg,
    status: tone === 'ok' ? 'success' : tone === 'danger' ? 'error' : undefined,
    duration: opts.action ? 4200 : 2600,
    group: 'app',
    action: opts.action ? { text: opts.action.label, click: opts.action.onPress } : undefined,
  });
}

/** One bottom sheet (BLUE BliModal drawer) at a time. The sheet component gets `close(then?)`. */
type Sheet = { comp: Component; props: Record<string, unknown>; confetti: boolean };
export const sheet = shallowRef<Sheet | null>(null);
export const sheetVisible = shallowRef(false);
let after: (() => void) | undefined;

export function openSheet(comp: Component, props: Record<string, unknown> = {}, opts: { confetti?: boolean } = {}) {
  sheet.value = { comp, props, confetti: !!opts.confetti };
  sheetVisible.value = true;
}
export function closeSheet(then?: () => void) {
  after = then;
  sheetVisible.value = false;
  setTimeout(() => { sheet.value = null; const f = after; after = undefined; f?.(); }, 260);
}
export const useOverlay = () => ({ toast, openSheet, closeSheet, sheet, sheetVisible });
