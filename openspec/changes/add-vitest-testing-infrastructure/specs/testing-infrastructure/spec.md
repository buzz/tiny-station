# testing-infrastructure Specification

## Purpose

Establish a comprehensive testing infrastructure using Vitest across all packages in the monorepo, enabling unit and integration testing with consistent patterns and tooling.

## ADDED Requirements

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

- **WHEN** importing `@listen-app/common` in server test files
- **THEN** the import resolves to the correct module
- **AND** no module resolution errors occur

#### Scenario: Common package imports work in frontend tests

- **WHEN** importing `@listen-app/common` in frontend test files
- **THEN** the import resolves to the correct module
- **AND** no module resolution errors occur

#### Scenario: Server package imports work in server tests

- **WHEN** importing `@listen-app/server` in server test files
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

## MODIFIED Requirements

### Requirement: Code Quality Testing

The existing code-quality capability MUST be extended to include automated testing.

#### Scenario: Testing is part of code quality workflow

- **WHEN** checking code quality practices
- **THEN** linting, type checking, AND testing are all included
- **AND** `pnpm run test` is equivalent to `pnpm run lint && pnpm run ts:check`
