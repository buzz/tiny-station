# Testing Guide

This document describes the testing infrastructure and patterns for the listen-app monorepo.

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
pnpm run test --project @listen-app/common

# packages/frontend
pnpm run test --project @listen-app/frontend

# packages/server
pnpm run test --project @listen-app/server
```

## Test File Naming Conventions

| Pattern                 | Location          | Purpose               |
| ----------------------- | ----------------- | --------------------- |
| `*.test.ts`             | All packages      | Unit tests            |
| `*.integration.test.ts` | packages/server   | Integration tests     |
| `*.test.tsx`            | packages/frontend | React component tests |

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
