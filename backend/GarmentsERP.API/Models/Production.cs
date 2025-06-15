using System.ComponentModel.DataAnnotations;
using System.ComponentModel.DataAnnotations.Schema;

namespace GarmentsERP.API.Models
{
    public class ProductionLine
    {
        [Key]
        public Guid ProductionLineId { get; set; } = Guid.NewGuid();

        [Required]
        [MaxLength(100)]
        public string LineName { get; set; } = string.Empty;

        [MaxLength(500)]
        public string? Description { get; set; }

        public bool IsActive { get; set; } = true;

        // Navigation properties
        public virtual ICollection<WorkOrder> WorkOrders { get; set; } = new List<WorkOrder>();
    }

    public class WorkOrder
    {
        [Key]
        public Guid WorkOrderId { get; set; } = Guid.NewGuid();

        [ForeignKey("ProductionLine")]
        public Guid ProductionLineId { get; set; }

        [ForeignKey("Product")]
        public Guid ProductId { get; set; }

        [Range(1, int.MaxValue)]
        public int Quantity { get; set; }

        public DateTime ScheduledStartDate { get; set; }
        public DateTime ScheduledEndDate { get; set; }
        public DateTime? ActualStartDate { get; set; }
        public DateTime? ActualEndDate { get; set; }

        public WorkOrderStatus Status { get; set; } = WorkOrderStatus.Scheduled;

        public DateTime CreatedAt { get; set; } = DateTime.UtcNow;
        public DateTime UpdatedAt { get; set; } = DateTime.UtcNow;

        // Navigation properties
        public virtual ProductionLine ProductionLine { get; set; } = null!;
        public virtual Product Product { get; set; } = null!;
        public virtual ICollection<ProductionSchedule> ProductionSchedules { get; set; } = new List<ProductionSchedule>();
    }

    public class ProductionSchedule
    {
        [Key]
        public Guid ScheduleId { get; set; } = Guid.NewGuid();

        [ForeignKey("WorkOrder")]
        public Guid WorkOrderId { get; set; }

        public DateTime ProductionDate { get; set; }

        public ProductionShift Shift { get; set; }

        [Range(0, int.MaxValue)]
        public int PlannedQuantity { get; set; }

        [Range(0, int.MaxValue)]
        public int ActualQuantity { get; set; }

        public DateTime CreatedAt { get; set; } = DateTime.UtcNow;

        // Navigation properties
        public virtual WorkOrder WorkOrder { get; set; } = null!;
    }

    public enum WorkOrderStatus
    {
        Scheduled,
        InProgress,
        Completed,
        OnHold,
        Cancelled
    }

    public enum ProductionShift
    {
        Morning,
        Evening,
        Night
    }
}
