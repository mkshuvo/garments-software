using System.ComponentModel.DataAnnotations;

namespace GarmentsERP.API.DTOs
{
    /// <summary>
    /// Account summary statistics DTO
    /// </summary>
    public class AccountSummaryDto
    {
        /// <summary>
        /// Total debit amount for the period
        /// </summary>
        /// <example>-2500.00</example>
        public decimal TotalDebits { get; set; }

        /// <summary>
        /// Total credit amount for the period
        /// </summary>
        /// <example>3000.00</example>
        public decimal TotalCredits { get; set; }

        /// <summary>
        /// Net balance for the period
        /// </summary>
        /// <example>500.00</example>
        public decimal NetBalance { get; set; }

        /// <summary>
        /// Opening balance at the start of the period
        /// </summary>
        /// <example>0.00</example>
        public decimal OpeningBalance { get; set; }

        /// <summary>
        /// Closing balance at the end of the period
        /// </summary>
        /// <example>500.00</example>
        public decimal ClosingBalance { get; set; }

        /// <summary>
        /// Number of transactions in the period
        /// </summary>
        /// <example>15</example>
        public int TransactionCount { get; set; }
    }
}
