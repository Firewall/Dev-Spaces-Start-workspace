import { defineConfig } from 'vite'
import react from '@vitejs/plugin-react'

// https://vite.dev/config/
export default defineConfig({
  base: '/Dev-Spaces-Start-workspace/',
  plugins: [react()],
})
