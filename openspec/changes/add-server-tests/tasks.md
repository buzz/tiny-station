## 1. Setup and Dependencies

- [ ] 1.1 Add supertest dependency to server package
- [ ] 1.2 Create test utilities module for mocks and fixtures
- [ ] 1.3 Configure vitest environment for API testing

## 2. API Integration Tests (supertest)

- [ ] 2.1 Test POST /auth/register - success and validation errors
- [ ] 2.2 Test POST /auth/login - success, invalid credentials, missing user
- [ ] 2.3 Test POST /auth/verify - valid and invalid tokens
- [ ] 2.4 Test GET /auth/verify-jwt - authenticated and unauthenticated requests
- [ ] 2.5 Test DELETE /user - account deletion
- [ ] 2.6 Test PUT /user/notifications - subscription updates
- [ ] 2.7 Test POST /auth/forgot-password - request handling
- [ ] 2.8 Test POST /auth/reset-password - token and password validation
- [ ] 2.9 Test GET /chat/messages - pagination and retrieval

## 3. AuthService Unit Tests

- [ ] 3.1 Test register - nickname uniqueness check
- [ ] 3.2 Test register - email uniqueness check
- [ ] 3.3 Test register - mail sending failure handling
- [ ] 3.4 Test login - successful authentication
- [ ] 3.5 Test login - invalid password handling
- [ ] 3.6 Test login - non-existent user
- [ ] 3.7 Test verifyEmail - token verification
- [ ] 3.8 Test requestPasswordReset - user lookup and token creation
- [ ] 3.9 Test resetPassword - token validation and password update

## 4. RedisConnection Unit Tests

- [ ] 4.1 Test key generation functions
- [ ] 4.2 Test password hashing and comparison
- [ ] 4.3 Test message serialization/deserialization
- [ ] 4.4 Test subscription operations

## 5. ChatManager Unit Tests

- [ ] 5.1 Test message text truncation at max length
- [ ] 5.2 Test message trimming
- [ ] 5.3 Test unauthenticated user handling

## 6. Utility Tests

- [ ] 6.1 Test JWT sign and verify
- [ ] 6.2 Test error classes (UnauthorizedError)

## 7. Validation

- [ ] 7.1 Run full test suite to verify all tests pass
- [ ] 7.2 Run lint and typecheck
