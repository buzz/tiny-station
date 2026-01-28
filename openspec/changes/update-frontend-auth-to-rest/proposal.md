# Change: Update frontend to use REST auth API

## Why

The backend recently migrated user authentication from Socket.io messages to REST API endpoints (`move-user-auth-to-rest` change). The frontend still uses Socket.io messages for user authentication operations (register, login, verify, delete, update notifications), which need to be updated to use the new REST endpoints. Only the `user:kick` Socket.io event should remain, as it's still needed for admin operations.

## What Changes

- Replace Socket.io message handlers in `UserContext.tsx` with REST API calls using `fetch`
- Remove Socket.io event handlers for: `user:verify-jwt`, `user:login-fail`, `user:login-success`, `user:register-fail`, `user:register-success`, `user:update-notif-success`, `user:verify-jwt-fail`, `user:delete-success`
- Keep Socket.io event handler for: `user:kick`
- Use types from `common` package (zod schema inferred types) for request bodies and responses
- Implement proper error handling for REST API responses
- Update login state management to work with async REST calls

## Impact

- Affected specs: `rest-auth-api` (frontend consumption), `fastify-http` (HTTP client usage)
- Affected code:
  - `packages/frontend/src/contexts/UserContext.tsx` (primary changes)
  - `packages/frontend/src/hooks/useSocketIO.ts` (may need updates for auth flow)
  - `packages/common/src/apiSchemas.ts` (types will be used from this file)
