using Microsoft.AspNetCore.Mvc;
using GarmentsERP.API.DTOs;

namespace GarmentsERP.API.Controllers
{
    /// <summary>
    /// Development-only Trial Balance Controller (No Authentication Required)
    /// </summary>
    [ApiController]
    [Route("api/dev/trial-balance")]
    [Produces("application/json")]
    public class DevTrialBalanceController : ControllerBase
    {
        private readonly ILogger<DevTrialBalanceController> _logger;

        public DevTrialBalanceController(ILogger<DevTrialBalanceController> logger)
        {
            _logger = logger;
        }

        /// <summary>
        /// Development-only trial balance endpoint with mock data
        /// </summary>
        [HttpGet]
        public IActionResult GetTrialBalance([FromQuery] TrialBalanceRequestDto request)
        {
            try
            {
                _logger.LogInformation("Development trial balance requested for {StartDate} to {EndDate}", 
                    request.StartDate, request.EndDate);

                // Return mock data for development
                var mockResponse = new TrialBalanceResponseDto
                {
                    DateRange = new DateRangeDto
                    {
                        StartDate = request.StartDate,
                        EndDate = request.EndDate
                    },
                    Categories = new List<AccountCategoryDto>
                    {
                        new AccountCategoryDto
                        {
                            Name = "Assets",
                            Accounts = new List<TrialBalanceAccountDto>
                            {
                                new TrialBalanceAccountDto
                                {
                                    AccountId = Guid.NewGuid(),
                                    AccountName = "Cash at Bank",
                                    CategoryName = "Assets",
                                    CategoryDescription = "Current Assets - Cash & Bank",
                                    Particulars = "Bank deposits and cash transactions",
                                    DebitAmount = -50000,
                                    CreditAmount = 0,
                                    NetBalance = -50000,
                                    TransactionCount = 15
                                },
                                new TrialBalanceAccountDto
                                {
                                    AccountId = Guid.NewGuid(),
                                    AccountName = "Accounts Receivable",
                                    CategoryName = "Assets",
                                    CategoryDescription = "Current Assets - Accounts Receivable",
                                    Particulars = "Customer outstanding payments",
                                    DebitAmount = -25000,
                                    CreditAmount = 0,
                                    NetBalance = -25000,
                                    TransactionCount = 8
                                }
                            },
                            Subtotal = -75000
                        },
                        new AccountCategoryDto
                        {
                            Name = "Liabilities",
                            Accounts = new List<TrialBalanceAccountDto>
                            {
                                new TrialBalanceAccountDto
                                {
                                    AccountId = Guid.NewGuid(),
                                    AccountName = "Accounts Payable",
                                    CategoryName = "Liabilities",
                                    CategoryDescription = "Current Liabilities - Accounts Payable",
                                    Particulars = "Supplier outstanding payments",
                                    DebitAmount = 0,
                                    CreditAmount = 15000,
                                    NetBalance = 15000,
                                    TransactionCount = 5
                                }
                            },
                            Subtotal = 15000
                        },
                        new AccountCategoryDto
                        {
                            Name = "Income",
                            Accounts = new List<TrialBalanceAccountDto>
                            {
                                new TrialBalanceAccountDto
                                {
                                    AccountId = Guid.NewGuid(),
                                    AccountName = "Sales Revenue",
                                    CategoryName = "Income",
                                    CategoryDescription = "Revenue - Sales",
                                    Particulars = "Product sales and services",
                                    DebitAmount = 0,
                                    CreditAmount = 100000,
                                    NetBalance = 100000,
                                    TransactionCount = 25
                                }
                            },
                            Subtotal = 100000
                        },
                        new AccountCategoryDto
                        {
                            Name = "Expenses",
                            Accounts = new List<TrialBalanceAccountDto>
                            {
                                new TrialBalanceAccountDto
                                {
                                    AccountId = Guid.NewGuid(),
                                    AccountName = "Cost of Goods Sold",
                                    CategoryName = "Expenses",
                                    CategoryDescription = "Expenses - Cost of Goods Sold",
                                    Particulars = "Direct costs of products sold",
                                    DebitAmount = -35000,
                                    CreditAmount = 0,
                                    NetBalance = -35000,
                                    TransactionCount = 12
                                }
                            },
                            Subtotal = -35000
                        }
                    },
                    TotalDebits = 110000,
                    TotalCredits = 115000,
                    FinalBalance = 5000,
                    CalculationExpression = "-50000 + -25000 + 15000 + 100000 + -35000 = 5000",
                    GeneratedAt = DateTime.UtcNow,
                    TotalTransactions = 65
                };

                return Ok(mockResponse);
            }
            catch (Exception ex)
            {
                _logger.LogError(ex, "Error generating development trial balance");
                return StatusCode(500, new { message = "Internal server error" });
            }
        }
    }
}