using Microsoft.EntityFrameworkCore;
using Microsoft.Extensions.Caching.Memory;
using Microsoft.Extensions.Logging;
using GarmentsERP.API.Data;
using GarmentsERP.API.Interfaces;
using GarmentsERP.API.DTOs;
using GarmentsERP.API.Models.Accounting;

namespace GarmentsERP.API.Services
{
    /// <summary>
    /// Service for managing journal entries with advanced filtering, pagination, and optimization
    /// </summary>
    public class JournalEntryService : IJournalEntryService
    {
        private readonly ApplicationDbContext _context;
        private readonly IMemoryCache _cache;
        private readonly ILogger<JournalEntryService> _logger;
        private readonly IAuditLogService _auditLogService;

        public JournalEntryService(
            ApplicationDbContext context,
            IMemoryCache cache,
            ILogger<JournalEntryService> logger,
            IAuditLogService auditLogService)
        {
            _context = context;
            _cache = cache;
            _logger = logger;
            _auditLogService = auditLogService;
        }

        /// <summary>
        /// Get journal entries with advanced filtering, pagination, and optimization
        /// </summary>
        public async Task<GetJournalEntriesResponse> GetJournalEntriesAsync(GetJournalEntriesRequest request)
        {
            try
            {
                // Create cache key
                var cacheKey = $"journal_entries_{request.GetHashCode()}";
                
                // Try to get from cache first
                if (_cache.TryGetValue(cacheKey, out GetJournalEntriesResponse? cachedResponse))
                {
                    return cachedResponse!;
                }

                // Build query with optimization
                var query = _context.JournalEntries
                    .Include(je => je.JournalEntryLines)
                        .ThenInclude(jel => jel.Account)
                    .AsNoTracking()
                    .AsQueryable();

                // Apply filters
                query = ApplyFilters(query, request);

                // Get total count for pagination
                var totalCount = await query.CountAsync();

                // Apply sorting
                query = ApplySorting(query, request.SortBy, request.SortOrder);

                // Apply pagination
                var skip = (request.Page - 1) * request.Limit;
                var journalEntries = await query
                    .Skip(skip)
                    .Take(request.Limit)
                    .ToListAsync();

                // Transform to display DTOs
                var entries = journalEntries.Select(TransformToDisplayDto).ToList();

                // Calculate summary
                var summary = await CalculateSummaryAsync(request);

                // Create pagination info
                var pagination = new PaginationInfo
                {
                    CurrentPage = request.Page,
                    TotalPages = (int)Math.Ceiling((double)totalCount / request.Limit),
                    TotalEntries = totalCount,
                    PageSize = request.Limit
                };

                var response = new GetJournalEntriesResponse
                {
                    Success = true,
                    Entries = entries,
                    Pagination = pagination,
                    Summary = summary
                };

                // Cache the response for 2 minutes
                _cache.Set(cacheKey, response, TimeSpan.FromMinutes(2));

                return response;
            }
            catch (Exception ex)
            {
                _logger.LogError(ex, "Error getting journal entries");
                return new GetJournalEntriesResponse
                {
                    Success = false,
                    Message = "Failed to retrieve journal entries"
                };
            }
        }

        /// <summary>
        /// Get detailed journal entry by ID
        /// </summary>
        public async Task<JournalEntryDetailDto?> GetJournalEntryByIdAsync(Guid id)
        {
            try
            {
                var journalEntry = await _context.JournalEntries
                    .Include(je => je.JournalEntryLines)
                    .ThenInclude(jel => jel.Account)
                    .FirstOrDefaultAsync(je => je.Id == id);

                if (journalEntry == null)
                    return null;

                return TransformToDetailDto(journalEntry);
            }
            catch (Exception ex)
            {
                _logger.LogError(ex, "Error getting journal entry by ID: {Id}", id);
                return null;
            }
        }

        /// <summary>
        /// Get journal entry statistics
        /// </summary>
        public async Task<JournalEntryStatisticsResponse> GetStatisticsAsync(JournalEntryStatisticsRequest request)
        {
            try
            {
                var query = _context.JournalEntries.AsNoTracking();

                // Apply date filters
                if (request.DateFrom.HasValue)
                    query = query.Where(je => je.TransactionDate >= request.DateFrom.Value);

                if (request.DateTo.HasValue)
                    query = query.Where(je => je.TransactionDate <= request.DateTo.Value);

                // Apply status filter
                if (!string.IsNullOrEmpty(request.Status) && request.Status != "All")
                {
                    if (Enum.TryParse<JournalStatus>(request.Status, out var status))
                        query = query.Where(je => je.Status == status);
                }

                // Apply journal type filter
                if (!string.IsNullOrEmpty(request.JournalType) && request.JournalType != "All")
                {
                    if (Enum.TryParse<JournalType>(request.JournalType, out var journalType))
                        query = query.Where(je => je.JournalType == journalType);
                }

                var entries = await query.ToListAsync();

                var response = new JournalEntryStatisticsResponse
                {
                    Success = true,
                    TotalEntries = entries.Count,
                    TotalDebits = entries.Sum(e => e.TotalDebit),
                    TotalCredits = entries.Sum(e => e.TotalCredit),
                    Balance = entries.Sum(e => e.TotalDebit - e.TotalCredit),
                    AverageEntryAmount = entries.Count > 0 ? entries.Average(e => e.TotalDebit + e.TotalCredit) : 0,
                    LargestEntry = entries.Count > 0 ? entries.Max(e => Math.Max(e.TotalDebit, e.TotalCredit)) : 0,
                    EntriesByType = entries.GroupBy(e => e.JournalType.ToString())
                        .ToDictionary(g => g.Key, g => g.Count()),
                    EntriesByStatus = entries.GroupBy(e => e.Status.ToString())
                        .ToDictionary(g => g.Key, g => g.Count()),
                    EntriesByMonth = entries.GroupBy(e => e.TransactionDate.ToString("yyyy-MM"))
                    .Select(g => new MonthlyStatistics
                    {
                            Month = g.Key,
                        Count = g.Count(),
                            TotalAmount = g.Sum(e => e.TotalDebit + e.TotalCredit)
                    })
                    .OrderBy(m => m.Month)
                        .ToList()
                };

                return response;
            }
            catch (Exception ex)
            {
                _logger.LogError(ex, "Error getting journal entry statistics");
                return new JournalEntryStatisticsResponse
                {
                    Success = false,
                    Message = "Failed to retrieve statistics"
                };
            }
        }

        /// <summary>
        /// Export journal entries to various formats
        /// </summary>
        public async Task<ExportJournalEntriesResponse> ExportJournalEntriesAsync(ExportJournalEntriesRequest request)
        {
            try
            {
                // Get journal entries based on filters
                var entriesResponse = await GetJournalEntriesAsync(request.Filters);
                
                if (!entriesResponse.Success)
                {
                    return new ExportJournalEntriesResponse
                    {
                        Success = false,
                        Message = "Failed to retrieve journal entries for export"
                    };
                }

                // Generate file based on format
                var fileName = $"journal_entries_{DateTime.Now:yyyyMMdd_HHmmss}";
                var downloadUrl = "";

                switch (request.Format.ToLower())
                {
                    case "csv":
                        fileName += ".csv";
                        downloadUrl = await GenerateCsvExportAsync(entriesResponse.Entries, fileName);
                        break;
                    case "excel":
                        fileName += ".xlsx";
                        downloadUrl = await GenerateExcelExportAsync(entriesResponse.Entries, fileName);
                        break;
                    case "pdf":
                        fileName += ".pdf";
                        downloadUrl = await GeneratePdfExportAsync(entriesResponse.Entries, fileName);
                        break;
                    default:
                        return new ExportJournalEntriesResponse
                        {
                            Success = false,
                            Message = "Unsupported export format"
                        };
                }

                return new ExportJournalEntriesResponse
                {
                    Success = true,
                    FileName = fileName,
                    DownloadUrl = downloadUrl,
                    ExportedRecords = entriesResponse.Entries.Count
                };
            }
            catch (Exception ex)
            {
                _logger.LogError(ex, "Error exporting journal entries");
                return new ExportJournalEntriesResponse
                {
                    Success = false,
                    Message = "Failed to export journal entries"
                };
            }
        }

        /// <summary>
        /// Create a new journal entry
        /// </summary>
        public async Task<JournalEntryDetailDto> CreateJournalEntryAsync(CreateJournalEntryRequest request)
        {
            try
            {
                // Validate request
                var validation = ValidateJournalEntryRequest(request);
                if (!validation.IsValid)
                {
                    throw new InvalidOperationException($"Validation failed: {string.Join(", ", validation.Errors)}");
                }

                // Create journal entry
                var journalEntry = new JournalEntry
                {
                    Id = Guid.NewGuid(),
                    JournalNumber = await GenerateJournalNumberAsync(),
                    TransactionDate = request.TransactionDate,
                    JournalType = Enum.Parse<JournalType>(request.JournalType),
                    ReferenceNumber = request.ReferenceNumber,
                    Description = request.Description,
                    Status = JournalStatus.Draft,
                    CreatedByUserId = GetCurrentUserId(),
                    CreatedAt = DateTime.UtcNow
                };

                // Create journal entry lines
                var lines = new List<JournalEntryLine>();
                foreach (var lineRequest in request.Lines)
                {
                    var line = new JournalEntryLine
                    {
                        Id = Guid.NewGuid(),
                        JournalEntryId = journalEntry.Id,
                        AccountId = lineRequest.AccountId,
                        Debit = lineRequest.Debit ?? 0,
                        Credit = lineRequest.Credit ?? 0,
                        Description = lineRequest.Description,
                        Reference = lineRequest.Reference,
                        LineOrder = lineRequest.LineOrder
                    };
                    lines.Add(line);
                }

                // Calculate totals
                journalEntry.TotalDebit = lines.Sum(l => l.Debit);
                journalEntry.TotalCredit = lines.Sum(l => l.Credit);

                // Validate balance
                if (Math.Abs(journalEntry.TotalDebit - journalEntry.TotalCredit) > 0.01m)
                {
                    throw new InvalidOperationException("Journal entry is not balanced");
                }

                // Save to database
                _context.JournalEntries.Add(journalEntry);
                _context.JournalEntryLines.AddRange(lines);
                await _context.SaveChangesAsync();

                // Log audit trail
                await _auditLogService.LogJournalEntryOperationAsync(
                    "Create", journalEntry.Id, GetCurrentUserId(), "Journal entry created");

                // Return detailed DTO
                return await GetJournalEntryByIdAsync(journalEntry.Id) ?? 
                    throw new InvalidOperationException("Failed to retrieve created journal entry");
            }
            catch (Exception ex)
            {
                _logger.LogError(ex, "Error creating journal entry");
                throw;
            }
        }

        /// <summary>
        /// Update an existing journal entry
        /// </summary>
        public async Task<JournalEntryDetailDto> UpdateJournalEntryAsync(Guid id, UpdateJournalEntryRequest request)
        {
            try
            {
                var journalEntry = await _context.JournalEntries
                    .Include(je => je.JournalEntryLines)
                    .FirstOrDefaultAsync(je => je.Id == id);

                if (journalEntry == null)
                    throw new InvalidOperationException("Journal entry not found");

                // Update properties
                if (request.TransactionDate.HasValue)
                    journalEntry.TransactionDate = request.TransactionDate.Value;

                if (!string.IsNullOrEmpty(request.JournalType))
                    journalEntry.JournalType = Enum.Parse<JournalType>(request.JournalType);

                if (request.ReferenceNumber != null)
                    journalEntry.ReferenceNumber = request.ReferenceNumber;

                if (request.Description != null)
                    journalEntry.Description = request.Description;

                // Update lines if provided
                if (request.Lines != null)
                {
                    // Remove existing lines
                    _context.JournalEntryLines.RemoveRange(journalEntry.JournalEntryLines);

                    // Add new lines
                    var newLines = request.Lines.Select(lineRequest => new JournalEntryLine
                    {
                        Id = Guid.NewGuid(),
                        JournalEntryId = journalEntry.Id,
                        AccountId = lineRequest.AccountId,
                        Debit = lineRequest.Debit ?? 0,
                        Credit = lineRequest.Credit ?? 0,
                        Description = lineRequest.Description,
                        Reference = lineRequest.Reference,
                        LineOrder = lineRequest.LineOrder
                    }).ToList();

                    _context.JournalEntryLines.AddRange(newLines);
                    journalEntry.JournalEntryLines = newLines;

                    // Recalculate totals
                    journalEntry.TotalDebit = newLines.Sum(l => l.Debit);
                    journalEntry.TotalCredit = newLines.Sum(l => l.Credit);
                }

                journalEntry.UpdatedAt = DateTime.UtcNow;

                // Validate balance
                if (Math.Abs(journalEntry.TotalDebit - journalEntry.TotalCredit) > 0.01m)
                {
                    throw new InvalidOperationException("Journal entry is not balanced");
                }

                await _context.SaveChangesAsync();

                // Log audit trail
                await _auditLogService.LogJournalEntryOperationAsync(
                    "Update", journalEntry.Id, GetCurrentUserId(), "Journal entry updated");

                return await GetJournalEntryByIdAsync(journalEntry.Id) ?? 
                    throw new InvalidOperationException("Failed to retrieve updated journal entry");
            }
            catch (Exception ex)
            {
                _logger.LogError(ex, "Error updating journal entry: {Id}", id);
                throw;
            }
        }

        /// <summary>
        /// Delete a journal entry (soft delete)
        /// </summary>
        public async Task<bool> DeleteJournalEntryAsync(Guid id)
        {
            try
            {
                var journalEntry = await _context.JournalEntries.FindAsync(id);
                if (journalEntry == null)
                    return false;

                // Soft delete by updating status
                journalEntry.Status = JournalStatus.Reversed;
                journalEntry.UpdatedAt = DateTime.UtcNow;

                await _context.SaveChangesAsync();

                // Log audit trail
                await _auditLogService.LogJournalEntryOperationAsync(
                    "Delete", journalEntry.Id, GetCurrentUserId(), "Journal entry deleted");

                return true;
            }
            catch (Exception ex)
            {
                _logger.LogError(ex, "Error deleting journal entry: {Id}", id);
                return false;
            }
        }

        /// <summary>
        /// Approve a journal entry
        /// </summary>
        public async Task<bool> ApproveJournalEntryAsync(Guid id, Guid userId, string? notes = null)
        {
            try
            {
                var journalEntry = await _context.JournalEntries.FindAsync(id);
                if (journalEntry == null)
                    return false;

                journalEntry.Status = JournalStatus.Approved;
                journalEntry.ApprovedByUserId = userId;
                journalEntry.ApprovedAt = DateTime.UtcNow;
                journalEntry.UpdatedAt = DateTime.UtcNow;

                await _context.SaveChangesAsync();

                // Log audit trail
                await _auditLogService.LogJournalEntryOperationAsync(
                    "Approve", journalEntry.Id, userId, $"Journal entry approved. Notes: {notes}");

                return true;
            }
            catch (Exception ex)
            {
                _logger.LogError(ex, "Error approving journal entry: {Id}", id);
                return false;
            }
        }

        /// <summary>
        /// Reverse a journal entry
        /// </summary>
        public async Task<bool> ReverseJournalEntryAsync(Guid id, Guid userId, string reason)
        {
            try
            {
                var journalEntry = await _context.JournalEntries.FindAsync(id);
                if (journalEntry == null)
                    return false;

                journalEntry.Status = JournalStatus.Reversed;
                journalEntry.UpdatedAt = DateTime.UtcNow;

                await _context.SaveChangesAsync();

                // Log audit trail
                await _auditLogService.LogJournalEntryOperationAsync(
                    "Reverse", journalEntry.Id, userId, $"Journal entry reversed. Reason: {reason}");

                return true;
            }
            catch (Exception ex)
            {
                _logger.LogError(ex, "Error reversing journal entry: {Id}", id);
                return false;
            }
        }

        /// <summary>
        /// Get journal entry audit trail
        /// </summary>
        public async Task<List<AuditTrailEntryDto>> GetAuditTrailAsync(Guid id)
        {
            try
            {
                // This would typically come from an audit log table
                // For now, return empty list
                return new List<AuditTrailEntryDto>();
            }
            catch (Exception ex)
            {
                _logger.LogError(ex, "Error getting audit trail for journal entry: {Id}", id);
                return new List<AuditTrailEntryDto>();
            }
        }

        /// <summary>
        /// Validate journal entry balance
        /// </summary>
        public async Task<JournalEntryValidationResult> ValidateJournalEntryAsync(Guid id)
        {
            try
            {
                var journalEntry = await _context.JournalEntries
                    .Include(je => je.JournalEntryLines)
                    .FirstOrDefaultAsync(je => je.Id == id);

                if (journalEntry == null)
                {
                    return new JournalEntryValidationResult
                    {
                        IsValid = false,
                        Errors = new List<string> { "Journal entry not found" }
                    };
                }

                var result = new JournalEntryValidationResult
                {
                    TotalDebits = journalEntry.TotalDebit,
                    TotalCredits = journalEntry.TotalCredit
                };

                // Check balance
                if (!result.IsBalanced)
                {
                    result.Errors.Add($"Journal entry is not balanced. Debits: {result.TotalDebits:C2}, Credits: {result.TotalCredits:C2}");
                }

                // Check for empty lines
                if (!journalEntry.JournalEntryLines.Any())
                {
                    result.Errors.Add("Journal entry has no lines");
                }

                // Check for zero amounts
                var zeroLines = journalEntry.JournalEntryLines.Where(l => l.Debit == 0 && l.Credit == 0).ToList();
                if (zeroLines.Any())
                {
                    result.Warnings.Add($"{zeroLines.Count} lines have zero amounts");
                }

                result.IsValid = !result.Errors.Any();
                return result;
            }
            catch (Exception ex)
            {
                _logger.LogError(ex, "Error validating journal entry: {Id}", id);
                return new JournalEntryValidationResult
                {
                    IsValid = false,
                    Errors = new List<string> { "Error validating journal entry" }
                };
            }
        }

        /// <summary>
        /// Get journal entry categories for filtering
        /// </summary>
        public async Task<List<string>> GetCategoriesAsync()
        {
            try
            {
                var categories = await _context.JournalEntryLines
                    .Include(jel => jel.Account)
                    .Where(jel => jel.Account != null)
                    .Select(jel => jel.Account!.AccountName)
                    .Distinct()
                    .OrderBy(name => name)
                    .ToListAsync();

                return categories;
            }
            catch (Exception ex)
            {
                _logger.LogError(ex, "Error getting categories");
                return new List<string>();
            }
        }

        /// <summary>
        /// Get journal entry statuses for filtering
        /// </summary>
        public async Task<List<string>> GetStatusesAsync()
        {
            return Enum.GetNames<JournalStatus>().ToList();
        }

        /// <summary>
        /// Get journal entry types for filtering
        /// </summary>
        public async Task<List<string>> GetTypesAsync()
        {
            return Enum.GetNames<JournalType>().ToList();
        }

        #region Private Helper Methods

        private IQueryable<JournalEntry> ApplyFilters(IQueryable<JournalEntry> query, GetJournalEntriesRequest request)
        {
            // Date filters
            if (request.DateFrom.HasValue)
                query = query.Where(je => je.TransactionDate >= request.DateFrom.Value);

            if (request.DateTo.HasValue)
                query = query.Where(je => je.TransactionDate <= request.DateTo.Value);

            // Type filter
            if (!string.IsNullOrEmpty(request.Type) && request.Type != "All")
            {
                // This would need to be implemented based on how you determine if an entry is Credit or Debit
                // For now, we'll skip this filter
            }

            // Amount filters
            if (request.AmountMin.HasValue)
                query = query.Where(je => je.TotalDebit >= request.AmountMin.Value || je.TotalCredit >= request.AmountMin.Value);

            if (request.AmountMax.HasValue)
                query = query.Where(je => je.TotalDebit <= request.AmountMax.Value && je.TotalCredit <= request.AmountMax.Value);

            // Status filter
            if (!string.IsNullOrEmpty(request.Status) && request.Status != "All")
            {
                if (Enum.TryParse<JournalStatus>(request.Status, out var status))
                    query = query.Where(je => je.Status == status);
            }

            // Text filters
            if (!string.IsNullOrEmpty(request.ReferenceNumber))
                query = query.Where(je => je.ReferenceNumber!.Contains(request.ReferenceNumber));

            if (!string.IsNullOrEmpty(request.Description))
                query = query.Where(je => je.Description!.Contains(request.Description));

            return query;
        }

        private IQueryable<JournalEntry> ApplySorting(IQueryable<JournalEntry> query, string sortBy, string sortOrder)
        {
            var isDescending = sortOrder.ToLower() == "desc";

            return sortBy.ToLower() switch
            {
                "transactiondate" => isDescending ? query.OrderByDescending(je => je.TransactionDate) : query.OrderBy(je => je.TransactionDate),
                "amount" => isDescending ? query.OrderByDescending(je => je.TotalDebit + je.TotalCredit) : query.OrderBy(je => je.TotalDebit + je.TotalCredit),
                "type" => isDescending ? query.OrderByDescending(je => je.JournalType) : query.OrderBy(je => je.JournalType),
                "category" => isDescending ? query.OrderByDescending(je => je.Description) : query.OrderBy(je => je.Description),
                "referencenumber" => isDescending ? query.OrderByDescending(je => je.ReferenceNumber) : query.OrderBy(je => je.ReferenceNumber),
                "createdat" => isDescending ? query.OrderByDescending(je => je.CreatedAt) : query.OrderBy(je => je.CreatedAt),
                _ => query.OrderByDescending(je => je.TransactionDate)
            };
        }

        private async Task<SummaryInfo> CalculateSummaryAsync(GetJournalEntriesRequest request)
        {
            var query = _context.JournalEntries.AsNoTracking();

            // Apply same filters as main query
            query = ApplyFilters(query, request);

            var entries = await query.ToListAsync();

            return new SummaryInfo
            {
                TotalEntries = entries.Count,
                TotalDebits = entries.Sum(e => e.TotalDebit),
                TotalCredits = entries.Sum(e => e.TotalCredit),
                Balance = entries.Sum(e => e.TotalDebit - e.TotalCredit),
                CreditEntries = entries.Count(e => e.TotalCredit > e.TotalDebit),
                DebitEntries = entries.Count(e => e.TotalDebit > e.TotalCredit),
                EntriesByStatus = entries.GroupBy(e => e.Status.ToString())
                    .ToDictionary(g => g.Key, g => g.Count()),
                EntriesByType = entries.GroupBy(e => e.JournalType.ToString())
                    .ToDictionary(g => g.Key, g => g.Count())
            };
        }

        private JournalEntryDisplayDto TransformToDisplayDto(JournalEntry journalEntry)
        {
            // Determine type based on description or other logic
            var type = journalEntry.Description?.StartsWith("Credit:") == true ? "Credit" : "Debit";
            
            // Get category name from first line
            var categoryName = journalEntry.JournalEntryLines.FirstOrDefault()?.Account?.AccountName ?? "Unknown";
            
            // Get contact name from first line reference
            var contactName = journalEntry.JournalEntryLines.FirstOrDefault()?.Reference;

            return new JournalEntryDisplayDto
            {
                Id = journalEntry.Id.ToString(),
                JournalNumber = journalEntry.JournalNumber,
                TransactionDate = journalEntry.TransactionDate,
                Type = type,
                CategoryName = categoryName,
                Particulars = journalEntry.Description ?? "",
                Amount = type == "Credit" ? journalEntry.TotalCredit : journalEntry.TotalDebit,
                ReferenceNumber = journalEntry.ReferenceNumber ?? "",
                ContactName = contactName,
                AccountName = categoryName,
                Status = journalEntry.Status.ToString(),
                TransactionStatus = journalEntry.Status.ToString(),
                CreatedAt = journalEntry.CreatedAt,
                CreatedBy = "System", // Would get from user lookup
                JournalType = journalEntry.JournalType.ToString()
            };
        }

        private JournalEntryDetailDto TransformToDetailDto(JournalEntry journalEntry)
        {
            return new JournalEntryDetailDto
            {
                Id = journalEntry.Id.ToString(),
                JournalNumber = journalEntry.JournalNumber,
                TransactionDate = journalEntry.TransactionDate,
                JournalType = journalEntry.JournalType.ToString(),
                ReferenceNumber = journalEntry.ReferenceNumber ?? "",
                Description = journalEntry.Description,
                TotalDebit = journalEntry.TotalDebit,
                TotalCredit = journalEntry.TotalCredit,
                Status = journalEntry.Status.ToString(),
                TransactionStatus = journalEntry.Status.ToString(),
                CreatedAt = journalEntry.CreatedAt,
                CreatedBy = "System", // Would get from user lookup
                UpdatedAt = journalEntry.UpdatedAt,
                ApprovedBy = "System", // Would get from user lookup
                ApprovedAt = journalEntry.ApprovedAt,
                Lines = journalEntry.JournalEntryLines.Select(TransformToLineDetailDto).ToList(),
                AuditTrail = new List<AuditTrailEntryDto>() // Would get from audit service
            };
        }

        private JournalEntryLineDetailDto TransformToLineDetailDto(JournalEntryLine line)
        {
            return new JournalEntryLineDetailDto
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
                ContactName = line.Reference
            };
        }

        private JournalEntryValidationResult ValidateJournalEntryRequest(CreateJournalEntryRequest request)
        {
            var result = new JournalEntryValidationResult();

            if (request.Lines == null || !request.Lines.Any())
            {
                result.Errors.Add("Journal entry must have at least one line");
            }

            if (request.Lines != null)
            {
                var totalDebits = request.Lines.Sum(l => l.Debit ?? 0);
                var totalCredits = request.Lines.Sum(l => l.Credit ?? 0);

                result.TotalDebits = totalDebits;
                result.TotalCredits = totalCredits;

                if (Math.Abs(totalDebits - totalCredits) > 0.01m)
                {
                    result.Errors.Add("Journal entry is not balanced");
                }

                // Check for lines with both debit and credit
                var invalidLines = request.Lines.Where(l => (l.Debit ?? 0) > 0 && (l.Credit ?? 0) > 0).ToList();
                if (invalidLines.Any())
                {
                    result.Errors.Add("Lines cannot have both debit and credit amounts");
                }
            }

            result.IsValid = !result.Errors.Any();
            return result;
        }

        private async Task<string> GenerateJournalNumberAsync()
        {
            var today = DateTime.Today;
            var year = today.Year;
            var month = today.Month;

            var lastJournal = await _context.JournalEntries
                .Where(j => j.JournalNumber.StartsWith($"JE-{year}-{month:D2}"))
                .OrderByDescending(j => j.JournalNumber)
                .FirstOrDefaultAsync();

            if (lastJournal == null)
                return $"JE-{year}-{month:D2}-0001";

            var parts = lastJournal.JournalNumber.Split('-');
            if (parts.Length == 4 && int.TryParse(parts[3], out int lastNumber))
            {
                return $"JE-{year}-{month:D2}-{(lastNumber + 1):D4}";
            }

            var count = await _context.JournalEntries
                .Where(j => j.JournalNumber.StartsWith($"JE-{year}-{month:D2}"))
                .CountAsync() + 1;

            return $"JE-{year}-{month:D2}-{count:D4}";
        }

        private async Task<string> GenerateCsvExportAsync(List<JournalEntryDisplayDto> entries, string fileName)
        {
            // This would generate CSV content and return a download URL
            // For now, return a placeholder
            return $"/api/exports/{fileName}";
        }

        private async Task<string> GenerateExcelExportAsync(List<JournalEntryDisplayDto> entries, string fileName)
        {
            // This would generate Excel content and return a download URL
            // For now, return a placeholder
            return $"/api/exports/{fileName}";
        }

        private async Task<string> GeneratePdfExportAsync(List<JournalEntryDisplayDto> entries, string fileName)
        {
            // This would generate PDF content and return a download URL
            // For now, return a placeholder
            return $"/api/exports/{fileName}";
        }

        private Guid GetCurrentUserId()
        {
            // TODO: Get from JWT token or authentication context
            return Guid.Parse("00000000-0000-0000-0000-000000000001");
        }

        #endregion
    }
}