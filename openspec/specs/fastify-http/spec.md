# fastify-http Specification

## Purpose
TBD - created by archiving change migrate-to-fastify. Update Purpose after archive.
## Requirements
### Requirement: Fastify HTTP Server Instance

The server MUST use Fastify as the HTTP server framework instead of Express.

#### Scenario: Server starts successfully with Fastify instance

- **WHEN** the server starts via `pnpm dev` or `pnpm start`
- **THEN** a Fastify instance is created and listening on the configured port
- **AND** the server logs "Listening on port {PORT}" using debuglog pattern
- **AND** no Express instance is created

### Requirement: Fastify Type Provider Configuration

The Fastify instance MUST configure `fastify-type-provider-zod` for schema-based validation and type inference.

#### Scenario: Validator and serializer compilers are configured

- **WHEN** the Fastify instance is created
- **THEN** `validatorCompiler` from `fastify-type-provider-zod` is set
- **AND** `serializerCompiler` from `fastify-type-provider-zod` is set
- **AND** all routes can use Zod schemas for validation and serialization

### Requirement: Schema-Based Request Validation

Request bodies MUST be validated using Zod schemas defined in route schemas, eliminating manual validation middleware.

#### Scenario: Invalid request body is rejected with 400 status

- **WHEN** a request body does not match the route's Zod schema
- **THEN** Fastify rejects the request with 400 status
- **AND** response contains validation error details
- **AND** no manual validation middleware is used

### Requirement: Typed Request Body Inference

Request handler functions MUST receive request bodies with types inferred from Zod schemas, not `any`.

#### Scenario: Request body is properly typed in handler

- **WHEN** a route handler accesses `request.body`
- **THEN** the body type matches the Zod schema defined for that route
- **AND** TypeScript compiler validates body property access
- **AND** no manual type casting is required

### Requirement: Schema-Based Response Serialization

Response bodies MUST be serialized using Fastify's serializer based on response schemas.

#### Scenario: Response matches declared schema

- **WHEN** a route handler sends a response
- **THEN** the response is validated against the route's response schema
- **AND** serialization error is thrown if response doesn't match schema
- **AND** error is caught by Fastify error handler

### Requirement: Global Error Handler

A global error handler MUST be configured to handle validation errors and preserve existing error handling patterns.

#### Scenario: Validation errors are formatted correctly

- **WHEN** a route handler throws a validation error
- **THEN** the error is caught by the global error handler
- **AND** response status is 400 for validation errors
- **AND** response contains error details matching existing format

#### Scenario: Application errors are handled consistently

- **WHEN** a route handler throws an application error (not validation)
- **THEN** the error is caught by the global error handler
- **AND** response status matches error.statusCode or defaults to 500
- **AND** response contains error message

### Requirement: Route Registration Pattern

Routes MUST be registered using Fastify's `route()` method or `register()` for route groups.

#### Scenario: Auth routes are registered with prefix

- **WHEN** auth routes are registered
- **THEN** all auth routes use `/api/auth` prefix
- **AND** routes are registered using Fastify's route registration API
- **AND** no Express router is used

#### Scenario: Stream info routes are registered with prefix

- **WHEN** stream info routes are registered
- **THEN** stream info routes use `/ic` prefix
- **AND** routes are registered using Fastify's route registration API
- **AND** no Express router is used

### Requirement: Graceful Shutdown

The server MUST implement graceful shutdown matching existing behavior.

#### Scenario: Server closes resources on SIGTERM

- **WHEN** server receives SIGTERM signal
- **THEN** mail notifier is cleared
- **AND** HTTP server closes
- **AND** Redis connection is closed
- **AND** Socket.io connections are disconnected
- **AND** process exits with code 0

### Requirement: HTTP Server Creation

The HTTP server MUST be created from the Fastify instance, not separately.

#### Scenario: HTTP server is created from Fastify

- **WHEN** the server is started
- **THEN** Fastify's underlying HTTP server is used
- **AND** Socket.io is attached to the Fastify server
- **AND** no separate `http.createServer()` call is made

### Requirement: Debug Logging Pattern

Debug logging MUST preserve the existing debuglog pattern from Node.js util module.

#### Scenario: Debug messages use debuglog pattern

- **WHEN** server logs debug messages
- **THEN** `debuglog('listen-app')` or `debuglog('listen-app:component')` is used
- **AND** no separate logging library is added
- **AND** log output format matches existing pattern

### Requirement: Middleware-Free Route Handlers

Route handlers MUST NOT use manual middleware chains; all logic must be in the handler function.

#### Scenario: Route handler has no middleware chain

- **WHEN** a route is defined
- **THEN** all request processing logic is in the handler function
- **AND** validation is handled by schema, not middleware
- **AND** no `next()` calls are made for error propagation

### Requirement: No Express Dependencies

The server package MUST NOT depend on Express or related packages after migration.

#### Scenario: Package.json has no Express dependencies

- **WHEN** `packages/server/package.json` is examined
- **THEN** `express` is not in dependencies
- **AND** `@types/express` is not in devDependencies
- **AND** `passport` is removed if no longer used

### Requirement: Request Type Augmentation

Request types MUST be augmented to support custom properties like `user` for JWT authentication.

#### Scenario: User data is type-safe on request

- **WHEN** JWT middleware attaches user data to request
- **THEN** `request.user` is properly typed as `UserData`
- **AND** TypeScript compiler validates user property access
- **AND** no type assertions are required

### Requirement: Response Status Handling

Responses MUST use Fastify's `reply.status()` method, not Express `res.status()`.

#### Scenario: Response status is set correctly

- **WHEN** a route handler sends a response with status code
- **THEN** `reply.status(code)` is used to set status
- **AND** `reply.send()` is used to send response body
- **AND** no Express `res.status().json()` pattern is used

### Requirement: JSON Response Serialization

JSON responses MUST use Fastify's optimized serializer, not Express `res.json()`.

#### Scenario: JSON response is efficiently serialized

- **WHEN** a route handler sends a JSON response
- **THEN** response is serialized by Fastify's `serializerCompiler`
- **AND** serialization uses fast-json-stringify optimization
- **AND** no manual `JSON.stringify()` is required

### Requirement: Route Schema Documentation

Route schemas MUST document expected input and output formats.

#### Scenario: Route schema defines request and response

- **WHEN** a route is defined
- **THEN** schema includes request schema (body/query/params)
- **AND** schema includes response schema by status code
- **AND** schema properties have descriptive names
- **AND** schema serves as inline documentation

