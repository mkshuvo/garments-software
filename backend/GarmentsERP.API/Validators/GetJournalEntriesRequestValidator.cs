using FluentValidation;
using GarmentsERP.API.DTOs;

namespace GarmentsERP.API.Validators
{
    /// <summary>
    /// Validator for GetJournalEntriesRequest using FluentValidation
    /// </summary>
    public class GetJournalEntriesRequestValidator : AbstractValidator<GetJournalEntriesRequest>
    {
        public GetJournalEntriesRequestValidator()
        {
            // Page validation
            RuleFor(x => x.Page)
                .GreaterThan(0)
                .WithMessage("Page number must be greater than 0")
                .LessThanOrEqualTo(100)
                .WithMessage("Page number cannot exceed 100");

            // Limit validation
            RuleFor(x => x.Limit)
                .GreaterThan(0)
                .WithMessage("Limit must be greater than 0")
                .LessThanOrEqualTo(100)
                .WithMessage("Limit cannot exceed 100");

            // Date range validation
            RuleFor(x => x.DateFrom)
                .Must(BeValidDate)
                .When(x => x.DateFrom.HasValue)
                .WithMessage("Invalid date format for DateFrom");

            RuleFor(x => x.DateTo)
                .Must(BeValidDate)
                .When(x => x.DateTo.HasValue)
                .WithMessage("Invalid date format for DateTo");

            // Date range logic validation
            RuleFor(x => x)
                .Must(HaveValidDateRange)
                .When(x => x.DateFrom.HasValue && x.DateTo.HasValue)
                .WithMessage("DateFrom must be less than or equal to DateTo");

            // Type validation
            RuleFor(x => x.Type)
                .Must(BeValidType)
                .WithMessage("Type must be 'All', 'Credit', or 'Debit'");

            // Amount range validation
            RuleFor(x => x.AmountMin)
                .GreaterThanOrEqualTo(0)
                .When(x => x.AmountMin.HasValue)
                .WithMessage("Minimum amount must be non-negative");

            RuleFor(x => x.AmountMax)
                .GreaterThanOrEqualTo(0)
                .When(x => x.AmountMax.HasValue)
                .WithMessage("Maximum amount must be non-negative");

            // Amount range logic validation
            RuleFor(x => x)
                .Must(HaveValidAmountRange)
                .When(x => x.AmountMin.HasValue && x.AmountMax.HasValue)
                .WithMessage("AmountMin must be less than or equal to AmountMax");

            // Category validation
            RuleFor(x => x.Category)
                .MaximumLength(200)
                .When(x => !string.IsNullOrEmpty(x.Category))
                .WithMessage("Category name cannot exceed 200 characters");

            // Reference number validation
            RuleFor(x => x.ReferenceNumber)
                .MaximumLength(50)
                .When(x => !string.IsNullOrEmpty(x.ReferenceNumber))
                .WithMessage("Reference number cannot exceed 50 characters");

            // Contact name validation
            RuleFor(x => x.ContactName)
                .MaximumLength(200)
                .When(x => !string.IsNullOrEmpty(x.ContactName))
                .WithMessage("Contact name cannot exceed 200 characters");

            // Description validation
            RuleFor(x => x.Description)
                .MaximumLength(500)
                .When(x => !string.IsNullOrEmpty(x.Description))
                .WithMessage("Description cannot exceed 500 characters");

            // Status validation
            RuleFor(x => x.Status)
                .Must(BeValidStatus)
                .WithMessage("Status must be 'All', 'Draft', 'Posted', 'Approved', or 'Reversed'");

            // Sort field validation
            RuleFor(x => x.SortBy)
                .Must(BeValidSortField)
                .WithMessage("SortBy must be a valid field: TransactionDate, Amount, Type, Category, ReferenceNumber, or CreatedAt");

            // Sort order validation
            RuleFor(x => x.SortOrder)
                .Must(BeValidSortOrder)
                .WithMessage("SortOrder must be 'asc' or 'desc'");

            // Custom validation for business rules
            RuleFor(x => x)
                .Must(HaveReasonableDateRange)
                .When(x => x.DateFrom.HasValue && x.DateTo.HasValue)
                .WithMessage("Date range cannot exceed 5 years");

            RuleFor(x => x)
                .Must(HaveReasonableAmountRange)
                .When(x => x.AmountMin.HasValue && x.AmountMax.HasValue)
                .WithMessage("Amount range cannot exceed 1 billion");
        }

        /// <summary>
        /// Validates if the date is in a reasonable range
        /// </summary>
        private bool BeValidDate(DateTime? date)
        {
            if (!date.HasValue) return true;
            
            var minDate = new DateTime(1900, 1, 1);
            var maxDate = DateTime.UtcNow.AddYears(10); // Allow future dates up to 10 years
            
            return date.Value >= minDate && date.Value <= maxDate;
        }

        /// <summary>
        /// Validates if the date range is logical
        /// </summary>
        private bool HaveValidDateRange(GetJournalEntriesRequest request)
        {
            if (!request.DateFrom.HasValue || !request.DateTo.HasValue) return true;
            
            return request.DateFrom.Value <= request.DateTo.Value;
        }

        /// <summary>
        /// Validates if the type is valid
        /// </summary>
        private bool BeValidType(string type)
        {
            return type == "All" || type == "Credit" || type == "Debit";
        }

        /// <summary>
        /// Validates if the amount range is logical
        /// </summary>
        private bool HaveValidAmountRange(GetJournalEntriesRequest request)
        {
            if (!request.AmountMin.HasValue || !request.AmountMax.HasValue) return true;
            
            return request.AmountMin.Value <= request.AmountMax.Value;
        }

        /// <summary>
        /// Validates if the status is valid
        /// </summary>
        private bool BeValidStatus(string status)
        {
            return status == "All" || status == "Draft" || status == "Posted" || status == "Approved" || status == "Reversed";
        }

        /// <summary>
        /// Validates if the sort field is valid
        /// </summary>
        private bool BeValidSortField(string sortBy)
        {
            var validFields = new[] { "TransactionDate", "Amount", "Type", "Category", "ReferenceNumber", "CreatedAt" };
            return validFields.Contains(sortBy);
        }

        /// <summary>
        /// Validates if the sort order is valid
        /// </summary>
        private bool BeValidSortOrder(string sortOrder)
        {
            return sortOrder == "asc" || sortOrder == "desc";
        }

        /// <summary>
        /// Validates if the date range is reasonable (not too large)
        /// </summary>
        private bool HaveReasonableDateRange(GetJournalEntriesRequest request)
        {
            if (!request.DateFrom.HasValue || !request.DateTo.HasValue) return true;
            
            var dateRange = request.DateTo.Value - request.DateFrom.Value;
            var maxRange = TimeSpan.FromDays(365 * 5); // 5 years
            
            return dateRange <= maxRange;
        }

        /// <summary>
        /// Validates if the amount range is reasonable (not too large)
        /// </summary>
        private bool HaveReasonableAmountRange(GetJournalEntriesRequest request)
        {
            if (!request.AmountMin.HasValue || !request.AmountMax.HasValue) return true;
            
            var amountRange = request.AmountMax.Value - request.AmountMin.Value;
            var maxRange = 1_000_000_000m; // 1 billion
            
            return amountRange <= maxRange;
        }
    }
}
