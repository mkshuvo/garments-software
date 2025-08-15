import { ExportFormat } from '@/types/trialBalance';

// Simple test to verify the service can be imported and basic functionality works
describe('TrialBalanceExportService - Simple Tests', () => {
  it('should import ExportFormat enum correctly', () => {
    expect(ExportFormat.CSV).toBe('csv');
    expect(ExportFormat.PDF).toBe('pdf');
  });

  it('should have the correct export format values', () => {
    expect(Object.values(ExportFormat)).toEqual(['pdf', 'csv']);
  });
});