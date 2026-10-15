using Microsoft.AspNetCore.Identity;
using System.ComponentModel.DataAnnotations;

namespace GarmentsERP.API.Models
{
    public enum UserRoles
    {
        Admin,
        Manager,
        Employee,
        Vendor,
        Customer
    }
}
