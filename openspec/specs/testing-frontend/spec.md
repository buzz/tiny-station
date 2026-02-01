# testing-frontend Specification

## Purpose

TBD - created by archiving change add-vitest-testing-infrastructure. Update Purpose after archive.
## Requirements
### Requirement: Vitest Configuration

The packages/frontend package MUST have a configured Vitest test runner with jsdom environment.

#### Scenario: Vitest config exists with jsdom

- **WHEN** a user runs `vitest --version` in the packages/frontend directory
- **THEN** Vitest is recognized and configured for jsdom environment

### Requirement: Test Script

The packages/frontend package.json MUST include a test script for running tests.

#### Scenario: Test script is defined

- **WHEN** a user runs `npm test --prefix packages/frontend`
- **THEN** the test runner executes successfully

### Requirement: Testing Library Integration

The packages/frontend package MUST integrate @testing-library/react for component testing.

#### Scenario: Testing library is available

- **WHEN** a test file imports from `@testing-library/react`
- **THEN** the import resolves without errors

### Requirement: Path Alias Resolution

The packages/frontend package MUST resolve monorepo path aliases for test files.

#### Scenario: Path aliases work in tests

- **WHEN** a test file imports from `@tiny-station/common` or other workspace packages
- **THEN** the import resolves correctly without errors

### Requirement: Sample Component Test

The packages/frontend package MUST have at least one sample component test file.

#### Scenario: Component test runs

- **WHEN** running `npm test --prefix packages/frontend`
- **THEN** component tests execute and pass using @testing-library/react

### Requirement: React Component Testing Infrastructure

The frontend package MUST support testing React components with @testing-library/react.

#### Scenario: Component renders correctly

- **WHEN** rendering a React component in a test
- **THEN** the component renders without errors
- **AND** DOM elements are accessible via queries
- **AND** component output matches expected structure

#### Scenario: Component props are handled correctly

- **WHEN** passing props to a component
- **THEN** component responds to prop changes
- **AND** rendered output reflects prop values
- **AND** prop type validation works (TypeScript level)

#### Scenario: Component state is managed correctly

- **WHEN** testing a stateful component
- **THEN** initial state renders correctly
- **AND** state updates are reflected in DOM
- **AND** state changes trigger re-renders

### Requirement: User Interaction Testing

The frontend package MUST support testing user interactions with @testing-library/user-event.

#### Scenario: Click events are handled

- **WHEN** simulating a click on a button
- **THEN** the click handler is called
- **AND** any resulting state changes are reflected

#### Scenario: Input events are handled

- **WHEN** typing in an input field
- **THEN** input value updates correctly
- **AND** any debounce or validation triggers

#### Scenario: Form submission is handled

- **WHEN** submitting a form
- **THEN** form data is collected correctly
- **AND** submit handler is called with correct data
- **AND** form validation errors are shown if present

#### Scenario: Select options are changed

- **WHEN** selecting an option in a dropdown
- **THEN** selected value updates correctly
- **AND** change handler is called with new value

### Requirement: Context Testing

The frontend package MUST support testing components that consume React Context.

#### Scenario: Context providers wrap components in tests

- **WHEN** testing a component that needs context
- **THEN** tests can wrap component with provider
- **AND** context values can be mocked in tests
- **AND** component receives mock context values

#### Scenario: Multiple contexts work together

- **WHEN** testing component that uses multiple contexts
- **THEN** all contexts can be provided in test setup
- **AND** each context is independently configurable
- **AND** component receives values from all providers

### Requirement: jsdom Environment Configuration

The frontend package MUST use jsdom as the test environment.

#### Scenario: jsdom is configured correctly

- **WHEN** running frontend tests
- **THEN** jsdom environment is active
- **AND** DOM APIs are available (window, document, etc.)
- **AND** React can render to jsdom DOM

#### Scenario: Global objects are available

- **WHEN** running frontend tests
- **THEN** `window`, `document`, `navigator` are available
- **AND** event simulation works (click, input, etc.)
- **AND** DOM manipulation APIs work as expected

### Requirement: CSS Module Handling

The frontend package MUST handle CSS modules in tests.

#### Scenario: CSS modules work in tests

- **WHEN** testing a component with CSS modules
- **THEN** styled elements render with scoped class names
- **AND** class names are scoped to component
- **AND** styling doesn't leak between components

#### Scenario: CSS file imports are handled

- **WHEN** importing CSS files in tests
- **THEN** imports don't cause errors
- **AND** CSS is not applied to DOM (or can be if needed)

### Requirement: SVG Import Handling

The frontend package MUST handle SVG imports used as components.

#### Scenario: SVG imports work in tests

- **WHEN** importing SVG files as components
- **THEN** imports resolve without errors
- **AND** SVG renders correctly in tests

#### Scenario: SVG aliases are configured

- **WHEN** configuring vitest for frontend
- **THEN** SVG file extensions are aliased to actual files
- **AND** no "Cannot find module" errors for SVG imports

### Requirement: Hook Testing

The frontend package MUST support testing custom React hooks.

#### Scenario: Custom hooks render correctly

- **WHEN** testing a custom hook
- **THEN** hook can be tested with renderHook
- **AND** initial hook value is correct
- **AND** hook updates when dependencies change

#### Scenario: Hook cleanup works

- **WHEN** testing a hook with cleanup
- **THEN** cleanup function runs when unmounting
- **AND** resource cleanup is verified

### Requirement: Component Test File Patterns

Component tests MUST follow consistent naming conventions.

#### Scenario: Component test files are named correctly

- **WHEN** naming component test files
- **THEN** files end with `.test.tsx`
- **AND** files are in the same directory as the component
- **AND** test filenames mirror component filenames

#### Scenario: Test files are discovered correctly

- **WHEN** running `vitest` in frontend package
- **THEN** all `.test.tsx` files are discovered
- **AND** no `.ts` files are run as component tests
- **AND** test file pattern is `**/*.test.tsx`

### Requirement: Test Scripts

The frontend package MUST have test scripts in package.json.

#### Scenario: Tests run in watch mode

- **WHEN** running `pnpm run test:watch` in frontend package
- **THEN** vitest runs in watch mode
- **AND** tests re-run on file changes
- **AND** watch mode commands work correctly

#### Scenario: Tests run once (CI mode)

- **WHEN** running `pnpm run test` in frontend package
- **THEN** vitest runs all tests once
- **AND** results are displayed in console
- **AND** exit code reflects test status

#### Scenario: Tests are isolated

- **WHEN** running frontend tests
- **THEN** each test file runs independently
- **AND** no test state leaks between files
- **AND** tests can run in parallel

### Requirement: Async Testing

The frontend package MUST support testing async operations.

#### Scenario: Async components render correctly

- **WHEN** testing a component with async operations
- **THEN** async operations complete before assertions
- **AND** loading states can be tested
- **AND** resolved states can be tested

#### Scenario: Promises are handled in tests

- **WHEN** testing components that return promises
- **THEN** promises resolve before assertions
- **AND** promise rejections can be tested

### Requirement: Error Boundary Testing

The frontend package MUST support testing error boundaries.

#### Scenario: Error boundaries catch errors

- **WHEN** testing an error boundary with a failing child
- **THEN** error boundary catches the error
- **AND** fallback UI is rendered
- **AND** error is accessible in test

#### Scenario: Error boundary re-throws unexpected errors

- **WHEN** testing an error boundary with an unexpected error type
- **THEN** unexpected errors are re-thrown
- **AND** test fails appropriately

