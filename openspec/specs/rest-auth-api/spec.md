# rest-auth-api Specification

## Purpose
TBD - created by archiving change move-user-auth-to-rest. Update Purpose after archive.
## Requirements
### Requirement: User Registration Endpoint

The server MUST provide a `POST /api/auth/register` endpoint that creates a new user account and sends a confirmation email.

#### Scenario: Successful user registration

**GIVEN** a client sends `POST /api/auth/register` with valid nickname, email, password, passwordConfirm, and notif fields

**WHEN** all validation passes (nickname length ≤ 16, email valid, passwords match and ≥ 6 chars, nickname/email not taken)

**THEN** the server responds with HTTP 201 and a message indicating the user should check their inbox

**AND** the user is stored in Redis with a verification token

**AND** a confirmation email is sent containing the verification token link

#### Scenario: Invalid registration data

**GIVEN** a client sends `POST /api/auth/register` with invalid data (too short nickname, invalid email, mismatched passwords, etc.)

**WHEN** validation fails

**THEN** the server responds with HTTP 400 and a JSON body containing an error message describing the validation failure

#### Scenario: Duplicate email or nickname

**GIVEN** a client sends `POST /api/auth/register` with an email or nickname already in use

**WHEN** Redis check finds existing user

**THEN** the server responds with HTTP 409 and a message indicating the email or nickname is not available

### Requirement: User Login Endpoint

The server MUST provide a `POST /api/auth/login` endpoint that validates credentials and returns a JWT token.

#### Scenario: Successful login

**GIVEN** a client sends `POST /api/auth/login` with valid nickname and password

**WHEN** the password matches the stored hash

**THEN** the server responds with HTTP 200 and a JSON body containing the JWT token, nickname, and subscription status

#### Scenario: Invalid credentials

**GIVEN** a client sends `POST /api/auth/login` with invalid nickname or password

**WHEN** password verification fails or nickname not found

**THEN** the server responds with HTTP 401 and a message indicating wrong nickname or password

### Requirement: Email Verification Endpoint

The server MUST provide a `POST /api/auth/verify` endpoint that confirms a user's email using a verification token.

#### Scenario: Successful email verification

**GIVEN** a client sends `POST /api/auth/verify` with a valid verification token

**WHEN** the token exists and is not expired

**THEN** the server responds with HTTP 200

**AND** the user's verified flag is set in Redis

**AND** the verification token is deleted

#### Scenario: Invalid verification token

**GIVEN** a client sends `POST /api/auth/verify` with an invalid or expired token

**WHEN** Redis does not find a matching token

**THEN** the server responds with HTTP 400 and a message indicating verification failed

### Requirement: JWT Verification Endpoint

The server MUST provide a `GET /api/auth/verify-jwt` endpoint that validates a JWT token and returns user info.

#### Scenario: Valid JWT token

**GIVEN** a client sends `GET /api/auth/verify-jwt` with a valid JWT in the Authorization header

**WHEN** JWT verification succeeds

**THEN** the server responds with HTTP 200 and a JSON body containing the user's nickname and subscription status

#### Scenario: Invalid JWT token

**GIVEN** a client sends `GET /api/auth/verify-jwt` with an invalid or expired JWT

**WHEN** JWT verification fails

**THEN** the server responds with HTTP 401

### Requirement: User Deletion Endpoint

The server MUST provide a `DELETE /api/user` endpoint that deletes the authenticated user's account.

#### Scenario: Successful account deletion

**GIVEN** an authenticated client sends `DELETE /api/user` with a valid JWT in the Authorization header

**WHEN** JWT verification succeeds and user is found

**THEN** the server responds with HTTP 204

**AND** the user is deleted from Redis

**AND** the user is unsubscribed from notifications

#### Scenario: Unauthorized account deletion

**GIVEN** a client sends `DELETE /api/user` without a valid JWT

**WHEN** JWT verification fails

**THEN** the server responds with HTTP 401

### Requirement: Notification Preference Endpoint

The server MUST provide a `PUT /api/user/notifications` endpoint that updates the authenticated user's notification subscription preference.

#### Scenario: Successful notification update

**GIVEN** an authenticated client sends `PUT /api/user/notifications` with a valid JWT and JSON body `{ "subscribed": true }`

**WHEN** JWT verification succeeds and user is found

**THEN** the server responds with HTTP 200 and a JSON body containing the new subscription status

**AND** the user's subscription preference is updated in Redis

#### Scenario: Unauthorized notification update

**GIVEN** a client sends `PUT /api/user/notifications` without a valid JWT

**WHEN** JWT verification fails

**THEN** the server responds with HTTP 401

### Requirement: Standard HTTP Error Responses

All REST auth endpoints MUST use standard HTTP status codes and JSON error responses.

#### Scenario: Bad request error

**WHEN** validation fails on a request body

**THEN** the server responds with HTTP 400 and a JSON body `{ "error": "message" }`

#### Scenario: Unauthorized error

**WHEN** JWT is missing, invalid, or expired on a protected endpoint

**THEN** the server responds with HTTP 401

#### Scenario: Conflict error

**WHEN** a resource already exists (duplicate email/nickname)

**THEN** the server responds with HTTP 409

#### Scenario: Server error

**WHEN** an unexpected server error occurs

**THEN** the server responds with HTTP 500

### Requirement: JWT Authentication Middleware

Protected REST endpoints MUST use Express middleware to verify JWT tokens from the Authorization header.

#### Scenario: Valid JWT in Authorization header

**GIVEN** a client sends a request to a protected endpoint with `Authorization: Bearer <jwt>`

**WHEN** the middleware verifies the JWT

**THEN** the request proceeds with `req.user` populated with decoded user data

#### Scenario: Invalid JWT in Authorization header

**GIVEN** a client sends a request to a protected endpoint with an invalid JWT

**WHEN** the middleware verification fails

**THEN** the request is rejected with HTTP 401

#### Scenario: Missing JWT in Authorization header

**GIVEN** a client sends a request to a protected endpoint without an Authorization header

**WHEN** the middleware detects missing JWT

**THEN** the request is rejected with HTTP 401

### Requirement: Input Validation

All REST auth endpoints MUST validate input data and reject invalid requests with appropriate error messages.

#### Scenario: Registration validation

**WHEN** a registration request is received

**THEN** the server validates: nickname is 1-16 characters, email is valid format, password ≥ 6 characters, passwords match, nickname/email not taken

#### Scenario: Login validation

**WHEN** a login request is received

**THEN** the server validates: nickname and password fields are present

#### Scenario: Notification update validation

**WHEN** a notification update request is received

**THEN** the server validates: subscribed field is a boolean

### Requirement: Rate Limiting

Auth endpoints MUST implement rate limiting to prevent brute force attacks.

#### Scenario: Too many login attempts

**GIVEN** a client sends too many login requests within the rate limit window

**WHEN** the rate limit is exceeded

**THEN** the server responds with HTTP 429

**AND** a Retry-After header indicates when to try again

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

