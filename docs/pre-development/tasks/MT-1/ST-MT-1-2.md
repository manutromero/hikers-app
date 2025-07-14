# Sub-Task 1.2: TypeScript and ESLint Configuration

### Objective
Configure TypeScript with strict mode and ESLint with Prettier for code quality and consistency across the mountain climber training app.

### Main Task Reference
**Parent Task**: [Task 1: Project Setup and Development Environment](../main-tasks-mountain-climber-training-app.md#task-1-project-setup-and-development-environment)
**Context**: This sub-task establishes the code quality foundation with TypeScript strict mode and comprehensive linting rules.

### Time Estimation
**Estimated Time**: 2.5 hours
**Complexity**: Medium
**Developer Type**: Full-Stack

### Dependencies
**Prerequisites**: 
- [ ] ST-MT-1-1 (Expo Project Initialization) completed
- [ ] Node.js 18+ installed
- [ ] npm or yarn package manager available

**Outputs Needed By**:
- ST-MT-1-3 (Hexagonal Architecture Setup)
- ST-MT-1-4 (State Management Configuration)

### Acceptance Criteria
- [ ] TypeScript configured with strict mode enabled
- [ ] ESLint configured with React Native and TypeScript rules
- [ ] Prettier configured for code formatting
- [ ] Pre-commit hooks configured with Husky
- [ ] VS Code settings configured for the project
- [ ] All existing code passes linting rules
- [ ] Type checking passes without errors
- [ ] Format on save works correctly

### Technical Implementation

**Architecture Context**:
This sub-task ensures code quality standards that will be applied across all hexagonal architecture layers (domain, application, infrastructure).

**Files to Create/Modify**:
```
mountain-climber-training-app/
├── tsconfig.json (modify)
├── .eslintrc.js (create)
├── .prettierrc (create)
├── .prettierignore (create)
├── .vscode/settings.json (create)
├── package.json (modify)
├── .husky/pre-commit (create)
└── .husky/_/husky.sh (create)
```

**Step-by-Step Implementation**:

1. **Install Required Dependencies**:
   ```bash
   npm install --save-dev @typescript-eslint/eslint-plugin @typescript-eslint/parser
   npm install --save-dev eslint eslint-plugin-react eslint-plugin-react-hooks
   npm install --save-dev eslint-plugin-react-native eslint-plugin-import
   npm install --save-dev prettier eslint-config-prettier eslint-plugin-prettier
   npm install --save-dev husky lint-staged
   ```

2. **Configure TypeScript (tsconfig.json)**:
   ```json
   {
     "extends": "expo/tsconfig.base",
     "compilerOptions": {
       "strict": true,
       "noImplicitAny": true,
       "strictNullChecks": true,
       "strictFunctionTypes": true,
       "strictBindCallApply": true,
       "strictPropertyInitialization": true,
       "noImplicitThis": true,
       "alwaysStrict": true,
       "noUnusedLocals": true,
       "noUnusedParameters": true,
       "exactOptionalPropertyTypes": true,
       "noImplicitReturns": true,
       "noFallthroughCasesInSwitch": true,
       "noUncheckedIndexedAccess": true,
       "noImplicitOverride": true,
       "allowUnusedLabels": false,
       "allowUnreachableCode": false,
       "baseUrl": ".",
       "paths": {
         "@/*": ["src/*"],
         "@/domain/*": ["src/domain/*"],
         "@/application/*": ["src/application/*"],
         "@/infrastructure/*": ["src/infrastructure/*"],
         "@/shared/*": ["src/shared/*"]
       },
       "types": ["react-native", "jest", "node"]
     },
     "include": [
       "**/*.ts",
       "**/*.tsx",
       ".expo/types/**/*.ts",
       "expo-env.d.ts"
     ],
     "exclude": [
       "node_modules",
       "babel.config.js",
       "metro.config.js",
       "jest.config.js"
     ]
   }
   ```

3. **Configure ESLint (.eslintrc.js)**:
   ```javascript
   module.exports = {
     root: true,
     extends: [
       'eslint:recommended',
       '@typescript-eslint/recommended',
       'plugin:react/recommended',
       'plugin:react-hooks/recommended',
       'plugin:react-native/all',
       'plugin:import/errors',
       'plugin:import/warnings',
       'plugin:import/typescript',
       'prettier'
     ],
     parser: '@typescript-eslint/parser',
     parserOptions: {
       ecmaFeatures: {
         jsx: true,
       },
       ecmaVersion: 2020,
       sourceType: 'module',
     },
     plugins: [
       '@typescript-eslint',
       'react',
       'react-hooks',
       'react-native',
       'import',
       'prettier'
     ],
     rules: {
       'prettier/prettier': 'error',
       '@typescript-eslint/no-unused-vars': 'error',
       '@typescript-eslint/explicit-function-return-type': 'off',
       '@typescript-eslint/explicit-module-boundary-types': 'off',
       '@typescript-eslint/no-explicit-any': 'warn',
       'react/react-in-jsx-scope': 'off',
       'react/prop-types': 'off',
       'react-native/no-unused-styles': 'error',
       'react-native/split-platform-components': 'error',
       'react-native/no-inline-styles': 'warn',
       'react-native/no-color-literals': 'warn',
       'import/order': [
         'error',
         {
           groups: [
             'builtin',
             'external',
             'internal',
             'parent',
             'sibling',
             'index'
           ],
           'newlines-between': 'always',
           alphabetize: {
             order: 'asc',
             caseInsensitive: true
           }
         }
       ],
       'import/no-unresolved': 'off',
       'import/named': 'off'
     },
     settings: {
       react: {
         version: 'detect',
       },
       'import/resolver': {
         typescript: {},
         node: {
           extensions: ['.js', '.jsx', '.ts', '.tsx']
         }
       }
     },
     env: {
       'react-native/react-native': true,
       es6: true,
       node: true,
       jest: true
     }
   };
   ```

4. **Configure Prettier (.prettierrc)**:
   ```json
   {
     "semi": true,
     "trailingComma": "es5",
     "singleQuote": true,
     "printWidth": 80,
     "tabWidth": 2,
     "useTabs": false,
     "bracketSpacing": true,
     "bracketSameLine": false,
     "arrowParens": "avoid",
     "endOfLine": "lf"
   }
   ```

5. **Configure Prettier Ignore (.prettierignore)**:
   ```
   node_modules/
   .expo/
   dist/
   build/
   *.md
   *.json
   *.lock
   .git/
   ```

6. **Configure VS Code Settings (.vscode/settings.json)**:
   ```json
   {
     "editor.formatOnSave": true,
     "editor.defaultFormatter": "esbenp.prettier-vscode",
     "editor.codeActionsOnSave": {
       "source.fixAll.eslint": true,
       "source.organizeImports": true
     },
     "typescript.preferences.importModuleSpecifier": "relative",
     "typescript.suggest.autoImports": true,
     "eslint.validate": [
       "javascript",
       "javascriptreact",
       "typescript",
       "typescriptreact"
     ],
     "files.associations": {
       "*.tsx": "typescriptreact"
     }
   }
   ```

7. **Configure Husky and Lint-staged**:
   ```bash
   npx husky install
   npx husky add .husky/pre-commit "npx lint-staged"
   ```

8. **Update package.json scripts**:
   ```json
   {
     "scripts": {
       "start": "expo start",
       "android": "expo start --android",
       "ios": "expo start --ios",
       "web": "expo start --web",
       "test": "jest",
       "lint": "eslint . --ext .ts,.tsx",
       "lint:fix": "eslint . --ext .ts,.tsx --fix",
       "type-check": "tsc --noEmit",
       "format": "prettier --write .",
       "format:check": "prettier --check .",
       "prepare": "husky install"
     },
     "lint-staged": {
       "*.{ts,tsx}": [
         "eslint --fix",
         "prettier --write"
       ],
       "*.{js,jsx,json,md}": [
         "prettier --write"
       ]
     }
   }
   ```

**Key Implementation Details**:
- **Design Patterns**: ESLint and Prettier configuration patterns
- **Error Handling**: Linting rules for error prevention
- **Data Validation**: TypeScript strict mode for type safety
- **Performance Considerations**: Import ordering for better tree-shaking

### Testing Requirements

**Unit Tests**:
- [ ] TypeScript compilation passes without errors
- [ ] ESLint runs without errors on existing code
- [ ] Prettier formatting works correctly

**Integration Tests**:
- [ ] Pre-commit hooks trigger correctly
- [ ] VS Code integration works properly
- [ ] Import resolution works with path aliases

**Manual Testing Steps**:
1. Run `npm run type-check` and verify no TypeScript errors
2. Run `npm run lint` and verify no ESLint errors
3. Run `npm run format` and verify code is formatted
4. Make a change and commit to verify pre-commit hooks work
5. Open VS Code and verify format on save works

### Code Quality Standards

**Code Requirements**:
- [ ] All code follows TypeScript strict mode
- [ ] All code passes ESLint rules
- [ ] All code is formatted with Prettier
- [ ] Import statements are properly ordered
- [ ] No unused variables or imports

**Security Requirements**:
- [ ] ESLint security rules enabled
- [ ] TypeScript strict mode prevents type-related vulnerabilities

### Definition of Done
- [ ] TypeScript strict mode configured and working
- [ ] ESLint configured with all necessary rules
- [ ] Prettier configured and working
- [ ] Pre-commit hooks configured and tested
- [ ] VS Code settings configured
- [ ] All existing code passes linting
- [ ] Type checking passes without errors

### Potential Challenges
**Known Risks**:
- ESLint and Prettier conflicts - Mitigation: Use eslint-config-prettier
- TypeScript strict mode breaking existing code - Mitigation: Gradual migration
- Import resolution issues - Mitigation: Proper path alias configuration

**Research Required**:
- Latest ESLint rules for React Native
- TypeScript strict mode best practices
- VS Code extension compatibility

### Additional Resources
**Reference Materials**:
- [TypeScript Strict Mode](https://www.typescriptlang.org/tsconfig#strict)
- [ESLint React Native Rules](https://github.com/Intellicode/eslint-plugin-react-native)
- [Prettier Configuration](https://prettier.io/docs/en/configuration.html)
- [Husky Documentation](https://typicode.github.io/husky/)

**Related Code**:
- [Expo TypeScript Configuration](https://docs.expo.dev/guides/typescript/)
- [React Native ESLint Configuration](https://github.com/facebook/react-native/tree/main/packages/eslint-config-react-native) 