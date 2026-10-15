using System.ComponentModel.DataAnnotations;
using System.ComponentModel.DataAnnotations.Schema;

namespace GarmentsERP.API.Models.Payments
{
    public enum PaymentMethod
    {
        Cash,
        Cheque,
        BankTransfer,
        CreditCard,
        DebitCard,
        OnlineTransfer
    }
}
