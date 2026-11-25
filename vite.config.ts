import { defineConfig } from 'vite';
import vue from '@vitejs/plugin-vue';
import { fileURLToPath, URL } from 'node:url';

export default defineConfig({
  base: './',
  plugins: [vue()],
  resolve: { alias: { '@': fileURLToPath(new URL('./src', import.meta.url)) } },
  css: {
    preprocessorOptions: {
      scss: {
        // BLUE design tokens ($blu-*) are available in every SFC <style lang="scss">
        additionalData: `@import '@blibli/blue-design-tokens/dist/tokens-default.scss';\n`,
        quietDeps: true,
        silenceDeprecations: ['import', 'global-builtin', 'legacy-js-api'],
      },
    },
  },
  server: { port: 5173, host: true },
});
