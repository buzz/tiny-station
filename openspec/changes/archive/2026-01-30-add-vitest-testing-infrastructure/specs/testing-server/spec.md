# testing-server Specification

## Purpose

Define testing requirements for the `@listen-app/server` package, including unit tests, integration tests, and mocking patterns for external dependencies.

## ADDED Requirements

### Requirement: Unit Test Infrastructure

The server package MUST support unit testing of service logic in isolation.

#### Scenario: AuthService unit tests run successfully

- **WHEN** running `pnpm run test:unit` in server package
- **THEN** AuthService unit tests execute
- **AND** Redis and Socket.IO dependencies are mocked
- **AND** test results are displayed

#### Scenario: RedisConnection is mocked in unit tests

- **WHEN** importing RedisConnection in a unit test
- **THEN** the import returns a mock implementation
- **AND** mock methods can be configured with `vi.mocked()`
- **AND** mock calls are trackable for assertions

#### Scenario: Unit tests run in isolation

- **WHEN** running unit tests
- **THEN** each test file runs in its own process or thread
- **AND** no test state leaks between test files
- **AND** mocks are reset between tests

### Requirement: Integration Test Infrastructure

The server package MUST support integration testing with a temporary Fastify instance.

#### Scenario: Fastify instance is created for integration tests

- **WHEN** running integration tests
- **THEN** a Fastify instance is created
- **AND** the instance is closed after tests complete
- **AND** no port conflicts occur between test runs

#### Scenario: Integration tests use temporary routes

- **WHEN** defining routes in integration tests
- **THEN** routes are registered on a temporary instance
- **AND** routes are not registered on the production instance
- **AND** test routes can be injected with test payloads

#### Scenario: Integration tests mock external services

- **WHEN** testing routes that depend on Redis
- **THEN** Redis is mocked
- **AND** mocked Redis returns test data
- **AND** route responses are based on mock data

#### Scenario: Integration tests mock Socket.IO

- **WHEN** testing routes or handlers that emit Socket.IO events
- **THEN** Socket.IO is mocked
- **AND** mock can track emitted events
- **AND** mock can be configured to return specific responses

### Requirement: Mock Patterns

The server package MUST provide consistent mock patterns for external dependencies.

#### Scenario: Redis mock is available

- **WHEN** creating mock Redis connection
- **THEN** `packages/server/src/__mocks__/redis.ts` exists
- **AND** mock implements key RedisConnection methods
- **AND** mock supports async operations
- **AND** mock can be configured with `vi.mock()`

#### Scenario: Socket.IO mock is available

- **WHEN** creating mock Socket.IO connection
- **THEN** `packages/server/src/__mocks__/socket.io.ts` exists
- **AND** mock implements key Socket.IO methods
- **AND** mock supports event emission tracking
- **AND** mock can be configured with `vi.mock()`

#### Scenario: Mock factories are used

- **WHEN** setting up mocks in tests
- **THEN** mock factories create consistent mock objects
- **AND** factories accept configuration options
- **AND** factories reset mocks between tests

### Requirement: Test File Organization

Unit and integration tests MUST be organized clearly.

#### Scenario: Unit test files are named correctly

- **WHEN** naming unit test files
- **THEN** files end with `.test.ts`
- **AND** files are in the same directory as the code they test
- **AND** test filenames mirror source filenames

#### Scenario: Integration test files are named correctly

- **WHEN** naming integration test files
- **THEN** files end with `.integration.test.ts`
- **AND** files are in the same directory as the code they test
- **AND** integration tests are clearly distinguished from unit tests

#### Scenario: Test directories are organized

- **WHEN** organizing tests by type
- **THEN** unit tests and integration tests can coexist in the same directory
- **AND** Vitest can filter by file pattern
- **AND** `pnpm run test:unit` only runs `.test.ts` files
- **AND** `pnpm run test:integration` only runs `.integration.test.ts` files

### Requirement: Test Scripts

The server package MUST have distinct test scripts for different test types.

#### Scenario: All tests run together

- **WHEN** running `pnpm run test` in server package
- **THEN** both unit and integration tests execute
- **AND** results are aggregated
- **AND** exit code reflects overall status

#### Scenario: Only unit tests run

- **WHEN** running `pnpm run test:unit` in server package
- **THEN** only `.test.ts` files execute
- **AND** `.integration.test.ts` files are excluded
- **AND** results show unit test count

#### Scenario: Only integration tests run

- **WHEN** running `pnpm run test:integration` in server package
- **THEN** only `.integration.test.ts` files execute
- **AND** `.test.ts` files are excluded
- **AND** results show integration test count

### Requirement: API Route Testing

The server package MUST support testing API routes with injected requests.

#### Scenario: Routes respond to injected requests

- **WHEN** testing a route with `app.inject()`
- **THEN** response status matches expected status
- **AND** response body matches expected body
- **AND** headers are correctly set

#### Scenario: Route validation works in tests

- **WHEN** testing a route with invalid payload
- **THEN** response status is 400
- **AND** response contains validation error details
- **AND** Zod schema validation is active

#### Scenario: Route authentication works in tests

- **WHEN** testing a protected route without authentication
- **THEN** response status is 401
- **AND** when testing with valid JWT, route responds correctly

### Requirement: Service Testing

The server package MUST support testing services with mocked dependencies.

#### Scenario: Services are testable in isolation

- **WHEN** instantiating a service in a test
- **THEN** dependencies can be injected
- **AND** mock dependencies replace real ones
- **AND** service logic can be tested independently

#### Scenario: Service errors are correctly thrown

- **WHEN** testing a service that throws errors
- **THEN** errors are caught in tests
- **AND** error types match expected types
- **AND** error messages are accessible

## Cross-Reference

- Related to [testing-infrastructure](../testing-infrastructure/spec.md) for general test runner requirements
- Related to [fastify-http](../../specs/fastify-http/spec.md) for route testing patterns
- Related to [fastify-redis](../../specs/fastify-redis/spec.md) for Redis mocking patterns
- Related to [fastify-socketio](../../specs/fastify-socketio/spec.md) for Socket.IO mocking patterns
