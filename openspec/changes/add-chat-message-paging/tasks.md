## 1. Backend Implementation

- [ ] 1.1 Add Redis pagination methods to RedisConnection (`getMessagesByPage`, `getMessagesBefore`)
- [ ] 1.2 Create chat messages route handler with Zod validation
- [ ] 1.3 Add REST endpoint registration in Fastify routes
- [ ] 1.4 Update event types in common package (remove `chat:push-messages` from ServerEvents)
- [ ] 1.5 Remove `chat:push-messages` emission from ChatManager

## 2. Frontend Implementation

- [ ] 2.1 Update ChatMessage type and event types (remove `chat:push-messages`)
- [ ] 2.2 Modify ChatContext to fetch initial messages via REST API instead of socket event
- [ ] 2.3 Add pagination state (hasMore, earliestTimestamp) to ChatContext
- [ ] 2.4 Implement `loadOlderMessages` function with REST API call
- [ ] 2.5 Add infinite scroll detection to MessagePane component
- [ ] 2.6 Remove `chat:push-messages` socket event handler from ChatContext

## 3. Validation

- [ ] 3.1 Write integration test for chat messages pagination endpoint
- [ ] 3.2 Write unit tests for Redis pagination methods
- [ ] 3.3 Test frontend message loading and infinite scroll behavior
- [ ] 3.4 Verify live message delivery still works via `chat:message` event

## 4. Code Quality

- [ ] 4.1 Run `pnpm lint` and fix any issues
- [ ] 4.2 Run `pnpm ts:check` and resolve type errors
- [ ] 4.3 Run `pnpm format` to ensure consistent formatting
