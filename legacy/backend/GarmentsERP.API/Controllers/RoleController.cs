using Microsoft.AspNetCore.Authorization;
using Microsoft.AspNetCore.Mvc;
using GarmentsERP.API.DTOs.Roles;
using GarmentsERP.API.DTOs.Users;
using GarmentsERP.API.Interfaces;
using System.Security.Claims;

namespace GarmentsERP.API.Controllers
{
    [ApiController]
    [Route("api/[controller]")]
    [Authorize(Roles = "Admin")]
    public class RoleController : ControllerBase
    {
        private readonly IRoleManagementService _roleManagementService;
        private readonly IPermissionService _permissionService;
        private readonly ILogger<RoleController> _logger;

        public RoleController(
            IRoleManagementService roleManagementService,
            IPermissionService permissionService,
            ILogger<RoleController> logger)
        {
            _roleManagementService = roleManagementService;
            _permissionService = permissionService;
            _logger = logger;
        }

        /// <summary>
        /// Get all roles with details
        /// </summary>
        [HttpGet]
        public async Task<ActionResult<IEnumerable<RoleDetailsDto>>> GetAllRoles()
        {
            try
            {
                var roles = await _roleManagementService.GetAllRolesAsync();
                return Ok(roles);
            }
            catch (Exception ex)
            {
                _logger.LogError(ex, "Error occurred while fetching all roles");
                return StatusCode(500, new { message = "An error occurred while fetching roles." });
            }
        }

        /// <summary>
        /// Get role by ID with details
        /// </summary>
        [HttpGet("{roleId}")]
        public async Task<ActionResult<RoleDetailsDto>> GetRoleById(string roleId)
        {
            try
            {
                var role = await _roleManagementService.GetRoleByIdAsync(roleId);
                if (role == null)
                {
                    return NotFound(new { message = "Role not found." });
                }

                return Ok(role);
            }
            catch (Exception ex)
            {
                _logger.LogError(ex, "Error occurred while fetching role: {RoleId}", roleId);
                return StatusCode(500, new { message = "An error occurred while fetching the role." });
            }
        }

        /// <summary>
        /// Create a new role
        /// </summary>
        [HttpPost]
        public async Task<ActionResult<RoleDetailsDto>> CreateRole(CreateRoleDto createDto)
        {
            try
            {
                if (!ModelState.IsValid)
                {
                    return BadRequest(ModelState);
                }

                var userId = User.FindFirst(ClaimTypes.NameIdentifier)?.Value;
                if (userId == null)
                {
                    return Unauthorized();
                }

                var role = await _roleManagementService.CreateRoleAsync(createDto, userId);
                return CreatedAtAction(nameof(GetRoleById), new { roleId = role.Id }, role);
            }
            catch (InvalidOperationException ex)
            {
                return BadRequest(new { message = ex.Message });
            }
            catch (Exception ex)
            {
                _logger.LogError(ex, "Error occurred while creating role: {RoleName}", createDto.Name);
                return StatusCode(500, new { message = "An error occurred while creating the role." });
            }
        }

        /// <summary>
        /// Update an existing role
        /// </summary>
        [HttpPut("{roleId}")]
        public async Task<ActionResult<RoleDetailsDto>> UpdateRole(string roleId, UpdateRoleDto updateDto)
        {
            try
            {
                if (!ModelState.IsValid)
                {
                    return BadRequest(ModelState);
                }

                var userId = User.FindFirst(ClaimTypes.NameIdentifier)?.Value;
                if (userId == null)
                {
                    return Unauthorized();
                }

                var role = await _roleManagementService.UpdateRoleAsync(roleId, updateDto, userId);
                if (role == null)
                {
                    return NotFound(new { message = "Role not found." });
                }

                return Ok(role);
            }
            catch (InvalidOperationException ex)
            {
                return BadRequest(new { message = ex.Message });
            }
            catch (Exception ex)
            {
                _logger.LogError(ex, "Error occurred while updating role: {RoleId}", roleId);
                return StatusCode(500, new { message = "An error occurred while updating the role." });
            }
        }

        /// <summary>
        /// Delete a role
        /// </summary>
        [HttpDelete("{roleId}")]
        public async Task<IActionResult> DeleteRole(string roleId)
        {
            try
            {
                var userId = User.FindFirst(ClaimTypes.NameIdentifier)?.Value;
                if (userId == null)
                {
                    return Unauthorized();
                }

                var deleted = await _roleManagementService.DeleteRoleAsync(roleId, userId);
                if (!deleted)
                {
                    return NotFound(new { message = "Role not found." });
                }

                return NoContent();
            }
            catch (InvalidOperationException ex)
            {
                return BadRequest(new { message = ex.Message });
            }
            catch (Exception ex)
            {
                _logger.LogError(ex, "Error occurred while deleting role: {RoleId}", roleId);
                return StatusCode(500, new { message = "An error occurred while deleting the role." });
            }
        }

        /// <summary>
        /// Get role permissions
        /// </summary>
        [HttpGet("{roleId}/permissions")]
        [Authorize(Roles = "Admin,Manager")]
        public async Task<ActionResult<RolePermissionsDto>> GetRolePermissions(string roleId)
        {
            try
            {
                var rolePermissions = await _permissionService.GetRolePermissionsAsync(roleId);
                if (rolePermissions == null)
                {
                    return NotFound(new { message = "Role not found." });
                }

                return Ok(rolePermissions);
            }
            catch (Exception ex)
            {
                _logger.LogError(ex, "Error occurred while fetching role permissions: {RoleId}", roleId);
                return StatusCode(500, new { message = "An error occurred while fetching role permissions." });
            }
        }

        /// <summary>
        /// Modify role permissions
        /// </summary>
        [HttpPut("{roleId}/permissions")]
        public async Task<IActionResult> ModifyRolePermissions(string roleId, ModifyRolePermissionsDto modifyDto)
        {
            try
            {
                if (!ModelState.IsValid)
                {
                    return BadRequest(ModelState);
                }

                var userId = User.FindFirst(ClaimTypes.NameIdentifier)?.Value;
                if (userId == null)
                {
                    return Unauthorized();
                }

                // Validate permissions first
                var isValid = await _roleManagementService.ValidateRolePermissionsAsync(modifyDto.PermissionIds);
                if (!isValid)
                {
                    return BadRequest(new { message = "One or more permission IDs are invalid or inactive." });
                }

                var success = await _roleManagementService.ModifyRolePermissionsAsync(roleId, modifyDto, userId);
                if (!success)
                {
                    return NotFound(new { message = "Role not found." });
                }

                return Ok(new { message = "Role permissions updated successfully." });
            }
            catch (InvalidOperationException ex)
            {
                return BadRequest(new { message = ex.Message });
            }
            catch (Exception ex)
            {
                _logger.LogError(ex, "Error occurred while modifying role permissions: {RoleId}", roleId);
                return StatusCode(500, new { message = "An error occurred while modifying role permissions." });
            }
        }

        /// <summary>
        /// Get role audit logs
        /// </summary>
        [HttpGet("audit-logs")]
        public async Task<ActionResult<IEnumerable<RoleAuditLogDto>>> GetRoleAuditLogs(
            [FromQuery] string? roleId = null, 
            [FromQuery] int limit = 100)
        {
            try
            {
                if (limit > 1000) limit = 1000; // Cap the limit

                var auditLogs = await _roleManagementService.GetRoleAuditLogsAsync(roleId, limit);
                return Ok(auditLogs);
            }
            catch (Exception ex)
            {
                _logger.LogError(ex, "Error occurred while fetching role audit logs");
                return StatusCode(500, new { message = "An error occurred while fetching audit logs." });
            }
        }

        /// <summary>
        /// Get role audit logs for a specific role
        /// </summary>
        [HttpGet("{roleId}/audit-logs")]
        public async Task<ActionResult<IEnumerable<RoleAuditLogDto>>> GetRoleAuditLogsByRoleId(
            string roleId, 
            [FromQuery] int limit = 100)
        {
            try
            {
                if (limit > 1000) limit = 1000; // Cap the limit

                var auditLogs = await _roleManagementService.GetRoleAuditLogsAsync(roleId, limit);
                return Ok(auditLogs);
            }
            catch (Exception ex)
            {
                _logger.LogError(ex, "Error occurred while fetching role audit logs for role: {RoleId}", roleId);
                return StatusCode(500, new { message = "An error occurred while fetching audit logs." });
            }
        }
    }
}