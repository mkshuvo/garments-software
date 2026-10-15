namespace GarmentsERP.API.DTOs.Products
{
    public class UpdateProductCategoryDto
    {
        public string CategoryName { get; set; } = string.Empty;
        public string? Description { get; set; }
        public bool IsActive { get; set; } = true;
    }
}
