<!-- OPENSPEC:START -->

# OpenSpec Instructions

These instructions are for AI assistants working in this project.

Always open `@/openspec/AGENTS.md` when the request:

- Mentions planning or proposals (words like proposal, spec, change, plan)
- Introduces new capabilities, breaking changes, architecture shifts, or big performance/security work
- Sounds ambiguous and you need the authoritative spec before coding

Use `@/openspec/AGENTS.md` to learn:

- How to create and apply change proposals
- Spec format and conventions
- Project structure and guidelines

Keep this managed block so 'openspec update' can refresh the instructions.

<!-- OPENSPEC:END -->

# Agent Guidelines

## Build/Lint/Test Commands

- Build: `pnpm build`
- Lint: `pnpm lint`
- Lint (fix): `pnpm lint:fix`
- Format: `pnpm format`
- Format (only check): `pnpm format --check`
- Type check: `pnpm ts:check`
- Test (all packages): `pnpm run test`
- Test (common): `pnpm run test --project @listen-app/common`
- Test (frontend): `pnpm run test --project @listen-app/frontend`
- Test (server): `pnpm run test --project @listen-app/server`

## Workspaces

pnpm workspaces:

- `packages/common`
- `packages/frontend`
- `packages/server`

## Dependency Management

- Install: `pnpm install`
- Add: `pnpm add --filter frontend PKG`
- Add dev dependency: `pnpm add -D --filter frontend PKG`
- Remove: `pnpm remove --filter frontend PKG`

## Code Style

### General

- 100-char line limit
- Use consistent indentation

### JavaScript/TypeScript

- Imports
  - Use explicit imports (avoid `import *`)
  - Organize in sections (stdlib, third-party, local)
  - Always keep imports at the top of a file
  - Default: use ESLint and Prettier configuration
- Formatting
  - Use Prettier for consistent code style
  - Follow TypeScript and JavaScript best practices
  - 2-space indentation
  - Use single quotes for strings
- Types
  - Use TypeScript type hints consistently
  - Use type inference where possible
  - Don't add redundant type annotations
- Naming
  - camelCase for variables and functions
  - PascalCase for classes
  - UPPER_CASE for constants
  - Use descriptive names
- Error Handling
  - Use appropriate error types
  - Avoid silent failures
  - Handle specific errors that are expected

### Documentation

- Markdown for all documentation
- Use consistent formatting throughout
- Update documentation when changing APIs
