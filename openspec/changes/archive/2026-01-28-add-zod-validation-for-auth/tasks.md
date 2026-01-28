# Implementation Tasks

## Phase 1: Add Zod Dependency

- [x] Add `zod` dependency to common package
  - Run `pnpm add zod --filter common`
  - Verify package.json updated

- [x] Add `zod` dependency to server package
  - Run `pnpm add zod --filter server`
  - Verify package.json updated

## Phase 2: Create Validation Schemas in Common Package

- [x] Create `schemas.ts` in `packages/common/src/`
  - Export `RegisterSchema` Zod schema
    - nickname: string, min 3 chars, max 16 chars (after trim)
    - email: string, email format
    - password: string, min 8 chars
    - passwordConfirm: string
    - notif: boolean, default false
    - Add refinement: password === passwordConfirm
  - Export `LoginSchema` Zod schema
    - nickname: string, min 1 char
    - password: string, min 1 char
  - Export `VerifyEmailSchema` Zod schema
    - token: string
  - Export `UpdateNotificationsSchema` Zod schema
    - subscribed: boolean
  - Export TypeScript types derived from schemas using `z.infer<>`

- [x] Update `packages/common/src/index.ts`
  - Export all schemas and types from `schemas.ts`

- [x] Build common package
  - Run `pnpm build` in common package
  - Verify no TypeScript errors

## Phase 3: Create Validation Middleware Helper

- [x] Create `validationMiddleware.ts` in `packages/server/src/`
  - Implement `validateRequestBody(schema: z.ZodObject)` function
    - Accept schema and Express Request/Response/NextFunction
    - Use `schema.safeParse(req.body)` for validation
    - On success: overwrite req.body with validated data, call next()
    - On failure: return 400 status with Zod error.format()
  - Export the helper function

- [x] Add to TypeScript compilation
  - Verify proper imports (zod, express types)
  - Verify no TypeScript errors

## Phase 4: Update Auth Routes with Zod Validation

- [x] Update POST /api/auth/register route
  - Import RegisterSchema from common package
  - Use validateRequestBody middleware with RegisterSchema
  - Remove manual type checking and validation if-conditions
  - Remove @typescript-eslint/no-unsafe-assignment comments
  - Update AuthService.register() call with validated data

- [x] Update POST /api/auth/login route
  - Import LoginSchema from common package
  - Use validateRequestBody middleware with LoginSchema
  - Remove manual type checking and validation if-conditions
  - Remove @typescript-eslint/no-unsafe-assignment comments

- [x] Update POST /api/auth/verify route
  - Import VerifyEmailSchema from common package
  - Use validateRequestBody middleware with VerifyEmailSchema
  - Remove manual type checking and validation if-conditions
  - Remove @typescript-eslint/no-unsafe-assignment comments

- [x] Update PUT /api/user/notifications route
  - Import UpdateNotificationsSchema from common package
  - Use validateRequestBody middleware with UpdateNotificationsSchema
  - Remove manual type checking and validation if-conditions
  - Remove @typescript-eslint/no-unsafe-assignment comments

## Phase 5: Remove Duplicate Validation from AuthService

- [x] Update AuthService.register() method
  - Remove nickname length validation (now handled by schema)
  - Remove email format validation (now handled by schema)
  - Remove password length validation (now handled by schema)
  - Remove password confirmation check (now handled by schema)
  - Keep nickname trim logic (business logic)
  - Keep existence checks (nicknameExists, emailExists) - business logic

- [x] Verify AuthService still validates business rules
  - Ensure nickname uniqueness check remains
  - Ensure email uniqueness check remains
  - Ensure password verification in login remains

## Phase 6: Update Error Responses

- [x] Test validation error responses
  - Verify register endpoint returns field-level errors for invalid data
  - Verify login endpoint returns field-level errors for missing fields
  - Verify verify endpoint returns field-level errors for invalid token
  - Verify notifications endpoint returns field-level errors for non-boolean subscribed

## Phase 7: Final Validation

- [x] Run TypeScript type checking
  - Execute `pnpm ts:check` in server package
  - Resolve any TypeScript errors

- [x] Run linting
  - Execute `pnpm lint` in server package
  - Resolve any lint errors (especially no-unsafe-assignment)

- [x] Run formatting check
  - Execute `pnpm format --check`
  - Resolve any formatting issues

- [x] Build all packages
  - Execute `pnpm build` in root
  - Ensure successful build
