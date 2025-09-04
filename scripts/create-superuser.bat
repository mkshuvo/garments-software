@echo off
REM Create Super User Script for GarmentsERP
REM This script creates a super admin user for the application

setlocal enabledelayedexpansion

REM Check if parameters are provided
if "%~1"=="" (
    echo Usage: create-superuser.bat ^<username^> ^<password^> [email] [api-url]
    echo.
    echo Example: create-superuser.bat admin Admin123! admin@example.com http://localhost:8080
    echo.
    pause
    exit /b 1
)

set USERNAME=%~1
set PASSWORD=%~2
set EMAIL=%~3
set API_URL=%~4

REM Set defaults if not provided
if "%EMAIL%"=="" set EMAIL=
if "%API_URL%"=="" set API_URL=http://localhost:8080

echo === GarmentsERP Super User Creation ===
echo.
echo Creating super admin user: %USERNAME%
echo API URL: %API_URL%
echo.

REM Create the JSON body
set JSON_BODY={"Username":"%USERNAME%","Password":"%PASSWORD%"}
if not "%EMAIL%"=="" set JSON_BODY={"Username":"%USERNAME%","Password":"%PASSWORD%","Email":"%EMAIL%"}

REM Make the API call using PowerShell
powershell -Command "try { $response = Invoke-RestMethod -Uri '%API_URL%/api/AdminSetup/create-admin' -Method POST -ContentType 'application/json' -Body '%JSON_BODY%' -ErrorAction Stop; Write-Host '✅ Success: Admin user created successfully' -ForegroundColor Green; Write-Host 'Username:' $response.username -ForegroundColor Yellow; Write-Host 'Email:' $response.email -ForegroundColor Yellow; Write-Host 'User ID:' $response.userId -ForegroundColor Yellow; Write-Host ''; Write-Host '🎉 Super user creation completed successfully!' -ForegroundColor Green; Write-Host 'You can now log in to the application with:' -ForegroundColor Yellow; Write-Host '  Username: %USERNAME%' -ForegroundColor White; Write-Host '  Password: %PASSWORD%' -ForegroundColor White; Write-Host ''; Write-Host 'Next steps:' -ForegroundColor Cyan; Write-Host '1. Open the application in your browser' -ForegroundColor White; Write-Host '2. Navigate to the login page' -ForegroundColor White; Write-Host '3. Use the credentials above to log in' -ForegroundColor White; Write-Host '4. Access the journal entries at: %API_URL%/admin/accounting/journal-entries' -ForegroundColor White } catch { if ($_.Exception.Response) { $result = $_.Exception.Response.GetResponseStream(); $reader = New-Object System.IO.StreamReader($result); $responseBody = $reader.ReadToEnd(); Write-Host '❌ Error:' $_.Exception.Response.StatusCode $_.Exception.Response.StatusDescription -ForegroundColor Red; Write-Host 'Details:' $responseBody -ForegroundColor Red } else { Write-Host '❌ Error: Could not connect to the application. Make sure it is running on %API_URL%' -ForegroundColor Red; Write-Host 'Error details:' $_.Exception.Message -ForegroundColor Red } }"

echo.
pause

