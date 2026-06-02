import { defineConfig } from 'vite'
import react from '@vitejs/plugin-react'
import tailwindcss from '@tailwindcss/vite'

// https://vitejs.dev/config/
export default defineConfig(({ mode }) => {
  return {
    plugins: [react(), tailwindcss()],
    // Ensure pdfjs-dist worker can be loaded if needed locally, though CDN is used in code
    optimizeDeps: {
      include: ['pdfjs-dist']
    }
  }
})