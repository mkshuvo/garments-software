using System.ComponentModel.DataAnnotations;
using System.ComponentModel.DataAnnotations.Schema;

namespace GarmentsERP.API.Models
{
    public class Order
    {
        [Key]
        public Guid OrderId { get; set; } = Guid.NewGuid();

        [ForeignKey("Customer")]
        public Guid CustomerId { get; set; }

        [ForeignKey("SalesOrder")]
        public Guid? SalesOrderId { get; set; }

        [ForeignKey("WorkOrder")]
        public Guid? ProductionOrderId { get; set; }

        public DateTime CreatedDate { get; set; } = DateTime.UtcNow;
        public DateTime? DeliveryDate { get; set; }

        public OrderStatus Status { get; set; } = OrderStatus.New;

        [Range(0, double.MaxValue)]
        public decimal TotalAmount { get; set; }

        public DateTime UpdatedAt { get; set; } = DateTime.UtcNow;

        // Navigation properties
        public virtual Customer Customer { get; set; } = null!;
        public virtual SalesOrder? SalesOrder { get; set; }
        public virtual WorkOrder? ProductionOrder { get; set; }
        public virtual ICollection<OrderDetail> OrderDetails { get; set; } = new List<OrderDetail>();
        public virtual ICollection<Invoice> Invoices { get; set; } = new List<Invoice>();
    }

    public class OrderDetail
    {
        [Key]
        public Guid OrderDetailId { get; set; } = Guid.NewGuid();

        [ForeignKey("Order")]
        public Guid OrderId { get; set; }

        [ForeignKey("Product")]
        public Guid ProductId { get; set; }

        [Range(1, int.MaxValue)]
        public int Quantity { get; set; }

        [Range(0, double.MaxValue)]
        public decimal Price { get; set; }

        [Range(0, double.MaxValue)]
        public decimal LineTotal { get; set; }

        // Navigation properties
        public virtual Order Order { get; set; } = null!;
        public virtual Product Product { get; set; } = null!;
    }

    public enum OrderStatus
    {
        New,
        Processing,
        InProduction,
        ReadyToShip,
        Shipped,
        Delivered,
        Cancelled
    }
}
