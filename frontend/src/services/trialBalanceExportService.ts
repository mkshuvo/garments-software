import jsPDF from 'jspdf';
import { saveAs } from 'file-saver';
import {
  TrialBalanceData,
  ExportFormat,
  DateRange
} from '@/types/trialBalance';

/**
 * Trial Balance Export Service
 * Handles PDF and CSV export functionality for trial balance reports
 * Includes professional formatting, company headers, and descriptive filenames
 */
class TrialBalanceExportService {
  private readonly companyName = 'Garments ERP System';
  private readonly companyAddress = 'Financial Reporting Department';

  /**
   * Export trial balance data to specified format
   * @param data - Trial balance data to export
   * @param format - Export format (PDF or CSV)
   * @param options - Additional export options
   */
  async exportTrialBalance(
    data: TrialBalanceData,
    format: ExportFormat,
    options: {
      includeCalculationDetails?: boolean;
      includeZeroBalances?: boolean;
      customFilename?: string;
    } = {}
  ): Promise<void> {
    const filename = options.customFilename || this.generateFilename(data.dateRange, format);

    try {
      switch (format) {
        case ExportFormat.CSV:
          await this.exportToCSV(data, filename, options);
          break;
        case ExportFormat.PDF:
          await this.exportToPDF(data, filename, options);
          break;
        default:
          throw new Error(`Unsupported export format: ${format}`);
      }
    } catch (error) {
      console.error('Export failed:', error);
      throw new Error(`Failed to export trial balance as ${format.toUpperCase()}: ${error instanceof Error ? error.message : 'Unknown error'}`);
    }
  }

  /**
   * Export trial balance to CSV format
   * @param data - Trial balance data
   * @param filename - Output filename
   * @param options - Export options
   */
  private async exportToCSV(
    data: TrialBalanceData,
    filename: string,
    options: {
      includeCalculationDetails?: boolean;
      includeZeroBalances?: boolean;
    }
  ): Promise<void> {
    const csvContent = this.generateCSVContent(data, options);
    const blob = new Blob([csvContent], { type: 'text/csv;charset=utf-8;' });
    saveAs(blob, filename);
  }

  /**
   * Export trial balance to PDF format
   * @param data - Trial balance data
   * @param filename - Output filename
   * @param options - Export options
   */
  private async exportToPDF(
    data: TrialBalanceData,
    filename: string,
    options: {
      includeCalculationDetails?: boolean;
      includeZeroBalances?: boolean;
    }
  ): Promise<void> {
    const pdf = new jsPDF('p', 'mm', 'a4');
    const pageWidth = pdf.internal.pageSize.getWidth();
    const pageHeight = pdf.internal.pageSize.getHeight();
    const margin = 20;
    let yPosition = margin;

    // Add company header
    yPosition = this.addPDFHeader(pdf, pageWidth, yPosition);

    // Add report title and date range
    yPosition = this.addPDFTitle(pdf, data, pageWidth, yPosition);

    // Add trial balance content
    yPosition = await this.addPDFContent(pdf, data, pageWidth, pageHeight, margin, yPosition, options);

    // Add calculation details if requested
    if (options.includeCalculationDetails) {
      this.addPDFCalculationDetails(pdf, data, pageWidth, pageHeight, margin, yPosition);
    }

    // Add footer
    this.addPDFFooter(pdf, data, pageWidth, pageHeight);

    // Save the PDF
    pdf.save(filename);
  }

  /**
   * Generate CSV content from trial balance data
   */
  private generateCSVContent(
    data: TrialBalanceData,
    options: {
      includeCalculationDetails?: boolean;
      includeZeroBalances?: boolean;
    }
  ): string {
    const lines: string[] = [];

    // Add header information
    lines.push(`"${this.companyName}"`);
    lines.push(`"Trial Balance Report"`);
    lines.push(`"Period: ${this.formatDateRange(data.dateRange)}"`);
    lines.push(`"Generated: ${data.generatedAt.toLocaleString()}"`);
    lines.push(''); // Empty line

    // Add column headers
    lines.push('"Account Name","Category","Category Description","Particulars","Debit Amount","Credit Amount","Net Balance","Transaction Count"');

    // Add account data by category
    data.categories.forEach(category => {
      // Add category header
      lines.push(`"=== ${category.name} ===","","","","","","",""`);

      // Add accounts in category
      category.accounts.forEach(account => {
        // Skip zero balance accounts if option is set
        if (!options.includeZeroBalances && account.netBalance === 0) {
          return;
        }

        lines.push([
          `"${this.escapeCSV(account.accountName)}"`,
          `"${category.name}"`,
          `"${this.escapeCSV(account.categoryDescription)}"`,
          `"${this.escapeCSV(account.particulars)}"`,
          `"${account.debitAmount}"`,
          `"${account.creditAmount}"`,
          `"${account.netBalance}"`,
          `"${account.transactionCount}"`
        ].join(','));
      });

      // Add category subtotal
      lines.push([
        `"${category.name} Subtotal"`,
        `"${category.name}"`,
        '""',
        '""',
        '""',
        '""',
        `"${category.subtotal}"`,
        '""'
      ].join(','));

      lines.push(''); // Empty line between categories
    });

    // Add totals
    lines.push('"=== TOTALS ===","","","","","","",""');
    lines.push(`"Total Debits","","","","${data.totalDebits}","","",""`);
    lines.push(`"Total Credits","","","","","${data.totalCredits}","",""`);
    lines.push(`"Final Balance","","","","","","${data.finalBalance}",""`);

    // Add calculation details if requested
    if (options.includeCalculationDetails) {
      lines.push('');
      lines.push('"=== CALCULATION DETAILS ===","","","","","","",""');
      lines.push(`"Calculation Expression","${this.escapeCSV(data.calculationExpression)}","","","","","",""`);
      lines.push(`"Total Transactions","${data.totalTransactions}","","","","","",""`);
    }

    return lines.join('\n');
  }

  /**
   * Add PDF header with company information
   */
  private addPDFHeader(pdf: jsPDF, pageWidth: number, yPosition: number): number {
    // Company name
    pdf.setFontSize(16);
    pdf.setFont('helvetica', 'bold');
    pdf.text(this.companyName, pageWidth / 2, yPosition, { align: 'center' });
    yPosition += 8;

    // Company address
    pdf.setFontSize(10);
    pdf.setFont('helvetica', 'normal');
    pdf.text(this.companyAddress, pageWidth / 2, yPosition, { align: 'center' });
    yPosition += 15;

    return yPosition;
  }

  /**
   * Add PDF title and date range
   */
  private addPDFTitle(pdf: jsPDF, data: TrialBalanceData, pageWidth: number, yPosition: number): number {
    // Report title
    pdf.setFontSize(14);
    pdf.setFont('helvetica', 'bold');
    pdf.text('Trial Balance Report', pageWidth / 2, yPosition, { align: 'center' });
    yPosition += 10;

    // Date range
    pdf.setFontSize(10);
    pdf.setFont('helvetica', 'normal');
    pdf.text(`Period: ${this.formatDateRange(data.dateRange)}`, pageWidth / 2, yPosition, { align: 'center' });
    yPosition += 8;

    // Generation timestamp
    pdf.text(`Generated: ${data.generatedAt.toLocaleString()}`, pageWidth / 2, yPosition, { align: 'center' });
    yPosition += 15;

    return yPosition;
  }

  /**
   * Add PDF content with trial balance data
   */
  private async addPDFContent(
    pdf: jsPDF,
    data: TrialBalanceData,
    pageWidth: number,
    pageHeight: number,
    margin: number,
    yPosition: number,
    options: {
      includeCalculationDetails?: boolean;
      includeZeroBalances?: boolean;
    }
  ): Promise<number> {
    const lineHeight = 6;

    // Table headers
    pdf.setFontSize(9);
    pdf.setFont('helvetica', 'bold');
    
    const headers = ['Account Name', 'Category', 'Particulars', 'Debit', 'Credit', 'Balance'];
    const colWidths = [50, 25, 40, 20, 20, 20]; // Column widths in mm
    let xPosition = margin;

    // Draw header row
    headers.forEach((header, index) => {
      pdf.text(header, xPosition, yPosition);
      xPosition += colWidths[index];
    });
    yPosition += lineHeight + 2;

    // Draw header line
    pdf.line(margin, yPosition - 2, pageWidth - margin, yPosition - 2);
    yPosition += 2;

    // Add categories and accounts
    pdf.setFont('helvetica', 'normal');
    
    for (const category of data.categories) {
      // Check if we need a new page
      if (yPosition > pageHeight - 40) {
        pdf.addPage();
        yPosition = margin;
      }

      // Category header
      pdf.setFont('helvetica', 'bold');
      pdf.text(`${category.name}`, margin, yPosition);
      yPosition += lineHeight;
      pdf.setFont('helvetica', 'normal');

      // Add accounts
      for (const account of category.accounts) {
        // Skip zero balance accounts if option is set
        if (!options.includeZeroBalances && account.netBalance === 0) {
          continue;
        }

        // Check if we need a new page
        if (yPosition > pageHeight - 30) {
          pdf.addPage();
          yPosition = margin;
        }

        xPosition = margin;
        
        // Account data
        const accountData = [
          this.truncateText(account.accountName, 25),
          category.name,
          this.truncateText(account.particulars, 20),
          account.debitAmount.toFixed(2),
          account.creditAmount.toFixed(2),
          account.netBalance.toFixed(2)
        ];

        accountData.forEach((text, index) => {
          pdf.text(text, xPosition, yPosition);
          xPosition += colWidths[index];
        });
        yPosition += lineHeight;
      }

      // Category subtotal
      pdf.setFont('helvetica', 'bold');
      xPosition = margin + colWidths[0] + colWidths[1] + colWidths[2] + colWidths[3] + colWidths[4];
      pdf.text(`${category.subtotal.toFixed(2)}`, xPosition, yPosition);
      yPosition += lineHeight + 3;
      pdf.setFont('helvetica', 'normal');
    }

    // Add totals section
    yPosition += 5;
    pdf.line(margin, yPosition, pageWidth - margin, yPosition);
    yPosition += 8;

    pdf.setFont('helvetica', 'bold');
    pdf.text(`Total Debits: ${data.totalDebits.toFixed(2)}`, margin, yPosition);
    yPosition += lineHeight;
    pdf.text(`Total Credits: ${data.totalCredits.toFixed(2)}`, margin, yPosition);
    yPosition += lineHeight;
    pdf.text(`Final Balance: ${data.finalBalance.toFixed(2)}`, margin, yPosition);
    yPosition += lineHeight + 5;

    return yPosition;
  }

  /**
   * Add calculation details to PDF
   */
  private addPDFCalculationDetails(
    pdf: jsPDF,
    data: TrialBalanceData,
    pageWidth: number,
    pageHeight: number,
    margin: number,
    yPosition: number
  ): number {
    // Check if we need a new page
    if (yPosition > pageHeight - 50) {
      pdf.addPage();
      yPosition = margin;
    }

    pdf.setFont('helvetica', 'bold');
    pdf.text('Calculation Details:', margin, yPosition);
    yPosition += 8;

    pdf.setFont('helvetica', 'normal');
    pdf.text(`Expression: ${data.calculationExpression}`, margin, yPosition);
    yPosition += 6;
    pdf.text(`Total Transactions: ${data.totalTransactions}`, margin, yPosition);
    yPosition += 10;

    return yPosition;
  }

  /**
   * Add PDF footer
   */
  private addPDFFooter(pdf: jsPDF, data: TrialBalanceData, pageWidth: number, pageHeight: number): void {
    const totalPages = pdf.getNumberOfPages();
    
    for (let i = 1; i <= totalPages; i++) {
      pdf.setPage(i);
      pdf.setFontSize(8);
      pdf.setFont('helvetica', 'normal');
      
      // Page number
      pdf.text(`Page ${i} of ${totalPages}`, pageWidth - 30, pageHeight - 10);
      
      // Generation info
      pdf.text(`Generated on ${data.generatedAt.toLocaleDateString()}`, 20, pageHeight - 10);
    }
  }

  /**
   * Generate descriptive filename with date and format
   */
  private generateFilename(dateRange: DateRange, format: ExportFormat): string {
    const startDate = dateRange.startDate.toISOString().split('T')[0];
    const endDate = dateRange.endDate.toISOString().split('T')[0];
    const timestamp = new Date().toISOString().split('T')[0];
    
    return `trial-balance_${startDate}_to_${endDate}_${timestamp}.${format}`;
  }

  /**
   * Format date range for display
   */
  private formatDateRange(dateRange: DateRange): string {
    const startDate = dateRange.startDate.toLocaleDateString();
    const endDate = dateRange.endDate.toLocaleDateString();
    return `${startDate} to ${endDate}`;
  }

  /**
   * Escape CSV special characters
   */
  private escapeCSV(text: string): string {
    if (text.includes('"')) {
      return text.replace(/"/g, '""');
    }
    return text;
  }

  /**
   * Truncate text to fit in PDF columns
   */
  private truncateText(text: string, maxLength: number): string {
    if (text.length <= maxLength) {
      return text;
    }
    return text.substring(0, maxLength - 3) + '...';
  }

  /**
   * Export account drill-down data to CSV
   * @param accountId - Account identifier
   * @param accountName - Account name
   * @param transactions - Transaction details
   * @param dateRange - Date range for the export
   */
  async exportAccountTransactions(
    accountId: string,
    accountName: string,
    transactions: Array<{
      id: string;
      date: Date;
      categoryDescription: string;
      particulars: string;
      referenceNumber: string;
      debitAmount: number;
      creditAmount: number;
      runningBalance: number;
    }>,
    dateRange: DateRange
  ): Promise<void> {
    const filename = this.generateAccountTransactionsFilename(accountName, dateRange);
    
    const lines: string[] = [];
    
    // Add header information
    lines.push(`"${this.companyName}"`);
    lines.push(`"Account Transaction Details"`);
    lines.push(`"Account: ${this.escapeCSV(accountName)}"`);
    lines.push(`"Period: ${this.formatDateRange(dateRange)}"`);
    lines.push(`"Generated: ${new Date().toLocaleString()}"`);
    lines.push(''); // Empty line

    // Add column headers
    lines.push('"Date","Category Description","Particulars","Reference Number","Debit Amount","Credit Amount","Running Balance"');

    // Add transaction data
    transactions.forEach(transaction => {
      lines.push([
        `"${transaction.date.toLocaleDateString()}"`,
        `"${this.escapeCSV(transaction.categoryDescription)}"`,
        `"${this.escapeCSV(transaction.particulars)}"`,
        `"${this.escapeCSV(transaction.referenceNumber)}"`,
        `"${transaction.debitAmount}"`,
        `"${transaction.creditAmount}"`,
        `"${transaction.runningBalance}"`
      ].join(','));
    });

    const csvContent = lines.join('\n');
    const blob = new Blob([csvContent], { type: 'text/csv;charset=utf-8;' });
    saveAs(blob, filename);
  }

  /**
   * Generate filename for account transactions export
   */
  private generateAccountTransactionsFilename(accountName: string, dateRange: DateRange): string {
    const startDate = dateRange.startDate.toISOString().split('T')[0];
    const endDate = dateRange.endDate.toISOString().split('T')[0];
    const timestamp = new Date().toISOString().split('T')[0];
    const sanitizedAccountName = accountName.replace(/[^a-zA-Z0-9]/g, '_');
    
    return `account-transactions_${sanitizedAccountName}_${startDate}_to_${endDate}_${timestamp}.csv`;
  }
}

// Export singleton instance
export const trialBalanceExportService = new TrialBalanceExportService();