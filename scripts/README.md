# GarmentsERP Super User Setup Scripts

This directory contains scripts to create a super admin user for the GarmentsERP application.

## Prerequisites

1. **Application Running**: The GarmentsERP application must be running before creating a super user.
2. **Network Access**: The scripts need to connect to the application API.

## Quick Start

### Option 1: Using the Makefile (Recommended)
```bash
make superuser USERNAME=admin PASSWORD=Admin123!
```

### Option 2: Using PowerShell Script
```powershell
.\scripts\create-superuser.ps1 -Username "admin" -Password "Admin123!" -Email "admin@example.com"
```

### Option 3: Using Batch File (Windows)
```cmd
scripts\create-superuser.bat admin Admin123! admin@example.com
```

## Script Parameters

| Parameter | Required | Description | Default |
|-----------|----------|-------------|---------|
| Username | Yes | The username for the super admin | - |
| Password | Yes | The password for the super admin | - |
| Email | No | Email address for the super admin | - |
| API URL | No | Base URL of the application API | http://localhost:8080 |

## Starting the Application

Before creating a super user, you need to start the application:

### Using Docker (Recommended)
```bash
# Development environment
make docker-dev

# Or manually
docker compose -f docker-compose.dev.yml up --build
```

### Using Podman
```bash
# Development environment
make podman-dev

# Or manually
podman-compose -f docker-compose.podman.yml up --build
```

### Manual Start
```bash
# Backend
cd backend/GarmentsERP.API
dotnet run

# Frontend (in another terminal)
cd frontend
npm run dev
```

## Verification

After creating the super user, you can verify it works by:

1. **Opening the application** in your browser (usually http://localhost:3000)
2. **Navigating to the login page**
3. **Logging in** with the created credentials
4. **Accessing journal entries** at `/admin/accounting/journal-entries`

## Troubleshooting

### Application Not Running
```
❌ Error: Could not connect to the application. Make sure it is running on http://localhost:8080
```

**Solution**: Start the application using one of the methods above.

### Port Conflicts
If you're using different ports, specify the correct API URL:
```bash
.\scripts\create-superuser.ps1 -Username "admin" -Password "Admin123!" -ApiUrl "http://localhost:5000"
```

### Permission Issues
Make sure you have the necessary permissions to:
- Run PowerShell scripts (if using PowerShell)
- Access the application API
- Create user accounts

### Database Issues
If you encounter database-related errors:
1. Check if the database is running
2. Verify database connection settings
3. Run database migrations if needed

## Security Notes

- Use a strong password (minimum 8 characters)
- This command should only be used for initial setup
- Only one super admin can be created this way
- Store credentials securely after creation

## Next Steps

After creating the super user:

1. **Log in** to the application
2. **Set up additional users** through the admin interface
3. **Configure permissions** and roles
4. **Test the journal entry management** functionality
5. **Import sample data** if needed

## Support

If you encounter issues:
1. Check the application logs
2. Verify all prerequisites are met
3. Ensure the application is running correctly
4. Check network connectivity to the API

