# Create Super User Script for GarmentsERP
# This script creates a super admin user for the application

param(
    [Parameter(Mandatory=$true)]
    [string]$Username,
    
    [Parameter(Mandatory=$true)]
    [string]$Password,
    
    [string]$Email = "",
    [string]$ApiUrl = "http://localhost:8080"
)

# Function to create super user via API
function Create-SuperUser {
    param(
        [string]$Username,
        [string]$Password,
        [string]$Email,
        [string]$ApiUrl
    )
    
    Write-Host "Creating super admin user: $Username" -ForegroundColor Green
    Write-Host "API URL: $ApiUrl" -ForegroundColor Blue
    
    # Prepare the request body
    $body = @{
        Username = $Username
        Password = $Password
    }
    
    if ($Email) {
        $body.Email = $Email
    }
    
    $jsonBody = $body | ConvertTo-Json
    
    try {
        # Make the API call
        $response = Invoke-RestMethod -Uri "$ApiUrl/api/AdminSetup/create-admin" -Method POST -ContentType "application/json" -Body $jsonBody -ErrorAction Stop
        
        Write-Host "✅ Success: Admin user created successfully" -ForegroundColor Green
        Write-Host "Username: $($response.username)" -ForegroundColor Yellow
        Write-Host "Email: $($response.email)" -ForegroundColor Yellow
        Write-Host "User ID: $($response.userId)" -ForegroundColor Yellow
        
        return $true
    }
    catch {
        if ($_.Exception.Response) {
            $result = $_.Exception.Response.GetResponseStream()
            $reader = New-Object System.IO.StreamReader($result)
            $responseBody = $reader.ReadToEnd()
            
            Write-Host "❌ Error: $($_.Exception.Response.StatusCode) $($_.Exception.Response.StatusDescription)" -ForegroundColor Red
            Write-Host "Details: $responseBody" -ForegroundColor Red
        }
        else {
            Write-Host "❌ Error: Could not connect to the application. Make sure it is running on $ApiUrl" -ForegroundColor Red
            Write-Host "Error details: $($_.Exception.Message)" -ForegroundColor Red
        }
        
        return $false
    }
}

# Function to check if application is running
function Test-ApplicationRunning {
    param([string]$ApiUrl)
    
    try {
        $response = Invoke-WebRequest -Uri "$ApiUrl/api/health" -Method GET -TimeoutSec 5 -ErrorAction Stop
        return $response.StatusCode -eq 200
    }
    catch {
        return $false
    }
}

# Main execution
Write-Host "=== GarmentsERP Super User Creation ===" -ForegroundColor Cyan
Write-Host ""

# Check if application is running
Write-Host "Checking if application is running..." -ForegroundColor Blue
if (-not (Test-ApplicationRunning -ApiUrl $ApiUrl)) {
    Write-Host "❌ Application is not running on $ApiUrl" -ForegroundColor Red
    Write-Host "Please start the application first using one of these methods:" -ForegroundColor Yellow
    Write-Host "1. Docker: docker compose -f docker-compose.dev.yml up --build" -ForegroundColor Yellow
    Write-Host "2. Manual: cd backend/GarmentsERP.API && dotnet run" -ForegroundColor Yellow
    Write-Host "3. Make: make docker-dev" -ForegroundColor Yellow
    Write-Host ""
    exit 1
}

Write-Host "✅ Application is running" -ForegroundColor Green
Write-Host ""

# Create the super user
$success = Create-SuperUser -Username $Username -Password $Password -Email $Email -ApiUrl $ApiUrl

if ($success) {
    Write-Host ""
    Write-Host "🎉 Super user creation completed successfully!" -ForegroundColor Green
    Write-Host "You can now log in to the application with:" -ForegroundColor Yellow
    Write-Host "  Username: $Username" -ForegroundColor White
    Write-Host "  Password: $Password" -ForegroundColor White
    Write-Host ""
    Write-Host "Next steps:" -ForegroundColor Cyan
    Write-Host "1. Open the application in your browser" -ForegroundColor White
    Write-Host "2. Navigate to the login page" -ForegroundColor White
    Write-Host "3. Use the credentials above to log in" -ForegroundColor White
    Write-Host "4. Access the journal entries at: $ApiUrl/admin/accounting/journal-entries" -ForegroundColor White
} else {
    Write-Host ""
    Write-Host "❌ Super user creation failed!" -ForegroundColor Red
    Write-Host "Please check the error messages above and try again." -ForegroundColor Yellow
    exit 1
}

