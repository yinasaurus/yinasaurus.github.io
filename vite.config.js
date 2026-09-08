import tailwindcss from '@tailwindcss/vite'
import react from '@vitejs/plugin-react'
import { defineConfig } from 'vite'

// https://vite.dev/config/
// three.js is code-split automatically via the lazy import of the mascot scene
// in `src/components/Hero.jsx`, so no manual chunking is needed here.
export default defineConfig({
  plugins: [react(), tailwindcss()],
})
