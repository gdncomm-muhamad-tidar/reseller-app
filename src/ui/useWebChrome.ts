import { useEffect } from 'react';
import { Platform } from 'react-native';
import { useIsFocused } from 'expo-router';

/*
 * Web only (no-op on native, where <StatusBar> + safe-area already handle this).
 * - `viewport-fit=cover` lets the page paint behind the iPhone status bar / notch, so the
 *   screen's gradient reaches the very top (safe-area insets then pad the content).
 * - `theme-color` + the html/body background tint Safari/Chrome's own bar with the colour at
 *   the top of the focused screen's gradient, instead of white.
 */
function setMeta(name: string, content: string) {
  let el = document.querySelector<HTMLMetaElement>(`meta[name="${name}"]`);
  if (!el) { el = document.createElement('meta'); el.name = name; document.head.appendChild(el); }
  el.content = content;
}

export function useWebChromeSetup() {
  useEffect(() => {
    if (Platform.OS !== 'web') return;
    const vp = document.querySelector<HTMLMetaElement>('meta[name="viewport"]');
    if (vp && !vp.content.includes('viewport-fit')) vp.content += ', viewport-fit=cover';
    setMeta('apple-mobile-web-app-capable', 'yes');
    setMeta('mobile-web-app-capable', 'yes');
    setMeta('apple-mobile-web-app-status-bar-style', 'black-translucent');
  }, []);
}

/** Call from a screen with the colour at the top of its header gradient. */
export function useWebThemeColor(color: string) {
  const focused = useIsFocused();
  useEffect(() => {
    if (Platform.OS !== 'web' || !focused) return;
    setMeta('theme-color', color);
    document.documentElement.style.backgroundColor = color;
    document.body.style.backgroundColor = color;
  }, [color, focused]);
}
