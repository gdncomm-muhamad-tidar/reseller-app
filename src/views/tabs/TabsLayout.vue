<script setup lang="ts">
import TabBar from '@/components/TabBar.vue';
</script>

<template>
  <div class="screen">
    <RouterView v-slot="{ Component, route }">
      <Transition name="dissolve" mode="out-in"><component :is="Component" :key="route.path" /></Transition>
    </RouterView>
    <TabBar />
  </div>
</template>
