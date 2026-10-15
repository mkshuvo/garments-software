using System.ComponentModel.DataAnnotations;
using System.ComponentModel.DataAnnotations.Schema;

namespace GarmentsERP.API.Models.Invoicing
{
    public enum InvoiceStatus
    {
        Draft,
        Sent,
        Paid,
        PartiallyPaid,
        Overdue,
        Cancelled,
        Void
    }
}
