namespace GarmentsERP.API.DTOs
{
    /// <summary>
    /// DTO for role information
    /// </summary>
    public class RoleInfoDto
    {
        /// <summary>
        /// Role identifier
        /// </summary>
        public Guid Id { get; set; }

        /// <summary>
        /// Role name
        /// </summary>
        public string Name { get; set; } = string.Empty;

        /// <summary>
        /// Role description
        /// </summary>
        public string? Description { get; set; }
    }
}
