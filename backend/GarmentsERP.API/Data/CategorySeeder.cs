using GarmentsERP.API.Models.Accounting;
using Microsoft.EntityFrameworkCore;

namespace GarmentsERP.API.Data
{
    public static class CategorySeeder
    {
        public static async Task SeedCategoriesAsync(ApplicationDbContext context)
        {
            // Check if categories already exist
            if (await context.Categories.AnyAsync())
            {
                return; // Categories already seeded
            }

            var categories = new List<Category>();

            // Credit Categories (Money In) - from CSV analysis
            var creditCategories = new[]
            {
                new { Name = "Loan A/C Chairman", Description = "Chairman loan account credit" },
                new { Name = "Received: Urbo ltd", Description = "Payments received from Urbo ltd" },
                new { Name = "Loan A/C Chairman by Bashar", Description = "Chairman loan account credit by Bashar" },
                new { Name = "Received: Kafit Gallary", Description = "Payments received from Kafit Gallary" },
                new { Name = "Received: Brooklyn BD", Description = "Payments received from Brooklyn BD" },
                new { Name = "Received: Adl", Description = "Payments received from ADL" },
                new { Name = "Speed Collection", Description = "Speed collection income" },
                new { Name = "Miscellaneous Income", Description = "Other miscellaneous income" }
            };

            // Debit Categories (Money Out) - from CSV analysis
            var debitCategories = new[]
            {
                new { Name = "Loan Debit", Description = "Loan payments and debit transactions" },
                new { Name = "Subcontract worker bill", Description = "Subcontract worker payments" },
                new { Name = "Convence", Description = "Conveyance and transportation expenses" },
                new { Name = "Fabric- Purchase", Description = "Fabric purchase expenses" },
                new { Name = "Accessories Bill", Description = "Accessories and materials purchase" },
                new { Name = "Office Maintance", Description = "Office maintenance expenses" },
                new { Name = "Factory Maintance", Description = "Factory maintenance expenses" },
                new { Name = "Tiffin Bill", Description = "Tiffin and meal expenses" },
                new { Name = "Carriage Bill", Description = "Carriage and transportation bills" },
                new { Name = "Entertainment Bill", Description = "Entertainment and hospitality expenses" },
                new { Name = "Machine- Purchase", Description = "Machine and equipment purchase" },
                new { Name = "Electric Bill", Description = "Electricity bills and charges" },
                new { Name = "Cons labour wages", Description = "Construction labor wages" },
                new { Name = "Furniture & Fittings", Description = "Furniture and fittings purchase" },
                new { Name = "Factory Papers", Description = "Factory documentation and paperwork expenses" },
                new { Name = "SubContract Bill", Description = "Subcontract service bills" },
                new { Name = "Advance Salary", Description = "Advance salary payments" },
                new { Name = "Donation Inspection", Description = "Donation and inspection fees" },
                new { Name = "Machine spare parts", Description = "Machine spare parts and maintenance" },
                new { Name = "Salary A/C", Description = "Regular salary payments" },
                new { Name = "Lunch bill", Description = "Lunch expenses" },
                new { Name = "Dinner bill", Description = "Dinner expenses" },
                new { Name = "bkash charge", Description = "bKash transaction charges" },
                new { Name = "breakfast bill", Description = "Breakfast expenses" },
                new { Name = "Internet bill", Description = "Internet service charges" },
                new { Name = "Night bill", Description = "Night shift expenses" },
                new { Name = "Wash bill", Description = "Washing and cleaning expenses" },
                new { Name = "Dying bill", Description = "Dyeing process expenses" },
                new { Name = "Embroderiy Bill", Description = "Embroidery work expenses" },
                new { Name = "Cons Materials", Description = "Construction materials" },
                new { Name = "Electric Item", Description = "Electrical items and equipment" },
                new { Name = "Mobile Recharge", Description = "Mobile phone recharge expenses" },
                new { Name = "Print Bill", Description = "Printing services expenses" },
                new { Name = "Shipment Bill", Description = "Shipment and delivery expenses" },
                new { Name = "Chemical Purchase", Description = "Chemical and raw material purchase" },
                new { Name = "Carriage Out word", Description = "Outward carriage expenses" },
                new { Name = "Carriage In word", Description = "Inward carriage expenses" },
                new { Name = "Donation & Subscription", Description = "Donations and subscription fees" },
                new { Name = "Interest Service Charge", Description = "Interest and service charges" },
                new { Name = "Fuel & Lubricants", Description = "Fuel and lubricant expenses" },
                new { Name = "Factory Rent", Description = "Factory rental expenses" },
                new { Name = "Remunaration", Description = "Remuneration and compensation" },
                new { Name = "Mobile Bill", Description = "Mobile phone bills" },
                new { Name = "Printing & Stationary", Description = "Printing and stationery expenses" },
                new { Name = "Purchase Local ( Paper )", Description = "Local paper purchase" },
                new { Name = "Security Service Charge", Description = "Security service charges" },
                new { Name = "VAT", Description = "VAT and tax payments" }
            };

            var currentTime = DateTime.UtcNow;

            // Add Credit categories
            foreach (var cat in creditCategories)
            {
                categories.Add(new Category
                {
                    Id = Guid.NewGuid(),
                    Name = cat.Name,
                    Description = cat.Description,
                    Type = CategoryType.Credit,
                    IsActive = true,
                    CreatedAt = currentTime,
                    CreatedBy = "System"
                });
            }

            // Add Debit categories
            foreach (var cat in debitCategories)
            {
                categories.Add(new Category
                {
                    Id = Guid.NewGuid(),
                    Name = cat.Name,
                    Description = cat.Description,
                    Type = CategoryType.Debit,
                    IsActive = true,
                    CreatedAt = currentTime,
                    CreatedBy = "System"
                });
            }

            // Add all categories to context
            await context.Categories.AddRangeAsync(categories);
            await context.SaveChangesAsync();
        }
    }
}