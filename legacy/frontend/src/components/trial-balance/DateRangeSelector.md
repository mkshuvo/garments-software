# DateRangeSelector Component

A reusable Material-UI date range selector component with validation, preset options, and accessibility features.

## Features

- **Material-UI Integration**: Built with Material-UI components and follows the design system
- **Date Validation**: Validates that start date is not later than end date
- **Maximum Range Validation**: Optional maximum range limit (in days)
- **Preset Options**: Quick select buttons for common date ranges (This Month, Last Month, etc.)
- **Responsive Design**: Adapts to mobile and desktop layouts
- **Accessibility**: Full keyboard navigation and screen reader support
- **Error Handling**: Displays validation errors and custom error messages
- **Controlled Component**: Fully controlled with proper state management

## Usage

```tsx
import { DateRangeSelector } from '@/components/trial-balance'
import { LocalizationProvider } from '@mui/x-date-pickers'
import { AdapterDateFns } from '@mui/x-date-pickers/AdapterDateFns'

function MyComponent() {
  const [startDate, setStartDate] = useState(new Date())
  const [endDate, setEndDate] = useState(new Date())

  const handleDateChange = (newStartDate: Date, newEndDate: Date) => {
    setStartDate(newStartDate)
    setEndDate(newEndDate)
  }

  return (
    <LocalizationProvider dateAdapter={AdapterDateFns}>
      <DateRangeSelector
        startDate={startDate}
        endDate={endDate}
        onDateChange={handleDateChange}
        maxRange={365}
        helperText="Select a date range for your report"
      />
    </LocalizationProvider>
  )
}
```

## Props

| Prop | Type | Default | Description |
|------|------|---------|-------------|
| `startDate` | `Date` | Required | The selected start date |
| `endDate` | `Date` | Required | The selected end date |
| `onDateChange` | `(startDate: Date, endDate: Date) => void` | Required | Callback when date range changes |
| `maxRange` | `number` | `365` | Maximum allowed range in days |
| `presets` | `DateRangePreset[]` | Default presets | Custom preset options |
| `disabled` | `boolean` | `false` | Whether the component is disabled |
| `error` | `string` | - | Custom error message to display |
| `helperText` | `string` | - | Helper text to display below the component |

## Default Presets

The component includes these default preset options:

- **This Month**: Current month start to end
- **Last Month**: Previous month start to end  
- **This Quarter**: Current quarter start to end
- **Last Quarter**: Previous quarter start to end
- **This Year**: Current year start to end
- **Last Year**: Previous year start to end

## Custom Presets

You can provide custom presets:

```tsx
const customPresets = [
  {
    label: 'Last 7 Days',
    startDate: subDays(new Date(), 7),
    endDate: new Date()
  },
  {
    label: 'Last 30 Days', 
    startDate: subDays(new Date(), 30),
    endDate: new Date()
  }
]

<DateRangeSelector
  presets={customPresets}
  // ... other props
/>
```

## Validation

The component automatically validates:

1. **Date Order**: Start date cannot be later than end date
2. **Maximum Range**: Date range cannot exceed the specified maximum (if provided)

Validation errors are displayed below the date pickers and the component border turns red.

## Accessibility

- Full keyboard navigation support
- Screen reader compatible with proper ARIA labels
- Focus management and tab order
- Error messages are properly associated with form controls

## Styling

The component uses Material-UI's theming system and can be customized through:

- Theme overrides for Material-UI components
- Custom CSS classes
- The `sx` prop (if needed for specific instances)

## Requirements

This component requires:

- `@mui/material` v5+
- `@mui/x-date-pickers` v6+
- `date-fns` v2+
- React 18+

Make sure to wrap your app with `LocalizationProvider` from `@mui/x-date-pickers`.