using Microsoft.AspNetCore.Mvc;
using Microsoft.AspNetCore.Authorization;
using GarmentsERP.API.DTOs.Users;
using GarmentsERP.API.Interfaces;

namespace GarmentsERP.API.Controllers
{
    [Route("api/[controller]")]
    [ApiController]
    [Authorize]
    public class PermissionController : ControllerBase
    {
        private readonly IPermissionService _permissionService;
        private readonly ILogger<PermissionController> _logger;

        public PermissionController(
            IPermissionService permissionService,
            ILogger<PermissionController> logger)
        {
            _permissionService = permissionService;
            _logger = logger;
        }

        /// <summary>
        /// Get all permissions
        /// </summary>
        [HttpGet]
        [Authorize(Roles = "Admin,Manager")]
        public async Task<ActionResult<IEnumerable<PermissionResponseDto>>> GetPermissions()
        {
            try
            {
                var permissions = await _permissionService.GetAllPermissionsAsync();
                return Ok(permissions);
            }
            catch (Exception ex)
            {
                _logger.LogError(ex, "Error retrieving permissions");
                return StatusCode(500, "Internal server error");
            }
        }

        /// <summary>
        /// Get permission by ID
        /// </summary>
        [HttpGet("{id}")]
        [Authorize(Roles = "Admin,Manager")]
        public async Task<ActionResult<PermissionResponseDto>> GetPermission(Guid id)
        {
            try
            {
                var permission = await _permissionService.GetPermissionByIdAsync(id);
                if (permission == null)
                {
                    return NotFound();
                }
                return Ok(permission);
            }
            catch (Exception ex)
            {
                _logger.LogError(ex, "Error retrieving permission {PermissionId}", id);
                return StatusCode(500, "Internal server error");
            }
        }

        /// <summary>
        /// Create a new permission
        /// </summary>
        [HttpPost]
        [Authorize(Roles = "Admin")]
        public async Task<ActionResult<PermissionResponseDto>> CreatePermission(CreatePermissionDto createDto)
        {
            try
            {
                if (!ModelState.IsValid)
                {
                    return BadRequest(ModelState);
                }

                var permission = await _permissionService.CreatePermissionAsync(createDto);
                return CreatedAtAction(nameof(GetPermission), new { id = permission.Id }, permission);
            }
            catch (InvalidOperationException ex)
            {
                return BadRequest(ex.Message);
            }
            catch (Exception ex)
            {
                _logger.LogError(ex, "Error creating permission");
                return StatusCode(500, "Internal server error");
            }
        }

        /// <summary>
        /// Update a permission
        /// </summary>
        [HttpPut("{id}")]
        [Authorize(Roles = "Admin")]
        public async Task<ActionResult<PermissionResponseDto>> UpdatePermission(Guid id, UpdatePermissionDto updateDto)
        {
            try
            {
                if (!ModelState.IsValid)
                {
                    return BadRequest(ModelState);
                }

                var permission = await _permissionService.UpdatePermissionAsync(id, updateDto);
                if (permission == null)
                {
                    return NotFound();
                }

                return Ok(permission);
            }
            catch (InvalidOperationException ex)
            {
                return BadRequest(ex.Message);
            }
            catch (Exception ex)
            {
                _logger.LogError(ex, "Error updating permission {PermissionId}", id);
                return StatusCode(500, "Internal server error");
            }
        }

        /// <summary>
        /// Delete a permission
        /// </summary>
        [HttpDelete("{id}")]
        [Authorize(Roles = "Admin")]
        public async Task<ActionResult> DeletePermission(Guid id)
        {
            try
            {
                var deleted = await _permissionService.DeletePermissionAsync(id);
                if (!deleted)
                {
                    return NotFound();
                }

                return NoContent();
            }
            catch (InvalidOperationException ex)
            {
                return BadRequest(ex.Message);
            }
            catch (Exception ex)
            {
                _logger.LogError(ex, "Error deleting permission {PermissionId}", id);
                return StatusCode(500, "Internal server error");
            }
        }

        /// <summary>
        /// Get active permissions
        /// </summary>
        [HttpGet("active")]
        [Authorize(Roles = "Admin,Manager")]
        public async Task<ActionResult<IEnumerable<PermissionResponseDto>>> GetActivePermissions()
        {
            try
            {
                var permissions = await _permissionService.GetActivePermissionsAsync();
                return Ok(permissions);
            }
            catch (Exception ex)
            {
                _logger.LogError(ex, "Error retrieving active permissions");
                return StatusCode(500, "Internal server error");
            }
        }

        /// <summary>
        /// Assign permissions to a role
        /// </summary>
        [HttpPost("role-permissions")]
        [Authorize(Roles = "Admin")]
        public async Task<ActionResult> AssignPermissionsToRole(AssignRolePermissionDto assignDto)
        {
            try
            {
                if (!ModelState.IsValid)
                {
                    return BadRequest(ModelState);
                }

                var result = await _permissionService.AssignPermissionsToRoleAsync(assignDto);
                if (!result)
                {
                    return BadRequest("Failed to assign permissions to role");
                }

                return Ok(new { message = "Permissions assigned to role successfully" });
            }
            catch (Exception ex)
            {
                _logger.LogError(ex, "Error assigning permissions to role");
                return StatusCode(500, "Internal server error");
            }
        }

        /// <summary>
        /// Get role permissions
        /// </summary>
        [HttpGet("role/{roleId}")]
        [Authorize(Roles = "Admin,Manager")]
        public async Task<ActionResult<RolePermissionsDto>> GetRolePermissions(string roleId)
        {
            try
            {
                var rolePermissions = await _permissionService.GetRolePermissionsAsync(roleId);
                if (rolePermissions == null)
                {
                    return NotFound();
                }
                return Ok(rolePermissions);
            }
            catch (Exception ex)
            {
                _logger.LogError(ex, "Error retrieving role permissions for {RoleId}", roleId);
                return StatusCode(500, "Internal server error");
            }
        }

        /// <summary>
        /// Get all role permissions
        /// </summary>
        [HttpGet("role-permissions")]
        [Authorize(Roles = "Admin,Manager")]
        public async Task<ActionResult<IEnumerable<RolePermissionsDto>>> GetAllRolePermissions()
        {
            try
            {
                var rolePermissions = await _permissionService.GetAllRolePermissionsAsync();
                return Ok(rolePermissions);
            }
            catch (Exception ex)
            {
                _logger.LogError(ex, "Error retrieving all role permissions");
                return StatusCode(500, "Internal server error");
            }
        }

        /// <summary>
        /// Assign permissions to a user
        /// </summary>
        [HttpPost("user-permissions")]
        [Authorize(Roles = "Admin")]
        public async Task<ActionResult> AssignPermissionsToUser(AssignUserPermissionDto assignDto)
        {
            try
            {
                if (!ModelState.IsValid)
                {
                    return BadRequest(ModelState);
                }

                var result = await _permissionService.AssignPermissionsToUserAsync(assignDto);
                if (!result)
                {
                    return BadRequest("Failed to assign permissions to user");
                }

                return Ok(new { message = "Permissions assigned to user successfully" });
            }
            catch (Exception ex)
            {
                _logger.LogError(ex, "Error assigning permissions to user");
                return StatusCode(500, "Internal server error");
            }
        }

        /// <summary>
        /// Get user permissions
        /// </summary>
        [HttpGet("user/{userId}")]
        [Authorize(Roles = "Admin,Manager")]
        public async Task<ActionResult<UserPermissionsDto>> GetUserPermissions(string userId)
        {
            try
            {
                var userPermissions = await _permissionService.GetUserPermissionsAsync(userId);
                if (userPermissions == null)
                {
                    return NotFound();
                }
                return Ok(userPermissions);
            }
            catch (Exception ex)
            {
                _logger.LogError(ex, "Error retrieving user permissions for {UserId}", userId);
                return StatusCode(500, "Internal server error");
            }
        }

        /// <summary>
        /// Get all user permissions
        /// </summary>
        [HttpGet("user-permissions")]
        [Authorize(Roles = "Admin,Manager")]
        public async Task<ActionResult<IEnumerable<UserPermissionsDto>>> GetAllUserPermissions()
        {
            try
            {
                var userPermissions = await _permissionService.GetAllUserPermissionsAsync();
                return Ok(userPermissions);
            }
            catch (Exception ex)
            {
                _logger.LogError(ex, "Error retrieving all user permissions");
                return StatusCode(500, "Internal server error");
            }
        }

        /// <summary>
        /// Check if user has specific permission
        /// </summary>
        [HttpGet("check/{userId}/{resource}/{action}")]
        [Authorize(Roles = "Admin,Manager")]
        public async Task<ActionResult<bool>> CheckPermission(string userId, string resource, string action)
        {
            try
            {
                var hasPermission = await _permissionService.HasPermissionAsync(userId, resource, action);
                return Ok(hasPermission);
            }
            catch (Exception ex)
            {
                _logger.LogError(ex, "Error checking permission for {UserId}", userId);
                return StatusCode(500, "Internal server error");
            }
        }

        /// <summary>
        /// Get user's effective permissions (combined role and direct permissions)
        /// </summary>
        [HttpGet("effective/{userId}")]
        [Authorize(Roles = "Admin,Manager")]
        public async Task<ActionResult<IEnumerable<PermissionResponseDto>>> GetUserEffectivePermissions(string userId)
        {
            try
            {
                var permissions = await _permissionService.GetUserEffectivePermissionsAsync(userId);
                return Ok(permissions);
            }
            catch (Exception ex)
            {
                _logger.LogError(ex, "Error retrieving effective permissions for {UserId}", userId);
                return StatusCode(500, "Internal server error");
            }
        }
    }
}
