## 1. Backend Implementation

- [ ] 1.1 Add password reset token methods to RedisConnection
  - [ ] Add `setPasswordResetToken(email, token)` method
  - [ ] Add `getPasswordResetEmail(token)` method
  - [ ] Add `deletePasswordResetToken(token)` method
  - [ ] Add `updateUserPassword(email, password)` method
- [ ] 1.2 Add password reset email template to AuthService
- [ ] 1.3 Add `requestPasswordReset(email)` method to AuthService
- [ ] 1.4 Add `resetPassword(token, newPassword)` method to AuthService
- [ ] 1.5 Add password reset request endpoint `POST /api/auth/forgot-password`
- [ ] 1.6 Add password reset confirmation endpoint `POST /api/auth/reset-password`
- [ ] 1.7 Add password reset request/response schemas to common package
- [ ] 1.8 Update API routes with new schemas

## 2. Frontend Implementation

- [ ] 2.1 Add password reset schemas to common package
- [ ] 2.2 Add `requestPasswordReset(email)` function to UserContext
- [ ] 2.3 Add `resetPassword(token, newPassword, passwordConfirm)` function to UserContext
- [ ] 2.4 Add `forgotPasswordForm` login state
- [ ] 2.5 Add "Forgot password?" link on login panel
- [ ] 2.6 Add forgot password form UI component
- [ ] 2.7 Add password reset form UI component
- [ ] 2.8 Handle token in URL for password reset page

## 3. Testing and Validation

- [ ] 3.1 Test password reset flow end-to-end
- [ ] 3.2 Verify token expiry after 30 minutes
- [ ] 3.3 Verify security (no account enumeration)
- [ ] 3.4 Run lint and typecheck
