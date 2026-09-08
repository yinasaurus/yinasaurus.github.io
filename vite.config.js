import tailwindcss from '@tailwindcss/vite'
import react from '@vitejs/plugin-react'
import { defineConfig } from 'vite'
import { githubProjectsPlugin } from './vite.github-projects.js'

// User site is served from https://yinasaurus.github.io/ (domain root).
// Built files go in /docs so Pages can publish `main` → `/docs`
// without colliding with the Vite source at the repo root.
export default defineConfig({
  base: '/',
  build: {
    outDir: 'docs',
    emptyOutDir: true,
  },
  plugins: [githubProjectsPlugin(), react(), tailwindcss()],
})
