using System.ComponentModel.DataAnnotations;
using System.ComponentModel.DataAnnotations.Schema;

namespace GarmentsERP.API.Models.Accounting
{
    public enum JournalType
    {
        General,
        Sales,
        Purchase,
        CashReceipt,
        CashPayment,
        BankTransfer,
        Adjustment,
        Opening,
        Closing
    }
}
