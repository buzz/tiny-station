# testing-common Specification

## Purpose

TBD - created by archiving change add-vitest-testing-infrastructure. Update Purpose after archive.
## Requirements
### Requirement: Vitest Configuration

The packages/common package MUST have a configured Vitest test runner.

#### Scenario: Vitest config exists

- **WHEN** a user runs `vitest --version` in the packages/common directory
- **THEN** Vitest is recognized and operational

### Requirement: Test Script

The packages/common package.json MUST include a test script for running tests.

#### Scenario: Test script is defined

- **WHEN** a user runs `npm test --prefix packages/common`
- **THEN** the test runner executes successfully

### Requirement: Path Alias Resolution

The packages/common package MUST resolve monorepo path aliases for test files.

#### Scenario: Path aliases work in tests

- **WHEN** a test file imports from `@listen-app/common` or other workspace packages
- **THEN** the import resolves correctly without errors

### Requirement: Sample Test File

The packages/common package MUST have at least one sample test file demonstrating patterns.

#### Scenario: Sample test runs

- **WHEN** running `npm test --prefix packages/common`
- **THEN** at least one test executes and passes

### Requirement: Schema Validation Tests

The common package MUST include tests for all Zod schemas.

#### Scenario: Login schema validates correctly

- **WHEN** testing the login schema with valid data
- **THEN** `safeParse` returns success
- **AND** parsed data matches input

#### Scenario: Login schema rejects invalid data

- **WHEN** testing the login schema with invalid email
- **THEN** `safeParse` returns failure
- **AND** error issues include email path

#### Scenario: Login schema rejects short password

- **WHEN** testing the login schema with password < 8 characters
- **THEN** `safeParse` returns failure
- **AND** error issues include password path

#### Scenario: Register schema validates correctly

- **WHEN** testing the register schema with valid data
- **THEN** `safeParse` returns success
- **AND** parsed data includes all required fields

#### Scenario: Register schema rejects weak passwords

- **WHEN** testing the register schema with password < 8 characters
- **THEN** `safeParse` returns failure
- **AND** error message indicates minimum password length

#### Scenario: Register schema validates email format

- **WHEN** testing the register schema with malformed email
- **THEN** `safeParse` returns failure
- **AND** error issues include email path

### Requirement: Test File Location

Schema tests MUST be co-located with the schemas they test.

#### Scenario: Test file is in same directory as schema

- **WHEN** looking for tests in `packages/common/src/`
- **THEN** `apiSchemas.test.ts` is located next to `apiSchemas.ts`
- **AND** test file follows naming pattern `*.test.ts`

### Requirement: Test Coverage

Schema tests MUST cover all exportable schemas.

#### Scenario: All exported schemas have tests

- **WHEN** counting schemas in `packages/common/src/`
- **THEN** each exported schema has at least one corresponding test file
- **AND** no exported schema is untested

### Requirement: Test Isolation

Schema tests MUST run in isolation without side effects.

#### Scenario: Test results are consistent across runs

- **WHEN** running schema tests multiple times
- **THEN** results are consistent
- **AND** no shared state affects test outcomes

