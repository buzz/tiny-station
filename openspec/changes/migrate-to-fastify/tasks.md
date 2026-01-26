# Tasks: Migrate from Express to Fastify

## Phase 1: Core Framework Setup

1. Install Fastify core dependencies
   - Add `fastify`, `@fastify/redis`, `fastify-socket.io`, `fastify-type-provider-zod` to server package
   - Add `@types/fastify` as dev dependency
   - Verify installation with `pnpm install`
   - Validation: `package.json` contains new dependencies

2. Create Fastify app skeleton in index.ts
   - Replace `express()` with `Fastify()`
   - Set up `fastify-type-provider-zod` compiler configuration
   - Configure basic logger (preserve debuglog pattern)
   - Validation: Server starts without errors on `pnpm dev`

3. Create Redis adapter plugin
   - Create `fastify-redis-plugin.ts` wrapping existing `RedisConnection`
   - Register plugin with Fastify instance
   - Expose Redis operations via `fastify.redis` decorator
   - Validation: Redis connection established and accessible via decorator

4. Create Socket.io adapter
   - Register `fastify-socket.io` plugin
   - Update `SocketIOManager` to use `fastify.io` decorator instead of creating Server
   - Validation: Socket.io server accessible via `fastify.io`

## Phase 2: Auth Routes Migration

5. Migrate `/api/auth/register` route
   - Create Fastify route with `ZodTypeProvider`
   - Define request schema using `RegisterSchema` from common package
   - Define response schema (201 success, 400 error)
   - Replace manual body casting with type inference
   - Preserve error handling logic
   - Validation: Register endpoint works with TypeScript compilation

6. Migrate `/api/auth/login` route
   - Create Fastify route with `ZodTypeProvider`
   - Define request schema using `LoginSchema`
   - Define response schema (200 success, 401 error)
   - Validation: Login endpoint works with TypeScript compilation

7. Migrate `/api/auth/verify` route
   - Create Fastify route with `ZodTypeProvider`
   - Define request schema using `VerifyEmailSchema`
   - Define response schema (200 success, 400 error)
   - Validation: Verify endpoint works with TypeScript compilation

8. Create Fastify JWT authentication middleware
   - Replace Express JWT middleware with Fastify middleware
   - Use `fastify.addHook('preHandler')` or route-specific `preValidation`
   - Attach user data to request with proper typing
   - Validation: JWT middleware validates tokens correctly

9. Migrate `/api/auth/verify-jwt` route
   - Create Fastify route with JWT middleware
   - Define response schema (200 success, 401 error)
   - Validation: JWT verification endpoint works

10. Migrate `/api/auth/user` DELETE route
    - Create Fastify route with JWT middleware
    - Define response schema (204 no content, 500 error)
    - Validation: Delete user endpoint works

11. Migrate `/api/auth/user/notifications` PUT route
    - Create Fastify route with JWT middleware
    - Define request schema using `UpdateNotificationsSchema`
    - Define response schema (200 success, 500 error)
    - Validation: Update notifications endpoint works

12. Remove validationMiddleware.ts
    - Delete `packages/server/src/validationMiddleware.ts`
    - Update imports in authRoutes.ts (if still using old Express router)
    - Validation: File deleted, no compilation errors

13. Update error handler to Fastify pattern
    - Create global Fastify error handler
    - Integrate `hasZodFastifySchemaValidationErrors` for validation errors
    - Preserve custom error handling logic from existing code
    - Validation: Errors are properly formatted and logged

14. Remove Express router from authRoutes.ts
    - Replace `express.Router()` with direct route registration
    - Export route registration function instead of router
    - Validation: Auth routes work without Express dependency

## Phase 3: StreamInfoHandler Migration

15. Create Fastify plugin for StreamInfoHandler
    - Create `fastify-stream-info.ts` plugin
    - Register routes at `/ic/source-connect` and `/ic/source-disconnect`
    - Preserve polling logic and Icecast integration
    - Validation: Icecast webhook routes work

16. Update StreamInfoHandler class
    - Remove Express router dependency
    - Use Fastify instance for route registration
    - Preserve EventEmitter pattern for stream updates
    - Validation: Stream info polling works

## Phase 4: Socket.io Integration

17. Update SocketIOManager JWT authentication
    - Migrate JWT middleware to Fastify Socket.io pattern
    - Use `fastify.io.use()` middleware
    - Preserve authentication logic (lines 46-67 in current implementation)
    - Validation: Socket.io authentication works (authenticated and guest users)

18. Update SocketIOManager handlers
    - Update handler initialization to use Fastify instance
    - Ensure handlers can access `fastify.redis`, `fastify.io`, etc.
    - Validation: ChatManager and StreamInfoDispatcher work correctly

## Phase 5: Cleanup and Validation

19. Remove Express dependencies
    - Remove `express` and `@types/express` from server package.json
    - Remove `passport` and related packages if no longer used
    - Run `pnpm install` to clean node_modules
    - Validation: No Express packages in package.json

20. Remove unused Express files
    - Remove `passport.ts` if no longer used
    - Check for any other Express-specific files
    - Validation: Only Fastify-specific files remain

21. Update TypeScript types
    - Remove Express type imports
    - Add Fastify type imports where needed
    - Update any remaining `any` types with proper typing
    - Validation: `pnpm ts:check` passes without errors

22. Update comments and documentation
    - Update comments referencing Express
    - Update any README or documentation files
    - Validation: No Express references remain in code comments

23. Run full linting and type checking
    - Run `pnpm lint` and fix any issues
    - Run `pnam ts:check` and fix any issues
    - Run `pnpm format` if needed
    - Validation: All checks pass

## Validation Criteria

Each task includes validation criteria. All tasks must be completed and validated before the migration is complete.

## Dependencies

- Tasks 1-4 must be completed before any Phase 2 task
- Tasks 5-14 must be completed in order
- Tasks 15-16 must be completed before task 17
- Tasks 17-19 must be completed in order
- Tasks 20-26 must be completed in order
- All Phase 1-4 tasks must be completed before any Phase 5 task
