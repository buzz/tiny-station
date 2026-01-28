# auth-request-validation Specification

## Purpose
TBD - created by archiving change add-zod-validation-for-auth. Update Purpose after archive.
## Requirements
### Requirement: Zod Schema Definitions in Common Package

The common package MUST define Zod schemas for all authentication request bodies.

#### Scenario: Register request schema exists and validates

- **WHEN** the common package is imported
- **THEN** `RegisterSchema` is exported with:
  - nickname validation (string, min 3 chars, max 16 chars)
  - email validation (string, email format)
  - password validation (string, min 8 chars)
  - passwordConfirm validation (string)
  - notif validation (boolean, default false)
  - password confirmation refinement (password === passwordConfirm)

#### Scenario: Login request schema exists and validates

- **WHEN** the common package is imported
- **THEN** `LoginSchema` is exported with:
  - nickname validation (string, min 1 char)
  - password validation (string, min 1 char)

#### Scenario: Verify email request schema exists and validates

- **WHEN** the common package is imported
- **THEN** `VerifyEmailSchema` is exported with:
  - token validation (string)

#### Scenario: Update notifications request schema exists and validates

- **WHEN** the common package is imported
- **THEN** `UpdateNotificationsSchema` is exported with:
  - subscribed validation (boolean)

### Requirement: TypeScript Type Derivation

The common package MUST export TypeScript types derived from Zod schemas.

#### Scenario: Types are derived from schemas

- **WHEN** importing auth request types
- **THEN** `RegisterInput`, `LoginInput`, `VerifyEmailInput`, and `UpdateNotificationsInput` types are available
- **AND** each type matches the corresponding Zod schema structure

### Requirement: Request Body Validation Middleware

The server package MUST provide a validation middleware helper for Zod schemas.

#### Scenario: Validation middleware validates requests

- **WHEN** a request passes through `validateRequestBody(RegisterSchema)`
- **THEN** the request body is validated against RegisterSchema
- **AND** valid requests have `req.body` replaced with validated data
- **AND** invalid requests return 400 status with Zod error format

#### Scenario: Validation errors are detailed

- **WHEN** validation fails with multiple errors
- **THEN** response includes field-level error messages
- **AND** each error specifies the field and validation reason
- **AND** error format matches Zod's `error.format()` output

### Requirement: Auth Routes Use Zod Validation

All authentication routes MUST use Zod schema validation instead of manual type checking.

#### Scenario: Register route validates with Zod

- **WHEN** POST /api/auth/register receives a request
- **THEN** RegisterSchema validates the request body
- **AND** `@typescript-eslint/no-unsafe-assignment` is not used
- **AND** invalid requests return detailed field-level errors
- **AND** valid requests proceed with typed data

#### Scenario: Login route validates with Zod

- **WHEN** POST /api/auth/login receives a request
- **THEN** LoginSchema validates the request body
- **AND** `@typescript-eslint/no-unsafe-assignment` is not used
- **AND** invalid requests return detailed field-level errors

#### Scenario: Verify email route validates with Zod

- **WHEN** POST /api/auth/verify receives a request
- **THEN** VerifyEmailSchema validates the request body
- **AND** `@typescript-eslint/no-unsafe-assignment` is not used
- **AND** invalid requests return detailed field-level errors

#### Scenario: Update notifications route validates with Zod

- **WHEN** PUT /api/user/notifications receives a request
- **THEN** UpdateNotificationsSchema validates the request body
- **AND** `@typescript-eslint/no-unsafe-assignment` is not used
- **AND** invalid requests return detailed field-level errors

### Requirement: Business Logic Validation Remains

AuthService MUST retain business logic validation that cannot be expressed in schemas.

#### Scenario: AuthService validates uniqueness constraints

- **WHEN** registering a user
- **THEN** AuthService checks nickname uniqueness (not in schema)
- **AND** AuthService checks email uniqueness (not in schema)
- **AND** unique constraint violations return appropriate errors

#### Scenario: AuthService verifies passwords correctly

- **WHEN** logging in
- **THEN** AuthService verifies password hash (not in schema)
- **AND** incorrect passwords return appropriate errors

