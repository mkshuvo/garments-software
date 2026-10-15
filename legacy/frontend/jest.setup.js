import '@testing-library/jest-dom'

// Mock Next.js router
jest.mock('next/router', () => ({
  useRouter() {
    return {
      route: '/',
      pathname: '/',
      query: {},
      asPath: '/',
      push: jest.fn(),
      pop: jest.fn(),
      reload: jest.fn(),
      back: jest.fn(),
      prefetch: jest.fn().mockResolvedValue(undefined),
      beforePopState: jest.fn(),
      events: {
        on: jest.fn(),
        off: jest.fn(),
        emit: jest.fn(),
      },
    }
  },
}))

// Mock Next.js navigation
jest.mock('next/navigation', () => ({
  useRouter() {
    return {
      push: jest.fn(),
      replace: jest.fn(),
      prefetch: jest.fn(),
      back: jest.fn(),
      forward: jest.fn(),
      refresh: jest.fn(),
    }
  },
  useSearchParams() {
    return new URLSearchParams()
  },
  usePathname() {
    return '/'
  },
}))

// Global test setup - Fix ResizeObserver mock
global.ResizeObserver = jest.fn().mockImplementation(() => ({
  observe: jest.fn(),
  unobserve: jest.fn(),
  disconnect: jest.fn(),
}))

// Also mock it as a class constructor
global.ResizeObserver = class ResizeObserver {
  observe() { }
  unobserve() { }
  disconnect() { }
}

// Mock window.matchMedia properly for MUI
Object.defineProperty(window, 'matchMedia', {
  writable: true,
  value: jest.fn().mockImplementation(query => ({
    matches: false,
    media: query,
    onchange: null,
    addListener: jest.fn(), // deprecated
    removeListener: jest.fn(), // deprecated
    addEventListener: jest.fn(),
    removeEventListener: jest.fn(),
    dispatchEvent: jest.fn(),
  })),
})

// Mock MUI's useMediaQuery hook with comprehensive implementation
const mockUseMediaQuery = jest.fn((query) => {
  // Handle different query types
  if (typeof query === 'string') {
    return false; // Default to desktop
  }
  if (typeof query === 'object' && query !== null) {
    // Handle theme breakpoint objects
    return false; // Default to desktop
  }
  return false;
});

// Mock the core useMediaQuery implementations
jest.mock('@mui/material/useMediaQuery', () => mockUseMediaQuery)
jest.mock('@mui/system/useMediaQuery', () => mockUseMediaQuery)

// Mock the internal useMediaQuery module that DatePicker uses
jest.mock('@mui/system/useMediaQuery/useMediaQuery', () => {
  // Create a mock that provides the expected interface
  const mockImpl = jest.fn(() => false);
  return {
    __esModule: true,
    default: mockImpl,
    useMediaQuery: mockImpl
  };
});

// Mock the entire system module to catch any other imports
jest.mock('@mui/system', () => {
  const actual = jest.requireActual('@mui/system');
  return {
    ...actual,
    useMediaQuery: mockUseMediaQuery
  };
});

// Mock the specific internal module that's causing the issue
jest.doMock('@mui/system/useMediaQuery/useMediaQuery.js', () => {
  const mockImpl = jest.fn(() => false);
  return {
    __esModule: true,
    default: mockImpl
  };
});

// Mock the theme's useTheme hook to provide proper breakpoints
jest.mock('@mui/material/styles', () => {
  const originalModule = jest.requireActual('@mui/material/styles');
  return {
    ...originalModule,
    useTheme: jest.fn(() => ({
      breakpoints: {
        up: jest.fn(() => '@media (min-width:600px)'),
        down: jest.fn(() => '@media (max-width:599.95px)'),
        between: jest.fn(() => '@media (min-width:600px) and (max-width:959.95px)'),
        only: jest.fn(() => '@media (min-width:600px) and (max-width:959.95px)'),
        values: {
          xs: 0,
          sm: 600,
          md: 960,
          lg: 1280,
          xl: 1920,
        },
      },
      palette: {
        primary: { main: '#1976d2' },
        secondary: { main: '#dc004e' },
        error: { main: '#f44336' },
        warning: { main: '#ff9800' },
        info: { main: '#2196f3' },
        success: { main: '#4caf50' },
      },
      spacing: jest.fn((factor) => `${8 * factor}px`),
      typography: {
        fontFamily: '"Roboto", "Helvetica", "Arial", sans-serif',
      },
    })),
  };
})

// Mock window.confirm to prevent hanging
global.confirm = jest.fn(() => true)

// Mock DatePicker components that cause hanging
jest.mock('@mui/x-date-pickers/DatePicker', () => ({
  DatePicker: ({ label, value, onChange, slotProps, ...props }) => {
    const handleChange = (e) => {
      if (onChange) {
        const date = new Date(e.target.value);
        onChange(date);
      }
    };
    return (
      <input
        type="date"
        aria-label={label}
        value={value ? value.toISOString().split('T')[0] : ''}
        onChange={handleChange}
        data-testid="date-picker"
        {...(slotProps?.textField || {})}
        {...props}
      />
    );
  }
}))

// Mock the entire date pickers module to prevent any deep imports
jest.mock('@mui/x-date-pickers', () => ({
  DatePicker: ({ label, value, onChange, slotProps, ...props }) => {
    const handleChange = (e) => {
      if (onChange) {
        const date = new Date(e.target.value);
        onChange(date);
      }
    };
    return (
      <input
        type="date"
        aria-label={label}
        value={value ? value.toISOString().split('T')[0] : ''}
        onChange={handleChange}
        data-testid="date-picker"
        {...(slotProps?.textField || {})}
        {...props}
      />
    );
  },
  LocalizationProvider: ({ children }) => children,
  AdapterDateFns: jest.fn()
}))

// Mock LocalizationProvider
jest.mock('@mui/x-date-pickers/LocalizationProvider', () => ({
  LocalizationProvider: ({ children }) => children
}))

// Mock AdapterDateFns
jest.mock('@mui/x-date-pickers/AdapterDateFns', () => ({
  AdapterDateFns: jest.fn()
}))

// Mock console methods to reduce noise
global.console = {
  ...console,
  log: jest.fn(),
  debug: jest.fn(),
  info: jest.fn(),
  warn: jest.fn(),
  error: jest.fn(),
}

// Set very aggressive timeout for all async operations
jest.setTimeout(2000)

// Override waitFor default timeout globally
import { configure } from '@testing-library/react'
configure({
  testIdAttribute: 'data-testid',
  asyncUtilTimeout: 1000, // 1 second max for waitFor
  getElementError: (message, container) => {
    const error = new Error(message)
    error.name = 'TestingLibraryElementError'
    error.stack = null
    return error
  }
})

// Mock all timers to prevent hanging
jest.useFakeTimers()

// Clean up aggressively after each test
afterEach(() => {
  // Clear all timers
  jest.clearAllTimers()
  jest.runOnlyPendingTimers()
  jest.useRealTimers()
  jest.useFakeTimers()
  // Clear all mocks
  jest.clearAllMocks()
  jest.resetAllMocks()
  // Clean up DOM
  document.body.innerHTML = ''
  // Force garbage collection if available
  if (global.gc) {
    global.gc()
  }
})

// Clean up before each test too
beforeEach(() => {
  jest.clearAllMocks()
  jest.clearAllTimers()
})