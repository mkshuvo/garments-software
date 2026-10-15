using Microsoft.EntityFrameworkCore;
using GarmentsERP.API.Data;
using GarmentsERP.API.Models.Accounting;
using GarmentsERP.API.Models.Contacts;
using GarmentsERP.API.Models.Payments;

namespace GarmentsERP.API.Services
{
    public class TrialBalanceData
    {
        public decimal TotalReceived { get; set; }
        public decimal TotalExpenses { get; set; }
        public decimal CashInHand { get; set; }
        public DateTime AsOfDate { get; set; }
    }
}
