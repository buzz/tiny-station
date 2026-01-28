# Socket.IO Auth Middleware

## ADDED Requirements

### Requirement: JWT Verification at Socket.IO Handshake

The Socket.IO middleware MUST verify JWT tokens at connection handshake and attach user data to socket.data for authenticated users.

#### Scenario: Valid JWT token provided

**GIVEN** a client connects with `auth: { token: <valid_jwt> }` in the handshake

**WHEN** the middleware verifies the JWT successfully

**THEN** the connection is allowed

**AND** `socket.data.user` is populated with the decoded user data (id, nickname, email)

#### Scenario: Invalid JWT token provided

**GIVEN** a client connects with `auth: { token: <invalid_jwt> }` in the handshake

**WHEN** the middleware verification fails (invalid signature, expired)

**THEN** the connection is still allowed (guest mode)

**AND** `socket.data.user` remains undefined

#### Scenario: No JWT token provided

**GIVEN** a client connects without sending a token in the handshake

**WHEN** the middleware detects missing token

**THEN** the connection is allowed (guest mode)

**AND** `socket.data.user` remains undefined

### Requirement: Socket Data Typing

The `socket.data.user` property MUST use proper TypeScript typing to ensure type-safe access in handlers.

#### Scenario: Type-safe user data access

**GIVEN** a handler accesses `socket.data.user`

**WHEN** the user is authenticated

**THEN** TypeScript knows `socket.data.user` is defined and contains UserData (id, nickname, email)

**AND** accessing properties like `socket.data.user.nickname` is type-safe

#### Scenario: Undefined user data

**GIVEN** a handler accesses `socket.data.user` for a guest connection

**THEN** TypeScript knows `socket.data.user` may be undefined

**AND** handlers must check for undefined before accessing properties

### Requirement: Guest Access for Public Features

Unauthenticated connections MUST be allowed to connect and access public features (stream info) while being blocked from protected features (chat).

#### Scenario: Guest connects to stream info

**GIVEN** a guest client (no JWT) connects to Socket.IO

**WHEN** the client subscribes to stream info events

**THEN** stream info events are delivered to the guest

#### Scenario: Guest attempts to send chat message

**GIVEN** a guest client (socket.data.user undefined) emits `chat:message`

**WHEN** the ChatManager handler checks `socket.data.user`

**THEN** the message is rejected

**AND** the client receives `user:kick` event with error message

### Requirement: JWT Expiration During Session

If a JWT expires during a long-lived Socket.IO connection, the user MUST remain authenticated until they reconnect.

#### Scenario: JWT expires during active connection

**GIVEN** an authenticated client with a JWT that expires during the session

**WHEN** the JWT expiration time passes while the connection remains active

**THEN** the client continues to send chat messages successfully

**AND** authentication is not rechecked until reconnection

#### Scenario: Client reconnects with expired JWT

**GIVEN** an authenticated client disconnects and reconnects with an expired JWT

**WHEN** the handshake middleware verifies the expired token

**THEN** the connection is allowed (guest mode)

**AND** `socket.data.user` is undefined

**AND** chat messages are rejected with `user:kick`

## REMOVED Requirements

### Requirement: Per-Event JWT Verification

Socket.IO event handlers MUST NOT perform JWT verification on each individual event.

**REASONING:** JWT verification at handshake is sufficient. Per-event verification adds unnecessary latency and CPU overhead.

### Requirement: Passport Integration

The Socket.IO handlers MUST NOT use Passport.js or Express Request mocking.

**REASONING:** Passport is designed for HTTP Request/Response cycles, not Socket.IO events. Using `jsonwebtoken` directly is simpler, faster, and type-safe.

### Requirement: Custom Auth Error Events

The server MUST NOT emit custom auth error events like `user:login-fail`, `user:register-fail`, etc.

**REASONING:** Auth errors are now communicated via REST API with standard HTTP status codes. Socket.IO only needs `user:kick` for runtime auth failures in chat.
