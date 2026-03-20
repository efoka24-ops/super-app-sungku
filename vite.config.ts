import { defineConfig } from 'vite'
import react from '@vitejs/plugin-react'
import tailwindcss from '@tailwindcss/vite'

// https://vitejs.dev/config/
export default defineConfig({
  base: './',
  plugins: [tailwindcss(), react()],
  server: {
    port: 5173,
    open: true,
    // proxy: {
    //   '/api': {
    //     target: 'http://localhost:4000',
    //     changeOrigin: true,
    //   },
    // },
  },
  build: {
    outDir: 'dist',
    sourcemap: false,
  },
})
