import { trialBalanceExportService } from '@/services/trialBalanceExportService';
import {
  TrialBalanceData,
  AccountCategoryType,
  ExportFormat,
  DateRange
} from '@/types/trialBalance';

// Mock the external dependencies
const mockPdfInstance = {
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
  save: jest.fn()
};

jest.mock('jspdf', () => {
  return jest.fn().mockImplementation(() => mockPdfInstance);
});

jest.mock('html2canvas', () => jest.fn());

const mockSaveAs = jest.fn();
jest.mock('file-saver', () => ({
  saveAs: mockSaveAs
}));

describe('TrialBalanceExportService', () => {
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
      },
      {
        name: AccountCategoryType.LIABILITIES,
        accounts: [
          {
            accountId: '2',
            accountName: 'Accounts Payable',
            categoryDescription: 'Current Liabilities',
            particulars: 'Supplier payments',
            debitAmount: -800,
            creditAmount: 1200,
            netBalance: 400,
            transactionCount: 3
          }
        ],
        subtotal: 400
      }
    ],
    totalDebits: -1800,
    totalCredits: 2700,
    finalBalance: 900,
    calculationExpression: '1500 - 1000 + 1200 - 800 = 900',
    generatedAt: new Date('2024-01-31T10:00:00Z'),
    totalTransactions: 8
  };

  beforeEach(() => {
    jest.clearAllMocks();
    mockSaveAs.mockClear();
    mockPdfInstance.save.mockClear();
  });

  describe('exportTrialBalance', () => {
    it('should export to CSV format successfully', async () => {
      await trialBalanceExportService.exportTrialBalance(
        mockTrialBalanceData,
        ExportFormat.CSV,
        { includeCalculationDetails: true }
      );

      expect(mockSaveAs).toHaveBeenCalledWith(
        expect.any(Blob),
        expect.stringMatching(/trial-balance_2024-01-01_to_2024-01-31_\d{4}-\d{2}-\d{2}\.csv/)
      );

      // Verify the blob contains expected CSV content
      const call = mockSaveAs.mock.calls[0];
      const blob = call[0] as Blob;
      expect(blob.type).toBe('text/csv;charset=utf-8;');
    });

    it('should export to PDF format successfully', async () => {
      await trialBalanceExportService.exportTrialBalance(
        mockTrialBalanceData,
        ExportFormat.PDF,
        { includeCalculationDetails: true }
      );

      expect(mockPdfInstance.save).toHaveBeenCalledWith(
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
  });

  describe('exportAccountTransactions', () => {
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
      },
      {
        id: '2',
        date: new Date('2024-01-20'),
        categoryDescription: 'Operating Expenses',
        particulars: 'Office supplies',
        referenceNumber: 'REF002',
        debitAmount: -200,
        creditAmount: 0,
        runningBalance: 800
      }
    ];

    it('should export account transactions to CSV', async () => {
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

      // Verify the blob contains expected CSV content
      const call = mockSaveAs.mock.calls[0];
      const blob = call[0] as Blob;
      expect(blob.type).toBe('text/csv;charset=utf-8;');
    });
  });

  describe('filename generation', () => {
    it('should generate descriptive filenames with date range', async () => {
      await trialBalanceExportService.exportTrialBalance(
        mockTrialBalanceData,
        ExportFormat.CSV
      );

      const call = mockSaveAs.mock.calls[0];
      const filename = call[1] as string;
      
      expect(filename).toMatch(/trial-balance_2024-01-01_to_2024-01-31_\d{4}-\d{2}-\d{2}\.csv/);
    });

    it('should sanitize account names in filenames', async () => {
      const dateRange: DateRange = {
        startDate: new Date('2024-01-01'),
        endDate: new Date('2024-01-31')
      };

      await trialBalanceExportService.exportAccountTransactions(
        'acc-001',
        'Cash & Bank Account',
        [],
        dateRange
      );

      const call = mockSaveAs.mock.calls[0];
      const filename = call[1] as string;
      
      expect(filename).toMatch(/account-transactions_Cash___Bank_Account_/);
    });
  });

  describe('CSV content generation', () => {
    it('should include company header and metadata', async () => {
      await trialBalanceExportService.exportTrialBalance(
        mockTrialBalanceData,
        ExportFormat.CSV,
        { includeCalculationDetails: true }
      );

      const call = mockSaveAs.mock.calls[0];
      const blob = call[0] as Blob;
      
      // Read blob content
      const text = await blob.text();
      
      expect(text).toContain('Garments ERP System');
      expect(text).toContain('Trial Balance Report');
      expect(text).toContain('Period: 1/1/2024 to 1/31/2024');
      expect(text).toContain('Generated:');
    });

    it('should include calculation details when requested', async () => {
      await trialBalanceExportService.exportTrialBalance(
        mockTrialBalanceData,
        ExportFormat.CSV,
        { includeCalculationDetails: true }
      );

      const call = mockSaveAs.mock.calls[0];
      const blob = call[0] as Blob;
      const text = await blob.text();
      
      expect(text).toContain('CALCULATION DETAILS');
      expect(text).toContain('1500 - 1000 + 1200 - 800 = 900');
      expect(text).toContain('Total Transactions","8"');
    });

    it('should exclude zero balance accounts when option is set', async () => {
      const dataWithZeroBalance: TrialBalanceData = {
        ...mockTrialBalanceData,
        categories: [
          {
            name: AccountCategoryType.ASSETS,
            accounts: [
              {
                accountId: '1',
                accountName: 'Cash Account',
                categoryDescription: 'Current Assets',
                particulars: 'Cash transactions',
                debitAmount: 0,
                creditAmount: 0,
                netBalance: 0,
                transactionCount: 0
              },
              {
                accountId: '2',
                accountName: 'Bank Account',
                categoryDescription: 'Current Assets',
                particulars: 'Bank transactions',
                debitAmount: -1000,
                creditAmount: 1500,
                netBalance: 500,
                transactionCount: 5
              }
            ],
            subtotal: 500
          }
        ]
      };

      await trialBalanceExportService.exportTrialBalance(
        dataWithZeroBalance,
        ExportFormat.CSV,
        { includeZeroBalances: false }
      );

      const call = mockSaveAs.mock.calls[0];
      const blob = call[0] as Blob;
      const text = await blob.text();
      
      expect(text).not.toContain('Cash Account');
      expect(text).toContain('Bank Account');
    });
  });
});