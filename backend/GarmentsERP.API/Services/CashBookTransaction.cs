using Microsoft.EntityFrameworkCore;
using GarmentsERP.API.Data;
using GarmentsERP.API.Models.Accounting;
using GarmentsERP.API.Models.Contacts;
using GarmentsERP.API.Models.Payments;

namespace GarmentsERP.API.Services
{
    public class CashBookTransaction
    {
        public DateTime Date { get; set; }
        public string CreditCategory { get; set; } = string.Empty;
        public string DebitCategory { get; set; } = string.Empty;
        public string Supplier { get; set; } = string.Empty;
        public string Buyer { get; set; } = string.Empty;
        public string Description { get; set; } = string.Empty;
        public decimal CreditAmount { get; set; }
        public decimal DebitAmount { get; set; }
        public string? Reference { get; set; }
    }
}
