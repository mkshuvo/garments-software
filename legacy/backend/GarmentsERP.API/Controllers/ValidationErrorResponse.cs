using Microsoft.AspNetCore.Mvc;
using Microsoft.AspNetCore.Authorization;
using GarmentsERP.API.Interfaces;
using GarmentsERP.API.DTOs;
using System.ComponentModel.DataAnnotations;
using System.Text.Json;

namespace GarmentsERP.API.Controllers
{
    public class ValidationErrorResponse : ErrorResponse
    {
        public Dictionary<string, string[]> Errors { get; set; } = new();
        public string[]? Warnings { get; set; }
    }
}
