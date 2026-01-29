## ADDED Requirements

### Requirement: Password Reset Client Request

The frontend MUST provide a function to request a password reset by sending an email to `/api/auth/forgot-password`.

#### Scenario: Password reset request for existing user

**GIVEN** a user enters their registered email in the forgot password form

**WHEN** the requestPasswordReset function is called

**THEN** a POST request is sent to `/api/auth/forgot-password` with the email body

**AND** on HTTP 200 response, a success message is displayed in a modal

**AND** the user is informed to check their inbox for the reset link

#### Scenario: Password reset request for non-existent email

**GIVEN** a user enters an email that does not exist in the system

**WHEN** the requestPasswordReset function is called

**THEN** a POST request is sent to `/api/auth/forgot-password`

**AND** on HTTP 200 response, the same success message is displayed

**AND** no indication is given that the email was not found

### Requirement: Password Reset Client Confirmation

The frontend MUST provide a function to confirm password reset by sending the token and new password to `/api/auth/reset-password`.

#### Scenario: Successful password reset

**GIVEN** a user clicks the reset link in their email and enters a new password with matching confirmation

**WHEN** the resetPassword function is called with token, new password, and confirmation

**THEN** a POST request is sent to `/api/auth/reset-password` with the token and password body

**AND** on HTTP 200 response, a success message is displayed

**AND** the user is redirected to login

#### Scenario: Invalid or expired reset token

**GIVEN** a user enters a token that is invalid or expired along with a new password

**WHEN** the resetPassword function is called

**THEN** a POST request is sent to `/api/auth/reset-password`

**AND** on HTTP 400 response, an error message is displayed indicating the token is invalid or expired

#### Scenario: Password mismatch

**GIVEN** a user enters a new password and confirmation that do not match

**WHEN** the resetPassword function is called

**THEN** the client validates the passwords match locally

**AND** an error message is displayed immediately without making an API call

### Requirement: Password Reset Form UI

The frontend MUST display a forgot password form when the user clicks "Forgot password?" on the login panel.

#### Scenario: User clicks forgot password link

**GIVEN** a user is on the login panel

**WHEN** the user clicks the "Forgot password?" link

**THEN** the login form is replaced with the forgot password form

**AND** the forgot password form contains an email input field

**AND** the forgot password form contains a send button

**AND** there is a link to return to the login form

#### Scenario: User sees password reset form from email link

**GIVEN** a user clicks a password reset link in their email

**WHEN** the URL contains a valid reset token

**THEN** the forgot password form is replaced with the password reset form

**AND** the password reset form contains a password input field

**AND** the password reset form contains a password confirmation field

**AND** the password reset form contains a reset button

### Requirement: Password Reset Type Safety

The frontend MUST use types from the `common` package for password reset request bodies and responses.

#### Scenario: Type-safe password reset request

**WHEN** constructing a request body for password reset endpoints

**THEN** the types from `common` package (e.g., `ForgotPasswordBody`, `ResetPasswordBody`) are used for type checking
