# Change: Add Password Forgotten Feature

## Why

Users who forget their password currently have no way to recover their account. This feature provides a secure, token-based password reset flow that allows users to regain access to their accounts without admin intervention.

## What Changes

- **Backend API**: Add two new endpoints for password reset flow
  - `POST /api/auth/forgot-password`: Accepts email, looks up user, sends reset email with token
  - `POST /api/auth/reset-password`: Accepts token and new password, updates password if token valid
- **Frontend**: Add "Forgot password?" link on login panel, show password reset form with email field
- **Redis**: Add password reset token storage with 30-minute expiry
- **Email**: Send password reset email with link containing reset token

## Impact

- **Affected specs**: `rest-auth-api`, `frontend-rest-auth-client`
- **Affected code**:
  - `packages/server/src/plugins/api/AuthService.ts`: Password reset logic
  - `packages/server/src/plugins/api/apiRoutes.ts`: New endpoints
  - `packages/server/src/plugins/redis/RedisConnection.ts`: Token storage methods
  - `packages/frontend/src/contexts/UserContext.tsx`: Password reset API calls
  - `packages/common/src/apiSchemas.ts`: Request/response schemas
  - Frontend login UI: New forgot password link and form

## Key Design Decisions

- **Token format**: Reuse existing 10-character token generation (alphanumeric)
- **Token expiry**: 30 minutes as specified (vs 1 hour for email verification)
- **Security**: Same generic response whether email exists or not to prevent account enumeration
- **Token storage**: Separate key prefix `pwdreset:` to distinguish from verification tokens
