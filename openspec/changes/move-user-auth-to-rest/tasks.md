# Implementation Tasks

## Phase 1: Create User Management Service

- [ ] Create `AuthService.ts` in `packages/server/src/` with user auth logic from `UserManager`
  - Implement `register(nickname, email, password, notif)` method
  - Implement `login(nickname, password)` method
  - Implement `verifyEmail(token)` method
  - Implement `deleteUser(email)` method
  - Implement `updateNotifications(email, subscribed)` method
  - Implement `generateVerificationToken()` static method
  - Implement `createJWT(nickname, email)` static method
  - Include all validation logic (nickname length, email format, password constraints)
  - Handle email sending failure with rollback logic

- [ ] Add `AuthService.ts` to TypeScript compilation
  - Ensure proper imports (RedisConnection, Mailer, jwt, EmailValidator)
  - Verify no TypeScript errors

## Phase 2: Create REST API Routes

- [ ] Create `authRoutes.ts` in `packages/server/src/` with Express router
  - Create Express router instance
  - Implement JWT authentication middleware for protected routes
  - Implement `POST /api/auth/register` endpoint
  - Implement `POST /api/auth/login` endpoint
  - Implement `POST /api/auth/verify` endpoint
  - Implement `GET /api/auth/verify-jwt` endpoint (optional)
  - Implement `DELETE /api/user` endpoint
  - Implement `PUT /api/user/notifications` endpoint
  - Add proper error handling with HTTP status codes (400, 401, 409, 500)
  - Add input validation middleware

- [ ] Integrate auth routes into server
  - Import and mount router in `packages/server/src/index.ts`
  - Mount at `/api/auth` prefix
  - Ensure body parser middleware is configured for JSON

- [ ] Add rate limiting to auth endpoints
  - Install or configure rate limiting middleware
  - Apply to login and register endpoints
  - Return 429 status with Retry-After header

## Phase 3: Update Socket.IO Auth Middleware

- [ ] Fix TypeScript types in `SocketIOManager.ts` middleware
  - Add proper type guard for JWT decoded object
  - Ensure `decoded.user` is accessed only when `decoded` is object with `user` property
  - Fix TypeScript errors related to `socket.data.user` assignment

- [ ] Remove unused imports from `SocketIOManager.ts`
  - Remove unused `Express` import
  - Remove unused `ExtendedError` import

## Phase 4: Remove UserManager Socket.IO Handler

- [ ] Remove `UserManager.ts` from `packages/server/src/socketio/`
  - Delete the file entirely

- [ ] Update `SocketIOManager.ts` handlers list
  - Remove `UserManager` from handlers array
  - Keep only `StreamInfoDispatcher` and `ChatManager`

- [ ] Remove unused `passportAuthenticate()` method from `SocketIOManager` (if it exists)
  - Search for any references to Passport methods in SocketIOManager
  - Remove any found

## Phase 5: Update Common Package Types

- [ ] Remove user-related events from `ClientEvents` in `packages/common/src/events.ts`
  - Remove `user:delete`
  - Remove `user:login`
  - Remove `user:register`
  - Remove `user:update-notif`
  - Remove `user:verify`
  - Remove `user:verify-jwt`

- [ ] Remove user-related events from `ServerEvents` in `packages/common/src/events.ts`
  - Remove `user:delete-success`
  - Remove `user:login-fail`
  - Remove `user:login-success`
  - Remove `user:register-fail`
  - Remove `user:register-success`
  - Remove `user:update-notif-success`
  - Remove `user:verify-jwt-fail`
  - Remove `user:verify-jwt-success`

- [ ] Verify `user:kick` event remains in `ServerEvents`
  - Ensure it's still defined for runtime auth failures

- [ ] Run `pnpm build` in common package
  - Verify no TypeScript errors in common package

## Phase 6: Remove Passport Dependencies and Code

- [ ] Delete `passport.ts` from `packages/server/src/`

- [ ] Remove `AbstractHandler.auth()` method
  - Delete the entire method from `AbstractHandler.ts`

- [ ] Remove unused imports from `AbstractHandler.ts`
  - Remove unused `Config` field and import

- [ ] Remove `passport` package from dependencies
  - Check `packages/server/package.json`
  - Remove if present (may already be removed)

- [ ] Search for any remaining Passport references
  - Run `rg "passport" packages/server/src --type ts`
  - Remove any found references

## Phase 7: Final Validation

- [ ] Run TypeScript type checking
  - Execute `pnpm ts:check` in server package
  - Resolve any TypeScript errors

- [ ] Run linting
  - Execute `pnpm lint` in server package
  - Resolve any lint errors

- [ ] Run formatting check
  - Execute `pnpm format --check`
  - Resolve any formatting issues

- [ ] Build all packages
  - Execute `pnpm build` in root
  - Ensure successful build
