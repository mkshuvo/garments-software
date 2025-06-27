using System.ComponentModel.DataAnnotations;
using System.ComponentModel.DataAnnotations.Schema;

namespace GarmentsERP.API.Models.Contacts
{
    public class ContactAddress
    {
        [Key]
        public Guid Id { get; set; } = Guid.NewGuid();

        [ForeignKey("Contact")]
        public Guid ContactId { get; set; }

        public AddressType AddressType { get; set; }

        [Required]
        [MaxLength(500)]
        public string Address { get; set; } = string.Empty;

        [MaxLength(100)]
        public string? City { get; set; }

        [MaxLength(100)]
        public string? State { get; set; }

        [MaxLength(20)]
        public string? PostalCode { get; set; }

        [MaxLength(100)]
        public string? Country { get; set; }

        public bool IsDefault { get; set; } = false;

        // Navigation properties
        public virtual Contact Contact { get; set; } = null!;
    }

    public enum AddressType
    {
        Billing,
        Shipping,
        Both
    }
}
