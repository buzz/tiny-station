## ADDED Requirements

### Requirement: Password Reset Request Endpoint

The server MUST provide a `POST /api/auth/forgot-password` endpoint that accepts an email address and sends a password reset email if the email exists.

#### Scenario: Successful password reset request

**GIVEN** a client sends `POST /api/auth/forgot-password` with a valid email that exists in the system

**WHEN** the email is found and the user is verified

**THEN** the server responds with HTTP 200 and a message indicating a reset link has been sent

**AND** a password reset token is stored in Redis with 30-minute expiry

**AND** a password reset email is sent containing the reset token link

#### Scenario: Email not found

**GIVEN** a client sends `POST /api/auth/forgot-password` with an email that does not exist in the system

**WHEN** no user is found for the email

**THEN** the server responds with HTTP 200 and the same success message

**AND** no email is sent

**AND** no token is generated

#### Scenario: Unverified email

**GIVEN** a client sends `POST /api/auth/forgot-password` with an email that exists but is not verified

**WHEN** the user is not verified

**THEN** the server responds with HTTP 200 and the same success message

**AND** no email is sent

**AND** no token is generated

### Requirement: Password Reset Confirmation Endpoint

The server MUST provide a `POST /api/auth/reset-password` endpoint that accepts a reset token and new password, updating the password if valid.

#### Scenario: Successful password reset

**GIVEN** a client sends `POST /api/auth/reset-password` with a valid, non-expired reset token and matching passwords

**WHEN** the token exists and is not expired

**THEN** the server responds with HTTP 200 and a success message

**AND** the user's password is updated with the new hash

**AND** the reset token is deleted

#### Scenario: Invalid or expired reset token

**GIVEN** a client sends `POST /api/auth/reset-password` with an invalid, expired, or non-existent token

**WHEN** the token is not found or is expired

**THEN** the server responds with HTTP 400 and an error message indicating the token is invalid or expired

#### Scenario: Password mismatch

**GIVEN** a client sends `POST /api/auth/reset-password` with a valid token but passwords that do not match

**WHEN** password validation fails

**THEN** the server responds with HTTP 400 and an error message indicating passwords do not match

### Requirement: Password Reset Rate Limiting

The forgot password endpoint MUST implement rate limiting to prevent abuse.

#### Scenario: Too many password reset requests

**GIVEN** a client sends too many password reset requests within the rate limit window

**WHEN** the rate limit is exceeded

**THEN** the server responds with HTTP 429

**AND** a Retry-After header indicates when to try again
