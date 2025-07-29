namespace GarmentsERP.API.Interfaces
{
    public interface IPermissionSeederService
    {
        Task SeedPermissionsAndRoleAssignmentsAsync();
    }
}