import '@testing-library/jest-dom';

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
    };
  },
}));

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
    };
  },
  useSearchParams() {
    return new URLSearchParams();
  },
  usePathname() {
    return '/';
  },
}));

// Mock ResizeObserver
global.ResizeObserver = jest.fn().mockImplementation(() => ({
  observe: jest.fn(),
  unobserve: jest.fn(),
  disconnect: jest.fn(),
}));

// Mock window.matchMedia
Object.defineProperty(window, 'matchMedia', {
  writable: true,
  value: jest.fn().mockImplementation(query => ({
    matches: false,
    media: query,
    onchange: null,
    addListener: jest.fn(),
    removeListener: jest.fn(),
    addEventListener: jest.fn(),
    removeEventListener: jest.fn(),
    dispatchEvent: jest.fn(),
  })),
});

// Mock window.confirm
global.confirm = jest.fn(() => true);

// Comprehensive MUI mocking
jest.mock('@mui/material/useMediaQuery', () => jest.fn(() => false));
jest.mock('@mui/system/useMediaQuery', () => jest.fn(() => false));

// Mock useTheme to provide proper breakpoints
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
});

// Set timeout
jest.setTimeout(5000);

// Clean up after each test
afterEach(() => {
  jest.clearAllMocks();
  document.body.innerHTML = '';
});

beforeEach(() => {
  jest.clearAllMocks();
});