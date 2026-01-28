import path from 'node:path'

import react from '@vitejs/plugin-react-swc'
import { defineConfig } from 'vite'
import tsconfigPaths from 'vite-tsconfig-paths'

// https://vite.dev/config/
export default defineConfig({
  plugins: [tsconfigPaths({ projects: ['tsconfig.app.json'] }), react()],
  server: {
    port: 3000,
    proxy: {
      '/socket.io': {
        target: 'ws://localhost:3001',
        ws: true,
        rewriteWsOrigin: true,
      },
      '/api': {
        target: 'http://localhost:3001',
      },
    },
  },
  envDir: path.resolve(import.meta.dirname, '..', '..'),
})
