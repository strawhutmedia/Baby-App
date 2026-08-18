import { defineConfig } from 'vite'
import react from '@vitejs/plugin-react'

export default defineConfig({
  // Relative base so the same build works at first100.baby and at
  // the strawhutmedia.github.io/Baby-App fallback URL.
  base: './',
  plugins: [react()],
})
