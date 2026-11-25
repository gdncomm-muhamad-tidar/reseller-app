/* Haptic feedback that also works in the web build (the demo is opened in phone browsers).
 * - native (iOS/Android): expo-haptics
 * - web Android: navigator.vibrate
 * - web iOS (Safari 18+): toggling a hidden <input type="checkbox" switch> plays the system haptic */
import { Platform } from 'react-native';
import * as Haptics from 'expo-haptics';

let iosSwitch: HTMLLabelElement | null = null;
function webTap(pattern: number | number[]) {
  if (typeof navigator === 'undefined') return;
  try {
    if (typeof navigator.vibrate === 'function' && navigator.vibrate(pattern)) return;
  } catch {}
  try {
    if (typeof document === 'undefined') return;
    if (!iosSwitch) {
      const label = document.createElement('label');
      const input = document.createElement('input');
      input.type = 'checkbox';
      input.setAttribute('switch', '');
      label.appendChild(input);
      label.setAttribute('aria-hidden', 'true');
      label.style.cssText = 'position:fixed;left:-9999px;top:0;width:1px;height:1px;opacity:0;pointer-events:none;';
      document.body.appendChild(label);
      iosSwitch = label;
    }
    const n = Array.isArray(pattern) ? Math.ceil(pattern.length / 2) : 1;
    for (let i = 0; i < n; i++) setTimeout(() => iosSwitch?.click(), i * 120);
  } catch {}
}

const native = Platform.OS !== 'web';

/** something good happened (credit note masuk, pembayaran berhasil) */
export function hapticSuccess() {
  if (native) Haptics.notificationAsync(Haptics.NotificationFeedbackType.Success).catch(() => {});
  else webTap([18, 60, 28]);
}
/** an error / warning toast */
export function hapticError() {
  if (native) Haptics.notificationAsync(Haptics.NotificationFeedbackType.Error).catch(() => {});
  else webTap([30, 50, 30, 50, 30]);
}
/** neutral notice (default toast) */
export function hapticLight() {
  if (native) Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Light).catch(() => {});
  else webTap(12);
}
