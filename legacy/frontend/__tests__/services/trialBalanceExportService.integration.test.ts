/**
 * Integration test for TrialBalanceExportService
 * Tests the service functionality without complex mocking
 */

import {
  TrialBalanceData,
  AccountCategoryType,
  ExportFormat,
  DateRange
} from '@/types/trialBalance';

// Mock file-saver to avoid actual file downloads in tests
const mockSaveAs = jest.fn();
jest.mock('file-saver', () => ({
  saveAs: mockSaveAs
}));

// Mock jsPDF to avoid PDF generation in tests
const mockPdfSave = jest.fn();
jest.mock('jspdf', () => {
  return jest.fn().mockImplementation(() => ({
    internal: {
      pageSize: {
        getWidth: () => 210,
        getHeight: () => 297
      }
    },
    setFontSize: jest.fn(),
    setFont: jest.fn(),
    text: jest.fn(),
    line: jest.fn(),
    addPage: jest.fn(),
    setPage: jest.fn(),
    getNumberOfPages: () => 1,
    save: mockPdfSave
  }));
});

jest.mock('html2canvas', () => jest.fn());

describe('TrialBalanceExportService Integration', () => {
  let trialBalanceExportService: any;

  const mockTrialBalanceData: TrialBalanceData = {
    dateRange: {
      startDate: new Date('2024-01-01'),
      endDate: new Date('2024-01-31')
    },
    categories: [
      {
        name: AccountCategoryType.ASSETS,
        accounts: [
          {
            accountId: '1',
            accountName: 'Cash Account',
            categoryDescription: 'Current Assets',
            particulars: 'Cash transactions',
            debitAmount: -1000,
            creditAmount: 1500,
            netBalance: 500,
            transactionCount: 5
          }
        ],
        subtotal: 500
      }
    ],
    totalDebits: -1000,
    totalCredits: 1500,
    finalBalance: 500,
    calculationExpression: '1500 - 1000 = 500',
    generatedAt: new Date('2024-01-31T10:00:00Z'),
    totalTransactions: 5
  };

  beforeEach(async () => {
    jest.clearAllMocks();
    mockSaveAs.mockClear();
    mockPdfSave.mockClear();
    
    // Dynamically import the service to avoid hoisting issues
    const module = await import('@/services/trialBalanceExportService');
    trialBalanceExportService = module.trialBalanceExportService;
  });

  it('should export to CSV format', async () => {
    await trialBalanceExportService.exportTrialBalance(
      mockTrialBalanceData,
      ExportFormat.CSV
    );

    expect(mockSaveAs).toHaveBeenCalledWith(
      expect.any(Blob),
      expect.stringMatching(/trial-balance_2024-01-01_to_2024-01-31_\d{4}-\d{2}-\d{2}\.csv/)
    );
  });

  it('should export to PDF format', async () => {
    await trialBalanceExportService.exportTrialBalance(
      mockTrialBalanceData,
      ExportFormat.PDF
    );

    expect(mockPdfSave).toHaveBeenCalledWith(
      expect.stringMatching(/trial-balance_2024-01-01_to_2024-01-31_\d{4}-\d{2}-\d{2}\.pdf/)
    );
  });

  it('should handle custom filename', async () => {
    const customFilename = 'custom-trial-balance.csv';

    await trialBalanceExportService.exportTrialBalance(
      mockTrialBalanceData,
      ExportFormat.CSV,
      { customFilename }
    );

    expect(mockSaveAs).toHaveBeenCalledWith(
      expect.any(Blob),
      customFilename
    );
  });

  it('should throw error for unsupported format', async () => {
    await expect(
      trialBalanceExportService.exportTrialBalance(
        mockTrialBalanceData,
        'unsupported' as ExportFormat
      )
    ).rejects.toThrow('Unsupported export format: unsupported');
  });

  it('should export account transactions', async () => {
    const mockTransactions = [
      {
        id: '1',
        date: new Date('2024-01-15'),
        categoryDescription: 'Sales Revenue',
        particulars: 'Product sale',
        referenceNumber: 'REF001',
        debitAmount: 0,
        creditAmount: 1000,
        runningBalance: 1000
      }
    ];

    const dateRange: DateRange = {
      startDate: new Date('2024-01-01'),
      endDate: new Date('2024-01-31')
    };

    await trialBalanceExportService.exportAccountTransactions(
      'acc-001',
      'Cash Account',
      mockTransactions,
      dateRange
    );

    expect(mockSaveAs).toHaveBeenCalledWith(
      expect.any(Blob),
      expect.stringMatching(/account-transactions_Cash_Account_2024-01-01_to_2024-01-31_\d{4}-\d{2}-\d{2}\.csv/)
    );
  });
});