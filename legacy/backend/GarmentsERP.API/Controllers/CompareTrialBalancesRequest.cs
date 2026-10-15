using Microsoft.AspNetCore.Mvc;
using Microsoft.AspNetCore.Authorization;
using GarmentsERP.API.Interfaces;
using GarmentsERP.API.DTOs;
using System.ComponentModel.DataAnnotations;
using System.Text.Json;

namespace GarmentsERP.API.Controllers
{
    // Request DTOs for the new implementation
    public class CompareTrialBalancesRequest
    {
        [Required]
        public TrialBalanceRequestDto Period1 { get; set; } = new();

        [Required]
        public TrialBalanceRequestDto Period2 { get; set; } = new();
    }
}
