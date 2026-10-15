using System.ComponentModel.DataAnnotations;
using System.ComponentModel.DataAnnotations.Schema;

namespace GarmentsERP.API.Models.Banking
{
    public enum TransferStatus
    {
        Draft,
        Pending,
        Completed,
        Failed,
        Cancelled
    }
}
