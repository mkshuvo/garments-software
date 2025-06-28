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
            var taxSchemes = await _context.TaxSchemes
                .Include(ts => ts.TaxRate)
                .OrderBy(ts => ts.SchemeName)
                .ToListAsync();

            return taxSchemes.Select(ts => new TaxSchemeDto
            {
                Id = ts.Id,
                SchemeName = ts.SchemeName,
                TaxRateId = ts.TaxRateId,
                Description = ts.Description,
                IsActive = ts.IsActive,
                CreatedAt = ts.CreatedAt,
                TaxRateName = ts.TaxRate.TaxName,
                TaxRatePercentage = ts.TaxRate.TaxPercentage
            });
        }

        public async Task<TaxSchemeDto?> GetTaxSchemeByIdAsync(Guid id)
        {
            var taxScheme = await _context.TaxSchemes
                .Include(ts => ts.TaxRate)
                .FirstOrDefaultAsync(ts => ts.Id == id);

            if (taxScheme == null)
                return null;

            return new TaxSchemeDto
            {
                Id = taxScheme.Id,
                SchemeName = taxScheme.SchemeName,
                TaxRateId = taxScheme.TaxRateId,
                Description = taxScheme.Description,
                IsActive = taxScheme.IsActive,
                CreatedAt = taxScheme.CreatedAt,
                TaxRateName = taxScheme.TaxRate.TaxName,
                TaxRatePercentage = taxScheme.TaxRate.TaxPercentage
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
                .Include(ts => ts.TaxRate)
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
            var taxSchemes = await _context.TaxSchemes
                .Include(ts => ts.TaxRate)
                .Where(ts => ts.IsActive)
                .OrderBy(ts => ts.SchemeName)
                .ToListAsync();

            return taxSchemes.Select(ts => new TaxSchemeDto
            {
                Id = ts.Id,
                SchemeName = ts.SchemeName,
                TaxRateId = ts.TaxRateId,
                Description = ts.Description,
                IsActive = ts.IsActive,
                CreatedAt = ts.CreatedAt,
                TaxRateName = ts.TaxRate.TaxName,
                TaxRatePercentage = ts.TaxRate.TaxPercentage
            });
        }

        public async Task<IEnumerable<TaxSchemeDto>> GetTaxSchemesByTaxRateAsync(Guid taxRateId)
        {
            var taxSchemes = await _context.TaxSchemes
                .Include(ts => ts.TaxRate)
                .Where(ts => ts.TaxRateId == taxRateId)
                .OrderBy(ts => ts.SchemeName)
                .ToListAsync();

            return taxSchemes.Select(ts => new TaxSchemeDto
            {
                Id = ts.Id,
                SchemeName = ts.SchemeName,
                TaxRateId = ts.TaxRateId,
                Description = ts.Description,
                IsActive = ts.IsActive,
                CreatedAt = ts.CreatedAt,
                TaxRateName = ts.TaxRate.TaxName,
                TaxRatePercentage = ts.TaxRate.TaxPercentage
            });
        }
    }
}
