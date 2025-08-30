# Fix Cash Book Entry - Independent Transactions

## Overview

The current cash book entry system enforces double-entry bookkeeping with balance validation, requiring credits to equal debits. However, the user needs a simplified system where credit and debit transactions can be entered independently without balance validation. Each transaction should be saved immediately to the database as a journal entry.

## Requirements

### Requirement 1: Independent Transaction Entry

**User Story:** As a user, I want to enter credit and debit transactions independently without balance validation, so that I can record transactions as they occur without waiting for matching entries.

#### Acceptance Criteria

1. WHEN I add a credit transaction THEN it SHALL be saved immediately to the database
2. WHEN I add a debit transaction THEN it SHALL be saved immediately to the database
3. WHEN I save a transaction THEN it SHALL create a simple journal entry with single line
4. WHEN I save a credit transaction THEN it SHALL only credit the category account
5. WHEN I save a debit transaction THEN it SHALL only debit the category account
6. WHEN I have unbalanced transactions THEN the system SHALL NOT prevent saving
7. WHEN I view saved transactions THEN I SHALL see all transactions regardless of balance

### Requirement 2: Separate Modal Dialogs

**User Story:** As a user, I want separate modal dialogs for credit and debit transactions, so that I can focus on one transaction type at a time.

#### Acceptance Criteria

1. WHEN I click "Add Credit" THEN a credit transaction modal SHALL open
2. WHEN I click "Add Debit" THEN a debit transaction modal SHALL open
3. WHEN I complete a transaction THEN the modal SHALL close and show success message
4. WHEN I cancel a transaction THEN the modal SHALL close without saving
5. WHEN I edit a transaction THEN the modal SHALL open with pre-filled data

### Requirement 3: Simplified Transaction Structure

**User Story:** As a user, I want a simplified transaction structure that focuses on the essential fields for each transaction type.

#### Acceptance Criteria

1. WHEN I enter a credit transaction THEN I SHALL provide:
   - Date
   - Category (from credit categories)
   - Particulars/Description
   - Amount
   - Contact (optional)
2. WHEN I enter a debit transaction THEN I SHALL provide:
   - Date
   - Category (from debit categories)
   - Particulars/Description
   - Amount
   - Supplier/Buyer (optional)
3. WHEN I save a transaction THEN it SHALL generate a unique reference number
4. WHEN I save a transaction THEN it SHALL create proper journal entry lines

### Requirement 4: Backend API Changes

**User Story:** As a developer, I want the backend to support independent transaction saving without balance validation.

#### Acceptance Criteria

1. WHEN I call the credit transaction endpoint THEN it SHALL create a journal entry with:
   - Credit to the category account only
2. WHEN I call the debit transaction endpoint THEN it SHALL create a journal entry with:
   - Debit to the category account only
3. WHEN I save a transaction THEN it SHALL return success/failure response
4. WHEN I save a transaction THEN it SHALL handle contact creation if needed
5. WHEN I save a transaction THEN it SHALL handle category creation if needed

### Requirement 5: Transaction History

**User Story:** As a user, I want to see a history of all saved transactions, so that I can review and track my entries.

#### Acceptance Criteria

1. WHEN I view the cash book entry page THEN I SHALL see recently saved transactions
2. WHEN I view saved transactions THEN I SHALL see:
   - Transaction type (Credit/Debit)
   - Category name
   - Amount
   - Date
   - Reference number
   - Contact/Supplier information
3. WHEN I view saved transactions THEN they SHALL be sorted by date (newest first)
4. WHEN I view saved transactions THEN I SHALL see running totals for credits and debits

### Requirement 6: Category Management Integration

**User Story:** As a user, I want to use categories from the existing category management system for transactions.

#### Acceptance Criteria

1. WHEN I open a credit modal THEN I SHALL see only credit categories
2. WHEN I open a debit modal THEN I SHALL see only debit categories
3. WHEN I select a category THEN it SHALL be validated against the category system
4. WHEN I enter a new category name THEN the system SHALL create it automatically
5. WHEN I view categories THEN I SHALL see only active categories

### Requirement 7: Contact Management Integration

**User Story:** As a user, I want to associate transactions with contacts from the existing contact system.

#### Acceptance Criteria

1. WHEN I enter a credit transaction THEN I SHALL be able to select a customer contact
2. WHEN I enter a debit transaction THEN I SHALL be able to select a supplier contact
3. WHEN I enter a new contact name THEN the system SHALL create it automatically
4. WHEN I view saved transactions THEN I SHALL see the associated contact information

## Technical Requirements

### Frontend Changes
- Remove balance validation logic
- Update modal components to save transactions independently
- Add transaction history display
- Update service calls to use new endpoints

### Backend Changes
- Create new endpoints for independent transaction saving
- Update journal entry creation logic
- Remove balance validation from cash book entry service
- Add transaction history retrieval endpoints

### Database Changes
- No schema changes required
- Use existing journal entry and journal entry line tables
- Use existing category and contact tables

## Success Criteria

- Users can save credit and debit transactions independently
- No balance validation prevents transaction saving
- Each transaction creates proper journal entries
- Transaction history is displayed clearly
- Categories and contacts are properly integrated
- System maintains data integrity and audit trail
