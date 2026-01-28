# Add Zod Validation for Auth Routes

## Summary

Replace manual request validation in auth routes with Zod schemas, defining shared validation schemas in the common package for frontend-backend type consistency.

## Motivation

### Current Problems

1. **Type safety issues:** Routes use `@typescript-eslint/no-unsafe-assignment` because `req.body` is typed as `any`
2. **Duplicate validation logic:** Validation rules exist in both routes and AuthService (nickname length, email format, password constraints)
3. **Manual type checking:** Routes manually check `typeof` and presence of fields with verbose if-conditions
4. **No single source of truth:** TypeScript interfaces and validation logic are not synchronized
5. **Poor error messages:** Validation errors return generic "Bad form data." messages without field-level details
6. **Frontend-backend type inconsistency:** Validation rules defined only in backend create mismatch risk

### Benefits

1. **Single source of truth:** Zod schemas generate both runtime validation and TypeScript types
2. **Type safety:** Eliminate `@typescript-eslint/no-unsafe-assignment` with validated request bodies
3. **Better error messages:** Zod provides detailed, field-level validation errors
4. **DRY validation:** Remove duplicate validation from routes, centralize in schemas
5. **Frontend sharing:** Common package schemas allow frontend to import same types
6. **Modern patterns:** Align with Express 5 and modern TypeScript ecosystem best practices

## Scope

### In Scope

- Add `zod` dependency to common and server packages
- Create `schemas.ts` in common package with auth-related Zod schemas
  - Register schema with password confirmation refinement
  - Login schema
  - Verify email schema
  - Update notifications schema
- Create validation middleware helper in server package
- Replace manual validation in all auth routes with Zod schemas
  - POST /api/auth/register
  - POST /api/auth/login
  - POST /api/auth/verify
  - PUT /api/user/notifications
- Remove duplicate validation logic from AuthService (keep only business logic validation like existence checks)
- Update error responses to use Zod's formatted errors

### Out of Scope

- Frontend schema consumption (handled in separate change proposal)
- Zod validation for other routes (only auth routes in scope)
- Password strength beyond length check (can be added later)
- Email provider-specific validation (keep current email-validator)

## Dependencies

- None blocking

## Trade-offs

### Validation Middleware vs Route-Level Validation

**Chosen:** Route-level validation with helper function

**Rationale:**

- Middleware approach requires more boilerplate for each schema
- Route-level validation keeps validation logic close to the route definition
- Helper function `validateRequest(schema)` provides consistency
- Allows different validation strategies per route if needed

### Error Format

**Chosen:** Zod's `error.format()` for detailed errors

**Rationale:**

- Provides field-level errors (e.g., `nickname: "String must contain at least 3 characters"`)
- Better UX than generic "Bad form data." message
- Frontend can display field-specific validation messages
- Matches modern API validation standards

### Schema Location

**Chosen:** Common package `schemas.ts`

**Rationale:**

- Enables frontend-backend type sharing (future change)
- Centralizes all auth schemas in one location
- Follows monorepo pattern for shared code
- Common package already exports types

## Related Changes

- Frontend schema consumption and validation integration (separate proposal)
