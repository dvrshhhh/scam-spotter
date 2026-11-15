import { defineConfig } from 'vite'
import react from '@vitejs/plugin-react'
import tailwindcss from '@tailwindcss/vite'

// https://vite.dev/config/
// GitHub Pages (project site) sets VITE_BASE=/scam-spotter/ in CI.
export default defineConfig({
  base: process.env.VITE_BASE || '/',
  plugins: [react(), tailwindcss()],
  server: {
    host: '127.0.0.1',
    port: 4731,
    strictPort: true,
  },
})
