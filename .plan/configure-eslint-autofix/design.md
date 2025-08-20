# ESLint Autofix Configuration Design

## Architecture Overview

This design implements a comprehensive ESLint autofix system for the garments software project, building upon the existing Next.js configuration to provide automated code quality enforcement, consistent formatting, and enhanced developer productivity.

### System Components

```
┌─────────────────────────────────────────────────────────────┐
│                    ESLint Autofix System                   │
├─────────────────────────────────────────────────────────────┤
│  ┌─────────────────┐  ┌─────────────────┐  ┌─────────────────┐ │
│  │   Core Config   │  │  VS Code Setup  │  │   CI/CD Hooks   │ │
│  │                 │  │                 │  │                 │ │
│  │ • eslint.config │  │ • settings.json │  │ • pre-commit    │ │
│  │ • Rule sets     │  │ • extensions    │  │ • lint-staged   │ │
│  │ • Plugins       │  │ • autofix setup │  │ • build checks  │ │
│  └─────────────────┘  └─────────────────┘  └─────────────────┘ │
├─────────────────────────────────────────────────────────────┤
│  ┌─────────────────┐  ┌─────────────────┐  ┌─────────────────┐ │
│  │  Rule Categories │  │   Performance   │  │   Integration   │ │
│  │                 │  │                 │  │                 │ │
│  │ • Code Quality  │  │ • Caching       │  │ • TypeScript    │ │
│  │ • Formatting    │  │ • Incremental   │  │ • Next.js       │ │
│  │ • Imports       │  │ • Parallel      │  │ • Jest          │ │
│  │ • Accessibility │  │ • Selective     │  │ • Prettier      │ │
│  └─────────────────┘  └─────────────────┘  └─────────────────┘ │
└─────────────────────────────────────────────────────────────┘
```

## Enhanced ESLint Configuration

### Core Configuration Structure

**File**: `frontend/eslint.config.mjs`

```javascript
import { dirname } from "path";
import { fileURLToPath } from "url";
import { FlatCompat } from "@eslint/eslintrc";
import js from "@eslint/js";
import typescript from "@typescript-eslint/eslint-plugin";
import typescriptParser from "@typescript-eslint/parser";
import react from "eslint-plugin-react";
import reactHooks from "eslint-plugin-react-hooks";
import jsxA11y from "eslint-plugin-jsx-a11y";
import importPlugin from "eslint-plugin-import";
import simpleImportSort from "eslint-plugin-simple-import-sort";
import unusedImports from "eslint-plugin-unused-imports";
import prettier from "eslint-config-prettier";

const __filename = fileURLToPath(import.meta.url);
const __dirname = dirname(__filename);

const compat = new FlatCompat({
  baseDirectory: __dirname,
});

const eslintConfig = [
  // Base configurations
  js.configs.recommended,
  ...compat.extends("next/core-web-vitals", "next/typescript"),
  prettier, // Must be last to override conflicting rules
  
  // Global settings
  {
    languageOptions: {
      parser: typescriptParser,
      parserOptions: {
        ecmaVersion: "latest",
        sourceType: "module",
        ecmaFeatures: {
          jsx: true,
        },
      },
      globals: {
        React: "readonly",
        JSX: "readonly",
      },
    },
    
    plugins: {
      "@typescript-eslint": typescript,
      react,
      "react-hooks": reactHooks,
      "jsx-a11y": jsxA11y,
      import: importPlugin,
      "simple-import-sort": simpleImportSort,
      "unused-imports": unusedImports,
    },
    
    settings: {
      react: {
        version: "detect",
      },
      "import/resolver": {
        typescript: {
          alwaysTryTypes: true,
          project: "./tsconfig.json",
        },
        node: {
          extensions: [".js", ".jsx", ".ts", ".tsx"],
        },
      },
    },
  },
  
  // Main configuration
  {
    files: ["**/*.{js,jsx,ts,tsx}"],
    ignores: [
      ".next/**/*",
      "out/**/*",
      "build/**/*",
      "dist/**/*",
      "node_modules/**/*",
      "*.config.js",
      "*.config.mjs",
      "*.config.ts",
      "coverage/**/*",
      ".swc/**/*",
    ],
    
    rules: {
      // TypeScript Rules (with autofix)
      "@typescript-eslint/no-unused-vars": [
        "error",
        {
          argsIgnorePattern: "^_",
          varsIgnorePattern: "^_",
          caughtErrorsIgnorePattern: "^_",
        },
      ],
      "@typescript-eslint/no-explicit-any": "warn",
      "@typescript-eslint/prefer-const": "error",
      "@typescript-eslint/no-inferrable-types": "error",
      "@typescript-eslint/array-type": ["error", { default: "array" }],
      "@typescript-eslint/consistent-type-definitions": ["error", "interface"],
      "@typescript-eslint/prefer-nullish-coalescing": "error",
      "@typescript-eslint/prefer-optional-chain": "error",
      
      // Import Rules (with autofix)
      "simple-import-sort/imports": [
        "error",
        {
          groups: [
            // React and Next.js imports first
            ["^react", "^next"],
            // External packages
            ["^@?\\w"],
            // Internal packages
            ["^(@|@company|@ui|components|utils|hooks|lib|types)(/.*|$)"],
            // Parent imports
            ["^\\.\\.(?!/?$)", "^\\.\\./?$"],
            // Same-folder imports
            ["^\\./(?=.*/)(?!/?$)", "^\\.(?!/?$)", "^\\./?$"],
            // Style imports
            ["^.+\\.s?css$"],
          ],
        },
      ],
      "simple-import-sort/exports": "error",
      "unused-imports/no-unused-imports": "error",
      "unused-imports/no-unused-vars": [
        "warn",
        {
          vars: "all",
          varsIgnorePattern: "^_",
          args: "after-used",
          argsIgnorePattern: "^_",
        },
      ],
      
      // React Rules (with autofix)
      "react/jsx-uses-react": "off", // Not needed in React 17+
      "react/react-in-jsx-scope": "off", // Not needed in React 17+
      "react/prop-types": "off", // Using TypeScript
      "react/jsx-boolean-value": ["error", "never"],
      "react/jsx-curly-brace-presence": [
        "error",
        { props: "never", children: "never" },
      ],
      "react/jsx-fragments": ["error", "syntax"],
      "react/jsx-no-useless-fragment": "error",
      "react/self-closing-comp": "error",
      "react/jsx-sort-props": [
        "error",
        {
          callbacksLast: true,
          shorthandFirst: true,
          multiline: "last",
          reservedFirst: true,
        },
      ],
      
      // React Hooks Rules
      "react-hooks/rules-of-hooks": "error",
      "react-hooks/exhaustive-deps": "warn",
      
      // Accessibility Rules (with autofix where possible)
      "jsx-a11y/alt-text": "error",
      "jsx-a11y/anchor-has-content": "error",
      "jsx-a11y/anchor-is-valid": "error",
      "jsx-a11y/aria-props": "error",
      "jsx-a11y/aria-proptypes": "error",
      "jsx-a11y/aria-unsupported-elements": "error",
      "jsx-a11y/click-events-have-key-events": "error",
      "jsx-a11y/heading-has-content": "error",
      "jsx-a11y/img-redundant-alt": "error",
      "jsx-a11y/no-redundant-roles": "error",
      
      // General Code Quality Rules (with autofix)
      "prefer-const": "error",
      "no-var": "error",
      "object-shorthand": "error",
      "prefer-arrow-callback": "error",
      "prefer-template": "error",
      "quote-props": ["error", "as-needed"],
      "no-console": ["warn", { allow: ["warn", "error"] }],
      "no-debugger": "error",
      "no-alert": "error",
      "no-duplicate-imports": "error",
      
      // Formatting Rules (handled by Prettier, but kept for safety)
      "semi": ["error", "always"],
      "quotes": ["error", "double", { avoidEscape: true }],
      "comma-dangle": ["error", "always-multiline"],
    },
  },
  
  // Test files configuration
  {
    files: ["**/__tests__/**/*", "**/*.test.*", "**/*.spec.*"],
    rules: {
      "no-console": "off",
      "@typescript-eslint/no-explicit-any": "off",
    },
  },
];

export default eslintConfig;
```

### Package.json Scripts Enhancement

```json
{
  "scripts": {
    "lint": "next lint",
    "lint:fix": "next lint --fix",
    "lint:check": "next lint --quiet",
    "lint:cache": "next lint --cache",
    "lint:staged": "lint-staged",
    "lint:ci": "next lint --max-warnings 0",
    "format": "prettier --write \"src/**/*.{js,jsx,ts,tsx,json,css,md}\"",
    "format:check": "prettier --check \"src/**/*.{js,jsx,ts,tsx,json,css,md}\"",
    "code-quality": "npm run lint:fix && npm run format",
    "pre-commit": "lint-staged"
  }
}
```

## VS Code Integration

### Workspace Settings

**File**: `frontend/.vscode/settings.json`

```json
{
  "editor.formatOnSave": true,
  "editor.codeActionsOnSave": {
    "source.fixAll.eslint": "explicit",
    "source.organizeImports": "never",
    "source.fixAll": "explicit"
  },
  "editor.defaultFormatter": "esbenp.prettier-vscode",
  "eslint.validate": [
    "javascript",
    "javascriptreact",
    "typescript",
    "typescriptreact"
  ],
  "eslint.format.enable": true,
  "eslint.lintTask.enable": true,
  "eslint.alwaysShowStatus": true,
  "eslint.workingDirectories": ["frontend"],
  "typescript.preferences.includePackageJsonAutoImports": "on",
  "typescript.suggest.autoImports": true,
  "typescript.updateImportsOnFileMove.enabled": "always",
  "files.associations": {
    "*.tsx": "typescriptreact",
    "*.ts": "typescript"
  },
  "[typescript]": {
    "editor.defaultFormatter": "esbenp.prettier-vscode",
    "editor.codeActionsOnSave": {
      "source.fixAll.eslint": "explicit"
    }
  },
  "[typescriptreact]": {
    "editor.defaultFormatter": "esbenp.prettier-vscode",
    "editor.codeActionsOnSave": {
      "source.fixAll.eslint": "explicit"
    }
  },
  "[javascript]": {
    "editor.defaultFormatter": "esbenp.prettier-vscode",
    "editor.codeActionsOnSave": {
      "source.fixAll.eslint": "explicit"
    }
  },
  "[javascriptreact]": {
    "editor.defaultFormatter": "esbenp.prettier-vscode",
    "editor.codeActionsOnSave": {
      "source.fixAll.eslint": "explicit"
    }
  }
}
```

### Extensions Recommendations

**File**: `frontend/.vscode/extensions.json`

```json
{
  "recommendations": [
    "ms-vscode.vscode-eslint",
    "esbenp.prettier-vscode",
    "bradlc.vscode-tailwindcss",
    "ms-vscode.vscode-typescript-next",
    "formulahendry.auto-rename-tag",
    "christian-kohler.path-intellisense",
    "ms-vscode.vscode-json"
  ],
  "unwantedRecommendations": [
    "ms-vscode.vscode-typescript"
  ]
}
```

## CI/CD Integration

### Pre-commit Hooks Setup

**File**: `frontend/.lintstagedrc.json`

```json
{
  "*.{js,jsx,ts,tsx}": [
    "eslint --fix",
    "prettier --write"
  ],
  "*.{json,css,md}": [
    "prettier --write"
  ]
}
```

**File**: `frontend/.huskyrc.json`

```json
{
  "hooks": {
    "pre-commit": "cd frontend && lint-staged",
    "pre-push": "cd frontend && npm run lint:ci && npm run type-check"
  }
}
```

### GitHub Actions Workflow

**File**: `.github/workflows/code-quality.yml`

```yaml
name: Code Quality

on:
  pull_request:
    branches: [main, develop]
    paths: ['frontend/**']
  push:
    branches: [main, develop]
    paths: ['frontend/**']

jobs:
  lint-and-format:
    runs-on: ubuntu-latest
    
    steps:
      - name: Checkout code
        uses: actions/checkout@v4
        
      - name: Setup Node.js
        uses: actions/setup-node@v4
        with:
          node-version: '20'
          cache: 'npm'
          cache-dependency-path: 'frontend/package-lock.json'
          
      - name: Install dependencies
        working-directory: ./frontend
        run: npm ci
        
      - name: Run ESLint
        working-directory: ./frontend
        run: npm run lint:ci
        
      - name: Check Prettier formatting
        working-directory: ./frontend
        run: npm run format:check
        
      - name: Type check
        working-directory: ./frontend
        run: npm run type-check
        
      - name: Run tests
        working-directory: ./frontend
        run: npm test
```

## Prettier Integration

### Prettier Configuration

**File**: `frontend/.prettierrc.json`

```json
{
  "semi": true,
  "trailingComma": "all",
  "singleQuote": false,
  "printWidth": 80,
  "tabWidth": 2,
  "useTabs": false,
  "bracketSpacing": true,
  "bracketSameLine": false,
  "arrowParens": "avoid",
  "endOfLine": "lf",
  "jsxSingleQuote": false,
  "quoteProps": "as-needed",
  "proseWrap": "preserve",
  "htmlWhitespaceSensitivity": "css",
  "embeddedLanguageFormatting": "auto"
}
```

**File**: `frontend/.prettierignore`

```
.next
out
build
dist
node_modules
coverage
*.config.js
*.config.mjs
*.config.ts
.swc
public
```

## Performance Optimization

### Caching Strategy

```javascript
// In eslint.config.mjs
export default [
  {
    // Enable caching for better performance
    cache: true,
    cacheLocation: '.eslintcache',
    
    // Optimize for large codebases
    reportUnusedDisableDirectives: true,
    
    // Parallel processing
    parallel: true,
  },
  // ... rest of configuration
];
```

### Incremental Linting

```json
// In package.json
{
  "scripts": {
    "lint:changed": "eslint $(git diff --name-only --diff-filter=ACMR HEAD | grep -E '\\.(js|jsx|ts|tsx)$' | xargs)",
    "lint:staged-files": "eslint --cache --fix"
  }
}
```

## Error Handling Strategy

### Rule Severity Levels

```javascript
// Error Classification
const ruleConfig = {
  // Critical issues that break functionality
  errors: [
    "@typescript-eslint/no-unused-vars",
    "react-hooks/rules-of-hooks",
    "jsx-a11y/aria-props",
    "no-debugger",
    "no-alert"
  ],
  
  // Issues that should be fixed but don't break functionality
  warnings: [
    "@typescript-eslint/no-explicit-any",
    "react-hooks/exhaustive-deps",
    "no-console",
    "jsx-a11y/click-events-have-key-events"
  ],
  
  // Style and formatting issues (auto-fixable)
  autofix: [
    "simple-import-sort/imports",
    "unused-imports/no-unused-imports",
    "react/jsx-boolean-value",
    "prefer-const",
    "object-shorthand"
  ]
};
```

### Graceful Degradation

```javascript
// Fallback configuration for legacy code
const legacyOverrides = {
  files: ["src/legacy/**/*"],
  rules: {
    "@typescript-eslint/no-explicit-any": "off",
    "react-hooks/exhaustive-deps": "off",
    "jsx-a11y/click-events-have-key-events": "off"
  }
};
```

## Security Measures

### Security-focused Rules

```javascript
const securityRules = {
  "no-eval": "error",
  "no-implied-eval": "error",
  "no-new-func": "error",
  "no-script-url": "error",
  "jsx-a11y/anchor-is-valid": "error",
  "react/jsx-no-script-url": "error",
  "react/jsx-no-target-blank": "error"
};
```

### Dependency Security

```json
// In package.json
{
  "scripts": {
    "security-audit": "npm audit",
    "security-fix": "npm audit fix",
    "lint-security": "eslint --ext .js,.jsx,.ts,.tsx src/ --config .eslintrc.security.js"
  }
}
```

## Monitoring and Metrics

### Performance Tracking

```javascript
// ESLint performance monitoring
const performanceConfig = {
  reportUnusedDisableDirectives: true,
  stats: true,
  timing: true
};
```

### Quality Metrics

```json
// Metrics collection script
{
  "scripts": {
    "metrics": "eslint src/ --format json --output-file eslint-report.json",
    "metrics-summary": "node scripts/eslint-metrics.js"
  }
}
```

## Deployment Strategy

### Rollout Plan

1. **Phase 1**: Install dependencies and basic configuration
2. **Phase 2**: Configure VS Code settings and extensions
3. **Phase 3**: Implement pre-commit hooks
4. **Phase 4**: Add CI/CD integration
5. **Phase 5**: Team training and documentation

### Rollback Strategy

```javascript
// Minimal fallback configuration
const fallbackConfig = [
  ...compat.extends("next/core-web-vitals", "next/typescript"),
  {
    rules: {
      "@typescript-eslint/no-explicit-any": "warn",
      "@typescript-eslint/no-unused-vars": "warn",
      "react/no-unescaped-entities": "warn",
      "react-hooks/exhaustive-deps": "warn"
    }
  }
];
```

## Testing Strategy

### Configuration Testing

```javascript
// Test ESLint configuration
const testConfig = {
  files: ["**/__tests__/**/*", "**/*.test.*"],
  rules: {
    "no-console": "off",
    "@typescript-eslint/no-explicit-any": "off",
    "react-hooks/exhaustive-deps": "off"
  }
};
```

### Integration Testing

```json
{
  "scripts": {
    "test:lint-config": "eslint --print-config src/index.tsx",
    "test:autofix": "eslint --fix-dry-run src/**/*.{ts,tsx}",
    "test:performance": "time npm run lint"
  }
}
```

This comprehensive design provides a robust, scalable, and maintainable ESLint autofix system that enhances code quality while maintaining developer productivity and team consistency.