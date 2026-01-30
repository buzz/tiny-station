# Change: Add Chat Message Paging

## Why

Currently, when a user connects to the chat, the server pushes ALL historical messages via the `chat:push-messages` socket event. This is inefficient and doesn't scale well as the message history grows. Users should be able to view messages in paginated chunks, loading older messages as they scroll up in the chat interface.

## What Changes

- **ADD** REST API endpoint for fetching historical chat messages with pagination (`/api/chat/messages`)
- **ADD** server-side pagination logic using Redis sorted set with `ZRANGEBYSCORE` and pagination cursor
- **MODIFY** frontend to load initial 50 messages via REST API instead of socket event
- **ADD** frontend infinite scroll implementation to load more messages when user scrolls up
- **REMOVE** `chat:push-messages` socket event (no longer needed for historical messages)
- **KEEP** `chat:message` socket event for live message delivery (unchanged)

## Impact

- Affected specs:
  - `fastify-http`: Add new REST endpoint for chat messages
  - `fastify-socketio`: Remove `chat:push-messages` event, keep `chat:message` event
  - `chat-messaging`: New spec for chat message handling requirements
- Affected code:
  - Server: New HTTP route handler, modified ChatManager, updated Redis operations
  - Frontend: ChatContext refactoring, MessagePane component with infinite scroll
  - Common: Updated event types (remove `chat:push-messages`)

## Open Questions

1. Should the pagination use cursor-based (timestamp) or offset-based pagination? (Cursor-based recommended for time-based data)
2. Should we limit message history retention in Redis? (e.g., keep last 1000 messages)
