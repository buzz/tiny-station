# testing-server Specification

## Purpose

TBD - created by archiving change add-vitest-testing-infrastructure. Update Purpose after archive.
## Requirements
### Requirement: Vitest Configuration

The packages/server package MUST have a configured Vitest test runner.

#### Scenario: Vitest config exists

- **WHEN** a user runs `vitest --version` in the packages/server directory
- **THEN** Vitest is recognized and operational

### Requirement: Test Script

The packages/server package.json MUST include a test script for running tests.

#### Scenario: Test script is defined

- **WHEN** a user runs `npm test --prefix packages/server`
- **THEN** the test runner executes successfully

### Requirement: Redis Mocking

The packages/server package MUST provide mock patterns for Redis interactions in tests.

#### Scenario: Redis mocking is available

- **WHEN** a test file needs to mock Redis operations
- **THEN** mock utilities are available and functional

### Requirement: Socket.IO Mocking

The packages/server package MUST provide mock patterns for Socket.IO interactions in tests.

#### Scenario: Socket.IO mocking is available

- **WHEN** a test file needs to mock Socket.IO operations
- **THEN** mock utilities are available and functional

### Requirement: Path Alias Resolution

The packages/server package MUST resolve monorepo path aliases for test files.

#### Scenario: Path aliases work in tests

- **WHEN** a test file imports from `@tiny-station/common` or other workspace packages
- **THEN** the import resolves correctly without errors

### Requirement: Sample Server Test

The packages/server package MUST have at least one sample test file demonstrating patterns.

#### Scenario: Sample test runs

- **WHEN** running `npm test --prefix packages/server`
- **THEN** at least one test executes and passes

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

### Requirement: API Endpoint Testing

The server SHALL provide comprehensive integration tests for all REST API endpoints using supertest.

#### Scenario: Registration endpoint handles valid requests

- **WHEN** a POST request is made to /auth/register with valid nickname, email, password, and notification preference
- **THEN** the response status SHALL be 201
- **AND** the response SHALL contain a success message about email verification

#### Scenario: Registration endpoint rejects duplicate nicknames

- **WHEN** a POST request is made to /auth/register with a nickname that already exists
- **THEN** the response status SHALL be 400
- **AND** the response SHALL contain an error about nickname unavailability

#### Scenario: Registration endpoint rejects duplicate emails

- **WHEN** a POST request is made to /auth/register with an email that already exists
- **THEN** the response status SHALL be 400
- **AND** the response SHALL contain an error about email unavailability

#### Scenario: Login endpoint authenticates valid credentials

- **WHEN** a POST request is made to /auth/login with valid nickname and password
- **THEN** the response status SHALL be 200
- **AND** the response SHALL contain a JWT token and user info

#### Scenario: Login endpoint rejects invalid credentials

- **WHEN** a POST request is made to /auth/login with an invalid nickname or password
- **THEN** the response status SHALL be 401
- **AND** the response SHALL contain an error about wrong credentials

#### Scenario: Login endpoint handles non-existent user

- **WHEN** a POST request is made to /auth/login with a nickname that does not exist
- **THEN** the response status SHALL be 401
- **AND** the response SHALL contain an error about wrong credentials

#### Scenario: Email verification validates tokens

- **WHEN** a POST request is made to /auth/verify with a valid verification token
- **THEN** the response status SHALL be 200
- **AND** the response SHALL confirm successful email verification

#### Scenario: Email verification rejects invalid tokens

- **WHEN** a POST request is made to /auth/verify with an invalid or expired token
- **THEN** the response status SHALL be 400
- **AND** the response SHALL indicate the token is invalid or expired

#### Scenario: JWT verification validates authentication

- **WHEN** a GET request is made to /auth/verify-jwt with a valid JWT token
- **THEN** the response status SHALL be 200
- **AND** the response SHALL contain the user's email, nickname, and subscription status

#### Scenario: JWT verification rejects invalid tokens

- **WHEN** a GET request is made to /auth/verify-jwt without a valid JWT token
- **THEN** the response status SHALL be 401
- **AND** the response SHALL indicate authorization is required

#### Scenario: User deletion removes account data

- **WHEN** a DELETE request is made to /user with a valid JWT token
- **THEN** the response status SHALL be 204
- **AND** the user's data SHALL be removed from Redis

#### Scenario: Notification update changes subscription

- **WHEN** a PUT request is made to /user/notifications with subscription preference
- **THEN** the response status SHALL be 200
- **AND** the response SHALL confirm the updated subscription status

#### Scenario: Password reset request handles existing users

- **WHEN** a POST request is made to /auth/forgot-password with an email of a verified user
- **THEN** the response status SHALL be 200
- **AND** a password reset token SHALL be generated and email sent

#### Scenario: Password reset request ignores non-existent users

- **WHEN** a POST request is made to /auth/forgot-password with an email that does not exist
- **THEN** the response status SHALL be 200
- **AND** no error SHALL be returned (prevent email enumeration)

#### Scenario: Password reset validates tokens

- **WHEN** a POST request is made to /auth/reset-password with a valid token and new password
- **THEN** the response status SHALL be 200
- **AND** the password SHALL be updated in Redis

#### Scenario: Password reset rejects invalid tokens

- **WHEN** a POST request is made to /auth/reset-password with an invalid or expired token
- **THEN** the response status SHALL be 400
- **AND** the response SHALL indicate the token is invalid

#### Scenario: Chat messages endpoint retrieves latest messages

- **WHEN** a GET request is made to /chat/messages with a limit parameter
- **THEN** the response status SHALL be 200
- **AND** the response SHALL contain the messages and pagination info

#### Scenario: Chat messages endpoint supports pagination

- **WHEN** a GET request is made to /chat/messages with a before timestamp
- **THEN** the response status SHALL be 200
- **AND** the response SHALL contain messages before the specified timestamp

### Requirement: AuthService Testing

The AuthService SHALL have unit tests validating authentication logic without external dependencies.

#### Scenario: Registration fails for duplicate nickname

- **WHEN** AuthService.register is called with a nickname that already exists in Redis
- **THEN** the service SHALL throw an error about nickname unavailability
- **AND** no user SHALL be created

#### Scenario: Registration fails for duplicate email

- **WHEN** AuthService.register is called with an email that already exists in Redis
- **THEN** the service SHALL throw an error about email unavailability
- **AND** no user SHALL be created

#### Scenario: Registration rolls back on mail failure

- **WHEN** AuthService.register succeeds but mail sending fails
- **THEN** the service SHALL delete the created user
- **AND** the service SHALL throw an error about mail failure

#### Scenario: Login authenticates with correct password

- **WHEN** AuthService.login is called with valid nickname and password
- **THEN** the service SHALL return a JWT token
- **AND** the returned token SHALL contain the user's email and nickname

#### Scenario: Login rejects wrong password

- **WHEN** AuthService.login is called with a valid nickname but wrong password
- **THEN** the service SHALL throw an error about wrong credentials

#### Scenario: Password reset validates token existence

- **WHEN** AuthService.resetPassword is called with a non-existent token
- **THEN** the service SHALL throw an error about invalid token

### Requirement: RedisConnection Testing

The RedisConnection class SHALL have unit tests validating data transformation and key generation.

#### Scenario: Key generation produces correct format

- **WHEN** getNicknameKey, getUserKey, getTokenKey, or getPasswordResetKey is called
- **THEN** each SHALL return a properly formatted key with the correct prefix

#### Scenario: Message serialization handles UUID and timestamp

- **WHEN** storeMessage is called with a ChatMessage
- **THEN** the message SHALL be stored in Redis with timestamp as score
- **AND** the message data SHALL contain UUID, senderNickname, and message text

#### Scenario: Message deserialization parses stored data

- **WHEN** getMessages, getMessagesBefore, or getLatestMessages is called
- **THEN** the returned ChatMessage objects SHALL have valid uuid, timestamp, senderNickname, and message

#### Scenario: Subscription operations work correctly

- **WHEN** subscribe, unsubscribe, or isSubscribed is called
- **THEN** the Redis set SHALL be updated accordingly

### Requirement: ChatManager Testing

The ChatManager SHALL have unit tests validating message processing logic.

#### Scenario: Message text is truncated at maximum length

- **WHEN** ChatManager processes a message longer than MAX_CHAT_MESSAGE_LENGTH
- **THEN** the resulting message SHALL contain only the first MAX_CHAT_MESSAGE_LENGTH characters

#### Scenario: Message text is trimmed of whitespace

- **WHEN** ChatManager processes a message with leading or trailing whitespace
- **THEN** the resulting message SHALL have leading and trailing whitespace removed

#### Scenario: Empty messages are filtered

- **WHEN** ChatManager processes an empty or whitespace-only message
- **THEN** no message SHALL be emitted or stored

#### Scenario: Unauthenticated users cannot send messages

- **WHEN** an unauthenticated socket sends a chat message
- **THEN** the user SHALL be kicked with an error message

### Requirement: Utility Function Testing

The server utils SHALL have unit tests validating core utility functions.

#### Scenario: JWT signing and verification works correctly

- **WHEN** jwt.sign creates a token with a secret
- **THEN** jwt.verify SHALL successfully decode the token
- **AND** the decoded payload SHALL contain the user data

#### Scenario: UnauthorizedError has correct properties

- **WHEN** an UnauthorizedError is created with a message
- **THEN** the error SHALL have statusCode 401
- **AND** the error message SHALL match the provided message

