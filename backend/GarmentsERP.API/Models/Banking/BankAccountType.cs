using System.ComponentModel.DataAnnotations;
using System.ComponentModel.DataAnnotations.Schema;

namespace GarmentsERP.API.Models.Banking
{
    public enum BankAccountType
    {
        Savings,
        Current,
        FixedDeposit,
        CashCredit,
        OverdraftAccount
    }
}
