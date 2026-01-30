## ADDED Requirements

### Requirement: Chat Messages REST Endpoint

The server MUST provide a REST API endpoint for fetching paginated chat messages.

#### Scenario: Client requests latest messages

- **WHEN** client sends `GET /api/chat/messages` with no `before` parameter
- **THEN** the server returns the 50 most recent messages sorted newest first
- **AND** response includes pagination object with `hasMore` and `earliestTimestamp`

#### Scenario: Client requests older messages

- **WHEN** client sends `GET /api/chat/messages?before=<timestamp>&limit=50`
- **THEN** the server returns up to 50 messages with timestamps less than `before`
- **AND** messages are sorted newest to oldest
- **AND** response includes pagination object with `hasMore` and `earliestTimestamp`

#### Scenario: No more messages to fetch

- **WHEN** client requests messages but no older messages exist
- **THEN** the server returns an empty messages array
- **AND** `hasMore` is `false`
- **AND** `earliestTimestamp` is `null`

### Requirement: Chat Messages Query Validation

The server MUST validate query parameters for the chat messages endpoint.

#### Scenario: Invalid limit parameter

- **WHEN** client sends `GET /api/chat/messages?limit=101`
- **THEN** the server responds with 400 status
- **AND** response contains validation error for `limit` parameter

#### Scenario: Invalid before parameter

- **WHEN** client sends `GET /api/chat/messages?before=invalid`
- **THEN** the server responds with 400 status
- **AND** response contains validation error for `before` parameter

### Requirement: Chat Messages Response Schema

The server MUST return messages in a standardized format with pagination metadata.

#### Scenario: Response structure is correct

- **WHEN** client requests chat messages
- **THEN** response body matches schema:
  ```
  {
    messages: ChatMessage[],
    pagination: {
      hasMore: boolean,
      earliestTimestamp: number | null
    }
  }
  ```
- **AND** `ChatMessage` includes: `uuid`, `timestamp`, `senderNickname`, `message`
