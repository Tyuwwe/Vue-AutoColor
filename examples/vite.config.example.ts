import { defineConfig } from 'vite';
import vue from '@vitejs/plugin-vue';
import { viteAutoColorPlugin } from 'v-auto-color';

// https://vitejs.dev/config/
export default defineConfig({
  plugins: [
    vue(),
    viteAutoColorPlugin() // 启用v-auto-color插件
  ],
});
