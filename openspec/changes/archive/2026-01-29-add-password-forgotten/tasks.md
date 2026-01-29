## 1. Backend Implementation

- [x] 1.1 Add password reset token methods to RedisConnection
  - [x] Add `setPasswordResetToken(email, token)` method
  - [x] Add `getPasswordResetEmail(token)` method
  - [x] Add `deletePasswordResetToken(token)` method
  - [x] Add `updateUserPassword(email, password)` method
- [x] 1.2 Add password reset email template to AuthService
- [x] 1.3 Add `requestPasswordReset(email)` method to AuthService
- [x] 1.4 Add `resetPassword(token, newPassword)` method to AuthService
- [x] 1.5 Add password reset request endpoint `POST /api/auth/forgot-password`
- [x] 1.6 Add password reset confirmation endpoint `POST /api/auth/reset-password`
- [x] 1.7 Add password reset request/response schemas to common package
- [x] 1.8 Update API routes with new schemas

## 2. Frontend Implementation

- [x] 2.1 Add password reset schemas to common package
- [x] 2.2 Add `requestPasswordReset(email)` function to UserContext
- [x] 2.3 Add `resetPassword(token, newPassword, passwordConfirm)` function to UserContext
- [x] 2.4 Add `forgotPasswordForm` login state
- [x] 2.5 Add "Forgot password?" link on login panel
- [x] 2.6 Add forgot password form UI component
- [x] 2.7 Add password reset form UI component
- [x] 2.8 Handle token in URL for password reset page

## 3. Testing and Validation

- [ ] 3.1 Test password reset flow end-to-end
- [ ] 3.2 Verify token expiry after 30 minutes
- [ ] 3.3 Verify security (no account enumeration)
- [x] 3.4 Run lint and typecheck
