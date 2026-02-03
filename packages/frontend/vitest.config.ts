import tsconfigPaths from 'vite-tsconfig-paths'
import { defineConfig } from 'vitest/config'

export default defineConfig({
  plugins: [tsconfigPaths({ projects: ['tsconfig.app.json'] })],
  test: {
    environment: 'jsdom',
    include: ['src/**/*.test.{ts,tsx}'],
    setupFiles: ['./test-utils/setup.ts'],
    css: {
      modules: {
        classNameStrategy: 'scoped',
      },
    },
  },
})
