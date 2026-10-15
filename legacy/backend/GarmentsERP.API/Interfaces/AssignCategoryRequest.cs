using GarmentsERP.API.Models.Contacts;
using GarmentsERP.API.Models.Accounting;

namespace GarmentsERP.API.Interfaces
{
    public class AssignCategoryRequest
    {
        public Guid CategoryId { get; set; }
        public ContactRole Role { get; set; }
    }
}
