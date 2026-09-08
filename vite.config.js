import tailwindcss from '@tailwindcss/vite'
import react from '@vitejs/plugin-react'
import { defineConfig } from 'vite'

// https://vite.dev/config/
// three.js is code-split automatically via the lazy import of the mascot scene
// in `src/components/Hero.jsx`, so no manual chunking is needed here.
export default defineConfig({
  // User site is served from https://yinasaurus.github.io/ (domain root).
  // Built files go in /docs so Pages can publish `main` → `/docs`
  // without colliding with the Vite source at the repo root.
  base: '/',
  build: {
    outDir: 'docs',
    emptyOutDir: true,
  },
  plugins: [react(), tailwindcss()],
})
