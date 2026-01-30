## MODIFIED Requirements

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
