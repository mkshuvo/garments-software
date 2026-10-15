# AddTransactionButtons Component

## Overview

The `AddTransactionButtons` component provides a clean, professional interface for adding credit and debit transactions to the cashbook entry system. It replaces the previous stacked form approach with prominent buttons that open modal dialogs.

## Features

- **Prominent Design**: Large, visually distinct buttons that clearly indicate their purpose
- **Appropriate Icons**: TrendingUp icon for credits (money in) and TrendingDown icon for debits (money out)
- **Disabled State**: Buttons are disabled when modals are open to prevent multiple modal instances
- **Accessibility**: Proper ARIA labels, descriptions, and keyboard navigation support
- **Material-UI Design**: Follows Material-UI design system with consistent theming
- **Responsive**: Adapts to mobile devices with stacked layout and appropriate sizing

## Props

```typescript
interface AddTransactionButtonsProps {
  onAddCredit: () => void;    // Callback when "Add Credit Transaction" is clicked
  onAddDebit: () => void;     // Callback when "Add Debit Transaction" is clicked
  disabled?: boolean;         // Optional: Disables both buttons (default: false)
}
```

## Usage

```tsx
import { AddTransactionButtons } from '@/components/accounting';

function CashBookEntryPage() {
  const [modals, setModals] = useState({
    creditModal: { isOpen: false },
    debitModal: { isOpen: false }
  });

  const handleAddCredit = () => {
    setModals(prev => ({
      ...prev,
      creditModal: { isOpen: true }
    }));
  };

  const handleAddDebit = () => {
    setModals(prev => ({
      ...prev,
      debitModal: { isOpen: true }
    }));
  };

  const isAnyModalOpen = modals.creditModal.isOpen || modals.debitModal.isOpen;

  return (
    <div>
      <AddTransactionButtons
        onAddCredit={handleAddCredit}
        onAddDebit={handleAddDebit}
        disabled={isAnyModalOpen}
      />
      
      {/* Your modal components here */}
    </div>
  );
}
```

## Design Decisions

### Color Scheme
- **Credit Button**: Green (success color) to represent money coming in
- **Debit Button**: Orange (warning color) to represent money going out

### Icons
- **Credit**: TrendingUp icon to represent increasing/incoming money
- **Debit**: TrendingDown icon to represent decreasing/outgoing money

### Layout
- **Desktop**: Side-by-side horizontal layout
- **Mobile**: Stacked vertical layout for better touch interaction

### Accessibility
- ARIA labels provide clear descriptions for screen readers
- Keyboard navigation support
- High contrast colors for visibility
- Descriptive text explains the purpose of each transaction type

## Requirements Satisfied

This component satisfies the following requirements from the specification:

- **1.1**: Modal dialog for transaction entry (buttons trigger modal opening)
- **1.2**: Single modal form per transaction (buttons open individual modals)
- **4.1**: Modal dialog focus and behavior (disabled state prevents multiple modals)
- **4.2**: Proper modal overlay behavior (disabled state ensures single modal focus)

## Testing

The component includes comprehensive unit tests covering:
- Button rendering and interaction
- Callback function execution
- Disabled state behavior
- Accessibility attributes
- Responsive design elements

Run tests with:
```bash
npm test -- AddTransactionButtons.test.tsx
```

## Integration

This component is designed to work seamlessly with:
- `CreditTransactionModal` component
- `DebitTransactionModal` component
- `TransactionList` component
- Existing cashbook entry state management

See `AddTransactionButtonsExample.tsx` for a complete integration example.