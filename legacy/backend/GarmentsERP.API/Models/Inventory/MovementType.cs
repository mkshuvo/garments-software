using System.ComponentModel.DataAnnotations;
using System.ComponentModel.DataAnnotations.Schema;

namespace GarmentsERP.API.Models.Inventory
{
    public enum MovementType
    {
        Purchase,
        Sale,
        Adjustment,
        Transfer,
        Opening,
        Closing,
        Scrap,
        Return
    }
}
