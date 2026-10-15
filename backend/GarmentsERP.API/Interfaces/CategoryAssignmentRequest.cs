using GarmentsERP.API.Models.Contacts;
using GarmentsERP.API.Models.Accounting;

namespace GarmentsERP.API.Interfaces
{
    public class CategoryAssignmentRequest
    {
        public Guid CategoryId { get; set; }
        public ContactRole Role { get; set; }
    }
}
