namespace GarmentsERP.API.DTOs.Products
{
    public class ProductCategoryResponseDto
    {
        public Guid Id { get; set; }
        public string CategoryName { get; set; } = string.Empty;
        public string? Description { get; set; }
        public bool IsActive { get; set; }
        public DateTime CreatedAt { get; set; }
    }
}
