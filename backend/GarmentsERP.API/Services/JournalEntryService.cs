using Microsoft.EntityFrameworkCore;
using Microsoft.Extensions.Logging;
using GarmentsERP.API.Data;
using GarmentsERP.API.DTOs;
using GarmentsERP.API.Models.Accounting;

namespace GarmentsERP.API.Services
{
    /// <summary>
    /// Service for managing journal entries with advanced filtering and optimization
    /// </summary>
    public interface IJournalEntryService
    {
        Task<GetJournalEntriesResponse> GetJournalEntriesAsync(GetJournalEntriesRequest request);
        Task<JournalEntryDetailDto> GetJournalEntryByIdAsync(Guid id);
        Task<JournalEntryStatisticsResponse> GetStatisticsAsync(JournalEntryStatisticsRequest request);
        Task<ExportJournalEntriesResponse> ExportJournalEntriesAsync(ExportJournalEntriesRequest request);
    }

    public class JournalEntryService : IJournalEntryService
    {
        private readonly ApplicationDbContext _context;
        private readonly ILogger<JournalEntryService> _logger;

        public JournalEntryService(ApplicationDbContext context, ILogger<JournalEntryService> logger)
        {
            _context = context;
            _logger = logger;
        }

        /// <summary>
        /// Get journal entries with advanced filtering, pagination, and optimization
        /// </summary>
        public async Task<GetJournalEntriesResponse> GetJournalEntriesAsync(GetJournalEntriesRequest request)
        {
            try
            {
                _logger.LogInformation("Getting journal entries with filters: {@Request}", request);

                // Build optimized query
                var query = BuildJournalEntriesQuery(request);

                // Get total count for pagination (optimized)
                var totalEntries = await query.CountAsync();

                // Apply sorting
                query = ApplySorting(query, request.SortBy, request.SortOrder);

                // Apply pagination
                var journalEntries = await query
                    .Skip((request.Page - 1) * request.Limit)
                    .Take(request.Limit)
                    .AsNoTracking() // Performance optimization for read-only queries
                    .ToListAsync();

                // Transform to DTOs
                var entries = TransformToDisplayDtos(journalEntries);

                // Calculate summary information
                var summary = await CalculateSummaryAsync(request);

                // Build pagination info
                var pagination = new PaginationInfo
                {
                    CurrentPage = request.Page,
                    TotalPages = (int)Math.Ceiling((double)totalEntries / request.Limit),
                    TotalEntries = totalEntries,
                    PageSize = request.Limit
                };

                return new GetJournalEntriesResponse
                {
                    Success = true,
                    Entries = entries,
                    Pagination = pagination,
                    Summary = summary
                };
            }
            catch (Exception ex)
            {
                _logger.LogError(ex, "Error getting journal entries");
                throw;
            }
        }

        /// <summary>
        /// Get detailed journal entry by ID
        /// </summary>
        public async Task<JournalEntryDetailDto> GetJournalEntryByIdAsync(Guid id)
        {
            try
            {
                var journalEntry = await _context.JournalEntries
                    .Include(je => je.JournalEntryLines)
                    .ThenInclude(jel => jel.Account)
                    .AsNoTracking()
                    .FirstOrDefaultAsync(je => je.Id == id);

                if (journalEntry == null)
                {
                    return null!;
                }

                return TransformToDetailDto(journalEntry);
            }
            catch (Exception ex)
            {
                _logger.LogError(ex, "Error getting journal entry by ID: {Id}", id);
                throw;
            }
        }

        /// <summary>
        /// Get journal entry statistics
        /// </summary>
        public async Task<JournalEntryStatisticsResponse> GetStatisticsAsync(JournalEntryStatisticsRequest request)
        {
            try
            {
                var query = _context.JournalEntries.AsQueryable();

                // Apply date filters
                if (request.DateFrom.HasValue)
                {
                    query = query.Where(je => je.TransactionDate >= request.DateFrom.Value);
                }

                if (request.DateTo.HasValue)
                {
                    query = query.Where(je => je.TransactionDate <= request.DateTo.Value);
                }

                // Apply status filter
                if (!string.IsNullOrEmpty(request.Status) && request.Status != "All")
                {
                    if (Enum.TryParse<JournalStatus>(request.Status, out var status))
                    {
                        query = query.Where(je => je.Status == status);
                    }
                }

                // Apply journal type filter
                if (!string.IsNullOrEmpty(request.JournalType) && request.JournalType != "All")
                {
                    if (Enum.TryParse<JournalType>(request.JournalType, out var journalType))
                    {
                        query = query.Where(je => je.JournalType == journalType);
                    }
                }

                var statistics = await query
                    .Select(je => new
                    {
                        je.TotalDebit,
                        je.TotalCredit,
                        je.Status,
                        je.JournalType,
                        je.TransactionDate
                    })
                    .AsNoTracking()
                    .ToListAsync();

                var response = new JournalEntryStatisticsResponse
                {
                    TotalEntries = statistics.Count,
                    TotalDebits = statistics.Sum(s => s.TotalDebit),
                    TotalCredits = statistics.Sum(s => s.TotalCredit),
                    Balance = statistics.Sum(s => s.TotalDebit - s.TotalCredit),
                    AverageEntryAmount = statistics.Any() ? statistics.Average(s => s.TotalDebit + s.TotalCredit) : 0,
                    LargestEntry = statistics.Any() ? statistics.Max(s => Math.Max(s.TotalDebit, s.TotalCredit)) : 0
                };

                // Calculate entries by type
                response.EntriesByType = statistics
                    .GroupBy(s => s.JournalType.ToString())
                    .ToDictionary(g => g.Key, g => g.Count());

                // Calculate entries by status
                response.EntriesByStatus = statistics
                    .GroupBy(s => s.Status.ToString())
                    .ToDictionary(g => g.Key, g => g.Count());

                // Calculate monthly statistics
                response.EntriesByMonth = statistics
                    .GroupBy(s => new { s.TransactionDate.Year, s.TransactionDate.Month })
                    .Select(g => new MonthlyStatistics
                    {
                        Month = $"{g.Key.Year}-{g.Key.Month:D2}",
                        Count = g.Count(),
                        TotalAmount = g.Sum(s => s.TotalDebit + s.TotalCredit)
                    })
                    .OrderBy(m => m.Month)
                    .ToList();

                return response;
            }
            catch (Exception ex)
            {
                _logger.LogError(ex, "Error getting journal entry statistics");
                throw;
            }
        }

        /// <summary>
        /// Export journal entries
        /// </summary>
        public async Task<ExportJournalEntriesResponse> ExportJournalEntriesAsync(ExportJournalEntriesRequest request)
        {
            try
            {
                // Build query with filters
                var query = BuildJournalEntriesQuery(request.Filters);

                // Get all entries for export (no pagination)
                var journalEntries = await query
                    .AsNoTracking()
                    .ToListAsync();

                var entries = TransformToDisplayDtos(journalEntries);

                var response = new ExportJournalEntriesResponse
                {
                    Success = true,
                    ExportedRecords = entries.Count,
                    ExportDate = DateTime.UtcNow
                };

                // Generate file based on format
                switch (request.Format.ToLower())
                {
                    case "csv":
                        response.FileName = $"journal-entries-{DateTime.UtcNow:yyyyMMdd-HHmmss}.csv";
                        break;
                    case "excel":
                        response.FileName = $"journal-entries-{DateTime.UtcNow:yyyyMMdd-HHmmss}.xlsx";
                        break;
                    case "pdf":
                        response.FileName = $"journal-entries-{DateTime.UtcNow:yyyyMMdd-HHmmss}.pdf";
                        break;
                }

                return response;
            }
            catch (Exception ex)
            {
                _logger.LogError(ex, "Error exporting journal entries");
                throw;
            }
        }

        /// <summary>
        /// Build optimized query for journal entries
        /// </summary>
        private IQueryable<JournalEntry> BuildJournalEntriesQuery(GetJournalEntriesRequest request)
        {
            var query = _context.JournalEntries
                .Include(je => je.JournalEntryLines.Take(1)) // Only load first line for list view
                .ThenInclude(jel => jel.Account)
                .AsQueryable();

            // Apply filters
            if (request.DateFrom.HasValue)
            {
                query = query.Where(je => je.TransactionDate >= request.DateFrom.Value);
            }

            if (request.DateTo.HasValue)
            {
                query = query.Where(je => je.TransactionDate <= request.DateTo.Value);
            }

            if (!string.IsNullOrEmpty(request.Type) && request.Type != "All")
            {
                if (request.Type == "Credit")
                {
                    query = query.Where(je => je.Description != null && je.Description.StartsWith("Credit:"));
                }
                else if (request.Type == "Debit")
                {
                    query = query.Where(je => je.Description != null && je.Description.StartsWith("Debit:"));
                }
            }

            if (!string.IsNullOrEmpty(request.Status) && request.Status != "All")
            {
                if (Enum.TryParse<JournalStatus>(request.Status, out var status))
                {
                    query = query.Where(je => je.Status == status);
                }
            }

            if (!string.IsNullOrEmpty(request.Category))
            {
                query = query.Where(je => je.JournalEntryLines.Any(jel => jel.Account.AccountName.Contains(request.Category)));
            }

            if (!string.IsNullOrEmpty(request.ReferenceNumber))
            {
                query = query.Where(je => je.ReferenceNumber.Contains(request.ReferenceNumber));
            }

            if (!string.IsNullOrEmpty(request.ContactName))
            {
                query = query.Where(je => je.JournalEntryLines.Any(jel => jel.Reference != null && jel.Reference.Contains(request.ContactName)));
            }

            if (!string.IsNullOrEmpty(request.Description))
            {
                query = query.Where(je => je.Description != null && je.Description.Contains(request.Description));
            }

            if (request.AmountMin.HasValue)
            {
                query = query.Where(je => je.JournalEntryLines.Any(jel => jel.Credit >= request.AmountMin.Value || jel.Debit >= request.AmountMin.Value));
            }

            if (request.AmountMax.HasValue)
            {
                query = query.Where(je => je.JournalEntryLines.Any(jel => jel.Credit <= request.AmountMax.Value || jel.Debit <= request.AmountMax.Value));
            }

            return query;
        }

        /// <summary>
        /// Apply sorting to the query
        /// </summary>
        private IQueryable<JournalEntry> ApplySorting(IQueryable<JournalEntry> query, string sortBy, string sortOrder)
        {
            var orderDirection = sortOrder.ToLower() == "asc" ? "ascending" : "descending";

            return sortBy.ToLower() switch
            {
                "transactiondate" => sortOrder.ToLower() == "asc" ? query.OrderBy(je => je.TransactionDate) : query.OrderByDescending(je => je.TransactionDate),
                "amount" => sortOrder.ToLower() == "asc" ? query.OrderBy(je => je.TotalDebit + je.TotalCredit) : query.OrderByDescending(je => je.TotalDebit + je.TotalCredit),
                "type" => sortOrder.ToLower() == "asc" ? query.OrderBy(je => je.Description) : query.OrderByDescending(je => je.Description),
                "category" => sortOrder.ToLower() == "asc" ? query.OrderBy(je => je.JournalEntryLines.FirstOrDefault()!.Account!.AccountName) : query.OrderByDescending(je => je.JournalEntryLines.FirstOrDefault()!.Account!.AccountName),
                "referencenumber" => sortOrder.ToLower() == "asc" ? query.OrderBy(je => je.ReferenceNumber) : query.OrderByDescending(je => je.ReferenceNumber),
                "createdat" => sortOrder.ToLower() == "asc" ? query.OrderBy(je => je.CreatedAt) : query.OrderByDescending(je => je.CreatedAt),
                _ => query.OrderByDescending(je => je.TransactionDate) // Default sorting
            };
        }

        /// <summary>
        /// Transform journal entries to display DTOs
        /// </summary>
        private List<JournalEntryDisplayDto> TransformToDisplayDtos(List<JournalEntry> journalEntries)
        {
            var entries = new List<JournalEntryDisplayDto>();

            foreach (var entry in journalEntries)
            {
                var line = entry.JournalEntryLines.FirstOrDefault();
                if (line != null)
                {
                    var isCredit = entry.Description?.StartsWith("Credit:") ?? false;
                    
                    entries.Add(new JournalEntryDisplayDto
                    {
                        Id = entry.Id.ToString(),
                        JournalNumber = entry.JournalNumber,
                        TransactionDate = entry.TransactionDate,
                        Type = isCredit ? "Credit" : "Debit",
                        CategoryName = line.Account?.AccountName ?? "Unknown",
                        Particulars = entry.Description?.Replace("Credit: ", "").Replace("Debit: ", "") ?? "",
                        Amount = isCredit ? line.Credit : line.Debit,
                        ReferenceNumber = entry.ReferenceNumber,
                        ContactName = line.Reference,
                        AccountName = line.Account?.AccountName ?? "Unknown",
                        Status = entry.Status.ToString(),
                        TransactionStatus = entry.TransactionStatus.ToString(),
                        CreatedAt = entry.CreatedAt,
                        CreatedBy = "System", // TODO: Get from user service
                        JournalType = entry.JournalType.ToString()
                    });
                }
            }

            return entries;
        }

        /// <summary>
        /// Transform journal entry to detail DTO
        /// </summary>
        private JournalEntryDetailDto TransformToDetailDto(JournalEntry journalEntry)
        {
            var lines = journalEntry.JournalEntryLines.Select(line => new JournalEntryLineDetailDto
            {
                Id = line.Id.ToString(),
                AccountCode = line.Account?.AccountCode ?? "",
                AccountName = line.Account?.AccountName ?? "",
                AccountType = line.Account?.AccountType.ToString() ?? "",
                Description = line.Description,
                Debit = line.Debit,
                Credit = line.Credit,
                Reference = line.Reference,
                LineOrder = line.LineOrder,
                ContactName = line.Reference // Using reference as contact name for now
            }).ToList();

            return new JournalEntryDetailDto
            {
                Id = journalEntry.Id.ToString(),
                JournalNumber = journalEntry.JournalNumber,
                TransactionDate = journalEntry.TransactionDate,
                JournalType = journalEntry.JournalType.ToString(),
                ReferenceNumber = journalEntry.ReferenceNumber,
                Description = journalEntry.Description,
                TotalDebit = journalEntry.TotalDebit,
                TotalCredit = journalEntry.TotalCredit,
                Status = journalEntry.Status.ToString(),
                TransactionStatus = journalEntry.TransactionStatus.ToString(),
                CreatedAt = journalEntry.CreatedAt,
                CreatedBy = "System", // TODO: Get from user service
                UpdatedAt = journalEntry.UpdatedAt,
                ApprovedBy = null, // TODO: Get from user service
                ApprovedAt = journalEntry.ApprovedAt,
                Lines = lines,
                AuditTrail = new List<AuditTrailEntryDto>() // TODO: Implement audit trail
            };
        }

        /// <summary>
        /// Calculate summary information for journal entries
        /// </summary>
        private async Task<SummaryInfo> CalculateSummaryAsync(GetJournalEntriesRequest request)
        {
            try
            {
                var query = BuildJournalEntriesQuery(request);

                var summaryData = await query
                    .Select(je => new
                    {
                        je.TotalDebit,
                        je.TotalCredit,
                        je.Status,
                        Type = je.Description != null && je.Description.StartsWith("Credit:") ? "Credit" : "Debit"
                    })
                    .AsNoTracking()
                    .ToListAsync();

                var summary = new SummaryInfo
                {
                    TotalEntries = summaryData.Count,
                    TotalDebits = summaryData.Sum(s => s.TotalDebit),
                    TotalCredits = summaryData.Sum(s => s.TotalCredit),
                    Balance = summaryData.Sum(s => s.TotalDebit - s.TotalCredit),
                    CreditEntries = summaryData.Count(s => s.Type == "Credit"),
                    DebitEntries = summaryData.Count(s => s.Type == "Debit")
                };

                // Calculate entries by status
                summary.EntriesByStatus = summaryData
                    .GroupBy(s => s.Status.ToString())
                    .ToDictionary(g => g.Key, g => g.Count());

                // Calculate entries by type
                summary.EntriesByType = summaryData
                    .GroupBy(s => s.Type)
                    .ToDictionary(g => g.Key, g => g.Count());

                return summary;
            }
            catch (Exception ex)
            {
                _logger.LogError(ex, "Error calculating summary");
                return new SummaryInfo();
            }
        }
    }
}
