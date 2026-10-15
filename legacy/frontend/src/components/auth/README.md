# Authentication Components

This directory contains React components and hooks for handling authentication and authorization in the frontend application.

## Components

### PermissionGuard

A component that conditionally renders children based on user permissions.

#### Single Permission Mode

```tsx
import { PermissionGuard } from './components/auth';

<PermissionGuard 
  resource="Category" 
  action="Create"
  fallback={<div>You don't have permission to create categories</div>}
>
  <button>Create Category</button>
</PermissionGuard>
```

#### Multiple Permissions Mode

```tsx
// User needs ANY of these permissions
<PermissionGuard 
  permissions={[
    { resource: "Category", action: "Create" },
    { resource: "Category", action: "Update" }
  ]}
  requireAll={false}
  fallback={<div>You need create or update permissions</div>}
>
  <button>Manage Categories</button>
</PermissionGuard>

// User needs ALL of these permissions
<PermissionGuard 
  permissions={[
    { resource: "User", action: "View" },
    { resource: "User", action: "Update" }
  ]}
  requireAll={true}
  fallback={<div>You need both view and update permissions</div>}
>
  <button>Edit User</button>
</PermissionGuard>
```

#### Props

- `resource` (string): The resource name (single permission mode)
- `action` (string): The action name (single permission mode)
- `permissions` (Array): Array of permission objects (multiple permissions mode)
- `requireAll` (boolean): Whether all permissions are required (default: false)
- `children` (ReactNode): Content to render when user has permission
- `fallback` (ReactNode): Content to render when user lacks permission
- `showLoading` (boolean): Whether to show loading state (default: true)

### RoleGuard

A component that conditionally renders children based on user roles.

#### Single Role Mode

```tsx
import { RoleGuard } from './components/auth';

<RoleGuard 
  role="Admin"
  fallback={<div>Admin access required</div>}
>
  <button>Admin Panel</button>
</RoleGuard>
```

#### Multiple Roles Mode

```tsx
// User needs ANY of these roles
<RoleGuard 
  roles={["Admin", "Manager"]}
  requireAll={false}
  fallback={<div>Admin or Manager access required</div>}
>
  <button>Management Features</button>
</RoleGuard>

// User needs ALL of these roles
<RoleGuard 
  roles={["Admin", "SuperUser"]}
  requireAll={true}
  fallback={<div>Both Admin and SuperUser roles required</div>}
>
  <button>Super Admin Features</button>
</RoleGuard>
```

#### Props

- `role` (string): The role name (single role mode)
- `roles` (Array): Array of role names (multiple roles mode)
- `requireAll` (boolean): Whether all roles are required (default: false)
- `children` (ReactNode): Content to render when user has role
- `fallback` (ReactNode): Content to render when user lacks role
- `showLoading` (boolean): Whether to show loading state (default: true)

### ProtectedRoute

A component that protects routes based on authentication status.

```tsx
import { ProtectedRoute } from './components/auth';

<ProtectedRoute>
  <AdminDashboard />
</ProtectedRoute>
```

### AuthInitializer

A component that initializes authentication state on app startup.

```tsx
import { AuthInitializer } from './components/auth';

function App() {
  return (
    <div>
      <AuthInitializer />
      {/* Rest of your app */}
    </div>
  );
}
```

## Hooks

### usePermissions

A hook for checking permissions in components.

```tsx
import { usePermissions } from './hooks';

function MyComponent() {
  const { 
    checkPermission, 
    checkAnyPermission, 
    checkAllPermissions,
    isPermissionsLoading 
  } = usePermissions();

  const canCreateCategory = checkPermission("Category", "Create");
  const canManageUsers = checkAnyPermission([
    { resource: "User", action: "Create" },
    { resource: "User", action: "Update" }
  ]);

  if (isPermissionsLoading()) {
    return <div>Loading permissions...</div>;
  }

  return (
    <div>
      {canCreateCategory && <button>Create Category</button>}
      {canManageUsers && <button>Manage Users</button>}
    </div>
  );
}
```

### useRoles

A hook for checking roles in components.

```tsx
import { useRoles } from './hooks';

function MyComponent() {
  const { 
    checkRole, 
    isAdmin, 
    isManager, 
    isAdminOrManager,
    isRolesLoading 
  } = useRoles();

  if (isRolesLoading()) {
    return <div>Loading roles...</div>;
  }

  return (
    <div>
      {isAdmin() && <button>Admin Panel</button>}
      {isManager() && <button>Manager Dashboard</button>}
      {isAdminOrManager() && <button>Management Features</button>}
    </div>
  );
}
```

## Best Practices

### 1. Use Guards for UI Elements

Use `PermissionGuard` and `RoleGuard` to conditionally show/hide UI elements:

```tsx
<PermissionGuard resource="Category" action="Delete">
  <IconButton onClick={handleDelete}>
    <DeleteIcon />
  </IconButton>
</PermissionGuard>
```

### 2. Provide Meaningful Fallbacks

Always provide user-friendly fallback content:

```tsx
<PermissionGuard 
  resource="Category" 
  action="Create"
  fallback={
    <div className="text-gray-500 text-sm">
      You don't have permission to create categories. 
      Contact your administrator for access.
    </div>
  }
>
  <CreateCategoryButton />
</PermissionGuard>
```

### 3. Combine Guards for Complex Logic

You can nest guards for complex authorization logic:

```tsx
<RoleGuard roles={["Admin", "Manager"]}>
  <div className="management-section">
    <h3>Management Tools</h3>
    
    <PermissionGuard resource="Category" action="Delete">
      <button className="danger">Delete Categories</button>
    </PermissionGuard>
    
    <PermissionGuard resource="User" action="Create">
      <button>Create Users</button>
    </PermissionGuard>
  </div>
</RoleGuard>
```

### 4. Use Hooks for Complex Logic

For complex conditional logic, use the hooks:

```tsx
function CategoryManagement() {
  const { checkPermission } = usePermissions();
  const { isAdmin } = useRoles();

  const showAdvancedFeatures = isAdmin() || checkPermission("Category", "Advanced");
  
  return (
    <div>
      <CategoryList />
      {showAdvancedFeatures && <AdvancedCategoryTools />}
    </div>
  );
}
```

### 5. Handle Loading States

Always handle loading states appropriately:

```tsx
function MyComponent() {
  const { isPermissionsLoading } = usePermissions();

  if (isPermissionsLoading()) {
    return <LoadingSpinner />;
  }

  return (
    <PermissionGuard resource="Category" action="View" showLoading={false}>
      <CategoryList />
    </PermissionGuard>
  );
}
```

## Testing

The components include comprehensive tests. To run them:

```bash
npm test -- --testPathPattern="auth"
```

Example test:

```tsx
import { render, screen } from '@testing-library/react';
import { PermissionGuard } from '../PermissionGuard';

test('renders children when user has permission', () => {
  // Mock auth store to return true for hasPermission
  mockUseAuthStore.mockReturnValue({
    hasPermission: () => true,
    isAuthenticated: true,
    isInitialized: true,
    isLoading: false,
  });

  render(
    <PermissionGuard resource="Category" action="View">
      <div>Protected Content</div>
    </PermissionGuard>
  );

  expect(screen.getByText('Protected Content')).toBeInTheDocument();
});
```