using System.ComponentModel.DataAnnotations;
using System.ComponentModel.DataAnnotations.Schema;

namespace GarmentsERP.API.Models.Products
{
    public enum ProductType
    {
        Finished,
        RawMaterial,
        Service
    }
}
