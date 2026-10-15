using Microsoft.AspNetCore.Identity;
using Microsoft.AspNetCore.Mvc;
using GarmentsERP.API.Data;
using GarmentsERP.API.Models;
using GarmentsERP.API.Models.Users;

namespace GarmentsERP.API.Controllers
{
    public class AdminSetupRequest
    {
        public string Username { get; set; } = string.Empty;
        public string Password { get; set; } = string.Empty;
        public string? Email { get; set; }
        public string? FullName { get; set; }
    }
}
