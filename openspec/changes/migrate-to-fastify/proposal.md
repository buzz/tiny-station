# Proposal: Migrate from Express to Fastify

## Summary

Replace the Express-based HTTP server with Fastify to improve type safety, performance, and maintainability. This migration eliminates the need for manual request body validation and provides native support for Zod schemas through `fastify-type-provider-zod`. The migration includes integrating Fastify with existing Redis, Socket.io, and authentication infrastructure using the plugins: `@fastify/redis`, `fastify-socket.io`, and `fastify-type-provider-zod`.

## Motivation

### Problems with Current Express Setup

1. **Untyped Request Bodies**: Express uses `any` type for `req.body`, requiring manual casting and validation middleware
2. **Manual Validation Layer**: `validationMiddleware.ts` uses Zod manually, duplicating work that Fastify can do natively
3. **Limited Async Support**: While Express v5 improved async support, it's still a wrapper around callback-based middleware
4. **Manual Error Handling**: Custom error handling needed for validation errors (line 12 in `validationMiddleware.ts`)

### Benefits of Fastify Migration

1. **Type-Safe Request Bodies**: Fastify with `fastify-type-provider-zod` infers request types from Zod schemas automatically
2. **Validation Support**: zod-based validation
3. **Better TypeScript Support**: Type providers and schema-based type inference
4. **Simplified Error Handling**: Built-in validation error handling with Zod integration

## Scope

### In-Scope Changes

1. **Replace Express with Fastify** in `packages/server/src/index.ts`
2. **Migrate Auth Routes** from Express router to Fastify routes with typed schemas
3. **Replace Redis Integration** from custom `RedisConnection` to `@fastify/redis` plugin
4. **Integrate Socket.io** using `fastify-socket.io` plugin
5. **Remove `validationMiddleware.ts`** (replaced by Fastify's native validation)
6. **Migrate StreamInfoHandler** router to Fastify routes
7. **Update JWT authentication** to Fastify middleware pattern
8. **Update error handlers** to Fastify's error handler pattern

### Out-of-Scope Changes

1. Frontend client changes (no API contract changes)
2. Socket.io protocol changes (same events, same data structures)
3. Database schema changes (Redis operations remain the same)
4. Email notification changes (MailNotifier stays as-is)
5. Icecast integration changes (StreamInfoHandler logic stays the same)

## Dependencies

### External Dependencies

- `fastify` - HTTP server framework
- `@fastify/redis` - Redis connection plugin
- `fastify-socket.io` - Socket.io integration plugin
- `fastify-type-provider-zod` - Zod schema validation plugin

### Internal Dependencies

- Existing Zod schemas in `packages/common/src/schemas.ts`
- Existing `AuthService.ts` (no changes needed)
- Existing Redis operations in `redis.ts` (may need adapter pattern)

## Design Considerations

### Redis Integration Strategy

The current `RedisConnection` class encapsulates Redis operations. Two options:

**Option A (Recommended)**: Create a thin adapter around existing `RedisConnection` that exposes it as a Fastify plugin. This preserves existing business logic and minimizes refactoring risk.

**Option B**: Replace `RedisConnection` entirely with `@fastify/redis` native client. This requires more refactoring but simplifies code.

### Socket.io Integration

`fastify-socket.io` adds an `io` decorator to the Fastify instance. This simplifies the `SocketIOManager` since we can access `fastify.io` directly. The JWT authentication logic in SocketIOManager (lines 46-67) will need to migrate to Fastify's Socket.io middleware pattern.

### Route Migration Pattern

Express routes will be migrated to Fastify routes following this pattern:

**Before (Express)**:

```typescript
router.post('/register', validateRequestBody(RegisterSchema), async (req, res) => {
  const { nickname, email, password, passwordConfirm, notif } = req.body as RegisterData
  // handler logic
})
```

**After (Fastify)**:

```typescript
fastify.withTypeProvider<ZodTypeProvider>().route({
  method: 'POST',
  url: '/api/auth/register',
  schema: {
    body: RegisterSchema,
    response: {
      201: z.object({ message: z.string() }),
      400: z.object({ error: z.string() }),
    },
  },
  handler: async (req, reply) => {
    const { nickname, email, password, passwordConfirm, notif } = req.body
    // handler logic - types inferred from schema!
  },
})
```

### Error Handling Migration

Express uses custom error middleware (`errorHandlers.ts`). Fastify has a built-in error handler that can be customized. We'll need to:

1. Set up a global error handler for validation errors
2. Preserve custom error handling logic from existing code
3. Use `hasZodFastifySchemaValidationErrors` from `fastify-type-provider-zod` for validation-specific errors

### StreamInfoHandler Integration

The current `StreamInfoHandler` uses an Express router. It will be migrated to a Fastify plugin that registers routes at `/ic/*`. The polling logic and Icecast integration remain unchanged.

## Risks and Mitigations

### Risk 1: Type Safety Regression During Migration

**Mitigation**: Use Fastify's type provider feature to ensure all routes are type-checked at compile time. Run `pnpm ts:check` after each route migration.

### Risk 2: Socket.io Authentication Breakage

**Mitigation**: Test Socket.io authentication thoroughly after migration. The JWT middleware in SocketIOManager must be preserved. Create a test suite for authentication flows.

### Risk 3: Redis Connection Issues

**Mitigation**: Use the adapter pattern (Option A) to wrap existing `RedisConnection`. This ensures Redis operations continue working while we validate the `@fastify/redis` integration.

### Risk 4: Performance Regression

**Mitigation**: Fastify should improve performance, but we'll measure before/after with load testing for the key endpoints (register, login, verify).

## Migration Phases

### Phase 1: Core Framework Setup (Low Risk)

1. Install Fastify and core dependencies
2. Create basic Fastify app structure
3. Set up `fastify-type-provider-zod` compiler configuration
4. Add `@fastify/redis` plugin with adapter for existing RedisConnection
5. Add `fastify-socket.io` plugin

### Phase 2: Auth Routes Migration (Medium Risk)

1. Migrate `/api/auth/register` route with typed schema
2. Migrate `/api/auth/login` route with typed schema
3. Migrate `/api/auth/verify` route with typed schema
4. Migrate `/api/auth/verify-jwt` route with JWT middleware
5. Migrate `/api/auth/user` routes (DELETE, PUT) with JWT middleware
6. Remove `validationMiddleware.ts` (no longer needed)
7. Update error handler to Fastify pattern

### Phase 3: StreamInfoHandler Migration (Low Risk)

1. Create Fastify plugin for StreamInfoHandler
2. Migrate `/ic/source-connect` and `/ic/source-disconnect` routes
3. Preserve polling logic and Icecast integration
4. Remove Express router dependency

### Phase 4: Socket.io Integration (Medium Risk)

1. Update SocketIOManager to use Fastify's `io` decorator
2. Migrate JWT authentication to Fastify Socket.io middleware pattern
3. Test real-time features (chat, stream info)

### Phase 5: Cleanup and Validation (Low Risk)

1. Remove Express dependencies from package.json
2. Remove unused Express-related files
3. Update documentation and comments
4. Run full test suite
5. Performance testing

## Success Criteria

- [ ] All existing authentication flows work (register, login, verify, JWT verification)
- [ ] Socket.io real-time features work (chat, stream info broadcasting)
- [ ] Redis operations function correctly (user storage, session management)
- [ ] Icecast webhook routes work (`/ic/source-connect`, `/ic/source-disconnect`)
- [ ] TypeScript compilation passes (`pnpm ts:check`)
- [ ] No Express dependencies remain in `packages/server/package.json`
- [ ] Type safety maintained (all request bodies properly typed)
- [ ] Performance not degraded (load test shows same or better response times)

## Backwards Compatibility

**No breaking changes** to the API contract or Socket.io protocol. Frontend requires no changes.

## Open Questions

1. **Redis Connection Strategy**: Should we use Option A (adapter) or Option B (native)? Recommendation: Start with Option A for safety, evaluate Option B after migration is complete.

2. **Error Response Format**: Should we preserve the current error format or standardize with Fastify's error handling? Recommendation: Preserve current format to avoid frontend changes.

## Related Changes

- `add-zod-validation-for-auth` (completed) - Already added Zod schemas that we'll reuse
- `move-user-auth-to-rest` (completed) - Auth routes are already RESTful

## References

- Fastify docs: https://fastify.dev
- fastify-type-provider-zod: https://github.com/turkerdev/fastify-type-provider-zod
- @fastify/redis: https://github.com/fastify/fastify-redis
- fastify-socket.io: https://github.com/ducktors/fastify-socket.io
- Current Express implementation: `packages/server/src/index.ts`, `packages/server/src/authRoutes.ts`
