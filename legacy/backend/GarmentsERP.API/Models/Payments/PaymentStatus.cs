using System.ComponentModel.DataAnnotations;
using System.ComponentModel.DataAnnotations.Schema;

namespace GarmentsERP.API.Models.Payments
{
    public enum PaymentStatus
    {
        Draft,
        Posted,
        Cleared,
        Bounced,
        Cancelled
    }
}
