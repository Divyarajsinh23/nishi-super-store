import { defineConfig } from 'vite'
import react from '@vitejs/plugin-react'

// https://vite.dev/config/
export default defineConfig({
  plugins: [react()],
  base: process.env.VITE_BASE_URL || '/',
  server: {
    host: true,
    allowedHosts: [
      'localhost',
      '.trycloudflare.com',
      '.vercel.app',
      '.loca.lt'
    ]
  }
})

