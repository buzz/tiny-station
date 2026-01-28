# fastify-authentication Specification

## Purpose

Define requirements for JWT-based authentication using Fastify middleware instead of Express middleware, maintaining type safety and existing authentication logic.

## ADDED Requirements

### Requirement: JWT Middleware Implementation

JWT authentication MUST use Fastify's preHandler middleware instead of Express middleware.

#### Scenario: Valid JWT token is accepted

- **WHEN** a request includes a valid Bearer token in Authorization header
- **THEN** the JWT is verified using the configured secret
- **AND** decoded user data is attached to `request.user`
- **AND** the request proceeds to the handler
- **AND** `request.user` contains `nickname` and `email`

#### Scenario: Missing authorization header is rejected

- **WHEN** a request does not include Authorization header
- **THEN** the middleware rejects with 401 status
- **AND** response contains error message "Authorization token required"
- **AND** the request does not proceed to the handler

#### Scenario: Invalid JWT token is rejected

- **WHEN** a request includes an invalid or expired JWT token
- **THEN** the middleware rejects with 401 status
- **AND** response contains error message "Invalid or expired token"
- **AND** the request does not proceed to the handler

#### Scenario: Invalid token format is rejected

- **WHEN** a request includes a JWT token that decodes but lacks `user` property
- **THEN** the middleware rejects with 401 status
- **AND** response contains error message "Invalid token format"
- **AND** the request does not proceed to the handler

### Requirement: JWT Token Generation

JWT tokens MUST be generated using the same algorithm and payload structure as existing Express implementation.

#### Scenario: Login generates valid JWT token

- **WHEN** a user successfully logs in
- **THEN** a JWT token is generated using `jsonwebtoken.sign()`
- **AND** token payload contains `user` object with `_id` (email) and `nickname`
- **AND** token is signed with configured JWT secret
- **AND** token is returned in response body

### Requirement: Protected Routes

Routes requiring authentication MUST use Fastify middleware for JWT verification.

#### Scenario: Protected route requires authentication

- **WHEN** a route is marked as requiring authentication
- **THEN** JWT middleware is applied via `preHandler` or route config
- **AND** unauthenticated requests are rejected before handler execution
- **AND** authenticated requests proceed with user data attached

### Requirement: User Data Type Safety

User data attached to request MUST be type-safe and accessible without type assertions.

#### Scenario: User data is properly typed

- **WHEN** JWT middleware attaches user data to request
- **THEN** `request.user` is typed as `UserData` interface
- **AND** TypeScript compiler validates property access
- **AND** no type casting or assertions are required in handlers

### Requirement: Authentication Response Format

Authentication endpoints MUST preserve existing response formats to avoid frontend changes.

#### Scenario: Login response format matches existing

- **WHEN** user logs in successfully
- **THEN** response contains `token` (string)
- **AND** response contains `nickname` (string)
- **AND** response contains `subscribed` (boolean)
- **AND** response status is 200

#### Scenario: Verify JWT response format matches existing

- **WHEN** JWT is verified successfully
- **THEN** response contains `nickname` (string)
- **AND** response contains `email` (string)
- **AND** response contains `authenticated` (true)
- **AND** response status is 200

#### Scenario: Verify JWT error response format matches existing

- **WHEN** JWT verification fails
- **THEN** response status is 401
- **AND** response contains error message

### Requirement: Guest User Access

Unauthenticated users MUST be able to access public routes and use Socket.io as guests.

#### Scenario: Public routes work without authentication

- **WHEN** a request does not include JWT token to a public route
- **THEN** the route handler executes normally
- **AND** `request.user` is undefined
- **AND** no authentication error is thrown

### Requirement: JWT Secret Configuration

JWT secret MUST be configured via same mechanism as existing implementation.

#### Scenario: JWT secret is configured

- **WHEN** server starts
- **THEN** JWT secret is loaded from config
- **AND** middleware uses configured secret for verification
- **AND** token generation uses configured secret for signing

### Requirement: Token Payload Structure

JWT token payload MUST preserve existing structure for compatibility.

#### Scenario: Token payload contains expected properties

- **WHEN** JWT token is decoded
- **THEN** payload contains `user` object
- **AND** `user._id` contains user email
- **AND** `user.nickname` contains user nickname
- **AND** no additional payload properties are added

### Requirement: Error Handling for Auth Routes

Authentication route errors MUST preserve existing error handling patterns.

#### Scenario: Login failure response format matches existing

- **WHEN** login fails (wrong credentials)
- **THEN** response status is 401
- **AND** response contains error message describing the failure
- **AND** error message matches existing format

#### Scenario: Register validation error response format matches existing

- **WHEN** registration fails validation (existing nickname/email)
- **THEN** response status is 400
- **AND** response contains error message describing the validation failure
- **AND** error message matches existing format

### Requirement: User Deletion Authentication

User deletion endpoint MUST require valid JWT authentication.

#### Scenario: Delete user requires authentication

- **WHEN** DELETE request to `/api/auth/user`
- **THEN** JWT middleware validates token
- **AND** user email is extracted from token payload
- **AND** deletion uses authenticated user's email
- **AND** response is 204 on success

### Requirement: Notification Update Authentication

Notification preference update endpoint MUST require valid JWT authentication.

#### Scenario: Update notifications requires authentication

- **WHEN** PUT request to `/api/auth/user/notifications`
- **THEN** JWT middleware validates token
- **AND** user email is extracted from token payload
- **AND** update uses authenticated user's email
- **AND** response contains updated `subscribed` status

## Related Capabilities

- fastify-http: HTTP server using Fastify framework
- fastify-redis: Redis integration for user storage
- fastify-socketio: JWT authentication for Socket.io connections
