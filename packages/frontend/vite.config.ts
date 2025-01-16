import path from 'node:path'

import { defineConfig } from 'vite'
import react from '@vitejs/plugin-react-swc'

// https://vite.dev/config/
export default defineConfig({
  plugins: [react()],
  server: {
    port: 3000,
    proxy: {
      '/socket.io': {
        target: 'ws://localhost:3001',
        ws: true,
        rewriteWsOrigin: true,
      },
    },
  },
  envDir: path.resolve(import.meta.dirname, '..', '..'),
})
