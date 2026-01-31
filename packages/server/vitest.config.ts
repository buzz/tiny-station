import tsconfigPaths from 'vite-tsconfig-paths'
import { defineConfig } from 'vitest/config'

export default defineConfig({
  plugins: [tsconfigPaths()],
  test: {
    environment: 'node',
    globalSetup: './test-utils/globalSetup.ts',
    include: ['src/**/*.test.ts'],
    testTimeout: 30_000,
  },
})
