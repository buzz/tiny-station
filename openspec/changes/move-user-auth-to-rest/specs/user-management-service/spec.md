# User Management Service

## ADDED Requirements

### Requirement: User Registration Service Method

The user management service MUST provide a method to register new users with validation, Redis storage, and email confirmation.

#### Scenario: Successful registration with notification

**GIVEN** valid nickname, email, password, and subscription preference

**WHEN** the register method is called

**THEN** a verification token is generated

**AND** the user is stored in Redis with hashed password

**AND** the email is sent with the confirmation link

**AND** the user is subscribed to notifications if requested

#### Scenario: Email sending failure

**GIVEN** user data is valid and stored in Redis

**WHEN** the email sending fails

**THEN** the user is deleted from Redis

**AND** the verification token is deleted

**AND** the subscription is removed if it was set

**AND** an error is thrown indicating email sending failed

### Requirement: User Login Service Method

The user management service MUST provide a method to authenticate users with credentials and return a JWT token.

#### Scenario: Successful login

**GIVEN** a nickname and matching password

**WHEN** the login method is called

**THEN** the email is looked up from the nickname

**AND** the password is verified against the stored hash

**AND** a JWT token is created containing the user's email and nickname

**AND** the token is returned with the user's subscription status

#### Scenario: Invalid credentials

**GIVEN** a nickname that doesn't exist or a mismatching password

**WHEN** the login method is called

**THEN** an error is thrown indicating wrong nickname or password

### Requirement: Email Verification Service Method

The user management service MUST provide a method to verify user emails using a verification token.

#### Scenario: Successful email verification

**GIVEN** a valid verification token

**WHEN** the verifyEmail method is called

**THEN** the token is looked up in Redis

**AND** the user's verified flag is set

**AND** the token is deleted

**AND** success is returned

#### Scenario: Invalid token

**GIVEN** a token that doesn't exist in Redis

**WHEN** the verifyEmail method is called

**THEN** failure is returned

### Requirement: User Deletion Service Method

The user management service MUST provide a method to delete user accounts.

#### Scenario: Successful account deletion

**GIVEN** a user's email

**WHEN** the deleteUser method is called

**THEN** the user is deleted from Redis

**AND** the user is unsubscribed from notifications

**AND** success is returned

### Requirement: Notification Subscription Service Method

The user management service MUST provide a method to update user notification preferences.

#### Scenario: Subscribe to notifications

**GIVEN** a user's email

**WHEN** the updateNotifications method is called with subscribed=true

**THEN** the user is subscribed in Redis

**AND** success is returned

#### Scenario: Unsubscribe from notifications

**GIVEN** a user's email

**WHEN** the updateNotifications method is called with subscribed=false

**THEN** the user is unsubscribed in Redis

**AND** success is returned

### Requirement: Input Validation

The user management service MUST validate all input parameters before processing.

#### Scenario: Nickname validation

**WHEN** validating a nickname

**THEN** it must be 1-16 characters after trimming

**AND** it must not contain only whitespace

#### Scenario: Email validation

**WHEN** validating an email

**THEN** it must pass email format validation

#### Scenario: Password validation

**WHEN** validating a password

**THEN** it must be at least 6 characters

**AND** password confirmation must match

#### Scenario: Duplicate detection

**WHEN** validating registration

**THEN** the nickname must not already exist

**AND** the email must not already exist

### Requirement: Verification Token Generation

The user management service MUST generate unique, random verification tokens.

#### Scenario: Token generation

**WHEN** generating a verification token

**THEN** the token is 10 characters long

**AND** the token contains uppercase letters, lowercase letters, and numbers

**AND** each token is random and unique

### Requirement: JWT Token Creation

The user management service MUST create JWT tokens containing user identification data.

#### Scenario: JWT creation

**WHEN** creating a JWT token

**THEN** the token payload contains user.\_id (email) and nickname

**AND** the token is signed with the JWT_SECRET environment variable

**AND** the token is returned as a string

## REMOVED Requirements

### Requirement: UserManager Socket.IO Handler

The UserManager class MUST NOT exist as a Socket.IO event handler.

**REASONING:** User auth operations are now handled by REST API endpoints and a user management service class.

### Requirement: User-related Socket.IO Events

User-related Socket.IO events MUST NOT be emitted or handled by the server.

**REASONING:** User auth operations are now handled via REST API. Socket.IO only handles chat and stream info events.

**Removed events:**

- `user:verify-jwt` (client/server)
- `user:login` (client/server)
- `user:register` (client/server)
- `user:verify` (client/server)
- `user:delete` (client/server)
- `user:update-notif` (client/server)
- All corresponding success/fail response events

### Requirement: AbstractHandler.auth() Method

The AbstractHandler.auth() method MUST NOT exist.

**REASONING:** JWT verification now happens once at Socket.IO handshake via middleware. Event handlers check `socket.data.user` synchronously.
