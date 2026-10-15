using System.ComponentModel.DataAnnotations;

namespace GarmentsERP.API.DTOs
{
    /// <summary>
    /// Export request model
    /// </summary>
    public class ExportJournalEntriesRequest
    {
        [Required(ErrorMessage = "Export format is required")]
        [RegularExpression("^(csv|excel|pdf)$", ErrorMessage = "Export format must be csv, excel, or pdf")]
        public string Format { get; set; } = "csv";

        public GetJournalEntriesRequest Filters { get; set; } = new();

        public bool IncludeDetails { get; set; } = false;

        [MaxLength(50, ErrorMessage = "Date format cannot exceed 50 characters")]
        public string DateFormat { get; set; } = "MMM dd, yyyy";

        [MaxLength(50, ErrorMessage = "Currency format cannot exceed 50 characters")]
        public string CurrencyFormat { get; set; } = "C2";

        public bool IncludeSummary { get; set; } = true;
        public bool IncludeHeaders { get; set; } = true;
    }
}
