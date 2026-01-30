## Context

The current chat system pushes all historical messages to clients via a Socket.io event (`chat:push-messages`) upon connection. This approach:

- Sends potentially thousands of messages at once
- Creates performance issues for clients with large message histories
- Doesn't align with standard REST API patterns for historical data retrieval

Users expect a scrollable chat interface where older messages load on demand.

## Goals / Non-Goals

### Goals:

- Implement paginated message retrieval via REST API
- Load 50 messages at a time, ordered newest first
- Support infinite scroll in the frontend to load older messages
- Keep real-time message delivery via Socket.io unchanged

### Non-Goals:

- Modify the live message delivery mechanism (`chat:message` event)
- Add message search or filtering capabilities
- Implement message reactions or threading
- Change the underlying Redis storage format

## Decisions

### 1. REST API Endpoint Design

**Decision**: Create `/api/chat/messages` endpoint with cursor-based pagination

**Endpoint**:

```
GET /api/chat/messages?limit=50&before=<timestamp>
```

**Response**:

```json
{
  "messages": [...],
  "pagination": {
    "hasMore": true,
    "earliestTimestamp": 1234567890
  }
}
```

**Rationale**: Cursor-based pagination is ideal for time-sorted data:

- `before` parameter uses timestamp as cursor for efficient Redis queries
- Prevents skipping messages during concurrent updates
- Consistent performance regardless of total message count

### 2. Redis Query Strategy

**Decision**: Use `ZREVRANGEBYSCORE` with `MAX` and `(MIN` for exclusive upper bound

**Query**:

```javascript
redis.zrevrangebyscore(MESSAGES_KEY, maxTimestamp, '(minTimestamp', 'WITHSCORES', 'LIMIT', 0, limit)
```

**Rationale**:

- `ZREVRANGEBYSCORE` returns messages in descending timestamp order (newest first)
- Exclusive upper bound `(max` ensures we don't duplicate the cursor message
- `LIMIT offset count` provides pagination built into Redis

### 3. Frontend Pagination Strategy

**Decision**: Maintain a scroll position tracker and fetch more messages when user scrolls within 200px of the top

**Implementation**:

- Initial load: Fetch latest 50 messages
- Scroll detection: When scroll position < 200px from top
- Fetch additional batch with `before` set to oldest loaded message timestamp
- Prepend messages to existing message list

**Rationale**: Standard infinite scroll pattern that provides smooth UX

### 4. Event Type Changes

**Decision**: Remove `chat:push-messages` from ServerEvents and ClientEvents

**Rationale**:

- No longer needed since historical messages are fetched via REST API
- Reduces socket event complexity
- `chat:message` remains unchanged for live message delivery

## Risks / Trade-offs

- **Risk**: Frontend must maintain message order correctly when prepending older messages
  - **Mitigation**: Use timestamp as key to ensure correct ordering, validate order on fetch

- **Risk**: Message gaps if new messages arrive while user is paging
  - **Mitigation**: `before` cursor ensures deterministic results, real-time messages still arrive via socket

- **Risk**: Redis query performance with large offset
  - **Mitigation**: Cursor-based pagination avoids OFFSET performance issues; `ZREVRANGEBYSCORE` is O(log(N)+M)

## Migration Plan

1. Deploy new REST endpoint (no changes to existing socket events)
2. Update frontend to use REST API for initial message load
3. Add scroll detection and pagination to MessagePane
4. Remove `chat:push-messages` socket event handling
5. Update event type definitions to remove the event

## Open Questions

- **Q1**: Should we limit message history retention in Redis?
  - **Recommendation**: Yes, implement `ZREMRANGEBYRANK` to keep last 10000 messages (configurable)
  - **Impact**: Reduces memory usage, maintains performance

- **Q2**: Should we add rate limiting to the pagination endpoint?
  - **Recommendation**: Yes, standard rate limiting applies as with other endpoints
