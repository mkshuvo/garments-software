using GarmentsERP.API.Models.Users;

namespace GarmentsERP.API.DTOs.Users
{
    public class LoginResponseDto
    {
        public string Token { get; set; } = string.Empty;
        public DateTime Expiration { get; set; }
        public UserResponseDto User { get; set; } = null!;
    }
}
