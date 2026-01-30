## ADDED Requirements

### Requirement: API Endpoint Testing

The server SHALL provide comprehensive integration tests for all REST API endpoints using supertest.

#### Scenario: Registration endpoint handles valid requests

- **WHEN** a POST request is made to /auth/register with valid nickname, email, password, and notification preference
- **THEN** the response status SHALL be 201
- **AND** the response SHALL contain a success message about email verification

#### Scenario: Registration endpoint rejects duplicate nicknames

- **WHEN** a POST request is made to /auth/register with a nickname that already exists
- **THEN** the response status SHALL be 400
- **AND** the response SHALL contain an error about nickname unavailability

#### Scenario: Registration endpoint rejects duplicate emails

- **WHEN** a POST request is made to /auth/register with an email that already exists
- **THEN** the response status SHALL be 400
- **AND** the response SHALL contain an error about email unavailability

#### Scenario: Login endpoint authenticates valid credentials

- **WHEN** a POST request is made to /auth/login with valid nickname and password
- **THEN** the response status SHALL be 200
- **AND** the response SHALL contain a JWT token and user info

#### Scenario: Login endpoint rejects invalid credentials

- **WHEN** a POST request is made to /auth/login with an invalid nickname or password
- **THEN** the response status SHALL be 401
- **AND** the response SHALL contain an error about wrong credentials

#### Scenario: Login endpoint handles non-existent user

- **WHEN** a POST request is made to /auth/login with a nickname that does not exist
- **THEN** the response status SHALL be 401
- **AND** the response SHALL contain an error about wrong credentials

#### Scenario: Email verification validates tokens

- **WHEN** a POST request is made to /auth/verify with a valid verification token
- **THEN** the response status SHALL be 200
- **AND** the response SHALL confirm successful email verification

#### Scenario: Email verification rejects invalid tokens

- **WHEN** a POST request is made to /auth/verify with an invalid or expired token
- **THEN** the response status SHALL be 400
- **AND** the response SHALL indicate the token is invalid or expired

#### Scenario: JWT verification validates authentication

- **WHEN** a GET request is made to /auth/verify-jwt with a valid JWT token
- **THEN** the response status SHALL be 200
- **AND** the response SHALL contain the user's email, nickname, and subscription status

#### Scenario: JWT verification rejects invalid tokens

- **WHEN** a GET request is made to /auth/verify-jwt without a valid JWT token
- **THEN** the response status SHALL be 401
- **AND** the response SHALL indicate authorization is required

#### Scenario: User deletion removes account data

- **WHEN** a DELETE request is made to /user with a valid JWT token
- **THEN** the response status SHALL be 204
- **AND** the user's data SHALL be removed from Redis

#### Scenario: Notification update changes subscription

- **WHEN** a PUT request is made to /user/notifications with subscription preference
- **THEN** the response status SHALL be 200
- **AND** the response SHALL confirm the updated subscription status

#### Scenario: Password reset request handles existing users

- **WHEN** a POST request is made to /auth/forgot-password with an email of a verified user
- **THEN** the response status SHALL be 200
- **AND** a password reset token SHALL be generated and email sent

#### Scenario: Password reset request ignores non-existent users

- **WHEN** a POST request is made to /auth/forgot-password with an email that does not exist
- **THEN** the response status SHALL be 200
- **AND** no error SHALL be returned (prevent email enumeration)

#### Scenario: Password reset validates tokens

- **WHEN** a POST request is made to /auth/reset-password with a valid token and new password
- **THEN** the response status SHALL be 200
- **AND** the password SHALL be updated in Redis

#### Scenario: Password reset rejects invalid tokens

- **WHEN** a POST request is made to /auth/reset-password with an invalid or expired token
- **THEN** the response status SHALL be 400
- **AND** the response SHALL indicate the token is invalid

#### Scenario: Chat messages endpoint retrieves latest messages

- **WHEN** a GET request is made to /chat/messages with a limit parameter
- **THEN** the response status SHALL be 200
- **AND** the response SHALL contain the messages and pagination info

#### Scenario: Chat messages endpoint supports pagination

- **WHEN** a GET request is made to /chat/messages with a before timestamp
- **THEN** the response status SHALL be 200
- **AND** the response SHALL contain messages before the specified timestamp

### Requirement: AuthService Testing

The AuthService SHALL have unit tests validating authentication logic without external dependencies.

#### Scenario: Registration fails for duplicate nickname

- **WHEN** AuthService.register is called with a nickname that already exists in Redis
- **THEN** the service SHALL throw an error about nickname unavailability
- **AND** no user SHALL be created

#### Scenario: Registration fails for duplicate email

- **WHEN** AuthService.register is called with an email that already exists in Redis
- **THEN** the service SHALL throw an error about email unavailability
- **AND** no user SHALL be created

#### Scenario: Registration rolls back on mail failure

- **WHEN** AuthService.register succeeds but mail sending fails
- **THEN** the service SHALL delete the created user
- **AND** the service SHALL throw an error about mail failure

#### Scenario: Login authenticates with correct password

- **WHEN** AuthService.login is called with valid nickname and password
- **THEN** the service SHALL return a JWT token
- **AND** the returned token SHALL contain the user's email and nickname

#### Scenario: Login rejects wrong password

- **WHEN** AuthService.login is called with a valid nickname but wrong password
- **THEN** the service SHALL throw an error about wrong credentials

#### Scenario: Password reset validates token existence

- **WHEN** AuthService.resetPassword is called with a non-existent token
- **THEN** the service SHALL throw an error about invalid token

### Requirement: RedisConnection Testing

The RedisConnection class SHALL have unit tests validating data transformation and key generation.

#### Scenario: Key generation produces correct format

- **WHEN** getNicknameKey, getUserKey, getTokenKey, or getPasswordResetKey is called
- **THEN** each SHALL return a properly formatted key with the correct prefix

#### Scenario: Message serialization handles UUID and timestamp

- **WHEN** storeMessage is called with a ChatMessage
- **THEN** the message SHALL be stored in Redis with timestamp as score
- **AND** the message data SHALL contain UUID, senderNickname, and message text

#### Scenario: Message deserialization parses stored data

- **WHEN** getMessages, getMessagesBefore, or getLatestMessages is called
- **THEN** the returned ChatMessage objects SHALL have valid uuid, timestamp, senderNickname, and message

#### Scenario: Subscription operations work correctly

- **WHEN** subscribe, unsubscribe, or isSubscribed is called
- **THEN** the Redis set SHALL be updated accordingly

### Requirement: ChatManager Testing

The ChatManager SHALL have unit tests validating message processing logic.

#### Scenario: Message text is truncated at maximum length

- **WHEN** ChatManager processes a message longer than MAX_CHAT_MESSAGE_LENGTH
- **THEN** the resulting message SHALL contain only the first MAX_CHAT_MESSAGE_LENGTH characters

#### Scenario: Message text is trimmed of whitespace

- **WHEN** ChatManager processes a message with leading or trailing whitespace
- **THEN** the resulting message SHALL have leading and trailing whitespace removed

#### Scenario: Empty messages are filtered

- **WHEN** ChatManager processes an empty or whitespace-only message
- **THEN** no message SHALL be emitted or stored

#### Scenario: Unauthenticated users cannot send messages

- **WHEN** an unauthenticated socket sends a chat message
- **THEN** the user SHALL be kicked with an error message

### Requirement: Utility Function Testing

The server utils SHALL have unit tests validating core utility functions.

#### Scenario: JWT signing and verification works correctly

- **WHEN** jwt.sign creates a token with a secret
- **THEN** jwt.verify SHALL successfully decode the token
- **AND** the decoded payload SHALL contain the user data

#### Scenario: UnauthorizedError has correct properties

- **WHEN** an UnauthorizedError is created with a message
- **THEN** the error SHALL have statusCode 401
- **AND** the error message SHALL match the provided message
