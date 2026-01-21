## 1. Root ESLint Migration

- [ ] 1.1 Create root `eslint.config.js` with TypeScript ESLint
- [ ] 1.2 Remove root `.eslintrc.json` file
- [ ] 1.3 Remove unused `@babel/eslint-parser`, `@babel/preset-env` from root `package.json`
- [ ] 1.4 Verify ESLint validation passes
- [ ] 1.5 Update README.md if build instructions reference old config

## 2. Server ESLint Migration

- [ ] 2.1 Create server `eslint.config.js` with typescript-eslint
- [ ] 2.2 Remove server `.eslintrc.json` file
- [ ] 2.3 Add `eslint` to server `package.json` if not present
- [ ] 2.4 Verify ESLint validation passes

## 3. Frontend ESLint Verification & Cleanup

- [ ] 3.1 Review frontend `eslint.config.js` to ensure consistency with root config
- [ ] 3.2 Verify frontend linting works with new config
- [ ] 3.3 Remove `frontend-webpack/.eslintrc.json` if no longer used
- [ ] 3.4 Update `.gitignore` if ESLint output is affected (unlikely)

## 4. Configuration Integration

- [ ] 4.1 Update `package.json` scripts to use new ESLint invocation (if different)
- [ ] 4.2 Verify all npm scripts pass linting check
- [ ] 4.3 Update documentation to reference new config location

## 5. Validation

- [ ] 5.1 Run full project lint check
- [ ] 5.2 Run strict validation with `eslint --format json`
- [ ] 5.3 Verify no lint errors introduced
- [ ] 5.4 Update `AGENTS.md` if new ESLint commands are added
