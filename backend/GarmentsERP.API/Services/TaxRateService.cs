using Microsoft.EntityFrameworkCore;
using GarmentsERP.API.Data;
using GarmentsERP.API.DTOs.Tax;
using GarmentsERP.API.Interfaces;
using GarmentsERP.API.Models.Tax;

namespace GarmentsERP.API.Services
{
    public class TaxRateService : ITaxRateService
    {
        private readonly ApplicationDbContext _context;

        public TaxRateService(ApplicationDbContext context)
        {
            _context = context;
        }

        public async Task<IEnumerable<TaxRateResponseDto>> GetAllTaxRatesAsync()
        {
            var taxRates = await _context.TaxRates
                .OrderBy(t => t.TaxName)
                .ToListAsync();

            return taxRates.Select(t => new TaxRateResponseDto
            {
                Id = t.Id,
                TaxName = t.TaxName,
                TaxPercentage = t.TaxPercentage,
                TaxType = t.TaxType,
                Description = t.Description,
                IsActive = t.IsActive,
                EffectiveFrom = t.EffectiveFrom,
                EffectiveTo = t.EffectiveTo,
                CreatedAt = t.CreatedAt
            });
        }

        public async Task<TaxRateResponseDto?> GetTaxRateByIdAsync(Guid id)
        {
            var taxRate = await _context.TaxRates
                .FirstOrDefaultAsync(t => t.Id == id);

            if (taxRate == null)
                return null;

            return new TaxRateResponseDto
            {
                Id = taxRate.Id,
                TaxName = taxRate.TaxName,
                TaxPercentage = taxRate.TaxPercentage,
                TaxType = taxRate.TaxType,
                Description = taxRate.Description,
                IsActive = taxRate.IsActive,
                EffectiveFrom = taxRate.EffectiveFrom,
                EffectiveTo = taxRate.EffectiveTo,
                CreatedAt = taxRate.CreatedAt
            };
        }

        public async Task<TaxRateResponseDto> CreateTaxRateAsync(CreateTaxRateDto dto)
        {
            // Check if tax rate name already exists
            var existingTaxRate = await _context.TaxRates
                .FirstOrDefaultAsync(t => t.TaxName == dto.TaxName);

            if (existingTaxRate != null)
            {
                throw new InvalidOperationException($"Tax rate with name '{dto.TaxName}' already exists.");
            }

            var taxRate = new TaxRate
            {
                TaxName = dto.TaxName,
                TaxPercentage = dto.TaxPercentage,
                TaxType = dto.TaxType,
                Description = dto.Description,
                IsActive = dto.IsActive,
                EffectiveFrom = dto.EffectiveFrom,
                EffectiveTo = dto.EffectiveTo,
                CreatedAt = DateTime.UtcNow
            };

            _context.TaxRates.Add(taxRate);
            await _context.SaveChangesAsync();

            return new TaxRateResponseDto
            {
                Id = taxRate.Id,
                TaxName = taxRate.TaxName,
                TaxPercentage = taxRate.TaxPercentage,
                TaxType = taxRate.TaxType,
                Description = taxRate.Description,
                IsActive = taxRate.IsActive,
                EffectiveFrom = taxRate.EffectiveFrom,
                EffectiveTo = taxRate.EffectiveTo,
                CreatedAt = taxRate.CreatedAt
            };
        }

        public async Task<TaxRateResponseDto?> UpdateTaxRateAsync(Guid id, UpdateTaxRateDto dto)
        {
            var taxRate = await _context.TaxRates
                .FirstOrDefaultAsync(t => t.Id == id);

            if (taxRate == null)
                return null;

            // Check if tax rate name already exists (excluding current tax rate)
            var existingTaxRate = await _context.TaxRates
                .FirstOrDefaultAsync(t => t.TaxName == dto.TaxName && t.Id != id);

            if (existingTaxRate != null)
            {
                throw new InvalidOperationException($"Tax rate with name '{dto.TaxName}' already exists.");
            }

            taxRate.TaxName = dto.TaxName;
            taxRate.TaxPercentage = dto.TaxPercentage;
            taxRate.TaxType = dto.TaxType;
            taxRate.Description = dto.Description;
            taxRate.IsActive = dto.IsActive;
            taxRate.EffectiveFrom = dto.EffectiveFrom;
            taxRate.EffectiveTo = dto.EffectiveTo;

            await _context.SaveChangesAsync();

            return new TaxRateResponseDto
            {
                Id = taxRate.Id,
                TaxName = taxRate.TaxName,
                TaxPercentage = taxRate.TaxPercentage,
                TaxType = taxRate.TaxType,
                Description = taxRate.Description,
                IsActive = taxRate.IsActive,
                EffectiveFrom = taxRate.EffectiveFrom,
                EffectiveTo = taxRate.EffectiveTo,
                CreatedAt = taxRate.CreatedAt
            };
        }

        public async Task<bool> DeleteTaxRateAsync(Guid id)
        {
            var taxRate = await _context.TaxRates
                .FirstOrDefaultAsync(t => t.Id == id);

            if (taxRate == null)
                return false;

            // Check if tax rate is used in any tax schemes
            var isUsed = await _context.TaxSchemes
                .AnyAsync(ts => ts.TaxRateId == id);

            if (isUsed)
            {
                throw new InvalidOperationException("Cannot delete tax rate as it is being used in one or more tax schemes.");
            }

            _context.TaxRates.Remove(taxRate);
            await _context.SaveChangesAsync();

            return true;
        }

        public async Task<IEnumerable<TaxRateResponseDto>> GetActiveTaxRatesAsync()
        {
            var taxRates = await _context.TaxRates
                .Where(t => t.IsActive && (t.EffectiveTo == null || t.EffectiveTo > DateTime.UtcNow))
                .OrderBy(t => t.TaxName)
                .ToListAsync();

            return taxRates.Select(t => new TaxRateResponseDto
            {
                Id = t.Id,
                TaxName = t.TaxName,
                TaxPercentage = t.TaxPercentage,
                TaxType = t.TaxType,
                Description = t.Description,
                IsActive = t.IsActive,
                EffectiveFrom = t.EffectiveFrom,
                EffectiveTo = t.EffectiveTo,
                CreatedAt = t.CreatedAt
            });
        }
    }
}
