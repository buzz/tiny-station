# add-vitest-testing-infrastructure Design

## Architecture Overview

The testing infrastructure uses Vitest as the primary test runner across all packages in the monorepo. The design follows a **per-package configuration** pattern with shared root conventions, allowing each package to have tailored settings while maintaining consistency.

### Key Design Decisions

#### 1. Per-Package Configuration vs Root Configuration

**Decision**: Use per-package `vitest.config.ts` files rather than a single root config with project inheritance.

**Rationale**:

- Each package has unique requirements (jsdom for frontend, Node for server)
- Simpler debugging and troubleshooting per package
- Clear separation of concerns
- Package-level test scripts are easier to manage
- Less coupling between packages

**Trade-offs**:

- Some configuration duplication
- Root cannot enforce global patterns easily

#### 2. Test File Naming Conventions

**Decision**: Use distinct file naming patterns for different test types:

| Pattern                 | Location          | Purpose               |
| ----------------------- | ----------------- | --------------------- |
| `*.test.ts`             | All packages      | Unit tests            |
| `*.integration.test.ts` | packages/server   | Integration tests     |
| `*.test.tsx`            | packages/frontend | React component tests |

**Rationale**:

- Clear distinction between test types
- Easy filtering by test type
- Consistent across packages

#### 3. Environment Selection

**Decision**: Use different environments per package:

| Package  | Environment       | Rationale                                                                            |
| -------- | ----------------- | ------------------------------------------------------------------------------------ |
| common   | jsdom             | Compatible with Vitest defaults, schema validation doesn't need specific environment |
| server   | happy-dom or Node | Fastify runs in Node, no DOM needed                                                  |
| frontend | jsdom             | Required for React component testing with @testing-library/react                     |

**Trade-offs**:

- jsdom is slower but more accurate for DOM simulation
- happy-dom is faster but less complete

#### 4. Path Alias Resolution

**Decision**: Use `vite-tsconfig-paths` plugin in each `vitest.config.ts` to resolve TypeScript path aliases.

**Configuration**:

```typescript
import { defineConfig } from 'vitest/config'
import tsconfigPaths from 'vite-tsconfig-paths'

export default defineConfig({
  plugins: [tsconfigPaths()],
})
```

**Rationale**:

- Leverages existing `tsconfig.json` configurations
- Consistent with Vite's module resolution
- Supports workspace path aliases like `@tiny-station/common`

#### 5. Mocking Strategy

**Decision**: Use Vitest's built-in mocking (`vi.mock()`) with manual mock files in `__mocks__` directories.

**Mock Locations**:

- `packages/server/src/__mocks__/redis.ts` - RedisConnection mock
- `packages/server/src/__mocks__/socket.io.ts` - Socket.IO mock

**Rationale**:

- Vitest provides excellent built-in mocking
- No additional library needed for basic mocking
- Supports module-level mocking

## Dependencies

### Root Level Dependencies

```json
{
  "devDependencies": {
    "vitest": "^2.0.0",
    "vite-tsconfig-paths": "^5.0.0"
  }
}
```

### Package-Specific Dependencies

**packages/common**:

```json
{
  "devDependencies": {
    "vitest": "workspace:*",
    "vite-tsconfig-paths": "workspace:*"
  }
}
```

**packages/server**:

```json
{
  "devDependencies": {
    "vitest": "workspace:*",
    "vite-tsconfig-paths": "workspace:*",
    "@testing-library/node": "^10.0.0",
    "happy-dom": "^15.0.0"
  }
}
```

**packages/frontend**:

```json
{
  "devDependencies": {
    "vitest": "workspace:*",
    "vite-tsconfig-paths": "workspace:*",
    "@testing-library/react": "^16.0.0",
    "@testing-library/user-event": "^14.0.0",
    "jsdom": "^24.0.0"
  }
}
```

## Test Scripts

Each package will have standardized test scripts:

| Script       | Command                         | Purpose                         |
| ------------ | ------------------------------- | ------------------------------- |
| `test`       | `vitest run`                    | Run all tests once              |
| `test:watch` | `vitest`                        | Run tests in watch mode         |
| `test:ci`    | `vitest run --reporter=verbose` | CI-optimized output (root only) |

**Server-specific scripts**:
| Script | Command | Purpose |
|--------|---------|---------|
| `test:unit` | `vitest run --config vitest.unit.config.ts` | Unit tests only |
| `test:integration` | `vitest run --config vitest.integration.config.ts` | Integration tests only |

## Configuration Examples

### packages/common/vitest.config.ts

```typescript
import { defineConfig } from 'vitest/config'
import tsconfigPaths from 'vite-tsconfig-paths'

export default defineConfig({
  plugins: [tsconfigPaths()],
  test: {
    environment: 'jsdom',
    include: ['src/**/*.test.ts'],
    coverage: {
      provider: 'v8',
      reporter: ['text', 'json', 'html'],
    },
  },
})
```

### packages/server/vitest.config.ts

```typescript
import { defineConfig } from 'vitest/config'
import tsconfigPaths from 'vite-tsconfig-paths'

export default defineConfig({
  plugins: [tsconfigPaths()],
  test: {
    environment: 'happy-dom',
    include: ['src/**/*.test.ts'],
    coverage: {
      provider: 'v8',
      reporter: ['text', 'json', 'html'],
    },
  },
})
```

### packages/frontend/vitest.config.ts

```typescript
import { defineConfig } from 'vitest/config'
import tsconfigPaths from 'vite-tsconfig-paths'

export default defineConfig({
  plugins: [tsconfigPaths()],
  test: {
    environment: 'jsdom',
    include: ['src/**/*.test.tsx'],
    css: {
      modules: {
        classNameStrategy: 'scoped',
      },
    },
    alias: {
      '\\.svg$': '<rootDir>/public/logo.svg',
    },
  },
})
```

## Test Patterns

### Unit Test Pattern (Server)

```typescript
// packages/server/src/plugins/api/AuthService.test.ts
import { describe, it, expect, vi, beforeEach, afterEach } from 'vitest'
import { AuthService } from './AuthService'
import { RedisConnection } from '../redis'

// Mock dependencies
vi.mock('../redis')

describe('AuthService', () => {
  let authService: AuthService
  let mockRedis: jest.Mocked<RedisConnection>

  beforeEach(() => {
    mockRedis = {
      get: vi.fn().mockResolvedValue(null),
      set: vi.fn().mockResolvedValue('OK'),
    } as any
    authService = new AuthService(mockRedis)
  })

  it('should authenticate valid user', async () => {
    const result = await authService.authenticate('user@example.com', 'password123')
    expect(result).toBeDefined()
    expect(mockRedis.get).toHaveBeenCalled()
  })
})
```

### Integration Test Pattern (Server)

```typescript
// packages/server/src/plugins/api/apiRoutes.integration.test.ts
import { describe, it, expect, beforeAll, afterAll } from 'vitest'
import Fastify from 'fastify'
import { buildApp } from '../index'
import { RedisConnection } from '../redis'

describe('API Routes Integration', () => {
  let app: ReturnType<typeof buildApp>
  let mockRedis: RedisConnection

  beforeAll(async () => {
    // Create mock Redis before tests
    mockRedis = createMockRedis()

    // Build app with mock dependencies
    app = await buildApp({
      redis: mockRedis,
      // Other mocks...
    })

    await app.ready()
  })

  afterAll(async () => {
    await app.close()
  })

  it('should respond with 400 for invalid registration', async () => {
    const response = await app.inject({
      method: 'POST',
      url: '/api/register',
      payload: {
        email: 'invalid-email',
        password: 'short',
      },
    })

    expect(response.statusCode).toBe(400)
  })
})
```

### Component Test Pattern (Frontend)

```typescript
// packages/frontend/src/components/Modal/Modal.test.tsx
import { describe, it, expect } from 'vitest'
import { render, screen, fireEvent } from '@testing-library/react'
import Modal from './Modal'
import userEvent from '@testing-library/user-event'

describe('Modal', () => {
  it('renders correctly when open', () => {
    render(
      <Modal isOpen={true} onClose={() => {}}>
        <div>Modal Content</div>
      </Modal>
    )

    expect(screen.getByText('Modal Content')).toBeInTheDocument()
    expect(screen.getByRole('dialog')).toBeInTheDocument()
  })

  it('calls onClose when close button is clicked', async () => {
    const onClose = vi.fn()
    const user = userEvent.setup()

    render(
      <Modal isOpen={true} onClose={onClose}>
        <div>Modal Content</div>
      </Modal>
    )

    await user.click(screen.getByRole('button', { name: /close/i }))

    expect(onClose).toHaveBeenCalledTimes(1)
  })

  it('does not render when closed', () => {
    render(
      <Modal isOpen={false} onClose={() => {}}>
        <div>Modal Content</div>
      </Modal>
    )

    expect(screen.queryByText('Modal Content')).not.toBeInTheDocument()
  })
})
```

### Schema Test Pattern (Common)

```typescript
// packages/common/src/apiSchemas.test.ts
import { describe, it, expect } from 'vitest'
import { loginSchema, registerSchema } from './apiSchemas'

describe('apiSchemas', () => {
  describe('loginSchema', () => {
    it('validates correct login data', () => {
      const validData = {
        email: 'user@example.com',
        password: 'password123',
      }

      const result = loginSchema.safeParse(validData)
      expect(result.success).toBe(true)
    })

    it('rejects invalid email format', () => {
      const invalidData = {
        email: 'not-an-email',
        password: 'password123',
      }

      const result = loginSchema.safeParse(invalidData)
      expect(result.success).toBe(false)
      expect(result.error?.issues[0].path).toContain('email')
    })

    it('rejects short password', () => {
      const invalidData = {
        email: 'user@example.com',
        password: '123',
      }

      const result = loginSchema.safeParse(invalidData)
      expect(result.success).toBe(false)
    })
  })
})
```

## CSS and Asset Handling

### CSS Modules

Frontend components using CSS modules need configuration:

```typescript
// packages/frontend/vitest.config.ts
export default defineConfig({
  test: {
    css: {
      modules: {
        classNameStrategy: 'scoped',
      },
    },
  },
})
```

### SVG Imports

SVG imports used as components need aliasing:

```typescript
// packages/frontend/vitest.config.ts
export default defineConfig({
  test: {
    alias: {
      '\\.svg$': path.resolve(__dirname, './public/logo.svg'),
    },
  },
})
```

## Migration Path

1. **Phase 1**: Install dependencies, create basic configs
2. **Phase 2**: Write first tests for critical paths
3. **Phase 3**: Expand test coverage over time
4. **Phase 4**: Add coverage thresholds and CI integration

## Open Questions to Resolve

1. **Environment for server**: Should we use `happy-dom` or `node` environment? Recommendation: `happy-dom` for consistency with frontend, faster startup.

2. **Mocking library**: Should we use `vi.mock()` (built-in) or introduce `msw` for HTTP mocking? Recommendation: Start with `vi.mock()`, add `msw` when needed for API mocking.

3. **Coverage thresholds**: What initial coverage target? Recommendation: 0% for first iteration, establish baseline before setting thresholds.

4. **Test isolation**: Should integration tests share a port or use random ports? Recommendation: Random ports for parallel test execution.
