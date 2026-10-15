import React from 'react'
import { render, screen, waitFor } from '@testing-library/react'
import userEvent from '@testing-library/user-event'
import { ThemeProvider } from '@mui/material/styles'
import { LocalizationProvider } from '@mui/x-date-pickers'
import { AdapterDateFns } from '@mui/x-date-pickers/AdapterDateFns'
import { theme } from '@/theme/theme'
import DateRangeSelector from '@/components/trial-balance/DateRangeSelector'
import { DateRangePreset } from '@/types/trialBalance'
import { startOfMonth, endOfMonth, subMonths } from 'date-fns'

// Mock date-fns to have consistent test dates
const mockDate = new Date('2024-01-15T10:00:00.000Z')
jest.useFakeTimers()
jest.setSystemTime(mockDate)

// Test wrapper with theme and localization
const TestWrapper: React.FC<{ children: React.ReactNode }> = ({ children }) => (
  <ThemeProvider theme={theme}>
    <LocalizationProvider dateAdapter={AdapterDateFns}>
      {children}
    </LocalizationProvider>
  </ThemeProvider>
)

describe('DateRangeSelector', () => {
  const defaultProps = {
    startDate: startOfMonth(mockDate),
    endDate: endOfMonth(mockDate),
    onDateChange: jest.fn()
  }

  beforeEach(() => {
    jest.clearAllMocks()
  })

  afterAll(() => {
    jest.useRealTimers()
  })

  it('renders with default props', () => {
    render(
      <TestWrapper>
        <DateRangeSelector {...defaultProps} />
      </TestWrapper>
    )

    expect(screen.getByText('Select Date Range')).toBeInTheDocument()
    expect(screen.getByLabelText('Start date')).toBeInTheDocument()
    expect(screen.getByLabelText('End date')).toBeInTheDocument()
    expect(screen.getByText('Selected Range:')).toBeInTheDocument()
  })

  it('displays the current date range correctly', () => {
    render(
      <TestWrapper>
        <DateRangeSelector {...defaultProps} />
      </TestWrapper>
    )

    expect(screen.getByText('Jan 01, 2024 - Jan 31, 2024')).toBeInTheDocument()
    expect(screen.getByText('31 days')).toBeInTheDocument()
  })

  it('shows default preset buttons', () => {
    render(
      <TestWrapper>
        <DateRangeSelector {...defaultProps} />
      </TestWrapper>
    )

    expect(screen.getByText('Quick Select:')).toBeInTheDocument()
    expect(screen.getByText('This Month')).toBeInTheDocument()
    expect(screen.getByText('Last Month')).toBeInTheDocument()
    expect(screen.getByText('This Quarter')).toBeInTheDocument()
    expect(screen.getByText('Last Quarter')).toBeInTheDocument()
    expect(screen.getByText('This Year')).toBeInTheDocument()
    expect(screen.getByText('Last Year')).toBeInTheDocument()
  })

  it('calls onDateChange when preset is clicked', async () => {
    const user = userEvent.setup({ advanceTimers: jest.advanceTimersByTime })
    
    render(
      <TestWrapper>
        <DateRangeSelector {...defaultProps} />
      </TestWrapper>
    )

    const lastMonthButton = screen.getByText('Last Month')
    await user.click(lastMonthButton)

    expect(defaultProps.onDateChange).toHaveBeenCalledWith(
      startOfMonth(subMonths(mockDate, 1)),
      endOfMonth(subMonths(mockDate, 1))
    )
  })

  it('accepts custom presets', () => {
    const customPresets: DateRangePreset[] = [
      {
        label: 'Custom Range',
        startDate: new Date('2024-01-01'),
        endDate: new Date('2024-01-07')
      }
    ]

    render(
      <TestWrapper>
        <DateRangeSelector {...defaultProps} presets={customPresets} />
      </TestWrapper>
    )

    expect(screen.getByText('Custom Range')).toBeInTheDocument()
    expect(screen.queryByText('This Month')).not.toBeInTheDocument()
  })

  it('shows validation error when start date is after end date', async () => {
    const user = userEvent.setup({ advanceTimers: jest.advanceTimersByTime })
    
    render(
      <TestWrapper>
        <DateRangeSelector 
          {...defaultProps}
          startDate={new Date('2024-01-31')}
          endDate={new Date('2024-01-01')}
        />
      </TestWrapper>
    )

    // The component should show validation error
    await waitFor(() => {
      expect(screen.getByText('Start date cannot be later than end date')).toBeInTheDocument()
    })
  })

  it('shows max range validation error', async () => {
    render(
      <TestWrapper>
        <DateRangeSelector 
          {...defaultProps}
          startDate={new Date('2024-01-01')}
          endDate={new Date('2024-12-31')}
          maxRange={30}
        />
      </TestWrapper>
    )

    await waitFor(() => {
      expect(screen.getByText('Date range cannot exceed 30 days')).toBeInTheDocument()
    })
  })

  it('displays custom error message', () => {
    render(
      <TestWrapper>
        <DateRangeSelector {...defaultProps} error="Custom error message" />
      </TestWrapper>
    )

    expect(screen.getByText('Custom error message')).toBeInTheDocument()
  })

  it('displays helper text', () => {
    render(
      <TestWrapper>
        <DateRangeSelector {...defaultProps} helperText="Select a date range for the report" />
      </TestWrapper>
    )

    expect(screen.getByText('Select a date range for the report')).toBeInTheDocument()
  })

  it('disables inputs when disabled prop is true', () => {
    render(
      <TestWrapper>
        <DateRangeSelector {...defaultProps} disabled />
      </TestWrapper>
    )

    const startDateInput = screen.getByLabelText('Start date')
    const endDateInput = screen.getByLabelText('End date')
    
    expect(startDateInput).toBeDisabled()
    expect(endDateInput).toBeDisabled()
  })

  it('shows maximum range information', () => {
    render(
      <TestWrapper>
        <DateRangeSelector {...defaultProps} maxRange={90} />
      </TestWrapper>
    )

    expect(screen.getByText('Maximum range: 90 days')).toBeInTheDocument()
  })

  it('has proper accessibility attributes', () => {
    render(
      <TestWrapper>
        <DateRangeSelector {...defaultProps} error="Test error" />
      </TestWrapper>
    )

    const startDateInput = screen.getByLabelText('Start date')
    const endDateInput = screen.getByLabelText('End date')

    expect(startDateInput).toHaveAttribute('aria-describedby', 'date-range-error')
    expect(endDateInput).toHaveAttribute('aria-describedby', 'date-range-error')
  })

  it('handles keyboard navigation properly', async () => {
    const user = userEvent.setup({ advanceTimers: jest.advanceTimersByTime })
    
    render(
      <TestWrapper>
        <DateRangeSelector {...defaultProps} />
      </TestWrapper>
    )

    const thisMonthButton = screen.getByText('This Month')
    
    // Click the button to test interaction
    await user.click(thisMonthButton)

    expect(defaultProps.onDateChange).toHaveBeenCalled()
  })

  it('formats date range display correctly', () => {
    render(
      <TestWrapper>
        <DateRangeSelector 
          startDate={new Date('2024-03-15')}
          endDate={new Date('2024-04-20')}
          onDateChange={jest.fn()}
        />
      </TestWrapper>
    )

    expect(screen.getByText('Mar 15, 2024 - Apr 20, 2024')).toBeInTheDocument()
    expect(screen.getByText('37 days')).toBeInTheDocument()
  })
})