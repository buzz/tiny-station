## 1. Update UserContext.tsx structure

- [x] 1.1 Remove Socket.io event handlers for user auth operations (user:verify-jwt, user:login-fail, user:login-success, user:register-fail, user:register-success, user:update-notif-success, user:verify-jwt-fail, user:delete-success)
- [x] 1.2 Keep Socket.io event handler for user:kick
- [x] 1.3 Add imports for types from `@listen-app/common` (RegisterBody, LoginBody, LoginResponse, VerifyJwtResponse, UpdateNotificationsBody, ErrorResponse, MessageResponse)
- [x] 1.4 Remove unused socket.emit calls in existing handler functions

## 2. Implement REST API client functions

- [x] 2.1 Create helper function to get Authorization header with JWT from cookie
- [x] 2.2 Implement register function with POST to `/api/auth/register`
  - [x] 2.2.1 Use RegisterBody type for request body construction
  - [x] 2.2.2 Handle 201 (success), 400 (validation error), 409 (duplicate) responses
  - [x] 2.2.3 Display success/error modals appropriately
  - [x] 2.2.4 Set login state to loggedOut on success
- [x] 2.3 Implement login function with POST to `/api/auth/login`
  - [x] 2.3.1 Use LoginBody type for request body construction
  - [x] 2.3.2 Use LoginResponse type for response handling
  - [x] 2.3.3 Handle 200 (success), 401 (invalid credentials) responses
  - [x] 2.3.4 Store JWT and nickname in cookies
  - [x] 2.3.5 Store subscription status in state
- [x] 2.4 Implement verifyJwt function with GET to `/api/auth/verify-jwt`
  - [x] 2.4.1 Use VerifyJwtResponse type for response handling
  - [x] 2.4.2 Handle 200 (success), 401 (invalid token) responses
  - [x] 2.4.3 Remove JWT cookie on 401 response
- [x] 2.5 Implement deleteAccount function with DELETE to `/api/user`
  - [x] 2.5.1 Handle 204 (success), 401 (unauthorized) responses
  - [x] 2.5.2 Reload page on success
- [x] 2.6 Implement updateNotif function with PUT to `/api/user/notifications`
  - [x] 2.6.1 Use UpdateNotificationsBody type for request body
  - [x] 2.6.2 Handle 200 (success), 401 (unauthorized) responses
  - [x] 2.6.3 Update notification state on success
- [x] 2.7 Add error handling for generic errors (500, network failures)

## 3. Update Socket.io connection handling

- [x] 3.1 Modify handleConnect to call verifyJwt REST function instead of socket.emit('user:verify-jwt')
- [x] 3.2 Ensure JWT token is used in Authorization header for verifyJwt call

## 4. Update UserContext value object

- [x] 4.1 Replace register implementation with REST API call
- [x] 4.2 Replace login implementation with REST API call
- [x] 4.3 Replace deleteAccount implementation with REST API call
- [x] 4.4 Replace updateNotif implementation with REST API call
- [x] 4.5 Keep logout implementation (cookie removal, no REST call needed)

## 5. Clean up unused code

- [x] 5.1 Remove unused handler functions (handleUserLoginSuccess, handleUserLoginFail, handleUserRegisterSuccess, handleUserRegisterFail, handleUserUpdateNotifSuccess, handleUserVerifyJwtSuccess, handleUserVerifyJwtFail)
- [x] 5.2 Remove unused imports if any

## 6. Verify and test

- [x] 6.1 Run TypeScript type check: `pnpm ts:check --filter frontend`
- [x] 6.2 Run linter: `pnpm lint --filter frontend`
