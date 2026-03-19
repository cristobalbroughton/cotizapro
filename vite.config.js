import { defineConfig } from 'vite'
import react from '@vitejs/plugin-react'

export default defineConfig({
  plugins: [react()],
  build: {
    chunkSizeWarningLimit: 1600,
    rollupOptions: {
      output: {
        manualChunks(id) {
          if (id.includes('@react-pdf'))        return 'react-pdf'
          if (id.includes('@supabase'))         return 'supabase'
          if (id.includes('react-router-dom')) return 'router'
        },
      },
    },
  },
})
