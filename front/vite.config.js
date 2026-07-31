// @ts-nocheck
import { defineConfig } from 'vite'
import vue from '@vitejs/plugin-vue'

export default defineConfig({
  plugins: [vue()],
  resolve: {
    alias: {
      '@': process.cwd() + '/src'
    }
  },
  server: {
    port: 5173,
    host: true
  }
})
