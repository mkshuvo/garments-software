using System.ComponentModel.DataAnnotations;
using System.ComponentModel.DataAnnotations.Schema;

namespace GarmentsERP.API.Models.Accounting
{
    public enum TrialBalanceStatus
    {
        Draft,
        Generated,
        Approved,
        Archived
    }
}
