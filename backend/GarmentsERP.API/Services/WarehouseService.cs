using Microsoft.EntityFrameworkCore;
using GarmentsERP.API.Data;
using GarmentsERP.API.DTOs.Inventory;
using GarmentsERP.API.Interfaces;
using GarmentsERP.API.Models.Inventory;

namespace GarmentsERP.API.Services
{
    public class WarehouseService : IWarehouseService
    {
        private readonly ApplicationDbContext _context;

        public WarehouseService(ApplicationDbContext context)
        {
            _context = context;
        }

        public async Task<IEnumerable<WarehouseResponseDto>> GetAllAsync()
        {
            var warehouses = await _context.Warehouses
                .Where(w => w.IsActive)
                .OrderBy(w => w.WarehouseName)
                .ToListAsync();

            return warehouses.Select(w => new WarehouseResponseDto
            {
                Id = w.Id,
                WarehouseName = w.WarehouseName,
                Address = w.Address,
                City = w.City,
                State = w.State,
                PostalCode = w.PostalCode,
                ContactPerson = w.ContactPerson,
                ContactPhone = w.ContactPhone,
                IsActive = w.IsActive,
                CreatedAt = w.CreatedAt
            });
        }

        public async Task<WarehouseResponseDto?> GetByIdAsync(Guid id)
        {
            var warehouse = await _context.Warehouses
                .FirstOrDefaultAsync(w => w.Id == id);

            if (warehouse == null)
                return null;

            return new WarehouseResponseDto
            {
                Id = warehouse.Id,
                WarehouseName = warehouse.WarehouseName,
                Address = warehouse.Address,
                City = warehouse.City,
                State = warehouse.State,
                PostalCode = warehouse.PostalCode,
                ContactPerson = warehouse.ContactPerson,
                ContactPhone = warehouse.ContactPhone,
                IsActive = warehouse.IsActive,
                CreatedAt = warehouse.CreatedAt
            };
        }

        public async Task<WarehouseResponseDto> CreateAsync(CreateWarehouseDto createDto)
        {
            var warehouse = new Warehouse
            {
                WarehouseName = createDto.WarehouseName,
                Address = createDto.Address,
                City = createDto.City,
                State = createDto.State,
                PostalCode = createDto.PostalCode,
                ContactPerson = createDto.ContactPerson,
                ContactPhone = createDto.ContactPhone,
                IsActive = createDto.IsActive
            };

            _context.Warehouses.Add(warehouse);
            await _context.SaveChangesAsync();

            return new WarehouseResponseDto
            {
                Id = warehouse.Id,
                WarehouseName = warehouse.WarehouseName,
                Address = warehouse.Address,
                City = warehouse.City,
                State = warehouse.State,
                PostalCode = warehouse.PostalCode,
                ContactPerson = warehouse.ContactPerson,
                ContactPhone = warehouse.ContactPhone,
                IsActive = warehouse.IsActive,
                CreatedAt = warehouse.CreatedAt
            };
        }

        public async Task<WarehouseResponseDto?> UpdateAsync(Guid id, UpdateWarehouseDto updateDto)
        {
            var warehouse = await _context.Warehouses
                .FirstOrDefaultAsync(w => w.Id == id);

            if (warehouse == null)
                return null;

            warehouse.WarehouseName = updateDto.WarehouseName;
            warehouse.Address = updateDto.Address;
            warehouse.City = updateDto.City;
            warehouse.State = updateDto.State;
            warehouse.PostalCode = updateDto.PostalCode;
            warehouse.ContactPerson = updateDto.ContactPerson;
            warehouse.ContactPhone = updateDto.ContactPhone;
            warehouse.IsActive = updateDto.IsActive;

            await _context.SaveChangesAsync();

            return new WarehouseResponseDto
            {
                Id = warehouse.Id,
                WarehouseName = warehouse.WarehouseName,
                Address = warehouse.Address,
                City = warehouse.City,
                State = warehouse.State,
                PostalCode = warehouse.PostalCode,
                ContactPerson = warehouse.ContactPerson,
                ContactPhone = warehouse.ContactPhone,
                IsActive = warehouse.IsActive,
                CreatedAt = warehouse.CreatedAt
            };
        }

        public async Task<bool> DeleteAsync(Guid id)
        {
            var warehouse = await _context.Warehouses
                .FirstOrDefaultAsync(w => w.Id == id);

            if (warehouse == null)
                return false;

            // Soft delete by setting IsActive to false
            warehouse.IsActive = false;

            await _context.SaveChangesAsync();
            return true;
        }

        public async Task<bool> ExistsAsync(Guid id)
        {
            return await _context.Warehouses
                .AnyAsync(w => w.Id == id);
        }

        public async Task<bool> NameExistsAsync(string name, Guid? excludeId = null)
        {
            var query = _context.Warehouses
                .Where(w => w.WarehouseName.ToLower() == name.ToLower());

            if (excludeId.HasValue)
            {
                query = query.Where(w => w.Id != excludeId.Value);
            }

            return await query.AnyAsync();
        }

    }
}
