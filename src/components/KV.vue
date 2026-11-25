<script setup lang="ts">
/** Key/value row: muted key left, value right (bold = s1). `vc` overrides the value colour. */
defineProps<{ k: string; v: string; vc?: string; bold?: boolean }>();
</script>

<template>
  <div class="row between">
    <span class="t-c1 c-med">{{ k }}</span>
    <span :class="[bold ? 't-s1' : 't-c1', vc ? '' : 'c-text']" :style="vc ? { color: vc } : undefined">{{ v }}</span>
  </div>
</template>
