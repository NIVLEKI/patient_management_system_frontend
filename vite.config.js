import { defineConfig } from 'vite'
import react from '@vitejs/plugin-react'

export default defineConfig({
  plugins: [react()],
  server: {
    port: 3000,
    // REMOVE THE PROXY - it's only for development
    // proxy: {
    //   '/api': {
    //     target: 'http://localhost:5000',
    //     changeOrigin: true
    //   }
    // }
  },
  build: {
    outDir: 'dist',
    emptyOutDir: true
  }
})