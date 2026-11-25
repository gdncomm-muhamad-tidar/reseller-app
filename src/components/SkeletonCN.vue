<script setup lang="ts">
import Bone from './Bone.vue';
import SkeletonGroup from './SkeletonGroup.vue';

/** Credit note card placeholder (inside the gradient header). */
</script>

<template>
  <SkeletonGroup>
    <div class="cn">
      <Bone :w="120" :h="12" />
      <Bone :w="190" :h="28" :r="8" />
      <div class="divider" />
      <div class="row cn__cols">
        <div class="col grow cn__col"><Bone :w="60" /><Bone :w="80" :h="16" /></div>
        <div class="col grow cn__col"><Bone :w="70" /><Bone :w="90" :h="16" /></div>
      </div>
    </div>
  </SkeletonGroup>
</template>

<style scoped lang="scss">
.cn { margin-top: 16px; background: $blu-color-neutral-background-default; border-radius: 16px; padding: 16px; display: flex; flex-direction: column; gap: 12px; }
.cn__cols { gap: 16px; align-items: flex-start; }
.cn__col { gap: 8px; }
</style>
