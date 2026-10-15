using System.ComponentModel.DataAnnotations;

namespace GarmentsERP.API.DTOs
{
    /// <summary>
    /// DTO for a saved transaction in the history
    /// </summary>
    public class SavedTransactionDto
    {
        public Guid Id { get; set; }
        public string Type { get; set; } = string.Empty; // "Credit" or "Debit"
        public DateTime Date { get; set; }
        public string CategoryName { get; set; } = string.Empty;
        public string Particulars { get; set; } = string.Empty;
        public decimal Amount { get; set; }
        public string ReferenceNumber { get; set; } = string.Empty;
        public string? ContactName { get; set; }
        public string? SupplierName { get; set; }
        public string? BuyerName { get; set; }
        public DateTime CreatedAt { get; set; }
    }
}
