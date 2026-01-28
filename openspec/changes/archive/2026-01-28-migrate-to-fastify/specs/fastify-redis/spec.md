# fastify-redis Specification

## Purpose

Define requirements for Redis integration using Fastify plugin pattern, preserving existing Redis operations while providing decorator-based access.

## ADDED Requirements

### Requirement: Redis Plugin Registration

Redis MUST be integrated via Fastify plugin using decorator pattern for access.

#### Scenario: Redis is available via decorator

- **WHEN** Fastify instance starts
- **THEN** Redis plugin is registered with Redis connection
- **AND** `fastify.redis` decorator provides access to Redis client
- **AND** Redis connection uses configured Redis URL

### Requirement: Redis Connection Configuration

Redis connection MUST be configured using existing Redis URL from config.

#### Scenario: Redis connects to configured URL

- **WHEN** Redis plugin is registered
- **THEN** Redis URL from config is used for connection
- **AND** connection is established before server starts
- **AND** connection error is thrown if Redis is unavailable

### Requirement: Redis Connection Lifecycle

Redis connection MUST be closed during Fastify shutdown.

#### Scenario: Redis connection closes on shutdown

- **WHEN** Fastify instance closes
- **THEN** Redis connection is closed gracefully
- **AND** `fastify.redis.quit()` is called
- **AND** process waits for connection to close

### Requirement: Redis Adapter Pattern

Redis operations MUST preserve existing `RedisConnection` class interface via adapter.

#### Scenario: Adapter wraps existing RedisConnection

- **WHEN** Redis plugin is registered
- **THEN** existing `RedisConnection` instance is wrapped
- **AND** all Redis operations go through the adapter
- **AND** adapter exposes methods matching RedisConnection interface

### Requirement: User Storage Operations

User storage operations MUST work identically to existing implementation.

#### Scenario: Add user to Redis

- **WHEN** `addUser()` is called with email, nickname, password, and token
- **THEN** user data is stored in Redis
- **AND** email is used as user identifier
- **AND** password is hashed before storage
- **AND** token is stored for email verification

#### Scenario: Delete user from Redis

- **WHEN** `deleteUser()` is called with email
- **THEN** user data is removed from Redis
- **AND** associated subscription is removed
- **AND** all user-related keys are deleted

#### Scenario: Email exists check

- **WHEN** `emailExists()` is called with email
- **THEN** Redis returns boolean indicating if email exists
- **AND** `true` if email is registered, `false` otherwise

#### Scenario: Nickname exists check

- **WHEN** `nicknameExists()` is called with nickname
- **THEN** Redis returns boolean indicating if nickname exists
- **AND** `true` if nickname is registered, `false` otherwise

#### Scenario: Get email by nickname

- **WHEN** `getEmail()` is called with nickname
- **THEN** Redis returns associated email address
- **AND** returns null if nickname not found

### Requirement: Password Verification

Password verification MUST work identically to existing implementation.

#### Scenario: Verify password for login

- **WHEN** `verifyPassword()` is called with email and password
- **THEN** Redis retrieves hashed password for email
- **AND** password hash is compared using bcrypt
- **AND** returns `true` if password matches, `false` otherwise

### Requirement: Token Operations

Token operations MUST work identically to existing implementation.

#### Scenario: Verify user with token

- **WHEN** `verifyUser()` is called with verification token
- **THEN** Redis looks up token
- **AND** if token valid and not expired, user is marked verified
- **AND** token is deleted after verification
- **AND** returns `true` on success, `false` otherwise

#### Scenario: Delete token

- **WHEN** `deleteToken()` is called with token
- **THEN** token is removed from Redis
- **AND** token becomes invalid

### Requirement: Subscription Operations

Subscription operations MUST work identically to existing implementation.

#### Scenario: Subscribe user to notifications

- **WHEN** `subscribe()` is called with email
- **THEN** email is added to notification subscribers set
- **AND** user will receive stream offline notifications

#### Scenario: Unsubscribe user from notifications

- **WHEN** `unsubscribe()` is called with email
- **THEN** email is removed from notification subscribers set
- **AND** user will not receive stream offline notifications

#### Scenario: Check subscription status

- **WHEN** `isSubscribed()` is called with email
- **THEN** Redis returns boolean indicating subscription status
- **AND** returns `true` if subscribed, `false` otherwise

### Requirement: Redis Access for Auth Routes

Auth routes MUST access Redis via Fastify decorator, not separate connection.

#### Scenario: Auth routes access Redis via decorator

- **WHEN** auth route handler needs Redis operations
- **THEN** handler accesses `fastify.redis` decorator
- **AND** no separate Redis instance is passed to AuthService
- **AND** AuthService receives Redis from Fastify context

### Requirement: Redis Access for Socket.io Handlers

Socket.io handlers MUST access Redis via Fastify decorator for shared state.

#### Scenario: Socket.io handlers access Redis via decorator

- **WHEN** Socket.io handler needs Redis operations
- **THEN** handler accesses `fastify.redis` decorator
- **AND** no separate Redis instance is passed to handlers
- **AND** same Redis instance shared with HTTP routes

### Requirement: Chat History Storage

Chat history MUST be stored in Redis identically to existing implementation.

#### Scenario: Chat messages stored in Redis

- **WHEN** chat message is sent
- **THEN** message is stored in Redis chat history
- **AND** message includes timestamp, nickname, and content
- **AND** messages are stored in list structure

#### Scenario: Chat history retrieved from Redis

- **WHEN** chat history is requested
- **THEN** Redis returns recent messages
- **AND** messages are returned in chronological order
- **AND** message count is limited (e.g., last 50 messages)

### Requirement: Session Management

Session management MUST work identically to existing implementation.

#### Scenario: User session is tracked in Redis

- **WHEN** user connects via Socket.io
- **THEN** session data is stored in Redis
- **AND** session includes user info and connection metadata
- **AND** session is removed on disconnect

### Requirement: Redis Error Handling

Redis errors MUST be handled consistently across HTTP and Socket.io.

#### Scenario: Redis connection error is caught

- **WHEN** Redis connection fails
- **THEN** error is caught and logged
- **AND** server fails to start if Redis unavailable
- **AND** descriptive error message is shown

#### Scenario: Redis operation error is caught

- **WHEN** Redis operation fails during request
- **THEN** error is caught by route handler
- **AND** appropriate error response is sent
- **AND** error is logged for debugging

### Requirement: Redis Type Safety

Redis operations MUST preserve existing type definitions.

#### Scenario: RedisConnection methods have proper types

- **WHEN** Redis methods are called
- **THEN** TypeScript validates parameter types
- **AND** return types match existing interfaces
- **AND** no type assertions are required

### Requirement: Redis Connection Pooling

Redis connection MUST be single shared instance across HTTP and Socket.io.

#### Scenario: Single Redis connection shared

- **WHEN** server starts
- **THEN** only one Redis connection is established
- **AND** all HTTP routes use same connection
- **AND** all Socket.io handlers use same connection
- **AND** connection is reused for all operations

### Requirement: Redis Namespace Support (Optional)

Redis MUST support namespace option if multiple Redis instances needed.

#### Scenario: Redis namespace is configured

- **WHEN** Redis plugin is registered with namespace option
- **THEN** Redis instance is accessible via `fastify.redis.{namespace}`
- **AND** separate Redis connections are established per namespace
- **AND** this allows future multi-Redis setup if needed

### Requirement: Redis Stream Support

Redis MUST support Redis streams for future enhancements.

#### Scenario: Redis streams are accessible

- **WHEN** Redis connection is established
- **THEN** Redis streams API is available via decorator
- **AND** stream operations (xadd, xread) can be used
- **AND** this enables future event streaming features

## Related Capabilities

- fastify-http: HTTP server using Fastify framework
- fastify-authentication: JWT authentication using Redis for user storage
- fastify-socketio: Socket.io integration using Redis for shared state
