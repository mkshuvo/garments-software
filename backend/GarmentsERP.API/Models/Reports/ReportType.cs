using System.ComponentModel.DataAnnotations;
using System.ComponentModel.DataAnnotations.Schema;

namespace GarmentsERP.API.Models.Reports
{
    public enum ReportType
    {
        TrialBalance,
        ProfitAndLoss,
        BalanceSheet,
        CashFlow,
        AgedReceivables,
        AgedPayables,
        SalesReport,
        PurchaseReport,
        StockReport,
        Custom
    }
}
