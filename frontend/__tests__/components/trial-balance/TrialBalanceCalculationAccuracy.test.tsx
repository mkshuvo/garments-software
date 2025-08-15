import React from 'react';
import { render, screen } from '@testing-library/react';
import '@testing-library/jest-dom';

// Test mathematical accuracy of trial balance calculations
describe('Trial Balance Mathematical Accuracy Tests', () => {
  
  // Helper function to simulate trial balance calculation
  const calculateTrialBalance = (transactions: Array<{debit: number, credit: number}>) => {
    let totalDebits = 0;
    let totalCredits = 0;
    
    transactions.forEach(transaction => {
      totalDebits += transaction.debit;
      totalCredits += transaction.credit;
    });
    
    // In trial balance: debits are negative, credits are positive
    const finalBalance = totalCredits - totalDebits;
    
    return {
      totalDebits,
      totalCredits,
      finalBalance,
      expression: generateExpression(transactions, finalBalance)
    };
  };
  
  const generateExpression = (transactions: Array<{debit: number, credit: number}>, finalBalance: number) => {
    const terms: string[] = [];
    
    transactions.forEach(transaction => {
      if (transaction.credit > 0) {
        terms.push(transaction.credit.toString());
      }
      if (transaction.debit > 0) {
        terms.push(`-${transaction.debit}`);
      }
    });
    
    let expression = terms.join(' + ').replace(/\+ -/g, ' - ');
    return `${expression} = ${finalBalance}`;
  };

  describe('Mathematical Accuracy', () => {
    it('calculates correct balance for the example scenario: 1000 - 1100 + 11000 - 1000 = 9900', () => {
      // Arrange - The specific scenario from requirements
      const transactions = [
        { debit: 0, credit: 1000 },    // Credit 1000
        { debit: 1100, credit: 0 },    // Debit 1100
        { debit: 0, credit: 11000 },   // Credit 11000
        { debit: 1000, credit: 0 }     // Debit 1000
      ];

      // Act
      const result = calculateTrialBalance(transactions);

      // Assert
      expect(result.finalBalance).toBe(9900); // 1000 - 1100 + 11000 - 1000 = 9900
      expect(result.totalDebits).toBe(2100); // 1100 + 1000
      expect(result.totalCredits).toBe(12000); // 1000 + 11000
      expect(result.expression).toContain('= 9900');
    });

    it('handles mixed positive and negative amounts correctly', () => {
      const scenarios = [
        {
          transactions: [
            { debit: 0, credit: 1000 },
            { debit: 500, credit: 0 },
            { debit: 0, credit: 2000 },
            { debit: 300, credit: 0 }
          ],
          expectedBalance: 2200 // 1000 - 500 + 2000 - 300 = 2200
        },
        {
          transactions: [
            { debit: 1000, credit: 0 },
            { debit: 500, credit: 0 },
            { debit: 300, credit: 0 }
          ],
          expectedBalance: -1800 // -1000 - 500 - 300 = -1800
        },
        {
          transactions: [
            { debit: 0, credit: 5000 },
            { debit: 0, credit: 3000 },
            { debit: 0, credit: 2000 }
          ],
          expectedBalance: 10000 // 5000 + 3000 + 2000 = 10000
        }
      ];

      scenarios.forEach((scenario, index) => {
        const result = calculateTrialBalance(scenario.transactions);
        expect(result.finalBalance).toBe(scenario.expectedBalance);
      });
    });

    it('handles decimal precision correctly', () => {
      const transactions = [
        { debit: 0, credit: 1000.50 },
        { debit: 500.25, credit: 0 },
        { debit: 0, credit: 250.75 }
      ];

      const result = calculateTrialBalance(transactions);
      
      expect(result.finalBalance).toBe(751.00); // 1000.50 - 500.25 + 250.75 = 751.00
      expect(result.totalDebits).toBe(500.25);
      expect(result.totalCredits).toBe(1251.25);
    });

    it('handles zero amounts correctly', () => {
      const transactions = [
        { debit: 0, credit: 0 },
        { debit: 0, credit: 0 },
        { debit: 0, credit: 0 }
      ];

      const result = calculateTrialBalance(transactions);
      
      expect(result.finalBalance).toBe(0);
      expect(result.totalDebits).toBe(0);
      expect(result.totalCredits).toBe(0);
    });

    it('handles balancing amounts (net zero)', () => {
      const transactions = [
        { debit: 0, credit: 999.99 },
        { debit: 999.99, credit: 0 }
      ];

      const result = calculateTrialBalance(transactions);
      
      expect(result.finalBalance).toBe(0); // 999.99 - 999.99 = 0
      expect(result.totalDebits).toBe(999.99);
      expect(result.totalCredits).toBe(999.99);
    });

    it('handles very large numbers correctly', () => {
      const transactions = [
        { debit: 0, credit: 999999999999.99 },
        { debit: 999999999999.98, credit: 0 }
      ];

      const result = calculateTrialBalance(transactions);
      
      expect(result.finalBalance).toBeCloseTo(0.01, 2); // 999999999999.99 - 999999999999.98 = 0.01
      expect(result.totalDebits).toBe(999999999999.98);
      expect(result.totalCredits).toBe(999999999999.99);
    });

    it('maintains precision with many small transactions', () => {
      const transactions: Array<{debit: number, credit: number}> = [];
      let expectedBalance = 0;

      for (let i = 1; i <= 100; i++) {
        const amount = 0.01 * i; // 0.01, 0.02, 0.03, ... 1.00
        if (i % 2 === 0) { // Even numbers as credits
          transactions.push({ debit: 0, credit: amount });
          expectedBalance += amount;
        } else { // Odd numbers as debits
          transactions.push({ debit: amount, credit: 0 });
          expectedBalance -= amount;
        }
      }

      const result = calculateTrialBalance(transactions);
      
      // Use toBeCloseTo for floating point precision
      expect(result.finalBalance).toBeCloseTo(expectedBalance, 2);
      expect(transactions.length).toBe(100);
    });
  });

  describe('Performance with Large Datasets', () => {
    it('calculates 1000 transactions within reasonable time', () => {
      // Arrange
      const transactions: Array<{debit: number, credit: number}> = [];
      for (let i = 0; i < 1000; i++) {
        if (i % 2 === 0) {
          transactions.push({ debit: 0, credit: i + 1 });
        } else {
          transactions.push({ debit: i + 1, credit: 0 });
        }
      }

      // Act
      const startTime = performance.now();
      const result = calculateTrialBalance(transactions);
      const endTime = performance.now();

      // Assert
      const calculationTime = endTime - startTime;
      expect(calculationTime).toBeLessThan(10); // Should complete within 10ms
      expect(result).toBeDefined();
      expect(typeof result.finalBalance).toBe('number');
    });

    it('calculates 10000 transactions within reasonable time', () => {
      // Arrange
      const transactions: Array<{debit: number, credit: number}> = [];
      for (let i = 0; i < 10000; i++) {
        if (i % 2 === 0) {
          transactions.push({ debit: 0, credit: Math.random() * 1000 });
        } else {
          transactions.push({ debit: Math.random() * 1000, credit: 0 });
        }
      }

      // Act
      const startTime = performance.now();
      const result = calculateTrialBalance(transactions);
      const endTime = performance.now();

      // Assert
      const calculationTime = endTime - startTime;
      expect(calculationTime).toBeLessThan(100); // Should complete within 100ms
      expect(result).toBeDefined();
      expect(typeof result.finalBalance).toBe('number');
    });
  });

  describe('Expression Generation', () => {
    it('generates correct mathematical expression for simple case', () => {
      const transactions = [
        { debit: 0, credit: 1000 },
        { debit: 500, credit: 0 }
      ];

      const result = calculateTrialBalance(transactions);
      
      expect(result.expression).toContain('1000');
      expect(result.expression).toContain('- 500');
      expect(result.expression).toContain('= 500');
    });

    it('generates correct expression for complex case', () => {
      const transactions = [
        { debit: 0, credit: 1500.50 },
        { debit: 750.25, credit: 0 },
        { debit: 0, credit: 2000.00 },
        { debit: 500.75, credit: 0 }
      ];

      const result = calculateTrialBalance(transactions);
      
      expect(result.expression).toContain('1500.5');
      expect(result.expression).toContain('- 750.25');
      expect(result.expression).toContain('2000');
      expect(result.expression).toContain('- 500.75');
      expect(result.expression).toContain('= 2249.5');
    });
  });

  describe('Edge Cases', () => {
    it('handles empty transaction list', () => {
      const transactions: Array<{debit: number, credit: number}> = [];

      const result = calculateTrialBalance(transactions);
      
      expect(result.finalBalance).toBe(0);
      expect(result.totalDebits).toBe(0);
      expect(result.totalCredits).toBe(0);
    });

    it('handles single transaction', () => {
      const transactions = [
        { debit: 0, credit: 1000 }
      ];

      const result = calculateTrialBalance(transactions);
      
      expect(result.finalBalance).toBe(1000);
      expect(result.totalDebits).toBe(0);
      expect(result.totalCredits).toBe(1000);
    });

    it('handles transactions with both debit and credit (compound entries)', () => {
      const transactions = [
        { debit: 300, credit: 500 } // Net credit of 200
      ];

      const result = calculateTrialBalance(transactions);
      
      expect(result.finalBalance).toBe(200); // 500 - 300 = 200
      expect(result.totalDebits).toBe(300);
      expect(result.totalCredits).toBe(500);
    });
  });

  describe('Data Integrity', () => {
    it('ensures debits and credits are properly signed in calculations', () => {
      const transactions = [
        { debit: 1000, credit: 0 },   // Should contribute -1000 to balance
        { debit: 0, credit: 1000 }    // Should contribute +1000 to balance
      ];

      const result = calculateTrialBalance(transactions);
      
      // Net effect should be zero
      expect(result.finalBalance).toBe(0);
      
      // But totals should reflect actual amounts
      expect(result.totalDebits).toBe(1000);
      expect(result.totalCredits).toBe(1000);
    });

    it('validates that the accounting equation balances', () => {
      // In a proper trial balance, the sum of all debits should equal the sum of all credits
      // when considering the natural balance of account types
      const transactions = [
        // Assets (normally debit balance)
        { debit: 5000, credit: 0 },   // Cash
        { debit: 3000, credit: 0 },   // Accounts Receivable
        
        // Liabilities (normally credit balance)  
        { debit: 0, credit: 2000 },   // Accounts Payable
        
        // Equity (normally credit balance)
        { debit: 0, credit: 4000 },   // Owner's Equity
        
        // Revenue (normally credit balance)
        { debit: 0, credit: 3000 },   // Sales Revenue
        
        // Expenses (normally debit balance)
        { debit: 1000, credit: 0 }    // Office Expenses
      ];

      const result = calculateTrialBalance(transactions);
      
      // Total debits: 5000 + 3000 + 1000 = 9000
      // Total credits: 2000 + 4000 + 3000 = 9000
      expect(result.totalDebits).toBe(9000);
      expect(result.totalCredits).toBe(9000);
      expect(result.finalBalance).toBe(0); // Should balance to zero
    });
  });
});