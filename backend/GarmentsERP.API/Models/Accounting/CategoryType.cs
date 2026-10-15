using System.ComponentModel.DataAnnotations;

namespace GarmentsERP.API.Models.Accounting
{
    public enum CategoryType
    {
        Credit = 0,  // Money In categories (e.g., "Received: Urbo ltd")
        Debit = 1    // Money Out categories (e.g., "Fabric Purchase", "Electric Bill")
    }
}
