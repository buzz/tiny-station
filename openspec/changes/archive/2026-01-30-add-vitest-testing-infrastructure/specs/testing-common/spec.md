# testing-common Specification

## Purpose

Define testing requirements for the `@tiny-station/common` package, focusing on Zod schema validation tests.

## ADDED Requirements

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

## Cross-Reference

- Related to [testing-infrastructure](../testing-infrastructure/spec.md) for general test runner requirements
