using Microsoft.AspNetCore.Mvc;
using Microsoft.AspNetCore.Authorization;
using GarmentsERP.API.Interfaces;
using GarmentsERP.API.DTOs;
using GarmentsERP.API.Attributes;

namespace GarmentsERP.API.Controllers
{
    /// <summary>
    /// Reversal request model
    /// </summary>
    public class ReversalRequest
    {
        public string Reason { get; set; } = string.Empty;
    }
}
