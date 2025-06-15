using System.ComponentModel.DataAnnotations;
using System.ComponentModel.DataAnnotations.Schema;
using GarmentsERP.API.Models.Users;

namespace GarmentsERP.API.Models
{
    public class PurchaseOrder
    {
        [Key]
        public int Id { get; set; }

        [Required]
        [MaxLength(20)]
        public string PurchaseOrderNumber { get; set; } = string.Empty;

        [Required]
        public string VendorId { get; set; } = string.Empty;

        [ForeignKey("VendorId")]
        public virtual VendorProfile Vendor { get; set; } = null!;

        [Required]
        public DateTime OrderDate { get; set; } = DateTime.UtcNow;

        public DateTime? ExpectedDeliveryDate { get; set; }

        public DateTime? ActualDeliveryDate { get; set; }

        [Required]
        [MaxLength(20)]
        public string Status { get; set; } = "Draft"; // Draft, Pending, Approved, Ordered, Received, Cancelled

        [Column(TypeName = "decimal(18,2)")]
        public decimal TotalAmount { get; set; } = 0;

        [Column(TypeName = "decimal(18,2)")]
        public decimal TaxAmount { get; set; } = 0;

        [Column(TypeName = "decimal(18,2)")]
        public decimal GrandTotal { get; set; } = 0;

        [MaxLength(500)]
        public string? Notes { get; set; }

        [MaxLength(100)]
        public string? DeliveryAddress { get; set; }

        [Required]
        public string CreatedBy { get; set; } = string.Empty;

        public DateTime CreatedAt { get; set; } = DateTime.UtcNow;

        public string? ModifiedBy { get; set; }

        public DateTime? ModifiedAt { get; set; }

        // Navigation properties
        public virtual ICollection<PurchaseOrderItem> Items { get; set; } = new List<PurchaseOrderItem>();
        public virtual ICollection<Bill> Bills { get; set; } = new List<Bill>();
    }

    public class PurchaseOrderItem
    {
        [Key]
        public int Id { get; set; }

        [Required]
        public int PurchaseOrderId { get; set; }

        [ForeignKey("PurchaseOrderId")]
        public virtual PurchaseOrder PurchaseOrder { get; set; } = null!;

        [Required]
        public int ProductId { get; set; }

        [ForeignKey("ProductId")]
        public virtual Product Product { get; set; } = null!;

        [Required]
        [MaxLength(100)]
        public string ProductName { get; set; } = string.Empty;

        [MaxLength(50)]
        public string? ProductSku { get; set; }

        [Required]
        public int Quantity { get; set; }

        [Required]
        [Column(TypeName = "decimal(18,4)")]
        public decimal UnitPrice { get; set; }

        [Column(TypeName = "decimal(18,2)")]
        public decimal TotalPrice { get; set; }

        [MaxLength(50)]
        public string? Unit { get; set; } = "Pieces";

        [MaxLength(500)]
        public string? Notes { get; set; }

        public int? ReceivedQuantity { get; set; } = 0;

        public DateTime? ReceivedDate { get; set; }

        [MaxLength(20)]
        public string Status { get; set; } = "Pending"; // Pending, Received, Partial, Cancelled
    }

    public class Bill
    {
        [Key]
        public int Id { get; set; }

        [Required]
        [MaxLength(20)]
        public string BillNumber { get; set; } = string.Empty;

        [Required]
        public string VendorId { get; set; } = string.Empty;

        [ForeignKey("VendorId")]
        public virtual VendorProfile Vendor { get; set; } = null!;

        public int? PurchaseOrderId { get; set; }

        [ForeignKey("PurchaseOrderId")]
        public virtual PurchaseOrder? PurchaseOrder { get; set; }

        [Required]
        public DateTime BillDate { get; set; } = DateTime.UtcNow;

        public DateTime? DueDate { get; set; }

        [Column(TypeName = "decimal(18,2)")]
        public decimal Amount { get; set; } = 0;

        [Column(TypeName = "decimal(18,2)")]
        public decimal TaxAmount { get; set; } = 0;

        [Column(TypeName = "decimal(18,2)")]
        public decimal TotalAmount { get; set; } = 0;

        [Column(TypeName = "decimal(18,2)")]
        public decimal PaidAmount { get; set; } = 0;

        [Column(TypeName = "decimal(18,2)")]
        public decimal BalanceAmount { get; set; } = 0;

        [Required]
        [MaxLength(20)]
        public string Status { get; set; } = "Pending"; // Pending, Paid, Partial, Overdue, Cancelled

        [MaxLength(50)]
        public string PaymentTerms { get; set; } = "Net 30";

        [MaxLength(500)]
        public string? Notes { get; set; }

        [MaxLength(100)]
        public string? Reference { get; set; }

        [Required]
        public string CreatedBy { get; set; } = string.Empty;

        public DateTime CreatedAt { get; set; } = DateTime.UtcNow;

        public string? ModifiedBy { get; set; }

        public DateTime? ModifiedAt { get; set; }

        // Navigation properties
        public virtual ICollection<BillItem> Items { get; set; } = new List<BillItem>();
        public virtual ICollection<BillPayment> Payments { get; set; } = new List<BillPayment>();
    }

    public class BillItem
    {
        [Key]
        public int Id { get; set; }

        [Required]
        public int BillId { get; set; }

        [ForeignKey("BillId")]
        public virtual Bill Bill { get; set; } = null!;

        [Required]
        [MaxLength(100)]
        public string Description { get; set; } = string.Empty;

        [Required]
        public int Quantity { get; set; }

        [Required]
        [Column(TypeName = "decimal(18,4)")]
        public decimal UnitPrice { get; set; }

        [Column(TypeName = "decimal(18,2)")]
        public decimal TotalPrice { get; set; }

        [MaxLength(50)]
        public string? Unit { get; set; } = "Pieces";

        public int? ProductId { get; set; }

        [ForeignKey("ProductId")]
        public virtual Product? Product { get; set; }
    }

    public class BillPayment
    {
        [Key]
        public int Id { get; set; }

        [Required]
        public int BillId { get; set; }

        [ForeignKey("BillId")]
        public virtual Bill Bill { get; set; } = null!;

        [Required]
        public DateTime PaymentDate { get; set; } = DateTime.UtcNow;

        [Required]
        [Column(TypeName = "decimal(18,2)")]
        public decimal Amount { get; set; }

        [Required]
        [MaxLength(50)]
        public string PaymentMethod { get; set; } = "Cash"; // Cash, Check, Bank Transfer, Credit Card

        [MaxLength(100)]
        public string? Reference { get; set; }

        [MaxLength(500)]
        public string? Notes { get; set; }

        [Required]
        public string CreatedBy { get; set; } = string.Empty;

        public DateTime CreatedAt { get; set; } = DateTime.UtcNow;
    }
}
