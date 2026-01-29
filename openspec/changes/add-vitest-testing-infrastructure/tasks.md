# add-vitest-testing-infrastructure Tasks

## Phase 1: Root Configuration and Dependencies

- [ ] Install root-level devDependencies for Vitest
  - `vitest`
  - `vite-tsconfig-paths`
  - Validate with `pnpm list --depth -1` in root

- [ ] Create root-level `vitest.config.ts` for workspace patterns
  - Configure `extends: true` for project inheritance
  - Set up base TypeScript resolution
  - Validate with `pnpm exec vitest --version`

- [ ] Add test scripts to root `package.json`
  - `test:all` - runs tests across all packages
  - `test:ci` - runs all tests with CI flag
  - Validate scripts work with `pnpm run test:ci --run`

## Phase 2: packages/common Testing Setup

- [ ] Install devDependencies in `packages/common`
  - `vitest`
  - `vite-tsconfig-paths`
  - Validate with `pnpm list --depth -1` in common

- [ ] Create `packages/common/vitest.config.ts`
  - Use jsdom environment (for compatibility)
  - Configure path aliases to resolve `@listen-app/common`
  - Set up test file pattern `**/*.test.ts`

- [ ] Add test scripts to `packages/common/package.json`
  - `test` - runs vitest
  - `test:watch` - runs vitest with watch mode
  - Validate with `cd packages/common && pnpm run test --run`

- [ ] Write sample schema test in `packages/common/src/apiSchemas.test.ts`
  - Test Zod schema validation
  - Test successful validation cases
  - Test validation failure cases
  - Run tests to verify they pass

## Phase 3: packages/server Testing Setup

- [ ] Install devDependencies in `packages/server`
  - `vitest`
  - `vite-tsconfig-paths`
  - `@testing-library/node` (for server testing)
  - `happy-dom` (for Node environment)
  - Validate with `pnpm list --depth -1` in server

- [ ] Create `packages/server/vitest.config.ts`
  - Use happy-dom or Node environment
  - Configure path aliases for `@listen-app/common`
  - Configure path aliases for `@listen-app/server`
  - Set up test file patterns:
    - `**/*.test.ts` for unit tests
    - `**/*.integration.test.ts` for integration tests
  - Configure pool settings for isolation

- [ ] Add test scripts to `packages/server/package.json`
  - `test` - runs all server tests
  - `test:unit` - runs only unit tests
  - `test:integration` - runs only integration tests
  - `test:watch` - runs vitest with watch mode
  - Validate with `cd packages/server && pnpm run test --run`

- [ ] Write unit test example in `packages/server/src/plugins/api/AuthService.test.ts`
  - Mock Redis dependency
  - Test service logic in isolation
  - Run tests to verify they pass

- [ ] Write integration test example in `packages/server/src/plugins/api/apiRoutes.integration.test.ts`
  - Create temporary Fastify instance
  - Test route behavior
  - Mock Socket.IO and Redis
  - Run tests to verify they pass

- [ ] Create mock patterns in `packages/server/src/__mocks__/`
  - `redis.ts` - mock RedisConnection
  - `socket.io.ts` - mock Socket.IO
  - Validate mocks work with `pnpm run test:integration --run`

## Phase 4: packages/frontend Testing Setup

- [ ] Install devDependencies in `packages/frontend`
  - `vitest`
  - `vite-tsconfig-paths`
  - `@testing-library/react`
  - `@testing-library/user-event`
  - `jsdom`
  - Validate with `pnpm list --depth -1` in frontend

- [ ] Create `packages/frontend/vitest.config.ts`
  - Use jsdom environment
  - Configure path aliases for `@listen-app/common`
  - Configure CSS module handling with `moduleNameMapper`
  - Configure SVG import handling
  - Set up test file pattern `**/*.test.tsx`

- [ ] Add test scripts to `packages/frontend/package.json`
  - `test` - runs vitest
  - `test:watch` - runs vitest with watch mode
  - Validate with `cd packages/frontend && pnpm run test --run`

- [ ] Write component test example in `packages/frontend/src/components/Modal/Modal.test.tsx`
  - Test component rendering
  - Test props and state
  - Test with @testing-library/react
  - Run tests to verify they pass

- [ ] Write component test with user interaction in `packages/frontend/src/components/NavBar/VolumeControl.test.tsx`
  - Test user event handling
  - Test state changes
  - Use @testing-library/user-event
  - Run tests to verify they pass

## Phase 5: Validation and Documentation

- [ ] Run full test suite across all packages
  - `pnpm run test:ci` should pass
  - No test failures

- [ ] Verify path aliases work correctly
  - Common imports work in server tests
  - Common imports work in frontend tests

- [ ] Create `TESTING.md` documentation
  - Testing patterns guide
  - How to write tests in each package
  - Mock patterns reference
  - CI/CD integration notes

- [ ] Update `AGENTS.md` with testing commands
  - Add test commands to Build/Lint/Test section
  - Document test scripts

## Dependencies and Parallelization

### Sequential Dependencies

- Root configuration must be complete before package configurations
- Package dependencies must install before package configs can be validated

### Parallelizable Tasks

- Common, server, and frontend packages can be set up in parallel after root config
- Test file writing for each package can happen in parallel
- Documentation can be written while tests are being implemented

### External Dependencies

- Vitest and related packages must be available in npm registry
- No external services required for basic setup
