using System.ComponentModel.DataAnnotations;
using System.ComponentModel.DataAnnotations.Schema;

namespace GarmentsERP.API.Models
{
    public class Customer
    {
        [Key]
        public Guid CustomerId { get; set; } = Guid.NewGuid();

        [Required]
        [MaxLength(200)]
        public string CompanyName { get; set; } = string.Empty;

        [MaxLength(100)]
        public string? ContactPerson { get; set; }

        [MaxLength(100)]
        public string? Email { get; set; }

        [MaxLength(15)]
        public string? Phone { get; set; }

        [MaxLength(500)]
        public string? Address { get; set; }

        public DateTime CreatedAt { get; set; } = DateTime.UtcNow;
        public bool IsActive { get; set; } = true;

        // Navigation properties
        public virtual ICollection<SalesOrder> SalesOrders { get; set; } = new List<SalesOrder>();
        public virtual ICollection<Order> Orders { get; set; } = new List<Order>();
    }

    public class SalesOrder
    {
        [Key]
        public Guid OrderId { get; set; } = Guid.NewGuid();

        [ForeignKey("Customer")]
        public Guid CustomerId { get; set; }

        public DateTime OrderDate { get; set; } = DateTime.UtcNow;

        public SalesOrderStatus Status { get; set; } = SalesOrderStatus.Pending;

        [Range(0, double.MaxValue)]
        public decimal TotalAmount { get; set; }

        public DateTime CreatedAt { get; set; } = DateTime.UtcNow;
        public DateTime UpdatedAt { get; set; } = DateTime.UtcNow;

        // Navigation properties
        public virtual Customer Customer { get; set; } = null!;
        public virtual ICollection<OrderItem> OrderItems { get; set; } = new List<OrderItem>();
    }

    public class OrderItem
    {
        [Key]
        public Guid OrderItemId { get; set; } = Guid.NewGuid();

        [ForeignKey("SalesOrder")]
        public Guid OrderId { get; set; }

        [ForeignKey("Product")]
        public Guid ProductId { get; set; }

        [Range(1, int.MaxValue)]
        public int Quantity { get; set; }

        [Range(0, double.MaxValue)]
        public decimal UnitPrice { get; set; }

        [Range(0, double.MaxValue)]
        public decimal LineTotal { get; set; }

        // Navigation properties
        public virtual SalesOrder SalesOrder { get; set; } = null!;
        public virtual Product Product { get; set; } = null!;
    }

    public enum SalesOrderStatus
    {
        Pending,
        Confirmed,
        InProduction,
        Delivered,
        Cancelled
    }
}
