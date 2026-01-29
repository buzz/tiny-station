# frontend-rest-auth-client Specification

## Purpose
TBD - created by archiving change update-frontend-auth-to-rest. Update Purpose after archive.
## Requirements
### Requirement: REST Auth Client Registration

The frontend MUST provide a registration function that sends a POST request to `/api/auth/register` with user credentials and handles the response appropriately.

#### Scenario: Successful registration

**GIVEN** a user submits valid registration data (nickname, email, password, passwordConfirm, notif preference)

**WHEN** the registration function is called

**THEN** a POST request is sent to `/api/auth/register` with the registration body

**AND** on HTTP 201 response, a success message modal is displayed

**AND** the login state is set to `loggedOut`

**AND** the user is informed to check their inbox for verification

#### Scenario: Registration validation error

**GIVEN** a user submits invalid registration data

**WHEN** the registration function is called

**THEN** a POST request is sent to `/api/auth/register`

**AND** on HTTP 400 response, the error message is displayed in a modal

**AND** the login state is set to `registerForm`

#### Scenario: Duplicate email or nickname

**GIVEN** a user submits registration data with an existing email or nickname

**WHEN** the registration function is called

**THEN** a POST request is sent to `/api/auth/register`

**AND** on HTTP 409 response, the error message is displayed in a modal

**AND** the login state is set to `registerForm`

### Requirement: REST Auth Client Login

The frontend MUST provide a login function that sends a POST request to `/api/auth/login` with user credentials and stores the JWT token on success.

#### Scenario: Successful login

**GIVEN** a user submits valid nickname and password

**WHEN** the login function is called

**THEN** a POST request is sent to `/api/auth/login` with the login body

**AND** on HTTP 200 response, the JWT token, nickname, and subscription status are extracted from the response

**AND** the JWT token is stored in a cookie

**AND** the nickname is stored in a cookie

**AND** the subscription preference is stored in state

**AND** the login state is set to `loggedIn`

#### Scenario: Invalid credentials

**GIVEN** a user submits invalid nickname or password

**WHEN** the login function is called

**THEN** a POST request is sent to `/api/auth/login`

**AND** on HTTP 401 response, an error message is displayed in a modal

**AND** the login state is set to `loggedOut`

### Requirement: REST Auth Client JWT Verification

The frontend MUST provide a function to verify a stored JWT token by calling `/api/auth/verify-jwt` on Socket.io connection.

#### Scenario: Valid JWT token

**GIVEN** a JWT token is stored in cookies

**WHEN** the Socket.io client connects

**THEN** a GET request is sent to `/api/auth/verify-jwt` with the JWT token in the Authorization header

**AND** on HTTP 200 response, the nickname and email are extracted from the response

**AND** the nickname is stored in state

**AND** the login state is set to `loggedIn`

#### Scenario: Invalid or expired JWT

**GIVEN** a JWT token is stored in cookies but is invalid or expired

**WHEN** the Socket.io client connects

**THEN** a GET request is sent to `/api/auth/verify-jwt` with the JWT token in the Authorization header

**AND** on HTTP 401 response, the JWT cookie is removed

**AND** the login state is set to `loggedOut`

### Requirement: REST Auth Client Account Deletion

The frontend MUST provide a function to delete the authenticated user's account by sending a DELETE request to `/api/user`.

#### Scenario: Successful account deletion

**GIVEN** an authenticated user (valid JWT in cookie)

**WHEN** the delete account function is called

**THEN** a DELETE request is sent to `/api/user` with the JWT in the Authorization header

**AND** on HTTP 204 response, the page is reloaded

**AND** the user is redirected to the app base URL

#### Scenario: Unauthorized account deletion

**GIVEN** no valid JWT in cookie

**WHEN** the delete account function is called

**THEN** a DELETE request is sent to `/api/user` without a valid JWT

**AND** on HTTP 401 response, the page is reloaded

### Requirement: REST Auth Client Notification Update

The frontend MUST provide a function to update notification preferences by sending a PUT request to `/api/user/notifications`.

#### Scenario: Successful notification update

**GIVEN** an authenticated user (valid JWT in cookie)

**WHEN** the update notification function is called with a new subscription value

**THEN** a PUT request is sent to `/api/user/notifications` with the subscription body and JWT in Authorization header

**AND** on HTTP 200 response, the new subscription status is extracted from the response

**AND** the subscription preference is updated in state

#### Scenario: Unauthorized notification update

**GIVEN** no valid JWT in cookie

**WHEN** the update notification function is called

**THEN** a PUT request is sent to `/api/user/notifications` without a valid JWT

**AND** on HTTP 401 response, an error is logged or displayed

### Requirement: REST Auth Client Error Handling

The frontend MUST handle REST API errors consistently across all auth operations.

#### Scenario: Generic error handling

**WHEN** any REST auth request fails with an unexpected error (HTTP 500, network error)

**THEN** the error message is displayed in a modal

**AND** the operation is considered failed

**AND** appropriate login state is maintained or set to `loggedOut`

### Requirement: REST Auth Client Type Safety

The frontend MUST use types from the `common` package for request bodies and responses without runtime validation.

#### Scenario: Type-safe request body construction

**WHEN** constructing a request body for a REST auth endpoint

**THEN** the types from `common` package (e.g., `RegisterBody`, `LoginBody`) are used for type checking

**AND** no runtime validation with zod is performed in the frontend

#### Scenario: Type-safe response handling

**WHEN** handling responses from REST auth endpoints

**THEN** the types from `common` package (e.g., `LoginResponse`, `VerifyJwtResponse`) are used for type checking

**AND** no runtime validation with zod is performed in the frontend

### Requirement: REST Auth Client Authorization Header

The frontend MUST include the JWT token in the Authorization header for protected REST endpoints.

#### Scenario: Authorization header format

**WHEN** making a request to a protected REST endpoint

**THEN** the Authorization header is set to `Bearer <jwt_token>`

**AND** the JWT token is retrieved from the cookie

### Requirement: Socket.io User Kick Event

The frontend MUST continue to handle the `user:kick` Socket.io event for admin operations.

#### Scenario: User kicked by admin

**WHEN** the `user:kick` Socket.io event is received with an optional error message

**THEN** the JWT cookie is removed

**AND** the login state is set to `loggedOut`

**AND** if an error message is provided, it is displayed in a modal

### Requirement: REST Auth Client Loading States

The frontend MUST update login state to indicate when async REST operations are in progress.

#### Scenario: Login operation in progress

**WHEN** the login function is called

**THEN** the login state is set to `loggingIn`

**AND** the state remains `loggingIn` until the request completes

#### Scenario: Register operation in progress

**WHEN** the register function is called

**THEN** the login state is set to `registering`

**AND** the state remains `registering` until the request completes

