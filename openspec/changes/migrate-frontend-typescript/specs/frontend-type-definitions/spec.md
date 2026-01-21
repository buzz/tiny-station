## ADDED Requirements

### Requirement: Global Type Definitions

The frontend package MUST define global type declarations in `global.d.ts` for environment variables, React interfaces, and shared types.

#### Scenario: Global types are defined

- **WHEN** inspecting `packages/frontend/src/global.d.ts`
- **THEN** all `VITE_*` environment variables are properly typed
- **AND** React types are declared
- **AND** shared types are defined in `@/types` module

#### Scenario: TypeScript recognizes global types

- **WHEN** using `import.meta.env.VITE_*` in source code
- **THEN** TypeScript provides type checking for all environment variables
- **AND** no `any` types are used for environment variables

### Requirement: Socket.IO Type Safety

Socket.IO events and messages MUST be fully type-safe with explicit type definitions for all emit and on handlers.

#### Scenario: Socket event types are defined

- **WHEN** inspecting `types/socket/` directory
- **THEN** Socket.IO event types are defined
- **AND** all event names are explicitly typed
- **AND** emit and on handlers have proper parameter types

#### Scenario: Socket context uses typed interface

- **WHEN** using `SocketIOContext` in application
- **THEN** the socket is typed with custom SocketIO interface
- **AND** event emit methods are type-safe
- **AND** event listener handlers accept correct parameter types

### Requirement: Context Type Definitions

All React Context providers and consumers MUST have explicit TypeScript interfaces and type definitions.

#### Scenario: All contexts are typed

- **WHEN** inspecting `contexts/` directory
- **THEN** each context provider has a corresponding types file
- **AND** context value interface is properly defined
- **AND** all context consumers use typed interfaces

#### Scenario: User Context is fully typed

- **WHEN** using `UserContext`
- **THEN** connection state types are defined
- **AND** user state (nickname, notifications) is typed
- **AND** all callback functions have proper signatures
- **AND** JWT token handling is type-safe

#### Scenario: Chat Context is fully typed

- **WHEN** using `ChatContext`
- **THEN** message types are fully defined
- **AND** chat state is typed
- **AND** event handlers are properly typed
- **AND** socket event types are defined

### Requirement: Component Type Definitions

React components MUST have explicit TypeScript props interfaces and return types.

#### Scenario: Components use props interfaces

- **WHEN** checking component implementations
- **THEN** each component has a corresponding interface for props
- **AND** component functions use `React.FC` or explicit return types
- **AND** no implicit `any` types appear in props

#### Scenario: Hook types are defined

- **WHEN** inspecting custom hooks
- **THEN** hook return types are explicitly defined
- **AND** all input parameters are typed
- **AND** side effect dependencies are type-safe

## MODIFIED Requirements

### Requirement: TypeScript Support in Frontend ESLint

The frontend ESLint configuration MUST use `typescript-eslint` to validate TypeScript files.

#### Scenario: Frontend TypeScript files are validated

- **WHEN** running `pnpm lint` on frontend package
- **THEN** TypeScript files are linted with proper rules
- **AND** no TypeScript parser errors occur
- **AND** all type-checking rules are enforced
