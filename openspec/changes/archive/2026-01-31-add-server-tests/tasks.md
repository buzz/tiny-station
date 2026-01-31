## 1. Setup and Dependencies

- [x] 1.1 Add supertest dependency to server package
- [x] 1.2 Create test utilities module for mocks and fixtures
- [x] 1.3 Configure vitest environment for API testing

## 2. API Integration Tests (supertest)

- [x] 2.1 Test POST /auth/register - success and validation errors
- [x] 2.2 Test POST /auth/login - success, invalid credentials, missing user
- [x] 2.3 Test POST /auth/verify - valid and invalid tokens
- [x] 2.4 Test GET /auth/verify-jwt - authenticated and unauthenticated requests
- [x] 2.5 Test DELETE /user - account deletion
- [x] 2.6 Test PUT /user/notifications - subscription updates
- [x] 2.7 Test POST /auth/forgot-password - request handling
- [x] 2.8 Test POST /auth/reset-password - token and password validation
- [x] 2.9 Test GET /chat/messages - pagination and retrieval

## 3. AuthService Unit Tests

- [x] 3.1 Test register - nickname uniqueness check
- [x] 3.2 Test register - email uniqueness check
- [x] 3.3 Test register - mail sending failure handling
- [x] 3.4 Test login - successful authentication
- [x] 3.5 Test login - invalid password handling
- [x] 3.6 Test login - non-existent user
- [x] 3.7 Test verifyEmail - token verification
- [x] 3.8 Test requestPasswordReset - user lookup and token creation
- [x] 3.9 Test resetPassword - token validation and password update

## 4. RedisConnection Unit Tests

- [x] 4.1 Test key generation functions
- [x] 4.2 Test password hashing and comparison
- [x] 4.3 Test message serialization/deserialization
- [x] 4.4 Test subscription operations

## 5. ChatManager Unit Tests

- [x] 5.1 Test message text truncation at max length
- [x] 5.2 Test message trimming
- [x] 5.3 Test unauthenticated user handling

## 6. Utility Tests

- [x] 6.1 Test JWT sign and verify
- [x] 6.2 Test error classes (UnauthorizedError)

## 7. Validation

- [x] 7.1 Run full test suite to verify all tests pass
- [x] 7.2 Run lint and typecheck
