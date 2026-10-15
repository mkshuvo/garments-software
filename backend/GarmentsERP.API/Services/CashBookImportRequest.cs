using Microsoft.EntityFrameworkCore;
using GarmentsERP.API.Data;
using GarmentsERP.API.Models.Accounting;
using GarmentsERP.API.Models.Contacts;
using GarmentsERP.API.Models.Payments;

namespace GarmentsERP.API.Services
{
    // DTOs for the import service
    public class CashBookImportRequest
    {
        public List<CashBookTransaction> Transactions { get; set; } = new();
        public List<string> Categories { get; set; } = new();
        public List<string> Suppliers { get; set; } = new();
        public List<string> Buyers { get; set; } = new();
        public TrialBalanceData TrialBalance { get; set; } = new();
    }
}
