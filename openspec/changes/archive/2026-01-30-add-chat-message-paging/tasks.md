## 1. Backend Implementation

- [x] 1.1 Add Redis pagination methods to RedisConnection (`getMessagesByPage`, `getMessagesBefore`)
- [x] 1.2 Create chat messages route handler with Zod validation
- [x] 1.3 Add REST endpoint registration in Fastify routes
- [x] 1.4 Update event types in common package (remove `chat:push-messages` from ServerEvents)
- [x] 1.5 Remove `chat:push-messages` emission from ChatManager

## 2. Frontend Implementation

- [x] 2.1 Update ChatMessage type and event types (remove `chat:push-messages`)
- [x] 2.2 Modify ChatContext to fetch initial messages via REST API instead of socket event
- [x] 2.3 Add pagination state (hasMore, earliestTimestamp) to ChatContext
- [x] 2.4 Implement `loadOlderMessages` function with REST API call
- [x] 2.5 Add infinite scroll detection to MessagePane component
- [x] 2.6 Remove `chat:push-messages` socket event handler from ChatContext

## 5. Scroll UX Improvements (post-initial)

- [x] 5.1 Add scroll anchoring with useLayoutEffect to prevent jump when loading older messages
- [x] 5.2 Fix auto-scroll logic to only scroll when user is at bottom (isAtBottom ref)
- [x] 5.3 Memoize sortUUidsByTimestamp with useMemo for performance
- [x] 5.4 Scroll to bottom on initial load so user sees most recent messages

## 3. Validation

- [x] 3.1 Write integration test for chat messages pagination endpoint
- [x] 3.2 Write unit tests for Redis pagination methods
- [x] 3.3 Test frontend message loading and infinite scroll behavior
- [x] 3.4 Verify live message delivery still works via `chat:message` event

## 4. Code Quality

- [x] 4.1 Run `pnpm lint` and fix any issues
- [x] 4.2 Run `pnpm ts:check` and resolve type errors
- [x] 4.3 Run `pnpm format` to ensure consistent formatting
