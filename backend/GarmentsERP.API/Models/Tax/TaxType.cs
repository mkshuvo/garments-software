using System.ComponentModel.DataAnnotations;
using System.ComponentModel.DataAnnotations.Schema;

namespace GarmentsERP.API.Models.Tax
{
    public enum TaxType
    {
        GST,
        VAT,
        SalesTax,
        ServiceTax,
        ExciseDuty,
        Custom
    }
}
