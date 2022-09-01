import { defineConfig } from 'vite'
import vue from '@vitejs/plugin-vue'
import { resolve } from 'path'
import Components from 'unplugin-vue-components/vite'
import AutoImport from 'unplugin-auto-import/vite'
import { ElementPlusResolver } from 'unplugin-vue-components/resolvers'

// https://vitejs.dev/config/
export default defineConfig({
  plugins: [
    vue(),
    AutoImport({
      /* options */
      include: [/\.vue$/, /\.vue\?vue/],
      imports: ['vue'],
      dts: "src/auto-imports.d.ts",
      resolvers: [ElementPlusResolver()],
    }),
    Components({
      // dirs choose the folder
      dirs: ['src/components', 'src/views'],
      resolvers: [ElementPlusResolver()],
    })
  ],
  resolve: {
    alias: {
      '@': resolve(__dirname, 'src')
    }
  }
})
