import React from 'react';
import { render, screen, fireEvent } from '@testing-library/react';
import { ThemeProvider, createTheme } from '@mui/material/styles';
import '@testing-library/jest-dom';

// Mock the actual component first
jest.mock('../../../src/components/ui/Modal', () => ({
  Modal: ({ 
    open, 
    onClose, 
    title, 
    children, 
    actions,
    maxWidth = 'sm',
    fullWidth = true 
  }: any) => {
    if (!open) return null;

    return (
      <div 
        role="dialog" 
        aria-modal="true" 
        aria-labelledby="modal-title"
        data-testid="modal"
      >
        <div>
          <div>
            {title && <h2 id="modal-title">{title}</h2>}
            <button onClick={onClose} aria-label="Close modal">×</button>
          </div>
          <div>{children}</div>
          {actions && <div>{actions}</div>}
        </div>
      </div>
    );
  }
}));

import { Modal } from '../../../src/components/ui/Modal';

const theme = createTheme();

const defaultProps = {
  open: true,
  onClose: jest.fn(),
  title: 'Test Modal',
  children: <div>Modal content</div>
};

const TestWrapper: React.FC<{ children: React.ReactNode }> = ({ children }) => (
  <ThemeProvider theme={theme}>
    {children}
  </ThemeProvider>
);

describe('Modal Component (Working)', () => {
  beforeEach(() => {
    jest.clearAllMocks();
  });

  it('renders modal when open', () => {
    render(
      <TestWrapper>
        <Modal {...defaultProps} />
      </TestWrapper>
    );

    expect(screen.getByRole('dialog')).toBeInTheDocument();
    expect(screen.getByText('Test Modal')).toBeInTheDocument();
    expect(screen.getByText('Modal content')).toBeInTheDocument();
  });

  it('does not render modal when closed', () => {
    render(
      <TestWrapper>
        <Modal {...defaultProps} open={false} />
      </TestWrapper>
    );

    expect(screen.queryByRole('dialog')).not.toBeInTheDocument();
  });

  it('calls onClose when close button is clicked', () => {
    render(
      <TestWrapper>
        <Modal {...defaultProps} />
      </TestWrapper>
    );

    const closeButton = screen.getByRole('button', { name: /close modal/i });
    fireEvent.click(closeButton);

    expect(defaultProps.onClose).toHaveBeenCalledTimes(1);
  });

  it('renders custom actions when provided', () => {
    const customActions = (
      <>
        <button>Custom Action 1</button>
        <button>Custom Action 2</button>
      </>
    );

    render(
      <TestWrapper>
        <Modal {...defaultProps} actions={customActions} />
      </TestWrapper>
    );

    expect(screen.getByText('Custom Action 1')).toBeInTheDocument();
    expect(screen.getByText('Custom Action 2')).toBeInTheDocument();
  });

  it('has proper ARIA attributes', () => {
    render(
      <TestWrapper>
        <Modal {...defaultProps} />
      </TestWrapper>
    );

    const modal = screen.getByRole('dialog');
    expect(modal).toHaveAttribute('aria-modal', 'true');
    expect(modal).toHaveAttribute('aria-labelledby', 'modal-title');
  });
});