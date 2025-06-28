using Microsoft.AspNetCore.Mvc;
using Microsoft.AspNetCore.Authorization;
using GarmentsERP.API.DTOs.Settings;
using GarmentsERP.API.Interfaces;
using GarmentsERP.API.Attributes;

namespace GarmentsERP.API.Controllers
{
    [ApiController]
    [Route("api/[controller]")]
    [Authorize]
    public class CompanyController : ControllerBase
    {
        private readonly ICompanyService _companyService;

        public CompanyController(ICompanyService companyService)
        {
            _companyService = companyService;
        }

        [HttpGet]
        [RequirePermission("Company", "Read")]
        public async Task<ActionResult<IEnumerable<CompanyResponseDto>>> GetAll()
        {
            try
            {
                var companies = await _companyService.GetAllAsync();
                return Ok(companies);
            }
            catch (Exception ex)
            {
                return StatusCode(500, $"Internal server error: {ex.Message}");
            }
        }

        [HttpGet("{id}")]
        [RequirePermission("Company", "Read")]
        public async Task<ActionResult<CompanyResponseDto>> GetById(Guid id)
        {
            try
            {
                var company = await _companyService.GetByIdAsync(id);
                
                if (company == null)
                {
                    return NotFound($"Company with ID {id} not found.");
                }
                
                return Ok(company);
            }
            catch (Exception ex)
            {
                return StatusCode(500, $"Internal server error: {ex.Message}");
            }
        }

        [HttpPost]
        [RequirePermission("Company", "Create")]
        public async Task<ActionResult<CompanyResponseDto>> Create([FromBody] CreateCompanyDto createDto)
        {
            try
            {
                if (!ModelState.IsValid)
                {
                    return BadRequest(ModelState);
                }

                // Check if company name already exists
                var nameExists = await _companyService.NameExistsAsync(createDto.CompanyName);
                if (nameExists)
                {
                    return BadRequest($"A company with the name '{createDto.CompanyName}' already exists.");
                }

                var company = await _companyService.CreateAsync(createDto);
                return CreatedAtAction(nameof(GetById), new { id = company.Id }, company);
            }
            catch (Exception ex)
            {
                return StatusCode(500, $"Internal server error: {ex.Message}");
            }
        }

        [HttpPut("{id}")]
        [RequirePermission("Company", "Update")]
        public async Task<ActionResult<CompanyResponseDto>> Update(Guid id, [FromBody] UpdateCompanyDto updateDto)
        {
            try
            {
                if (!ModelState.IsValid)
                {
                    return BadRequest(ModelState);
                }

                // Check if company exists
                var exists = await _companyService.ExistsAsync(id);
                if (!exists)
                {
                    return NotFound($"Company with ID {id} not found.");
                }

                // Check if company name already exists (excluding current company)
                var nameExists = await _companyService.NameExistsAsync(updateDto.CompanyName, id);
                if (nameExists)
                {
                    return BadRequest($"A company with the name '{updateDto.CompanyName}' already exists.");
                }

                var company = await _companyService.UpdateAsync(id, updateDto);
                if (company == null)
                {
                    return NotFound($"Company with ID {id} not found.");
                }

                return Ok(company);
            }
            catch (Exception ex)
            {
                return StatusCode(500, $"Internal server error: {ex.Message}");
            }
        }

        [HttpDelete("{id}")]
        [RequirePermission("Company", "Delete")]
        public async Task<IActionResult> Delete(Guid id)
        {
            try
            {
                var success = await _companyService.DeleteAsync(id);
                
                if (!success)
                {
                    return NotFound($"Company with ID {id} not found.");
                }
                
                return NoContent();
            }
            catch (Exception ex)
            {
                return StatusCode(500, $"Internal server error: {ex.Message}");
            }
        }

        [HttpGet("exists/{id}")]
        [RequirePermission("Company", "Read")]
        public async Task<ActionResult<bool>> Exists(Guid id)
        {
            try
            {
                var exists = await _companyService.ExistsAsync(id);
                return Ok(exists);
            }
            catch (Exception ex)
            {
                return StatusCode(500, $"Internal server error: {ex.Message}");
            }
        }

        [HttpGet("name-exists")]
        [RequirePermission("Company", "Read")]
        public async Task<ActionResult<bool>> NameExists([FromQuery] string name, [FromQuery] Guid? excludeId = null)
        {
            try
            {
                if (string.IsNullOrWhiteSpace(name))
                {
                    return BadRequest("Company name is required.");
                }

                var exists = await _companyService.NameExistsAsync(name, excludeId);
                return Ok(exists);
            }
            catch (Exception ex)
            {
                return StatusCode(500, $"Internal server error: {ex.Message}");
            }
        }
    }
}