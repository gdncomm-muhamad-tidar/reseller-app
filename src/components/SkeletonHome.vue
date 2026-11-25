<script setup lang="ts">
import Bone from './Bone.vue';
import SkeletonGroup from './SkeletonGroup.vue';

/** Beranda sections placeholder: perlu tindakan, ringkasan belanja, misi, product rows. */
</script>

<template>
  <SkeletonGroup>
    <div class="sh">
      <div class="sh__sec">
        <Bone :w="140" :h="18" />
        <div class="sh__box" style="gap: 16px">
          <div v-for="i in 3" :key="i" class="row sh__act">
            <div class="col grow sh__txt"><Bone w="70%" :h="14" /><Bone w="50%" /></div>
            <Bone :w="64" :h="32" :r="16" />
          </div>
        </div>
      </div>
      <div class="sh__sec">
        <Bone :w="200" :h="18" />
        <div class="sh__box">
          <Bone :w="120" :h="24" :r="8" /><Bone w="100%" :h="120" :r="8" />
          <div class="row" style="gap: 8px"><Bone w="48%" :h="56" :r="8" /><Bone w="48%" :h="56" :r="8" /></div>
        </div>
      </div>
      <div v-for="[w, id] in [[110, 'a'], [160, 'b']]" :key="id" class="sh__sec">
        <Bone :w="w as number" :h="18" />
        <div class="row sh__prow">
          <div v-for="i in 3" :key="i" class="sh__prod">
            <Bone w="100%" :h="120" :r="0" /><Bone :w="110" class="sh__m" /><Bone :w="80" :h="14" class="sh__m" /><Bone :w="96" class="sh__m" />
          </div>
        </div>
      </div>
    </div>
  </SkeletonGroup>
</template>

<style scoped lang="scss">
.sh { display: flex; flex-direction: column; gap: 24px; padding: 8px 16px 0; }
.sh__sec { display: flex; flex-direction: column; gap: 12px; }
.sh__box { background: $blu-color-neutral-background-default; border-radius: 12px; padding: 16px; display: flex; flex-direction: column; gap: 12px; }
.sh__act { gap: 12px; }
.sh__txt { gap: 8px; }
.sh__prow { gap: 12px; align-items: flex-start; overflow: hidden; }
.sh__prod { width: 144px; flex: none; background: $blu-color-neutral-background-default; border-radius: 12px; overflow: hidden; display: flex; flex-direction: column; gap: 8px; padding-bottom: 12px; }
.sh__m { margin: 0 12px; }
</style>
