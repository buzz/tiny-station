# Architecture Design: Move User Auth to REST

## Overview

This change separates transactional user authentication operations from real-time Socket.IO communication, creating a cleaner architecture with REST APIs for auth and Socket.IO for broadcasting/chat.

## Current Architecture

```
Client ──┐
         ├─ Socket.IO ──► SocketIOManager ──► UserManager ──► Redis
         │                      │                    │
         │                      │                    └─ Mailer
         │                      └─► StreamInfoDispatcher
         └─ (no REST auth)
```

**Problems:**

- `UserManager` handles all auth via Socket.IO events (`user:login`, `user:register`, etc.)
- Every protected event calls `this.auth(socket)` which performs JWT verification
- Passport integration mocks Express Request object on `socket.request.user`
- No standard HTTP status codes for auth errors

## Proposed Architecture

```
Client ──┐
         ├─ Socket.IO ──► SocketIOManager ──► ChatManager ──► Redis
         │                      │                    │
         │                      └─► StreamInfoDispatcher
         │
         └─ REST API ──► Express Router ──► AuthService ──► Redis
                                        │
                                        └─ Mailer
```

**Benefits:**

- Auth operations via REST with proper HTTP status codes
- Socket.IO middleware verifies JWT once at handshake
- Event handlers check `socket.data.user` synchronously
- Clean separation of concerns

## Component Changes

### 1. Remove: `UserManager` class

**Current behavior:**

- Handles `user:verify-jwt`, `user:login`, `user:register`, `user:verify`, `user:delete`, `user:update-notif` events
- Uses `AbstractHandler.auth()` to verify JWT per-event
- Emits custom error events (`user:login-fail`, `user:register-fail`, etc.)

**Replacement:** REST endpoints (see below)

### 2. Add: REST API Router

**Endpoints:**

| Method | Path                      | Description              | Auth                    |
| ------ | ------------------------- | ------------------------ | ----------------------- |
| POST   | `/api/auth/register`      | Register new user        | None                    |
| POST   | `/api/auth/login`         | Login with credentials   | None                    |
| POST   | `/api/auth/verify`        | Verify email token       | None                    |
| DELETE | `/api/user`               | Delete account           | JWT required            |
| PUT    | `/api/user/notifications` | Update notification pref | JWT required            |
| GET    | `/api/auth/verify-jwt`    | Verify current JWT       | JWT required (optional) |

**Response formats:**

**Success:** Standard HTTP 2xx with JSON body

```json
{ "token": "jwt_token_here", "nickname": "user_name", "subscribed": true }
```

**Failure:** Standard HTTP 4xx with JSON body

```json
{ "error": "User-friendly error message" }
```

### 3. Update: `SocketIOManager` middleware

**Current behavior:** Already implements JWT verification at handshake

```typescript
this.io.use((socket, next) => {
  const token = socket.handshake.auth.token
  if (typeof token === 'string') {
    jwt.verify(token, this.config.jwtSecret, (err, decoded) => {
      if (err === null) {
        socket.data.user = decoded.user
      }
      next()
    })
  } else {
    next()
  }
})
```

**Changes:** None required (already implemented correctly)

**Type fix needed:**

```typescript
// Current: decoded is possibly undefined
// Fix: Add proper type guard
if (err === null && decoded && typeof decoded === 'object' && 'user' in decoded) {
  socket.data.user = (decoded as { user: UserData }).user
}
```

### 4. Remove: `AbstractHandler.auth()` and Passport

**Current behavior:**

```typescript
auth(socket: Socket): Promise<void> {
  return new Promise((resolve, reject) => {
    this.manager.passportAuthenticate(socket, (err) => {
      if (err) reject(err)
      else resolve()
    })
  })
}
```

**Replacement:** Direct synchronous check

```typescript
// In ChatManager
if (!socket.data.user) {
  socket.emit('user:kick', 'You must be logged in to chat.')
  return
}
```

**Remove:**

- `AbstractHandler.auth()` method
- `passport.ts` file
- `passportAuthenticate()` method from `SocketIOManager`
- All references to `socket.request.user`

### 5. Update: `ChatManager`

**Current behavior:** Already uses `socket.data.user` (no changes needed!)

```typescript
const { user } = socket.data
if (!user) {
  socket.emit('user:kick', 'You must be logged in to chat.')
  return
}
```

**Changes:** None required

### 6. Update: `ClientEvents` / `ServerEvents` types

**Remove from `ClientEvents`:**

- `user:delete`
- `user:login`
- `user:register`
- `user:update-notif`
- `user:verify`
- `user:verify-jwt`

**Remove from `ServerEvents`:**

- `user:delete-success`
- `user:login-fail`
- `user:login-success`
- `user:register-fail`
- `user:register-success`
- `user:update-notif-success`
- `user:verify-jwt-fail`
- `user:verify-jwt-success`

**Keep:**

- `user:kick` - for runtime auth failures in chat

### 7. Add: AuthService (new class)

**Purpose:** Encapsulate user auth logic (moved from `UserManager`)

**Methods:**

- `register(nickname, email, password, notif)` - register and send email
- `login(nickname, password)` - validate and return JWT
- `verifyEmail(token)` - verify user email
- `deleteUser(email)` - delete user account
- `updateNotifications(email, subscribed)` - update notification preference

**Dependencies:** `RedisConnection`, `Mailer`

**Validation logic:** Same as `UserManager` (nickname length, email format, password constraints)

### 8. Add: Express Routes (new file)

**Purpose:** Map HTTP endpoints to `AuthService` methods

**Middleware:**

- Body parser (JSON)
- JWT verification middleware for protected routes (`/api/user/*`, `/api/auth/verify-jwt`)

**Error handling:** Standard HTTP status codes

- 400: Bad request (invalid input)
- 401: Unauthorized (invalid/missing token)
- 404: Not found (user not found)
- 500: Server error

## Data Flow Examples

### Login Flow (New)

```
Client                          Server
│                               │
│ POST /api/auth/login          │
│    {nickname, password}       │
├──────────────────────────────►│
│                               │ AuthService.login()
│                               │    ├─ Redis.getEmail()
│                               │    ├─ Redis.verifyPassword()
│                               │    └─ createJWT()
│                               │
│◄──────────────────────────────┤ 200 OK
│  {token, nickname, sub}      │
│                               │
│ Socket.IO connect             │
│    auth: {token}              │
├──────────────────────────────►│
│                               │ Middleware verifies JWT
│                               │    └─ socket.data.user
│                               │
│◄──────────────────────────────┤ Connected
│                               │
│ chat:message                  │
├──────────────────────────────►│
│                               │ Check socket.data.user
│                               │ (synchronous, fast)
│                               │
│◄──────────────────────────────┤ chat:message
│                               │
```

### Delete Account Flow (New)

```
Client                          Server
│                               │
│ DELETE /api/user              │
│    Authorization: JWT         │
├──────────────────────────────►│
│                               │ JWT middleware verifies token
│                               │    └─ req.user = decoded.user
│                               │
│                               │ AuthService.deleteUser()
│                               │    ├─ Redis.deleteUser()
│                               │    └─ Redis.unsubscribe()
│                               │
│◄──────────────────────────────┤ 204 No Content
│                               │
```

## Implementation Sequence

1. Create `AuthService` class with user logic from `UserManager`
2. Create Express routes with JWT middleware
3. Update Socket.IO middleware type safety
4. Remove `UserManager` from `SocketIOManager.handlers`
5. Remove user events from `ClientEvents`/`ServerEvents`
6. Remove `AbstractHandler.auth()` and Passport code
7. Verify chat still works with `socket.data.user` check

## Backward Compatibility

Breaking change: Client must switch from Socket.IO events to REST API for auth.

No database/Redis schema changes: All user keys remain same (`user:{email}`, `nickname:{nickname}`, `token:{token}`).

## Security Considerations

1. **JWT verification at handshake:** Already implemented, unchanged
2. **JWT middleware on REST:** Standard Express JWT middleware for protected routes
3. **Rate limiting:** Add to auth endpoints (new capability)
4. **Input validation:** Same validation rules as `UserManager`, moved to `AuthService`
5. **Email verification:** Same token generation and validation logic
