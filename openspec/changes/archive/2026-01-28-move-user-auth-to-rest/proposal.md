# Move User Authentication to REST API

## Summary

Move all user authentication and registration functionality from Socket.IO event handlers to a REST API, keeping Socket.IO strictly for broadcasting (stream info) and chat.

## Motivation

### Current Problems

1. **Performance bottleneck:** User authentication via Socket.IO requires running JWT verification on every protected event, adding unnecessary latency
2. **Code complexity:** Wrapping every handler with try/catch blocks around `this.auth(socket)` creates code bloat
3. **Type safety issues:** Passport integration with Socket.IO requires mocking Express Request objects (`socket.request.user`), creating TypeScript friction
4. **Poor error handling:** Socket.IO lacks standard HTTP status codes (400/401/500), requiring custom error protocols (`user:login-fail`)
5. **Security limitations:** Rate limiting and WAF protections work better with standard HTTP POST requests than WebSocket frames

### Benefits

1. **Stateless authentication:** Login/register are inherently stateless operations better suited for REST
2. **Better security:** Standard HTTP authentication middleware, rate limiting, and WAF protection
3. **Clear separation of concerns:** Socket.IO for real-time events, REST for transactional operations
4. **Type safety:** Remove Passport mocking and use standard Express Request/Response types
5. **Performance:** Single JWT verification at handshake, then synchronous checks on events

## Scope

### In Scope

- Create REST API endpoints for all user operations currently handled by `UserManager`
  - Login (`POST /api/auth/login`)
  - Register (`POST /api/auth/register`)
  - Verify email (`POST /api/auth/verify`)
  - Delete account (`DELETE /api/user`)
  - Update notifications (`PUT /api/user/notifications`)
  - Verify JWT (GET /api/auth/verify-jwt) - optional, client can verify locally
- Remove `UserManager` Socket.IO handler class
- Remove all user-related Socket.IO events from `ClientEvents` and `ServerEvents`
- Remove unused `AbstractHandler.auth()` method and Passport dependencies
- Keep `user:kick` server event for runtime auth failures in chat

### Out of Scope

- Frontend changes (handled in separate change proposal)
- Chat message history pagination (already noted as TODO in `ChatManager`)
- Stream info handler changes (unrelated to user auth)
- Redis data structure changes (user keys remain same)

## Dependencies

- None blocking

## Trade-offs

### Guest Access Pattern

We keep the mixed access model (authenticated chat + public stream info) by:

- Allowing Socket.IO connection without token (guest mode)
- Using middleware to verify token and attach to `socket.data.user` if present
- Checking `socket.data.user` synchronously in event handlers

This avoids blocking guest users from seeing stream info while requiring auth for chat.

### JWT Expiration Handling

We use Option 1 (Simple): If JWT expires during a long-lived connection, the user remains authenticated until they reconnect. This is acceptable because:

- User was valid when they entered
- Reconnect triggers fresh verification
- Avoids complex token refresh logic during active sessions

## Related Changes

- Frontend changes to consume REST API endpoints (separate proposal)
