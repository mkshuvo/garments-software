using System.ComponentModel.DataAnnotations;

namespace GarmentsERP.API.DTOs
{
    public class RefreshTokenRequest
    {
        [Required]
        public string Token { get; set; } = string.Empty;
    }
}
