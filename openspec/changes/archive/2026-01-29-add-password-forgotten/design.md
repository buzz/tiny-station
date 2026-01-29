## Context

The password forgotten feature requires adding a secure password reset flow. The system already has email verification tokens working, which provides a good template for the password reset tokens.

## Goals / Non-Goals

### Goals

- Provide users a way to reset forgotten passwords
- Use time-limited tokens (30 minutes) stored in Redis
- Send reset links via email using existing Nodemailer setup
- Prevent account enumeration attacks (don't reveal if email exists)

### Non-Goals

- Change existing authentication flow
- Add password complexity requirements beyond existing rules
- Add password history requirements
- Add admin password reset capability

## Decisions

### Token Storage Strategy

**Decision**: Use separate Redis key prefix `pwdreset:{token}` storing the email, with 30-minute TTL.

**Rationale**:

- Clear separation from email verification tokens (`token:{token}`)
- Simple key-value lookup is fast and memory-efficient
- Automatic cleanup via TTL prevents orphaned tokens

**Alternatives considered**:

- Store in same keyspace as verification tokens: Rejected - different expiry times and purposes
- Use database table: Overkill - Redis is already used and faster for this use case

### Email Response Behavior

**Decision**: Return generic success message regardless of whether the email exists in the system.

**Rationale**: Prevents account enumeration attacks where attackers could discover which emails are registered.

**Message**: "If an account with that email exists, a password reset link has been sent. Check your inbox."

### Password Reset Token Format

**Decision**: Reuse the existing 10-character alphanumeric token generation function.

**Rationale**:

- Already proven and working
- Consistent with email verification tokens
- Sufficient entropy for 30-minute window

### Link URL Format

**Decision**: Use `/reset-password?token={token}` format.

**Rationale**:

- Clear purpose in URL
- Easy to handle in frontend with existing verification token hook pattern
- Backend already has token parsing infrastructure

## Risks / Trade-offs

| Risk                          | Mitigation                                       |
| ----------------------------- | ------------------------------------------------ |
| User never receives email     | Generic message prevents knowing if email exists |
| Token leaks before expiry     | 30-minute window is short enough to reduce risk  |
| User clicks link after expiry | Clear error message, can request new link        |
| Email provider marks as spam  | Use consistent from address, verify DNS records  |

## Migration Plan

No migration needed - this is a new feature. Existing users can use the password reset flow if they forget their password.

## Open Questions

1. Should the reset link include the base URL dynamically or use a fixed path?
   - Current: Uses config.baseUrl similar to email verification
2. Should we show a "link sent" page or just a modal?
   - Current: Modal message similar to registration flow
