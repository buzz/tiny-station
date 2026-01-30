# fastify-socketio Specification

## Purpose
TBD - created by archiving change migrate-to-fastify. Update Purpose after archive.
## Requirements
### Requirement: Socket.io Plugin Registration

Socket.io MUST be integrated via `fastify-socket.io` plugin, not manual Socket.io Server creation.

#### Scenario: Socket.io server is available via decorator

- **WHEN** Fastify instance starts
- **THEN** `fastify-socket.io` plugin is registered
- **AND** `fastify.io` decorator provides access to Socket.io server
- **AND** no manual `new Server()` call is made

### Requirement: Socket.io Server Configuration

Socket.io server MUST be configured to match existing behavior.

#### Scenario: Socket.io server does not serve client library

- **WHEN** Socket.io server is configured
- **THEN** `serveClient: false` is set
- **AND** client library is not served by the server
- **AND** client is served by frontend separately

#### Scenario: Socket.io attaches to Fastify server

- **WHEN** Fastify server starts listening
- **THEN** Socket.io attaches to the same HTTP server
- **AND** both HTTP and WebSocket traffic use same port
- **AND** no separate HTTP server is created for Socket.io

### Requirement: JWT Authentication for Socket.io

Socket.io connections MUST support JWT authentication for authenticated users, preserving existing logic.

#### Scenario: Valid JWT token authenticates Socket.io connection

- **WHEN** client connects with valid JWT token in handshake auth
- **THEN** token is verified using configured JWT secret
- **AND** decoded user data is attached to `socket.data.user`
- **AND** connection proceeds to handlers
- **AND** user contains `email` (as `id`), `nickname`, and `email` properties

#### Scenario: Missing token allows guest connection

- **WHEN** client connects without JWT token
- **THEN** connection proceeds as guest
- **AND** `socket.data.user` is undefined
- **AND** guest users can chat and receive stream updates

#### Scenario: Invalid JWT token allows guest connection

- **WHEN** client connects with invalid or expired JWT token
- **THEN** connection proceeds as guest
- **AND** `socket.data.user` is undefined
- **AND** guest users can chat and receive stream updates
- **AND** no error is thrown to prevent connection

### Requirement: Socket.io Middleware Pattern

JWT authentication for Socket.io MUST use Fastify/Socket.io middleware pattern.

#### Scenario: Authentication middleware processes handshake

- **WHEN** a client initiates Socket.io connection
- **THEN** authentication middleware processes the handshake
- **AND** middleware extracts token from `socket.handshake.auth.token`
- **AND** middleware verifies token before handlers execute
- **AND** middleware calls `next()` to proceed

### Requirement: Handler Initialization

Socket.io handlers MUST be initialized using existing pattern with Fastify instance access.

#### Scenario: Handlers are initialized with Fastify instance

- **WHEN** Socket.io server starts
- **THEN** `StreamInfoDispatcher` and `ChatManager` handlers are initialized
- **AND** handlers receive Fastify instance for dependency access
- **AND** handlers can access `fastify.redis`, `fastify.io`, etc.

### Requirement: Connection Event Handling

Socket.io MUST handle connection events using existing handler pattern.

#### Scenario: Connection triggers all handlers

- **WHEN** a client connects via Socket.io
- **THEN** connection event fires
- **AND** all registered handlers receive the socket
- **AND** handlers execute their `handleClientConnect()` methods
- **AND** handlers execute asynchronously

### Requirement: Chat Functionality

The chat functionality MUST work with paginated message loading while preserving live message delivery.

#### Scenario: Authenticated users can send chat messages

- **WHEN** authenticated user sends chat message
- **THEN** message is broadcast to all clients via `chat:message` event
- **AND** message includes user nickname and content
- **AND** message is stored in Redis chat history

#### Scenario: Guest users can send chat messages

- **WHEN** guest user sends chat message
- **THEN** message is broadcast to all clients via `chat:message` event
- **AND** message includes guest nickname and content
- **AND** message is stored in Redis chat history

#### Scenario: Live messages arrive via socket event

- **WHEN** a new chat message is created by any user
- **THEN** all connected clients receive the message via `chat:message` socket event
- **AND** messages arrive in real-time as they are sent

#### Scenario: Historical messages are loaded via REST API

- **WHEN** a client connects to the chat
- **THEN** the client fetches initial 50 messages from `GET /api/chat/messages`
- **AND** the client listens for `chat:message` events for live updates
- **AND** the client fetches older messages via REST API when scrolling up

### Requirement: Stream Info Updates

Stream info updates MUST work identically to existing implementation.

#### Scenario: Stream info is broadcast on update

- **WHEN** Icecast stream info changes
- **THEN** `StreamInfoHandler` emits update event
- **AND** `StreamInfoDispatcher` broadcasts to all connected clients
- **AND** all clients receive updated stream metadata

#### Scenario: Listener count is broadcast on change

- **WHEN** Icecast listener count changes
- **THEN** `StreamInfoHandler` emits listeners event
- **AND** `StreamInfoDispatcher` broadcasts to all connected clients
- **AND** all clients receive updated listener count

### Requirement: Socket.io Events Protocol

Socket.io events MUST preserve existing protocol to avoid frontend changes.

#### Scenario: Client events match existing format

- **WHEN** client emits events
- **THEN** event names match existing `ClientEvents` type
- **AND** event payloads match existing structures
- **AND** no new events are added without frontend updates

#### Scenario: Server events match existing format

- **WHEN** server emits events
- **THEN** event names match existing `ServerEvents` type
- **AND** event payloads match existing structures
- **AND** no new events are added without frontend updates

### Requirement: Socket.io Graceful Shutdown

Socket.io MUST disconnect all local sockets during server shutdown.

#### Scenario: Shutdown disconnects all sockets

- **WHEN** server receives shutdown signal (SIGTERM/SIGINT)
- **THEN** all local Socket.io connections are disconnected
- **AND** `fastify.io.local.disconnectSockets(true)` is called
- **AND** Socket.io server closes before process exit

### Requirement: Socket.io Type Safety

Socket.io types MUST preserve existing type definitions for client and server events.

#### Scenario: Socket.io server has proper type definition

- **WHEN** Socket.io server is defined
- **THEN** server type uses `ClientEvents` and `ServerEvents` generics
- **AND** socket data includes optional `user` property
- **AND** TypeScript validates event names and payloads

### Requirement: Redis Access for Socket.io Handlers

Socket.io handlers MUST access Redis via Fastify decorator, not separate connection.

#### Scenario: Handlers access Redis via Fastify

- **WHEN** Socket.io handler needs Redis operations
- **THEN** handler accesses `fastify.redis` decorator
- **AND** no separate Redis instance is passed to handlers
- **AND** Redis connection is shared across HTTP and Socket.io

### Requirement: Mailer Access for Socket.io Handlers

Socket.io handlers MUST access Mailer via Fastify instance, not separate injection.

#### Scenario: Handlers access Mailer via Fastify

- **WHEN** Socket.io handler needs Mailer operations
- **THEN** handler accesses mailer from Fastify instance context
- **AND** no separate Mailer instance is passed to handlers
- **AND** Mailer is shared across HTTP and Socket.io

### Requirement: StreamInfoHandler Access for Socket.io Handlers

Socket.io handlers MUST access StreamInfoHandler via Fastify decorator, not separate injection.

#### Scenario: Handlers access StreamInfoHandler via Fastify

- **WHEN** Socket.io handler needs StreamInfoHandler operations
- **THEN** handler accesses `fastify.streamInfoHandler` decorator
- **AND** no separate StreamInfoHandler instance is passed to handlers
- **AND** handler can subscribe to StreamInfoHandler events

### Requirement: Abstract Handler Pattern

Socket.io handlers MUST preserve existing AbstractHandler pattern and interface.

#### Scenario: Handlers extend AbstractHandler

- **WHEN** Socket.io handler class is defined
- **THEN** handler extends AbstractHandler base class
- **AND** handler implements `handleClientConnect()` method
- **AND** handler receives SocketIOManager (or Fastify instance) in constructor

### Requirement: User Data in Socket.io

User data in Socket.io MUST preserve existing structure for compatibility.

#### Scenario: Socket user data has expected properties

- **WHEN** JWT authentication attaches user data to socket
- **THEN** `socket.data.user.id` contains email
- **AND** `socket.data.user.nickname` contains nickname
- **AND** `socket.data.user.email` contains email
- **AND** TypeScript validates these properties

