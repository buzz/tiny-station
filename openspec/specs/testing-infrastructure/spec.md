# testing-infrastructure Specification

## Purpose

TBD - created by archiving change add-vitest-testing-infrastructure. Update Purpose after archive.
## Requirements
### Requirement: Root Vitest Configuration

The project root MUST have a shared Vitest configuration that can be extended by packages.

#### Scenario: Root config exists

- **WHEN** a user checks for vitest.config.ts in the project root
- **THEN** the file exists and defines shared configuration patterns

### Requirement: Workspace Test Scripts

The root package.json MUST include workspace-level test scripts.

#### Scenario: Workspace test script runs all tests

- **WHEN** a user runs `npm test` at the workspace root
- **THEN** tests run across all packages (common, server, frontend)

### Requirement: Vitest Dependencies

Vitest and related dependencies MUST be installed in the workspace.

#### Scenario: Dependencies are installed

- **WHEN** checking package.json files
- **THEN** vitest appears as a dependency in relevant packages

### Requirement: Path Alias Configuration

The workspace MUST be configured to resolve path aliases for test execution.

#### Scenario: Path aliases resolve in all packages

- **WHEN** running tests in any package
- **THEN** imports using workspace paths (e.g., `@tiny-station/common`) resolve correctly

### Requirement: Vitest Test Runner

The project MUST use Vitest as the primary test runner for all packages.

#### Scenario: Test runner is installed and functional

- **WHEN** running `vitest` command in any package
- **THEN** the test runner executes successfully
- **AND** test files matching the package pattern are discovered
- **AND** test results are displayed in the console

#### Scenario: Test runner version is consistent

- **WHEN** checking Vitest versions across packages
- **THEN** all packages use the same Vitest version
- **AND** version is declared as a devDependency in each package

### Requirement: Path Alias Resolution

Vitest MUST correctly resolve TypeScript path aliases used in the monorepo.

#### Scenario: Common package imports work in server tests

- **WHEN** importing `@tiny-station/common` in server test files
- **THEN** the import resolves to the correct module
- **AND** no module resolution errors occur

#### Scenario: Common package imports work in frontend tests

- **WHEN** importing `@tiny-station/common` in frontend test files
- **THEN** the import resolves to the correct module
- **AND** no module resolution errors occur

#### Scenario: Server package imports work in server tests

- **WHEN** importing `@tiny-station/server` in server test files
- **THEN** the import resolves to the correct module
- **AND** no module resolution errors occur

### Requirement: Package-Level Configuration

Each package MUST have its own `vitest.config.ts` file with appropriate settings.

#### Scenario: Configuration file exists in common package

- **WHEN** listing files in `packages/common/`
- **THEN** `vitest.config.ts` exists
- **AND** configuration includes jsdom environment
- **AND** configuration includes path alias resolution

#### Scenario: Configuration file exists in server package

- **WHEN** listing files in `packages/server/`
- **THEN** `vitest.config.ts` exists
- **AND** configuration includes appropriate environment (node or happy-dom)
- **AND** configuration includes path alias resolution
- **AND** configuration supports both unit and integration tests

#### Scenario: Configuration file exists in frontend package

- **WHEN** listing files in `packages/frontend/`
- **THEN** `vitest.config.ts` exists
- **AND** configuration includes jsdom environment
- **AND** configuration includes path alias resolution
- **AND** configuration handles CSS modules and SVG imports

### Requirement: Test Scripts

Each package MUST have test scripts defined in `package.json`.

#### Scenario: Test scripts are available in common package

- **WHEN** running `pnpm run test` in common package
- **THEN** Vitest runs all tests
- **AND** exits with appropriate code (0 for success, 1 for failures)

#### Scenario: Test scripts are available in server package

- **WHEN** running `pnpm run test` in server package
- **THEN** Vitest runs all tests
- **AND** tests for both unit and integration are executed

#### Scenario: Test scripts are available in frontend package

- **WHEN** running `pnpm run test` in frontend package
- **THEN** Vitest runs all tests
- **AND** React component tests are executed

### Requirement: Test File Patterns

Test files MUST follow consistent naming conventions.

#### Scenario: Unit test files are named correctly

- **WHEN** naming unit test files in any package
- **THEN** files end with `.test.ts` or `.test.tsx`
- **AND** files are located in the same directory as the code they test

#### Scenario: Integration test files are named correctly

- **WHEN** naming integration test files in server package
- **THEN** files end with `.integration.test.ts`
- **AND** files are located in the same directory as the code they test

#### Scenario: Test files are discovered correctly

- **WHEN** running Vitest in any package
- **THEN** all test files matching the pattern are discovered
- **AND** no non-test files are executed as tests

### Requirement: Workspace Test Execution

The root `package.json` MUST have scripts to run all tests.

#### Scenario: All tests run from root

- **WHEN** running `pnpm run test:ci` in root directory
- **THEN** tests run in all packages
- **AND** results from all packages are aggregated
- **AND** exit code reflects overall test status

#### Scenario: Test results are visible in CI output

- **WHEN** running tests in CI environment
- **THEN** test output is verbose and readable
- **AND** failures are clearly identified
- **AND** success/failure summary is displayed

