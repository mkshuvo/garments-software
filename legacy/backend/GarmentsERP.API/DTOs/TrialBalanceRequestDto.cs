using System.ComponentModel.DataAnnotations;

namespace GarmentsERP.API.DTOs
{
    /// <summary>
    /// Request DTO for trial balance generation with date range and filtering options
    /// </summary>
    public class TrialBalanceRequestDto
    {
        /// <summary>
        /// Start date for the trial balance report (inclusive)
        /// </summary>
        /// <example>2024-01-01</example>
        [Required(ErrorMessage = "Start date is required")]
        public DateTime StartDate { get; set; }

        /// <summary>
        /// End date for the trial balance report (inclusive)
        /// </summary>
        /// <example>2024-01-31</example>
        [Required(ErrorMessage = "End date is required")]
        public DateTime EndDate { get; set; }

        /// <summary>
        /// Whether to group accounts by category (Assets, Liabilities, Equity, Income, Expenses)
        /// </summary>
        /// <example>true</example>
        public bool GroupByCategory { get; set; } = true;

        /// <summary>
        /// Whether to include accounts with zero balances in the report
        /// </summary>
        /// <example>false</example>
        public bool IncludeZeroBalances { get; set; } = false;

        /// <summary>
        /// Optional filter to include only specific account categories
        /// </summary>
        /// <example>["Assets", "Liabilities"]</example>
        public List<string> CategoryFilter { get; set; } = new();

        /// <summary>
        /// Validates the date range and other business rules
        /// </summary>
        /// <returns>True if the request is valid, false otherwise</returns>
        public bool IsValid()
        {
            return StartDate <= EndDate && StartDate != default && EndDate != default;
        }

        /// <summary>
        /// Gets validation error messages for the request
        /// </summary>
        /// <returns>List of validation error messages</returns>
        public List<string> GetValidationErrors()
        {
            var errors = new List<string>();

            if (StartDate == default)
                errors.Add("Start date is required");

            if (EndDate == default)
                errors.Add("End date is required");

            if (StartDate > EndDate)
                errors.Add("Start date must not be later than end date");

            var daysDifference = (EndDate - StartDate).Days;
            if (daysDifference > 365)
                errors.Add("Date range cannot exceed 365 days for performance reasons");

            return errors;
        }
    }
}