## ADDED Requirements

### Requirement: ESLint Flat Configuration

The project MUST use the modern flat configuration format (`eslint.config.js`) instead of legacy `.eslintrc.json` files.

#### Scenario: ESLint config file exists and is valid

- **WHEN** a user runs `eslint --version` or any linting command
- **THEN** ESLint uses the new `eslint.config.js` format without errors

### Requirement: TypeScript Support in Root ESLint

The root ESLint configuration MUST use `typescript-eslint` instead of `@babel/eslint-parser` for improved TypeScript support and performance.

#### Scenario: TypeScript files are linted without parser errors

- **WHEN** running ESLint on TypeScript project files
- **THEN** TypeScript syntax is properly parsed without Babel dependencies

### Requirement: TypeScript Support in Server ESLint

The server ESLint configuration MUST use `typescript-eslint` to support Node.js TypeScript files.

#### Scenario: Server TypeScript files are validated

- **WHEN** running ESLint on server TypeScript files
- **THEN** server code passes linting checks with TypeScript support

### Requirement: Legacy Configuration Removal

The project MUST remove all legacy `.eslintrc.json` files that are no longer in use.

#### Scenario: Legacy config files are absent

- **WHEN** checking for ESLint configuration files
- **THEN** only `eslint.config.js` files exist in the project root

### Requirement: Configuration Consistency

ESLint configurations across all packages MUST follow consistent patterns and conventions.

#### Scenario: Code is linted uniformly

- **WHEN** linting code in root, frontend, or server packages
- **THEN** all packages apply the same linting rules and formatting standards
