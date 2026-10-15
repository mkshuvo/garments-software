import React from 'react';
import { PermissionGuard } from './PermissionGuard';
import { RoleGuard } from './RoleGuard';
import { usePermissions, useRoles } from '../../hooks';

/**
 * Example component demonstrating how to use PermissionGuard and RoleGuard components
 * This component is for documentation and testing purposes
 */
export const GuardExamples: React.FC = () => {
  const { checkPermission, checkAnyPermission } = usePermissions();
  const { isAdmin, isAdminOrManager } = useRoles();

  return (
    <div className="p-6 space-y-6">
      <h2 className="text-2xl font-bold mb-4">Permission and Role Guard Examples</h2>
      
      {/* Single Permission Guard Examples */}
      <section className="space-y-4">
        <h3 className="text-lg font-semibold">Single Permission Guards</h3>
        
        <PermissionGuard 
          resource="Category" 
          action="Create"
          fallback={<p className="text-gray-500">You don&apos;t have permission to create categories.</p>}
        >
          <button className="bg-blue-500 text-white px-4 py-2 rounded">
            Create Category
          </button>
        </PermissionGuard>

        <PermissionGuard 
          resource="Category" 
          action="Delete"
          fallback={<span className="text-gray-400">Delete not available</span>}
        >
          <button className="bg-red-500 text-white px-4 py-2 rounded">
            Delete Category
          </button>
        </PermissionGuard>
      </section>

      {/* Multiple Permission Guard Examples */}
      <section className="space-y-4">
        <h3 className="text-lg font-semibold">Multiple Permission Guards</h3>
        
        {/* User needs ANY of these permissions */}
        <PermissionGuard 
          permissions={[
            { resource: "Category", action: "Create" },
            { resource: "Category", action: "Update" }
          ]}
          requireAll={false}
          fallback={<p className="text-gray-500">You need create or update permissions for categories.</p>}
        >
          <button className="bg-green-500 text-white px-4 py-2 rounded">
            Manage Categories
          </button>
        </PermissionGuard>

        {/* User needs ALL of these permissions */}
        <PermissionGuard 
          permissions={[
            { resource: "User", action: "View" },
            { resource: "User", action: "Update" }
          ]}
          requireAll={true}
          fallback={<p className="text-gray-500">You need both view and update permissions for users.</p>}
        >
          <button className="bg-purple-500 text-white px-4 py-2 rounded">
            Edit User Profile
          </button>
        </PermissionGuard>
      </section>

      {/* Single Role Guard Examples */}
      <section className="space-y-4">
        <h3 className="text-lg font-semibold">Single Role Guards</h3>
        
        <RoleGuard 
          role="Admin"
          fallback={<p className="text-gray-500">Admin access required.</p>}
        >
          <button className="bg-red-600 text-white px-4 py-2 rounded">
            Admin Panel
          </button>
        </RoleGuard>

        <RoleGuard 
          role="Manager"
          fallback={<span className="text-gray-400">Manager access required</span>}
        >
          <button className="bg-orange-500 text-white px-4 py-2 rounded">
            Manager Dashboard
          </button>
        </RoleGuard>
      </section>

      {/* Multiple Role Guard Examples */}
      <section className="space-y-4">
        <h3 className="text-lg font-semibold">Multiple Role Guards</h3>
        
        {/* User needs ANY of these roles */}
        <RoleGuard 
          roles={["Admin", "Manager"]}
          requireAll={false}
          fallback={<p className="text-gray-500">Admin or Manager access required.</p>}
        >
          <button className="bg-indigo-500 text-white px-4 py-2 rounded">
            Management Features
          </button>
        </RoleGuard>

        {/* User needs ALL of these roles (rare case) */}
        <RoleGuard 
          roles={["Admin", "SuperUser"]}
          requireAll={true}
          fallback={<p className="text-gray-500">Both Admin and SuperUser roles required.</p>}
        >
          <button className="bg-gray-800 text-white px-4 py-2 rounded">
            Super Admin Features
          </button>
        </RoleGuard>
      </section>

      {/* Hook Usage Examples */}
      <section className="space-y-4">
        <h3 className="text-lg font-semibold">Hook Usage Examples</h3>
        
        <div className="bg-gray-100 p-4 rounded">
          <p>Using hooks for conditional logic:</p>
          <ul className="list-disc list-inside mt-2 space-y-1">
            <li>Can create categories: {checkPermission("Category", "Create") ? "Yes" : "No"}</li>
            <li>Can manage users: {checkAnyPermission([
              { resource: "User", action: "Create" },
              { resource: "User", action: "Update" }
            ]) ? "Yes" : "No"}</li>
            <li>Is Admin: {isAdmin() ? "Yes" : "No"}</li>
            <li>Is Admin or Manager: {isAdminOrManager() ? "Yes" : "No"}</li>
          </ul>
        </div>
      </section>

      {/* Nested Guards Example */}
      <section className="space-y-4">
        <h3 className="text-lg font-semibold">Nested Guards Example</h3>
        
        <RoleGuard 
          roles={["Admin", "Manager"]}
          fallback={<p className="text-gray-500">Management access required.</p>}
        >
          <div className="border p-4 rounded">
            <h4 className="font-semibold mb-2">Management Section</h4>
            
            <PermissionGuard 
              resource="Category" 
              action="Delete"
              fallback={<p className="text-sm text-gray-500">Delete permission required for this action.</p>}
            >
              <button className="bg-red-500 text-white px-3 py-1 rounded text-sm">
                Delete Categories
              </button>
            </PermissionGuard>
          </div>
        </RoleGuard>
      </section>
    </div>
  );
};

export default GuardExamples;