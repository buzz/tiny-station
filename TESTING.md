# Testing Guide

This document describes the testing infrastructure and patterns for the tiny-station monorepo.

## Test Stack

- **Vitest**: Test runner for all packages
- **jsdom**: Environment for frontend component tests
- **@testing-library/react**: React component testing utilities
- **vite-tsconfig-paths**: Path alias resolution for monorepo imports

## Running Tests

### All Packages

```bash
pnpm run test
```

### Per Package

```bash
# packages/common
pnpm run test --project @tiny-station/common

# packages/frontend
pnpm run test --project @tiny-station/frontend

# packages/server
pnpm run test --project @tiny-station/server
```

## Test File Naming Conventions

| Pattern       | Location          | Purpose                |
| ------------- | ----------------- | ---------------------- |
| `*.test.ts`   | All packages      | Unit tests             |
| `*.test.ts`   | packages/server   | Unit/integration tests |
| `*.test.tsx`  | packages/frontend | React component tests  |

## Mocking

Use Vitest's built-in mocking (`vi.mock()`) for dependencies:

```typescript
// Mock a module
vi.mock('#plugins/redis/RedisConnection.js')

// Access mock in tests
const mockRedis = {
  getEmail: vi.fn().mockResolvedValue('user@example.com'),
}
```

IMPORTANT: Mocking is meant as an escape hatch. Use it sparingly!
