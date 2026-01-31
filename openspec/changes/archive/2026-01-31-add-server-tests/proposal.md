# Change: Add Comprehensive Tests to Server Package

## Why

The server package currently has only placeholder tests with no actual test coverage. Adding meaningful tests will:

- Catch regressions in core authentication and chat functionality
- Validate API behavior without manual testing
- Ensure Redis operations work correctly
- Provide confidence when refactoring

## What Changes

- Add supertest-based integration tests for all REST API endpoints
- Add unit tests for AuthService with mocked dependencies
- Add unit tests for RedisConnection key generation and data transformation
- Add unit tests for ChatManager message processing
- Add unit tests for utility functions (JWT verification, error classes)
- Configure test fixtures and mock services

## Impact

- Affected specs: `testing-server` (new capability)
- Affected code: All server source files under `packages/server/src/`
- New dependencies: `supertest` (for API integration tests)
