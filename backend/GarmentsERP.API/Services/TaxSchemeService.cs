using Microsoft.EntityFrameworkCore;
using GarmentsERP.API.Data;
using GarmentsERP.API.DTOs.Tax;
using GarmentsERP.API.Interfaces;
using GarmentsERP.API.Models.Tax;

namespace GarmentsERP.API.Services
{
    public class TaxSchemeService : ITaxSchemeService
    {
        private readonly ApplicationDbContext _context;

        public TaxSchemeService(ApplicationDbContext context)
        {
            _context = context;
        }

        public async Task<IEnumerable<TaxSchemeDto>> GetAllTaxSchemesAsync()
        {
            // SIMPLIFIED APPROACH - USE JOIN INSTEAD OF NAVIGATION PROPERTIES
            var taxSchemes = await (from ts in _context.TaxSchemes
                                   join tr in _context.TaxRates on ts.TaxRateId equals tr.Id
                                   orderby ts.SchemeName
                                   select new { TaxScheme = ts, TaxRate = tr })
                                   .ToListAsync();

            return taxSchemes.Select(x => new TaxSchemeDto
            {
                Id = x.TaxScheme.Id,
                SchemeName = x.TaxScheme.SchemeName,
                TaxRateId = x.TaxScheme.TaxRateId,
                Description = x.TaxScheme.Description,
                IsActive = x.TaxScheme.IsActive,
                CreatedAt = x.TaxScheme.CreatedAt,
                TaxRateName = x.TaxRate.TaxName,
                TaxRatePercentage = x.TaxRate.TaxPercentage
            });
        }

        public async Task<TaxSchemeDto?> GetTaxSchemeByIdAsync(Guid id)
        {
            // SIMPLIFIED APPROACH - USE JOIN INSTEAD OF NAVIGATION PROPERTIES
            var result = await (from ts in _context.TaxSchemes
                               join tr in _context.TaxRates on ts.TaxRateId equals tr.Id
                               where ts.Id == id
                               select new { TaxScheme = ts, TaxRate = tr })
                               .FirstOrDefaultAsync();

            if (result == null)
                return null;

            return new TaxSchemeDto
            {
                Id = result.TaxScheme.Id,
                SchemeName = result.TaxScheme.SchemeName,
                TaxRateId = result.TaxScheme.TaxRateId,
                Description = result.TaxScheme.Description,
                IsActive = result.TaxScheme.IsActive,
                CreatedAt = result.TaxScheme.CreatedAt,
                TaxRateName = result.TaxRate.TaxName,
                TaxRatePercentage = result.TaxRate.TaxPercentage
            };
        }

        public async Task<TaxSchemeDto> CreateTaxSchemeAsync(CreateTaxSchemeDto createDto)
        {
            // Check if scheme name already exists
            var existingScheme = await _context.TaxSchemes
                .FirstOrDefaultAsync(ts => ts.SchemeName == createDto.SchemeName);

            if (existingScheme != null)
            {
                throw new InvalidOperationException($"Tax scheme with name '{createDto.SchemeName}' already exists.");
            }

            // Validate tax rate exists
            var taxRate = await _context.TaxRates
                .FirstOrDefaultAsync(tr => tr.Id == createDto.TaxRateId);

            if (taxRate == null)
            {
                throw new InvalidOperationException("Invalid tax rate selected.");
            }

            var taxScheme = new TaxScheme
            {
                SchemeName = createDto.SchemeName,
                TaxRateId = createDto.TaxRateId,
                Description = createDto.Description,
                IsActive = createDto.IsActive,
                CreatedAt = DateTime.UtcNow
            };

            _context.TaxSchemes.Add(taxScheme);
            await _context.SaveChangesAsync();

            return new TaxSchemeDto
            {
                Id = taxScheme.Id,
                SchemeName = taxScheme.SchemeName,
                TaxRateId = taxScheme.TaxRateId,
                Description = taxScheme.Description,
                IsActive = taxScheme.IsActive,
                CreatedAt = taxScheme.CreatedAt,
                TaxRateName = taxRate.TaxName,
                TaxRatePercentage = taxRate.TaxPercentage
            };
        }

        public async Task<TaxSchemeDto?> UpdateTaxSchemeAsync(Guid id, UpdateTaxSchemeDto updateDto)
        {
            var taxScheme = await _context.TaxSchemes
                .FirstOrDefaultAsync(ts => ts.Id == id);

            if (taxScheme == null)
                return null;

            // Check if scheme name already exists (excluding current scheme)
            var existingScheme = await _context.TaxSchemes
                .FirstOrDefaultAsync(ts => ts.SchemeName == updateDto.SchemeName && ts.Id != id);

            if (existingScheme != null)
            {
                throw new InvalidOperationException($"Tax scheme with name '{updateDto.SchemeName}' already exists.");
            }

            // Validate tax rate exists
            var taxRate = await _context.TaxRates
                .FirstOrDefaultAsync(tr => tr.Id == updateDto.TaxRateId);

            if (taxRate == null)
            {
                throw new InvalidOperationException("Invalid tax rate selected.");
            }

            taxScheme.SchemeName = updateDto.SchemeName;
            taxScheme.TaxRateId = updateDto.TaxRateId;
            taxScheme.Description = updateDto.Description;
            taxScheme.IsActive = updateDto.IsActive;

            await _context.SaveChangesAsync();

            return new TaxSchemeDto
            {
                Id = taxScheme.Id,
                SchemeName = taxScheme.SchemeName,
                TaxRateId = taxScheme.TaxRateId,
                Description = taxScheme.Description,
                IsActive = taxScheme.IsActive,
                CreatedAt = taxScheme.CreatedAt,
                TaxRateName = taxRate.TaxName,
                TaxRatePercentage = taxRate.TaxPercentage
            };
        }

        public async Task<bool> DeleteTaxSchemeAsync(Guid id)
        {
            var taxScheme = await _context.TaxSchemes
                .FirstOrDefaultAsync(ts => ts.Id == id);

            if (taxScheme == null)
                return false;

            // Check if tax scheme is used in any invoices or transactions
            // This would require checking related tables when they're implemented
            // For now, we'll allow deletion

            _context.TaxSchemes.Remove(taxScheme);
            await _context.SaveChangesAsync();

            return true;
        }

        public async Task<IEnumerable<TaxSchemeDto>> GetActiveTaxSchemesAsync()
        {
            // SIMPLIFIED APPROACH - GET TAX SCHEMES AND TAX RATES SEPARATELY
            var taxSchemes = await _context.TaxSchemes
                .Where(ts => ts.IsActive)
                .OrderBy(ts => ts.SchemeName)
                .ToListAsync();

            var taxRateIds = taxSchemes.Select(ts => ts.TaxRateId).ToList();
            var taxRates = await _context.TaxRates
                .Where(tr => taxRateIds.Contains(tr.Id))
                .ToDictionaryAsync(tr => tr.Id, tr => tr);

            return taxSchemes.Select(ts => new TaxSchemeDto
            {
                Id = ts.Id,
                SchemeName = ts.SchemeName,
                TaxRateId = ts.TaxRateId,
                Description = ts.Description,
                IsActive = ts.IsActive,
                CreatedAt = ts.CreatedAt,
                TaxRateName = taxRates.ContainsKey(ts.TaxRateId) ? taxRates[ts.TaxRateId].TaxName : "Unknown",
                TaxRatePercentage = taxRates.ContainsKey(ts.TaxRateId) ? taxRates[ts.TaxRateId].TaxPercentage : 0
            });
        }

        public async Task<IEnumerable<TaxSchemeDto>> GetTaxSchemesByTaxRateAsync(Guid taxRateId)
        {
            // SIMPLIFIED APPROACH - GET TAX SCHEMES AND TAX RATE SEPARATELY
            var taxSchemes = await _context.TaxSchemes
                .Where(ts => ts.TaxRateId == taxRateId)
                .OrderBy(ts => ts.SchemeName)
                .ToListAsync();

            var taxRate = await _context.TaxRates.FirstOrDefaultAsync(tr => tr.Id == taxRateId);

            return taxSchemes.Select(ts => new TaxSchemeDto
            {
                Id = ts.Id,
                SchemeName = ts.SchemeName,
                TaxRateId = ts.TaxRateId,
                Description = ts.Description,
                IsActive = ts.IsActive,
                CreatedAt = ts.CreatedAt,
                TaxRateName = taxRate?.TaxName ?? "Unknown",
                TaxRatePercentage = taxRate?.TaxPercentage ?? 0
            });
        }
    }
}
