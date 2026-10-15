using System.ComponentModel.DataAnnotations;
using System.ComponentModel.DataAnnotations.Schema;

namespace GarmentsERP.API.Models.Banking
{
    public enum ReconciliationStatus
    {
        InProgress,
        Completed,
        Reviewed
    }
}
