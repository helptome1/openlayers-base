import { defineConfig } from "vite";
import vue from "@vitejs/plugin-vue";
import cesium from "vite-plugin-cesium";
import { resolve } from "path";

// https://vitejs.dev/config/
export default defineConfig({
  // base: './',
  plugins: [vue(), cesium()],
  resolve: {
    alias: {
      "@": resolve(__dirname, "src"),
    },
  },
    // 支持 less 样式
    css: {
      preprocessorOptions: {
          less: {
              javascriptEnabled: true,
          },
      },
  },
  runtimeCompiler: true,
});
