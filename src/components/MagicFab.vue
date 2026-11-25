<script setup lang="ts">
import { computed, onBeforeUnmount, onMounted, ref } from 'vue';
import { openSheet, sheetVisible } from '@/composables/overlay';
import MagicFabSheet from './MagicFabSheet.vue';

/** Magic floating button (testing / demo only): drag it anywhere, tap it to jump straight into a flow.
 *  Edge-docked: always snaps to the left or right edge (whichever is nearer). Drag it past the edge, or
 *  long-press it, to tuck it half away; tap a tucked button to bring it back. Rendered once in App.vue. */
const SIZE = 44, M = 8;
const el = ref<HTMLElement>();
const pos = ref({ x: M, y: 600 });
const tucked = ref(false);
const dragging = ref(false);

let side: 'left' | 'right' = 'left', collapsed = false, sx = M, sy = 600, moved = false, startX = 0, startY = 0;
let hold: ReturnType<typeof setTimeout> | undefined;
const box = () => {
  const r = el.value?.parentElement?.getBoundingClientRect();
  return { W: r?.width ?? 430, H: r?.height ?? 800 };
};
const xFor = () => { const { W } = box(); return side === 'left' ? (collapsed ? -SIZE / 2 : M) : (collapsed ? W - SIZE / 2 : W - SIZE - M); };
const settle = () => { sx = xFor(); tucked.value = collapsed; dragging.value = false; pos.value = { x: sx, y: sy }; };

onMounted(() => { sy = box().H - 260; pos.value = { x: M, y: sy }; });
onBeforeUnmount(() => clearTimeout(hold));

const down = (e: PointerEvent) => {
  (e.currentTarget as HTMLElement).setPointerCapture(e.pointerId);
  moved = false; startX = e.clientX; startY = e.clientY;
  hold = setTimeout(() => { if (!moved) { collapsed = !collapsed; settle(); moved = true; } }, 550); // long-press: tuck / untuck
};
const move = (e: PointerEvent) => {
  if (!(e.buttons || e.pointerType === 'touch')) return;
  const dx = e.clientX - startX, dy = e.clientY - startY;
  if (Math.abs(dx) + Math.abs(dy) > 4 && !moved) { moved = true; clearTimeout(hold); }
  if (moved && Math.abs(dx) + Math.abs(dy) > 4) { dragging.value = true; pos.value = { x: sx + dx, y: sy + dy }; }
};
const up = (e: PointerEvent) => {
  clearTimeout(hold);
  const dx = e.clientX - startX, dy = e.clientY - startY;
  const { W, H } = box();
  const dragged = Math.abs(dx) + Math.abs(dy) > 4;
  if (!dragged) {
    if (moved) return; // long-press already handled it
    if (collapsed) { collapsed = false; settle(); } // tap a tucked button -> expand
    else openSheet(MagicFabSheet);
    return;
  }
  const x = sx + dx;
  sy = Math.min(Math.max(40, sy + dy), H - 60);
  side = x + SIZE / 2 < W / 2 ? 'left' : 'right';
  collapsed = side === 'left' ? x < M - 14 : x > W - SIZE - M + 14; // dragged past the edge -> tuck half of it away
  settle();
};
const cancel = () => { clearTimeout(hold); settle(); };
const style = computed(() => ({ transform: `translate(${pos.value.x}px, ${pos.value.y}px)`, opacity: tucked.value ? 0.8 : 1, transition: dragging.value ? 'none' : 'transform 0.35s cubic-bezier(0.34, 1.3, 0.64, 1), opacity 0.2s' }));
</script>

<template>
  <div v-if="!sheetVisible" ref="el" class="fab" role="button" :aria-label="tucked ? 'Tampilkan pintasan flow demo' : 'Pintasan flow demo'" :style="style"
    @pointerdown="down" @pointermove="move" @pointerup="up" @pointercancel="cancel">
    <svg width="22" height="22" viewBox="0 0 14 14"><path d="M7 0L8.48492 5.51508L14 7L8.48492 8.48492L7 14L5.51508 8.48492L0 7L5.51508 5.51508L7 0Z" fill="#FFCD00" stroke="rgba(25,34,42,0.35)" stroke-width="0.6" /></svg>
  </div>
</template>

<style scoped lang="scss">
.fab { position: absolute; left: 0; top: 0; z-index: 999; width: 44px; height: 44px; border-radius: 22px; background: rgba(25, 34, 42, 0.25); display: flex; align-items: center; justify-content: center; user-select: none; cursor: grab; touch-action: none; }
</style>
