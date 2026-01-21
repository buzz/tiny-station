# Change: Migrate to Modern ESLint Config Format

## Why

The project currently uses deprecated ESLint configuration formats across multiple packages:

- Root uses `.eslintrc.json` with `@babel/eslint-parser` (legacy)
- Server uses `.eslintrc.json` with minimal configuration
- Frontend webpack directory still has a legacy `.eslintrc.json` for webpack build

The new `eslint.config.js` flat configuration format is:

- More maintainable and readable
- Built-in support for TypeScript without extra parser plugins
- Better performance and validation
- Aligns with modern Node.js/JavaScript tooling standards

## What Changes

- Migrate root `.eslintrc.json` to `eslint.config.js` with TypeScript ESLint
- Migrate server `.eslintrc.json` to `eslint.config.js` using typescript-eslint
- Remove legacy `frontend-webpack/.eslintrc.json` (already using Vite)
- Standardize ESLint configuration patterns across packages
- Remove `@babel/eslint-parser` and related dependencies from root
- Update `package.json` scripts to use new ESLint commands if needed

## Impact

- Affected specs: Code Quality
- Affected code:
  - Root: `.eslintrc.json` → `eslint.config.js`, `package.json`
  - Frontend: Already migrated (`eslint.config.js`) - verify consistency
  - Server: `.eslintrc.json` → `eslint.config.js`, `package.json`
  - Cleanup: Remove `frontend-webpack/.eslintrc.json` and related config files
- Breaking Changes: None (ESLint will be configured the same way, just using new syntax)
