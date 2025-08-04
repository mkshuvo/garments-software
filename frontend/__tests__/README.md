# Test Suite

This directory contains all tests for the frontend application, organized by feature and component type.

## Directory Structure

```
__tests__/
├── components/
│   ├── accounting/          # Accounting-related component tests
│   │   ├── CreditTransactionModal.test.tsx
│   │   └── DebitTransactionModal.test.tsx
│   ├── ui/                  # UI component tests
│   │   └── Modal.test.tsx
│   └── auth/                # Authentication component tests
├── hooks/                   # Custom hook tests
│   └── useModalForm.test.tsx
├── services/                # Service layer tests
└── utils/                   # Utility function tests
```

## Running Tests

### Quick Tests (Recommended)
```bash
# Run basic non-React tests (fastest)
npm run test:quick

# Run custom hooks tests
npm run test:hooks

# Run UI component tests
npm run test:ui
```

### Full Test Suite
```bash
# Run all tests with aggressive timeouts
npm test

# Run all tests with bail on first failure
npm run test:all
```

### Development Commands
```bash
# Watch mode for development
npm run test:watch

# Debug mode with verbose output
npm run test:debug

# Test specific components (may hang - use with caution)
npm run test:accounting
```

### Run Specific Test Files
```bash
# Run a specific test file
npm test -- CreditTransactionModal.test.tsx

# Run tests matching a pattern
npm test -- --testNamePattern="Modal"

# Run tests in a specific directory
npm test -- __tests__/components/accounting
```

## Test Configuration

- **Timeout**: 5 seconds per test to prevent hanging
- **Environment**: jsdom for React component testing
- **Mocks**: Comprehensive mocks for browser APIs, MUI components, and date pickers
- **Cleanup**: Aggressive cleanup between tests to prevent memory leaks

## Writing New Tests

### Component Tests
Place component tests in the appropriate subdirectory under `__tests__/components/`:

```typescript
import React from 'react';
import { render, screen, fireEvent } from '@testing-library/react';
import '@testing-library/jest-dom';
import { YourComponent } from '../../../src/components/path/YourComponent';

describe('YourComponent', () => {
  it('should render correctly', () => {
    render(<YourComponent />);
    expect(screen.getByText('Expected Text')).toBeInTheDocument();
  });
});
```

### Hook Tests
Place hook tests in `__tests__/hooks/`:

```typescript
import { renderHook, act } from '@testing-library/react';
import { useYourHook } from '../../src/hooks/useYourHook';

describe('useYourHook', () => {
  it('should return expected values', () => {
    const { result } = renderHook(() => useYourHook());
    expect(result.current.someValue).toBe('expected');
  });
});
```

## Best Practices

1. **Use fireEvent instead of userEvent** for form interactions to avoid timing issues
2. **Mock external dependencies** properly to prevent network calls
3. **Clean up after each test** using beforeEach/afterEach hooks
4. **Use descriptive test names** that explain what is being tested
5. **Group related tests** using describe blocks
6. **Test both happy path and error cases**

## Troubleshooting

### Common Issues

1. **Tests hanging**: Usually caused by unmocked async operations or infinite loops
2. **ResizeObserver errors**: Already mocked in jest.setup.js
3. **DatePicker issues**: Already mocked in jest.setup.js
4. **useMediaQuery errors**: Already mocked in jest.setup.js

### Debug Tips

1. Use `npm run test:debug` for verbose output
2. Add `console.log` statements in tests for debugging
3. Use `screen.debug()` to see the rendered DOM
4. Check jest.setup.js for available mocks