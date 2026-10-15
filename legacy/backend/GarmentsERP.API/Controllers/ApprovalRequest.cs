using Microsoft.AspNetCore.Mvc;
using Microsoft.AspNetCore.Authorization;
using GarmentsERP.API.Interfaces;
using GarmentsERP.API.DTOs;
using GarmentsERP.API.Attributes;

namespace GarmentsERP.API.Controllers
{
    /// <summary>
    /// Approval request model
    /// </summary>
    public class ApprovalRequest
    {
        public string? Notes { get; set; }
    }
}
