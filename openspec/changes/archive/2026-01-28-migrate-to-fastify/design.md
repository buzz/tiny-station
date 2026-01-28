# Design: Fastify Migration Architecture

## Overview

This design document explains the architectural decisions for migrating from Express to Fastify, including integration patterns for Redis, Socket.io, and authentication.

## Core Architecture

### Fastify Instance Pattern

The migration follows Fastify's plugin-based architecture:

```typescript
const fastify = Fastify({
  logger: false, // Preserve existing debuglog pattern
})

// Register plugins
fastify.register(redisPlugin)
fastify.register(socketIOPlugin)
fastify.register(streamInfoPlugin)

// Register routes
fastify.register(authRoutes, { prefix: '/api/auth' })
```

### Type Provider Configuration

Fastify with `fastify-type-provider-zod` requires compiler configuration:

```typescript
import { serializerCompiler, validatorCompiler } from 'fastify-type-provider-zod'

fastify.setValidatorCompiler(validatorCompiler)
fastify.setSerializerCompiler(serializerCompiler)
```

This enables Zod schema validation and serialization for all routes.

## Redis Integration Design

### Current Architecture

The existing `RedisConnection` class encapsulates:

- Connection management
- User operations (add, delete, verify)
- Session operations (subscribe, unsubscribe)
- Password verification
- Token operations

### Adapter Pattern (Chosen Approach)

We create a Fastify plugin that wraps the existing `RedisConnection`:

```typescript
// fastify-redis-plugin.ts
import { FastifyPluginAsync } from 'fastify'
import RedisConnection from './redis.js'

const redisPlugin: FastifyPluginAsync = async (fastify, options) => {
  const redis = new RedisConnection(options.redisUrl)
  fastify.decorate('redis', redis)

  fastify.addHook('onClose', async () => {
    await redis.quit()
  })
}
```

**Rationale**:

- Minimal refactoring risk
- Preserves existing business logic
- Allows gradual migration to native `@fastify/redis` later
- Maintains type safety with decorator pattern

### Alternative: Native @fastify/redis

```typescript
// Alternative (not chosen for initial migration)
fastify.register(require('@fastify/redis'), {
  url: process.env.REDIS_URL,
})
```

**Trade-offs**:

- ✅ Simpler plugin registration
- ✅ Better integration with Fastify lifecycle
- ✅ Built-in connection error handling
- ❌ Requires refactoring all Redis operations
- ❌ Higher initial risk
- ❌ Breaking changes to existing code

**Decision**: Start with adapter pattern, evaluate native migration after Phase 5.

## Socket.io Integration Design

### Current Architecture

`SocketIOManager` creates a Socket.io Server instance and:

- Implements JWT authentication middleware
- Manages handler initialization (ChatManager, StreamInfoDispatcher)
- Provides access to config, Redis, and StreamInfoHandler

### Fastify Integration Pattern

Using `fastify-socket.io` plugin:

```typescript
fastify.register(require('fastify-socket.io'))

// Access Socket.io via decorator
const io = fastify.io
```

### Authentication Middleware Migration

Current Express/Socket.io pattern:

```typescript
// Current (SocketIOManager.ts:46-67)
this.io.use((socket, next) => {
  const token = socket.handshake.auth.token as unknown
  // JWT verification logic
})
```

Migrated to Fastify pattern:

```typescript
// Migrated
fastify.addHook('preHandler', (socket, next) => {
  const token = socket.handshake.auth.token
  // Same JWT verification logic
  next()
})
```

### Handler Initialization

Current pattern:

```typescript
// Current (SocketIOManager.ts:37)
this.handlers = [StreamInfoDispatcher, ChatManager].map((Handler) => new Handler(this))

this.io.on('connection', (socket) => {
  for (const handler of this.handlers) {
    await handler.handleClientConnect(socket)
  }
})
```

Migrated pattern (preserved):

```typescript
// Migrated
const handlers = [StreamInfoDispatcher, ChatManager].map((Handler) => new Handler(fastify))

fastify.io.on('connection', (socket) => {
  for (const handler of handlers) {
    await handler.handleClientConnect(socket)
  }
})
```

**Rationale**: Preserves existing handler architecture, minimal refactoring.

## Authentication Routes Design

### JWT Middleware Pattern

Express pattern:

```typescript
// Current (authRoutes.ts:32-55)
function createJwtMiddleware(jwtSecret: string) {
  return (req: Request, res: Response, next: NextFunction) => {
    const authHeader = req.headers.authorization
    // JWT verification logic
    if (valid) {
      ;(req as Request & { user: UserData }).user = user
      next()
    }
  }
}
```

Fastify pattern:

```typescript
// Migrated
fastify.addHook('preHandler', async (request, reply) => {
  const authHeader = request.headers.authorization
  // JWT verification logic
  if (valid) {
    request.user = user // Type-safe via request interface augmentation
  }
})
```

### Request/Response Types

Express uses `any` for request body:

```typescript
// Current (authRoutes.ts:64)
const { nickname, email, password, passwordConfirm, notif } = req.body as RegisterData
```

Fastify infers types from schema:

```typescript
// Migrated
const { nickname, email, password, passwordConfirm, notif } = request.body
// Types automatically inferred from RegisterSchema!
```

**Schema-based type inference** eliminates manual casting.

## StreamInfoHandler Design

### Current Architecture

`StreamInfoHandler` extends `EventEmitter` and:

- Uses Express router for Icecast webhooks
- Polls Icecast server for stream info
- Emits updates to listeners

### Fastify Plugin Pattern

```typescript
// fastify-stream-info.ts
import { FastifyPluginAsync } from 'fastify'

const streamInfoPlugin: FastifyPluginAsync = async (fastify, options) => {
  const handler = new StreamInfoHandler(options.icecastUrl)

  fastify.post('/ic/source-connect', async (request, reply) => {
    handler.triggerConnect()
    return reply.send()
  })

  fastify.post('/ic/source-disconnect', async (request, reply) => {
    handler.triggerDisconnect()
    return reply.send()
  })

  fastify.decorate('streamInfoHandler', handler)
}
```

**Rationale**:

- Preserves EventEmitter pattern
- Maintains polling logic
- Routes registered as Fastify routes
- Handler accessible via decorator

## Error Handling Design

### Current Architecture

Express error middleware:

```typescript
// Current (errorHandlers.ts)
app.use(errorHandlers)
```

### Fastify Error Handler

```typescript
// Migrated
import { hasZodFastifySchemaValidationErrors } from 'fastify-type-provider-zod'

fastify.setErrorHandler((error, request, reply) => {
  if (hasZodFastifySchemaValidationErrors(error)) {
    return reply.status(400).send({
      error: 'Validation error',
      issues: error.validation,
    })
  }

  // Preserve existing error handling logic
  const message = error.message || 'Internal server error'
  reply.status(error.statusCode || 500).send({ error: message })
})
```

**Rationale**:

- Preserves existing error format
- Adds Zod-specific error handling
- Type-safe error detection

## Route Migration Pattern

### Schema-Driven Design

Each route defines:

1. Request schema (body, query, params)
2. Response schema by status code
3. Handler with inferred types

Example:

```typescript
fastify.withTypeProvider<ZodTypeProvider>().route({
  method: 'POST',
  url: '/api/auth/register',
  schema: {
    body: RegisterSchema,  // From common package
    response: {
      201: z.object({ message: z.string() }),
      400: z.object({ error: z.string() })
    }
  },
  handler: async (request, reply) => {
    // request.body is automatically typed as RegisterData
    const result = await authService.register(...)
    reply.status(201).send(result)
  }
})
```

### Benefits

1. **Type Safety**: Handler receives typed request body
2. **Validation**: Automatic validation via AJV
3. **Documentation**: Self-documenting via schemas
4. **OpenAPI Ready**: Can integrate with `@fastify/swagger` later

## Type Safety Strategy

### Request Type Augmentation

For JWT-attached user data:

```typescript
declare module 'fastify' {
  interface FastifyRequest {
    user?: UserData
  }
}
```

### Response Serialization

Fastify serializes responses based on schema:

```typescript
response: {
  200: z.object({
    token: z.string(),
    nickname: z.string(),
    subscribed: z.boolean()
  })
}
```

Invalid responses throw serialization errors (caught by error handler).

## Migration Order Rationale

### Phase 1: Core Framework (Low Risk)

- Establishes Fastify foundation
- Validates Redis/Socket.io integration
- No production code changes yet

### Phase 2: Auth Routes (Medium Risk)

- Critical authentication paths
- Highest type safety benefit
- Can test independently

### Phase 3: StreamInfoHandler (Low Risk)

- Webhook routes, not user-facing
- Independent from authentication
- Can test with Icecast simulator

### Phase 4: Socket.io (Medium Risk)

- Real-time features
- Depends on Phase 1 completion
- Can test with chat simulator

### Phase 5: Cleanup (Low Risk)

- Removes legacy code
- Validation phase
- No new functionality

## Performance Considerations

### Schema Compilation

Fastify compiles schemas at startup time, not runtime:

- ✅ Faster validation (pre-compiled)
- ✅ Faster serialization (fast-json-stringify)
- ✅ Lower memory footprint (shared compiled schema)

### Middleware Overhead

Fastify uses fewer middleware layers:

- Express: `express.json()` → `errorHandlers` → `validateRequestBody` → route
- Fastify: Route with schema → handler

**Expected improvement**: 10-20% faster request/response cycle for auth endpoints.

### Async Optimization

Fastify is designed for async/await:

```typescript
// Current Express pattern
router.post('/register', validateRequestBody(RegisterSchema), async (req, res, next) => {
  try {
    await authService.register(...)
    res.status(201).json(...)
  } catch (error) {
    next(error)  // Error handling via next()
  }
})

// Fastify pattern
fastify.route({
  schema: { body: RegisterSchema },
  handler: async (request, reply) => {
    await authService.register(...)
    reply.status(201).send(...)
  }
  // Errors thrown automatically, caught by setErrorHandler
})
```

**Simpler**: No manual error passing via `next()`.

## Security Considerations

### JWT Verification

Preserve existing JWT verification logic:

```typescript
const decoded = jwt.verify(token, jwtSecret)
if (decoded && 'user' in decoded) {
  request.user = decoded.user
}
```

**No security regression**: Same verification algorithm.

### Input Validation

Zod schemas provide same validation:

```typescript
// Same RegisterSchema used in Express and Fastify
const RegisterSchema = z.object({
  nickname: trimmedString(3, 16),
  email: z.email(),
  password: z.string().min(8),
  // ...
})
```

**No validation regression**: Same Zod schemas.

## Future Enhancements

After migration complete, consider:

1. **Native Redis**: Refactor RedisConnection to use native `@fastify/redis`
2. **Rate Limiting**: Add `@fastify/rate-limit` for abuse prevention

## Conclusion

The migration architecture preserves existing business logic while gaining:

- Type safety for request/response bodies
- Better performance via schema compilation
- Simpler error handling
- Native async/await support

The phased approach minimizes risk and allows incremental validation.
