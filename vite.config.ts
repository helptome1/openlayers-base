import { defineConfig } from 'vite'
import vue from '@vitejs/plugin-vue'
import AutoImport from 'unplugin-auto-import/vite'
import { resolve } from 'path'
import Components from 'unplugin-vue-components/vite'

// https://vitejs.dev/config/
export default defineConfig({
  plugins: [
    vue(),
    AutoImport({
      /* options */
      include: [/\.vue$/, /\.vue\?vue/],
      imports: ['vue'],
      dts: "src/auto-imports.d.ts"
    }),
    Components({
      dirs: ['src/compoenets', 'src/views']
    })
  ],
  resolve: {
    alias: {
      '@': resolve(__dirname, 'src')
    }
  }
})
