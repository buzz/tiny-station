# add-vitest-testing-infrastructure Change Proposal

## Summary

Introduce a robust testing infrastructure using **Vitest** across all packages in the monorepo (common, server, frontend) to enable unit and integration testing with consistent patterns and tooling.

## Problem Statement

Currently, the project has no testing infrastructure:

- No test runner configured
- No test files exist
- No testing dependencies installed
- Code quality relies solely on linting and type checking

This creates risks for:

- Regression bugs going undetected
- Difficulty refactoring with confidence
- No automated verification of behavior
- Poor test coverage for business logic

## Proposed Solution

Implement a comprehensive Vitest-based testing infrastructure with:

1. **Root Configuration**: Shared Vitest configuration patterns and workspace-level test scripts
2. **packages/common**: Minimal setup for schema validation tests
3. **packages/server**: Unit and integration tests with mocked Redis and Socket.IO
4. **packages/frontend**: React component tests with @testing-library/react and jsdom environment

## Scope

### In Scope

- Install and configure Vitest in each package
- Set up path alias resolution for monorepo imports
- Create package-specific vitest.config.ts files
- Add test scripts to package.json files
- Write sample tests demonstrating patterns
- Configure mocking for external dependencies (Redis, Socket.IO)
- Configure jsdom for frontend component testing

### Out of Scope

- E2E testing (Cypress/Playwright)
- Test database seeding
- Coverage reporting thresholds
- CI/CD pipeline integration
- Snapshot testing for frontend

## Impact Analysis

### Benefits

- Automated verification of code behavior
- Confidence in refactoring and feature development
- Early detection of regressions
- Documentation through test cases
- Consistent testing patterns across packages

### Risks

- Initial setup complexity
- Learning curve for team members
- Maintenance overhead for test files
- Potential performance impact on dev workflow (mitigated by Vitest's speed)

### Rollback Plan

The changes are additive only:

- Remove vitest-related dependencies
- Remove test files (\*.test.ts)
- Remove test scripts from package.json
- No production code changes

## Stakeholders

- **Developer Experience**: Testing patterns and tooling
- **Quality**: Automated verification of behavior
- **Maintenance**: Long-term test maintenance

## Timeline

**Phase 1 - Infrastructure Setup** (Est. 2-3 days)

- Root configuration and dependency installation
- Path alias resolution setup
- Common package test setup

**Phase 2 - Server Testing** (Est. 2-3 days)

- Unit test infrastructure
- Integration test infrastructure
- Mock patterns for Redis and Socket.IO

**Phase 3 - Frontend Testing** (Est. 2-3 days)

- Component testing setup
- jsdom environment configuration
- Testing patterns for React components

## Dependencies

- Vitest (test runner)
- @testing-library/react (React testing)
- @testing-library/user-event (user interaction simulation)
- happy-dom or jsdom (DOM environment)
- vite-tsconfig-paths (path alias resolution)
- msw (Mock Service Worker) - optional for API mocking

## Open Questions

1. Should we use happy-dom or jsdom for frontend testing? (jsdom is more comprehensive, happy-dom is faster)
2. What coverage threshold should we target initially? (recommend 0% for start, gradually increase)
3. Should we configure a root vitest.config.ts with project inheritance or per-package configs?
4. Should we use TypeScript with Vitest or keep test files as .js?
