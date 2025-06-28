using Microsoft.EntityFrameworkCore;
using GarmentsERP.API.Data;
using GarmentsERP.API.DTOs.Settings;
using GarmentsERP.API.Interfaces;
using GarmentsERP.API.Models.Settings;

namespace GarmentsERP.API.Services
{
    public class CompanyService : ICompanyService
    {
        private readonly ApplicationDbContext _context;

        public CompanyService(ApplicationDbContext context)
        {
            _context = context;
        }

        public async Task<IEnumerable<CompanyResponseDto>> GetAllAsync()
        {
            var companies = await _context.Companies
                .Where(c => c.IsActive)
                .OrderBy(c => c.CompanyName)
                .ToListAsync();

            return companies.Select(c => new CompanyResponseDto
            {
                Id = c.Id,
                CompanyName = c.CompanyName,
                Address = c.Address,
                City = c.City,
                State = c.State,
                PostalCode = c.PostalCode,
                Country = c.Country,
                Phone = c.Phone,
                Fax = c.Fax,
                Email = c.Email,
                Website = c.Website,
                TaxNumber = c.TaxNumber,
                RegistrationNumber = c.RegistrationNumber,
                Logo = c.Logo,
                FinancialYearStart = c.FinancialYearStart,
                FinancialYearEnd = c.FinancialYearEnd,
                IsActive = c.IsActive,
                CreatedAt = c.CreatedAt,
                UpdatedAt = c.UpdatedAt
            });
        }

        public async Task<CompanyResponseDto?> GetByIdAsync(Guid id)
        {
            var company = await _context.Companies
                .FirstOrDefaultAsync(c => c.Id == id);

            if (company == null)
                return null;

            return new CompanyResponseDto
            {
                Id = company.Id,
                CompanyName = company.CompanyName,
                Address = company.Address,
                City = company.City,
                State = company.State,
                PostalCode = company.PostalCode,
                Country = company.Country,
                Phone = company.Phone,
                Fax = company.Fax,
                Email = company.Email,
                Website = company.Website,
                TaxNumber = company.TaxNumber,
                RegistrationNumber = company.RegistrationNumber,
                Logo = company.Logo,
                FinancialYearStart = company.FinancialYearStart,
                FinancialYearEnd = company.FinancialYearEnd,
                IsActive = company.IsActive,
                CreatedAt = company.CreatedAt,
                UpdatedAt = company.UpdatedAt
            };
        }

        public async Task<CompanyResponseDto> CreateAsync(CreateCompanyDto createDto)
        {
            var company = new Company
            {
                CompanyName = createDto.CompanyName,
                Address = createDto.Address,
                City = createDto.City,
                State = createDto.State,
                PostalCode = createDto.PostalCode,
                Country = createDto.Country,
                Phone = createDto.Phone,
                Fax = createDto.Fax,
                Email = createDto.Email,
                Website = createDto.Website,
                TaxNumber = createDto.TaxNumber,
                RegistrationNumber = createDto.RegistrationNumber,
                Logo = createDto.Logo,
                FinancialYearStart = createDto.FinancialYearStart,
                FinancialYearEnd = createDto.FinancialYearEnd,
                IsActive = createDto.IsActive
            };

            _context.Companies.Add(company);
            await _context.SaveChangesAsync();

            return new CompanyResponseDto
            {
                Id = company.Id,
                CompanyName = company.CompanyName,
                Address = company.Address,
                City = company.City,
                State = company.State,
                PostalCode = company.PostalCode,
                Country = company.Country,
                Phone = company.Phone,
                Fax = company.Fax,
                Email = company.Email,
                Website = company.Website,
                TaxNumber = company.TaxNumber,
                RegistrationNumber = company.RegistrationNumber,
                Logo = company.Logo,
                FinancialYearStart = company.FinancialYearStart,
                FinancialYearEnd = company.FinancialYearEnd,
                IsActive = company.IsActive,
                CreatedAt = company.CreatedAt,
                UpdatedAt = company.UpdatedAt
            };
        }

        public async Task<CompanyResponseDto?> UpdateAsync(Guid id, UpdateCompanyDto updateDto)
        {
            var company = await _context.Companies
                .FirstOrDefaultAsync(c => c.Id == id);

            if (company == null)
                return null;

            company.CompanyName = updateDto.CompanyName;
            company.Address = updateDto.Address;
            company.City = updateDto.City;
            company.State = updateDto.State;
            company.PostalCode = updateDto.PostalCode;
            company.Country = updateDto.Country;
            company.Phone = updateDto.Phone;
            company.Fax = updateDto.Fax;
            company.Email = updateDto.Email;
            company.Website = updateDto.Website;
            company.TaxNumber = updateDto.TaxNumber;
            company.RegistrationNumber = updateDto.RegistrationNumber;
            company.Logo = updateDto.Logo;
            company.FinancialYearStart = updateDto.FinancialYearStart;
            company.FinancialYearEnd = updateDto.FinancialYearEnd;
            company.IsActive = updateDto.IsActive;
            company.UpdatedAt = DateTime.UtcNow;

            await _context.SaveChangesAsync();

            return new CompanyResponseDto
            {
                Id = company.Id,
                CompanyName = company.CompanyName,
                Address = company.Address,
                City = company.City,
                State = company.State,
                PostalCode = company.PostalCode,
                Country = company.Country,
                Phone = company.Phone,
                Fax = company.Fax,
                Email = company.Email,
                Website = company.Website,
                TaxNumber = company.TaxNumber,
                RegistrationNumber = company.RegistrationNumber,
                Logo = company.Logo,
                FinancialYearStart = company.FinancialYearStart,
                FinancialYearEnd = company.FinancialYearEnd,
                IsActive = company.IsActive,
                CreatedAt = company.CreatedAt,
                UpdatedAt = company.UpdatedAt
            };
        }

        public async Task<bool> DeleteAsync(Guid id)
        {
            var company = await _context.Companies
                .FirstOrDefaultAsync(c => c.Id == id);

            if (company == null)
                return false;

            // Soft delete by setting IsActive to false
            company.IsActive = false;
            company.UpdatedAt = DateTime.UtcNow;

            await _context.SaveChangesAsync();
            return true;
        }

        public async Task<bool> ExistsAsync(Guid id)
        {
            return await _context.Companies
                .AnyAsync(c => c.Id == id);
        }

        public async Task<bool> NameExistsAsync(string name, Guid? excludeId = null)
        {
            var query = _context.Companies
                .Where(c => c.CompanyName.ToLower() == name.ToLower());

            if (excludeId.HasValue)
            {
                query = query.Where(c => c.Id != excludeId.Value);
            }

            return await query.AnyAsync();
        }
    }
}
