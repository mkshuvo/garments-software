using Microsoft.AspNetCore.Mvc;
using Microsoft.AspNetCore.Authorization;
using GarmentsERP.API.Interfaces;
using GarmentsERP.API.DTOs;
using System.ComponentModel.DataAnnotations;
using System.Text.Json;

namespace GarmentsERP.API.Controllers
{
    // Enhanced error response DTOs for API documentation
    public class ErrorResponse
    {
        public bool Success { get; set; } = false;
        public string Message { get; set; } = string.Empty;
        public string ErrorCode { get; set; } = string.Empty;
        public DateTime Timestamp { get; set; } = DateTime.UtcNow;
        public string? RequestId { get; set; }
        public Dictionary<string, object>? Details { get; set; }
    }
}
