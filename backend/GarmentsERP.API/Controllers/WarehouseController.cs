using Microsoft.AspNetCore.Mvc;
using Microsoft.AspNetCore.Authorization;
using GarmentsERP.API.DTOs.Inventory;
using GarmentsERP.API.Interfaces;

namespace GarmentsERP.API.Controllers
{
    [Route("api/[controller]")]
    [ApiController]
    [Authorize]
    public class WarehouseController : ControllerBase
    {
        private readonly IWarehouseService _warehouseService;
        private readonly ILogger<WarehouseController> _logger;

        public WarehouseController(
            IWarehouseService warehouseService,
            ILogger<WarehouseController> logger)
        {
            _warehouseService = warehouseService;
            _logger = logger;
        }

        /// <summary>
        /// Get all warehouses
        /// </summary>
        [HttpGet]
        public async Task<ActionResult<IEnumerable<WarehouseResponseDto>>> GetWarehouses()
        {
            try
            {
                var warehouses = await _warehouseService.GetAllAsync();
                return Ok(warehouses);
            }
            catch (Exception ex)
            {
                _logger.LogError(ex, "Error retrieving warehouses");
                return StatusCode(500, "Internal server error");
            }
        }

        /// <summary>
        /// Get warehouse by ID
        /// </summary>
        [HttpGet("{id}")]
        public async Task<ActionResult<WarehouseResponseDto>> GetWarehouse(Guid id)
        {
            try
            {
                var warehouse = await _warehouseService.GetByIdAsync(id);
                if (warehouse == null)
                {
                    return NotFound($"Warehouse with ID {id} not found");
                }
                return Ok(warehouse);
            }
            catch (Exception ex)
            {
                _logger.LogError(ex, "Error retrieving warehouse with ID: {Id}", id);
                return StatusCode(500, "Internal server error");
            }
        }

        /// <summary>
        /// Create a new warehouse
        /// </summary>
        [HttpPost]
        public async Task<ActionResult<WarehouseResponseDto>> CreateWarehouse(CreateWarehouseDto createDto)
        {
            try
            {
                var warehouse = await _warehouseService.CreateAsync(createDto);
                return CreatedAtAction(nameof(GetWarehouse), new { id = warehouse.Id }, warehouse);
            }
            catch (Exception ex)
            {
                _logger.LogError(ex, "Error creating warehouse");
                return StatusCode(500, "Internal server error");
            }
        }

        /// <summary>
        /// Update an existing warehouse
        /// </summary>
        [HttpPut("{id}")]
        public async Task<ActionResult<WarehouseResponseDto>> UpdateWarehouse(Guid id, UpdateWarehouseDto updateDto)
        {
            try
            {
                var warehouse = await _warehouseService.UpdateAsync(id, updateDto);
                if (warehouse == null)
                {
                    return NotFound($"Warehouse with ID {id} not found");
                }
                return Ok(warehouse);
            }
            catch (Exception ex)
            {
                _logger.LogError(ex, "Error updating warehouse with ID: {Id}", id);
                return StatusCode(500, "Internal server error");
            }
        }

        /// <summary>
        /// Delete a warehouse
        /// </summary>
        [HttpDelete("{id}")]
        public async Task<ActionResult> DeleteWarehouse(Guid id)
        {
            try
            {
                var result = await _warehouseService.DeleteAsync(id);
                if (!result)
                {
                    return NotFound($"Warehouse with ID {id} not found");
                }
                return NoContent();
            }
            catch (Exception ex)
            {
                _logger.LogError(ex, "Error deleting warehouse with ID: {Id}", id);
                return StatusCode(500, "Internal server error");
            }
        }

        /// <summary>
        /// Get active warehouses
        /// </summary>
        [HttpGet("active")]
        public async Task<ActionResult<IEnumerable<WarehouseResponseDto>>> GetActiveWarehouses()
        {
            try
            {
                var warehouses = await _warehouseService.GetAllAsync();
                return Ok(warehouses.Where(w => w.IsActive));
            }
            catch (Exception ex)
            {
                _logger.LogError(ex, "Error retrieving active warehouses");
                return StatusCode(500, "Internal server error");
            }
        }
    }
}
