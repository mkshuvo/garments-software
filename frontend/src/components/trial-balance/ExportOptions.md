# ExportOptions Component

The `ExportOptions` component provides a comprehensive interface for exporting trial balance reports in PDF and CSV formats. It includes progress tracking, error handling with retry functionality, and success notifications.

## Features

- **Multiple Export Formats**: Support for PDF and CSV export formats
- **Progress Tracking**: Real-time progress indicators during export generation
- **Error Handling**: Comprehensive error handling with automatic retry functionality (up to 3 attempts)
- **Success Notifications**: Toast notifications when exports complete successfully
- **Two Variants**: Standard and compact variants for different UI contexts
- **Loading States**: Visual feedback during export operations
- **Accessibility**: Full keyboard navigation and screen reader support

## Props

```typescript
interface ExportOptionsProps {
  onExport: (format: ExportFormat, options?: ExportRequestOptions) => Promise<void>;
  isExporting: boolean;
  exportProgress?: number;
  disabled?: boolean;
  showProgress?: boolean;
  variant?: 'standard' | 'compact';
}

interface ExportRequestOptions {
  includeCalculationDetails?: boolean;
  includeZeroBalances?: boolean;
  customFilename?: string;
}
```

### Prop Details

- **`onExport`** (required): Callback function called when user initiates an export
- **`isExporting`** (required): Boolean indicating if an export is currently in progress
- **`exportProgress`**: Progress percentage (0-100) for the current export operation
- **`disabled`**: Disables all export buttons when true
- **`showProgress`**: Controls visibility of progress indicators (default: true)
- **`variant`**: Display variant - 'standard' for full interface, 'compact' for icon buttons

## Usage Examples

### Standard Variant

```tsx
import { ExportOptions } from '@/components/trial-balance/ExportOptions';
import { trialBalanceExportService } from '@/services/trialBalanceExportService';

const TrialBalancePage = () => {
  const [isExporting, setIsExporting] = useState(false);
  const [exportProgress, setExportProgress] = useState(0);

  const handleExport = async (format: ExportFormat, options?: ExportRequestOptions) => {
    setIsExporting(true);
    setExportProgress(0);

    try {
      // Simulate progress updates
      const progressInterval = setInterval(() => {
        setExportProgress(prev => Math.min(prev + 10, 90));
      }, 200);

      await trialBalanceExportService.exportTrialBalance(
        trialBalanceData,
        format,
        options
      );

      clearInterval(progressInterval);
      setExportProgress(100);
      
    } catch (error) {
      throw error; // Let ExportOptions handle the error display
    } finally {
      setIsExporting(false);
      setExportProgress(0);
    }
  };

  return (
    <div>
      {/* Other trial balance content */}
      
      <ExportOptions
        onExport={handleExport}
        isExporting={isExporting}
        exportProgress={exportProgress}
        variant="standard"
      />
    </div>
  );
};
```

### Compact Variant

```tsx
const TrialBalanceToolbar = () => {
  return (
    <Box sx={{ display: 'flex', alignItems: 'center', gap: 2 }}>
      <Typography variant="h6">Trial Balance Report</Typography>
      
      <ExportOptions
        onExport={handleExport}
        isExporting={isExporting}
        exportProgress={exportProgress}
        variant="compact"
      />
    </Box>
  );
};
```

## Progress Messages

The component displays contextual progress messages based on the export progress:

- **0-24%**: "Preparing data..."
- **25-49%**: "Processing calculations..."
- **50-74%**: "Formatting report..."
- **75-94%**: "Generating file..."
- **95-100%**: "Finalizing export..."

## Error Handling

The component includes comprehensive error handling:

1. **Automatic Retry**: Failed exports can be retried up to 3 times
2. **Error Display**: Clear error messages with retry options
3. **Retry Counter**: Shows current retry attempt (e.g., "Retry attempt 2 of 3")
4. **Retry Limit**: After 3 failed attempts, retry option is disabled

## Notifications

### Success Notifications
- Displays toast notification when export completes successfully
- Shows the export format (PDF/CSV) in the success message
- Auto-dismisses after 4 seconds

### Error Notifications
- Shows detailed error messages in toast notifications
- Includes retry button in error notifications
- Auto-dismisses after 6 seconds

## Accessibility Features

- **Keyboard Navigation**: All buttons are keyboard accessible
- **Screen Reader Support**: Proper ARIA labels and roles
- **Focus Management**: Clear focus indicators
- **Progress Announcements**: Progress bar has proper ARIA attributes

## Styling

The component uses Material-UI components and follows the application's theme:

- **Standard Variant**: Full-width paper container with elevation
- **Compact Variant**: Inline icon buttons with tooltips
- **Progress Bar**: Styled linear progress indicator
- **Buttons**: Themed PDF (red) and CSV (green) buttons

## Integration with Export Service

The component is designed to work seamlessly with the `trialBalanceExportService`:

```typescript
const handleExport = async (format: ExportFormat, options?: ExportRequestOptions) => {
  await trialBalanceExportService.exportTrialBalance(
    trialBalanceData,
    format,
    {
      includeCalculationDetails: options?.includeCalculationDetails ?? true,
      includeZeroBalances: options?.includeZeroBalances ?? false,
      customFilename: options?.customFilename
    }
  );
};
```

## Testing

The component includes comprehensive tests covering:

- Basic rendering and interaction
- Progress tracking functionality
- Error handling and retry logic
- Success notifications
- Accessibility features
- Both standard and compact variants

Run tests with:
```bash
npm test -- __tests__/components/trial-balance/ExportOptions.test.tsx
```

## Best Practices

1. **Progress Updates**: Provide regular progress updates for better user experience
2. **Error Handling**: Always handle export errors gracefully
3. **Loading States**: Use the `isExporting` prop to prevent multiple simultaneous exports
4. **Variant Selection**: Use 'standard' for dedicated export sections, 'compact' for toolbars
5. **Accessibility**: Ensure proper ARIA labels and keyboard navigation

## Dependencies

- `@mui/material`: UI components and theming
- `@mui/icons-material`: Icons for buttons and notifications
- `@/types/trialBalance`: TypeScript interfaces
- `@/services/trialBalanceExportService`: Export functionality