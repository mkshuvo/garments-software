using Microsoft.EntityFrameworkCore;
using GarmentsERP.API.Data;
using GarmentsERP.API.Models.Accounting;
using GarmentsERP.API.Models.Contacts;
using GarmentsERP.API.Models.Payments;

namespace GarmentsERP.API.Services
{
    public class ImportResult
    {
        public bool IsSuccess { get; set; }
        public string Message { get; set; } = string.Empty;
        public int AccountsCreated { get; set; }
        public int ContactsCreated { get; set; }
        public int TransactionsImported { get; set; }
        public bool TrialBalanceValidated { get; set; }
    }
}
