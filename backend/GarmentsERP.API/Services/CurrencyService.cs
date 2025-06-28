using GarmentsERP.API.Data;
using GarmentsERP.API.DTOs.Currency;
using GarmentsERP.API.Interfaces;
using GarmentsERP.API.Models.Currency;
using Microsoft.EntityFrameworkCore;

namespace GarmentsERP.API.Services
{
    public class CurrencyService : ICurrencyService
    {
        private readonly ApplicationDbContext _context;
        private readonly ILogger<CurrencyService> _logger;

        public CurrencyService(ApplicationDbContext context, ILogger<CurrencyService> logger)
        {
            _context = context;
            _logger = logger;
        }

        public async Task<IEnumerable<CurrencyResponseDto>> GetAllAsync()
        {
            try
            {
                var currencies = await _context.Set<Currency>()
                    .OrderBy(c => c.Code)
                    .ToListAsync();

                return currencies.Select(c => new CurrencyResponseDto
                {
                    Id = c.Id,
                    Code = c.Code,
                    Name = c.Name,
                    Symbol = c.Symbol,
                    IsBaseCurrency = c.IsBaseCurrency,
                    IsActive = c.IsActive,
                    CreatedAt = c.CreatedAt
                });
            }
            catch (Exception ex)
            {
                _logger.LogError(ex, "Error occurred while getting all currencies");
                throw;
            }
        }

        public async Task<CurrencyResponseDto?> GetByIdAsync(Guid id)
        {
            try
            {
                var currency = await _context.Set<Currency>()
                    .FirstOrDefaultAsync(c => c.Id == id);

                if (currency == null)
                    return null;

                return new CurrencyResponseDto
                {
                    Id = currency.Id,
                    Code = currency.Code,
                    Name = currency.Name,
                    Symbol = currency.Symbol,
                    IsBaseCurrency = currency.IsBaseCurrency,
                    IsActive = currency.IsActive,
                    CreatedAt = currency.CreatedAt
                };
            }
            catch (Exception ex)
            {
                _logger.LogError(ex, "Error occurred while getting currency with ID {Id}", id);
                throw;
            }
        }

        public async Task<CurrencyResponseDto> CreateAsync(CreateCurrencyDto createDto)
        {
            try
            {
                var currency = new Currency
                {
                    Code = createDto.Code.ToUpperInvariant(),
                    Name = createDto.Name,
                    Symbol = createDto.Symbol,
                    IsBaseCurrency = createDto.IsBaseCurrency,
                    IsActive = createDto.IsActive,
                    CreatedAt = DateTime.UtcNow
                };

                _context.Set<Currency>().Add(currency);
                await _context.SaveChangesAsync();

                _logger.LogInformation("Currency created with ID {Id}", currency.Id);

                return new CurrencyResponseDto
                {
                    Id = currency.Id,
                    Code = currency.Code,
                    Name = currency.Name,
                    Symbol = currency.Symbol,
                    IsBaseCurrency = currency.IsBaseCurrency,
                    IsActive = currency.IsActive,
                    CreatedAt = currency.CreatedAt
                };
            }
            catch (Exception ex)
            {
                _logger.LogError(ex, "Error occurred while creating currency");
                throw;
            }
        }

        public async Task<CurrencyResponseDto?> UpdateAsync(Guid id, UpdateCurrencyDto updateDto)
        {
            try
            {
                var currency = await _context.Set<Currency>()
                    .FirstOrDefaultAsync(c => c.Id == id);

                if (currency == null)
                    return null;

                currency.Code = updateDto.Code.ToUpperInvariant();
                currency.Name = updateDto.Name;
                currency.Symbol = updateDto.Symbol;
                currency.IsBaseCurrency = updateDto.IsBaseCurrency;
                currency.IsActive = updateDto.IsActive;

                await _context.SaveChangesAsync();

                _logger.LogInformation("Currency updated with ID {Id}", id);

                return new CurrencyResponseDto
                {
                    Id = currency.Id,
                    Code = currency.Code,
                    Name = currency.Name,
                    Symbol = currency.Symbol,
                    IsBaseCurrency = currency.IsBaseCurrency,
                    IsActive = currency.IsActive,
                    CreatedAt = currency.CreatedAt
                };
            }
            catch (Exception ex)
            {
                _logger.LogError(ex, "Error occurred while updating currency with ID {Id}", id);
                throw;
            }
        }

        public async Task<bool> DeleteAsync(Guid id)
        {
            try
            {
                var currency = await _context.Set<Currency>()
                    .FirstOrDefaultAsync(c => c.Id == id);

                if (currency == null)
                    return false;

                _context.Set<Currency>().Remove(currency);
                await _context.SaveChangesAsync();

                _logger.LogInformation("Currency deleted with ID {Id}", id);
                return true;
            }
            catch (Exception ex)
            {
                _logger.LogError(ex, "Error occurred while deleting currency with ID {Id}", id);
                throw;
            }
        }

        public async Task<bool> ExistsAsync(Guid id)
        {
            try
            {
                return await _context.Set<Currency>()
                    .AnyAsync(c => c.Id == id);
            }
            catch (Exception ex)
            {
                _logger.LogError(ex, "Error occurred while checking if currency exists with ID {Id}", id);
                throw;
            }
        }

        public async Task<bool> CodeExistsAsync(string code, Guid? excludeId = null)
        {
            try
            {
                var query = _context.Set<Currency>()
                    .Where(c => c.Code.ToLower() == code.ToLower());

                if (excludeId.HasValue)
                    query = query.Where(c => c.Id != excludeId.Value);

                return await query.AnyAsync();
            }
            catch (Exception ex)
            {
                _logger.LogError(ex, "Error occurred while checking if currency code exists: {Code}", code);
                throw;
            }
        }
    }
}
