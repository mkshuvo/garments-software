using System.ComponentModel.DataAnnotations;
using System.ComponentModel.DataAnnotations.Schema;

namespace GarmentsERP.API.Models.Contacts
{
    public enum ContactType
    {
        Customer,
        Supplier,
        Both
    }
}
