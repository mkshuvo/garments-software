using System.ComponentModel.DataAnnotations;
using System.ComponentModel.DataAnnotations.Schema;

namespace GarmentsERP.API.Models.Accounting
{
    public enum JournalStatus
    {
        Draft,
        Posted,
        Approved,
        Reversed
    }
}
