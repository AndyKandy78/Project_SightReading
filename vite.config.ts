import { defineConfig } from 'vite'
import react from '@vitejs/plugin-react'

// https://vite.dev/config/
export default defineConfig({
  base: './',
  plugins: [react()],
  optimizeDeps: {
    include: ['vexflow', 'webmidi', 'zustand'],
  },
  server: {
    host: true, // Listen on all local IPs so mobile devices on the same Wi-Fi can connect
    port: 5173,
    open: true,
  }
})
