# Chat Messaging Specification

## Purpose

This specification defines the requirements for chat message handling, including REST API pagination and live message delivery. The system provides paginated access to historical chat messages while preserving real-time message delivery via Socket.io.

## ADDED Requirements

### Requirement: Chat Message Data Model

The system MUST store chat messages with the following structure.

#### Scenario: Message has required properties

- **WHEN** a chat message is created
- **THEN** it contains `uuid` (unique identifier, UUID v4)
- **AND** it contains `timestamp` (Unix timestamp in milliseconds)
- **AND** it contains `senderNickname` (string, display name of sender)
- **AND** it contains `message` (string, the message content)

### Requirement: Chat Message Storage

The system MUST store chat messages in Redis sorted set for efficient time-based retrieval.

#### Scenario: Messages are stored with timestamp score

- **WHEN** a new chat message is created
- **THEN** the message is stored in Redis sorted set
- **AND** the message timestamp is used as the score for ordering
- **AND** the message UUID is used as the member
- **AND** message data is stored as JSON: `[uuid, senderNickname, message]`

#### Scenario: Messages are retrieved in timestamp order

- **WHEN** messages are queried by timestamp
- **THEN** messages are returned sorted by timestamp (newest first)
- **AND** pagination queries use cursor-based approach with timestamps

### Requirement: Chat Message Pagination

The system MUST support paginated retrieval of chat messages.

#### Scenario: Default pagination returns 50 messages

- **WHEN** client requests messages without explicit limit
- **THEN** the server returns at most 50 messages
- **AND** messages are sorted newest first (descending timestamp)

#### Scenario: Pagination cursor uses timestamp

- **WHEN** client requests older messages with `before` parameter
- **THEN** the server returns messages with timestamps less than the `before` value
- **AND** messages are ordered newest to oldest within the page

#### Scenario: Pagination indicates more results

- **WHEN** client requests messages
- **THEN** the response includes `pagination.hasMore` indicating if more messages exist
- **AND** the response includes `pagination.earliestTimestamp` for the last message in the set

### Requirement: Live Chat Message Delivery

The system MUST deliver new chat messages to all connected clients in real-time.

#### Scenario: New messages are broadcast to all clients

- **WHEN** a client sends a chat message
- **THEN** the message is broadcast to all connected clients via `chat:message` socket event
- **AND** all clients receive the message in real-time
- **AND** the message includes all required properties: `uuid`, `timestamp`, `senderNickname`, `message`

### Requirement: Chat Message Limits

The system MUST enforce message content limits.

#### Scenario: Message content is limited to 512 characters

- **WHEN** a client sends a message longer than 512 characters
- **THEN** the server rejects the message
- **AND** the server responds with an error indicating the message is too long

#### Scenario: Empty messages are rejected

- **WHEN** a client sends an empty or whitespace-only message
- **THEN** the server does not create or broadcast the message
- **AND** no error is returned to the client (silently ignored)

### Requirement: Chat Message Authentication

The system MUST handle authentication for sending messages.

#### Scenario: Unauthenticated users can send messages

- **WHEN** a guest user (not logged in) sends a chat message
- **THEN** the message is accepted and broadcast
- **AND** the message uses the sender's nickname (guest identifier)

#### Scenario: Authenticated users send messages with their nickname

- **WHEN** an authenticated user sends a chat message
- **THEN** the message is accepted and broadcast
- **AND** the message uses the user's registered nickname

#### Scenario: Unauthenticated users cannot send messages when kicked

- **WHEN** an unauthenticated user has been kicked from chat
- **THEN** subsequent message attempts are rejected
- **AND** the user receives a `user:kick` event with reason
